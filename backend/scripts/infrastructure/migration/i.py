from __future__ import annotations

import argparse
import json
import re
from datetime import datetime, timezone
from pathlib import Path
from typing import Any

import pandas as pd


MIGRATION_YEARS = (1990, 1995, 2000, 2005, 2010, 2015, 2020, 2024)
ISO3_PATTERN = re.compile(r"^[A-Z]{3}$")


def repository_root() -> Path:
    # build_un_migration_data.py is stored at:
    # python/preprocessing/infrastructure/migration/
    return Path(__file__).resolve().parents[4]


def clean_text(value: Any) -> str:
    if value is None or pd.isna(value):
        return ""

    return re.sub(r"\s+", " ", str(value).replace("\u00a0", " ")).strip()


def normalize_header(value: Any) -> str:
    text = clean_text(value).lower()
    text = text.replace("@", "")
    return re.sub(r"[^a-z0-9]+", "_", text).strip("_")


def unique_headers(values: list[Any]) -> list[str]:
    headers: list[str] = []
    seen: dict[str, int] = {}

    for index, value in enumerate(values):
        header = clean_text(value) or f"unnamed_{index}"
        count = seen.get(header, 0)
        seen[header] = count + 1
        headers.append(header if count == 0 else f"{header}_{count}")

    return headers


def parse_number(value: Any) -> float | None:
    if value is None or pd.isna(value):
        return None

    text = clean_text(value).replace(",", "").replace(" ", "")
    if text.lower() in {"", "-", "—", "..", "...", "na", "n/a", "null"}:
        return None

    parsed = pd.to_numeric(text, errors="coerce")
    if pd.isna(parsed):
        return None

    return float(parsed)


def normalize_location_code(value: Any) -> str | None:
    if value is None or pd.isna(value):
        return None

    text = clean_text(value)
    if not text:
        return None

    if re.fullmatch(r"\d+\.0+", text):
        text = text.split(".", 1)[0]

    if not text.isdigit():
        return None

    return text.zfill(3)


def normalize_iso3(value: Any) -> str | None:
    text = clean_text(value).upper()
    return text if ISO3_PATTERN.fullmatch(text) else None


def find_column(
    columns: list[str],
    required_fragments: tuple[str, ...],
    excluded_fragments: tuple[str, ...] = (),
) -> str | None:
    normalized = [(column, normalize_header(column)) for column in columns]

    for column, header in normalized:
        if all(fragment in header for fragment in required_fragments) and not any(
            fragment in header for fragment in excluded_fragments
        ):
            return column

    return None


def find_header_row(
    raw: pd.DataFrame,
    required_groups: tuple[tuple[str, ...], ...],
    scan_limit: int = 50,
) -> int | None:
    for row_index in range(min(scan_limit, len(raw))):
        cells = [normalize_header(value) for value in raw.iloc[row_index].tolist()]
        if all(
            any(all(fragment in cell for fragment in group) for cell in cells)
            for group in required_groups
        ):
            return row_index

    return None


def read_excel_table(path: Path, required_groups: tuple[tuple[str, ...], ...]) -> tuple[pd.DataFrame, str, int]:
    workbook = pd.ExcelFile(path)

    for sheet_name in workbook.sheet_names:
        raw = pd.read_excel(path, sheet_name=sheet_name, header=None, dtype=object)
        header_row = find_header_row(raw, required_groups)

        if header_row is None:
            continue

        frame = raw.iloc[header_row + 1 :].copy()
        frame.columns = unique_headers(raw.iloc[header_row].tolist())
        frame = frame.dropna(how="all").reset_index(drop=True)
        return frame, sheet_name, header_row

    raise ValueError(
        f"Could not find a matching header in any sheet of {path.name}. "
        f"Available sheets: {workbook.sheet_names}"
    )


def read_population_table(path: Path) -> tuple[pd.DataFrame, str | None, int | None]:
    if path.suffix.lower() in {".csv", ".txt", ".gz"}:
        return (
            pd.read_csv(path, dtype=object, low_memory=False, compression="infer"),
            None,
            None,
        )

    return read_excel_table(
        path,
        required_groups=(
            ("location",),
            ("time",),
        ),
    )


def select_population_columns(frame: pd.DataFrame) -> dict[str, str]:
    columns = list(frame.columns)

    year_column = next(
        (
            column
            for column in columns
            if normalize_header(column) in {"time", "year", "year_"}
        ),
        None,
    )
    if year_column is None:
        raise ValueError(f"Could not find a year column in population data: {columns}")

    iso_column = next(
        (
            column
            for column in columns
            if normalize_header(column) in {"iso3_code", "iso3", "iso_code", "code"}
        ),
        None,
    )

    location_code_column = next(
        (
            column
            for column in columns
            if normalize_header(column) in {"locid", "location_code", "m49", "location_id"}
        ),
        None,
    )

    name_column = next(
        (
            column
            for column in columns
            if normalize_header(column) in {"location", "entity", "country", "country_name", "name"}
        ),
        None,
    )
    if name_column is None:
        raise ValueError(f"Could not find a country/location column in population data: {columns}")

    population_candidates = [
        "tpopulation1july",
        "population1july",
        "poptotal",
        "population",
        "total_population",
        "value",
    ]
    population_column = next(
        (
            column
            for candidate in population_candidates
            for column in columns
            if normalize_header(column) == candidate
        ),
        None,
    )

    if population_column is None:
        raise ValueError(f"Could not find a total population column in: {columns}")

    variant_column = next(
        (
            column
            for column in columns
            if normalize_header(column) in {"variant", "projection_variant", "scenario"}
        ),
        None,
    )

    sex_column = next(
        (
            column
            for column in columns
            if normalize_header(column) in {"sex", "sexes", "gender"}
        ),
        None,
    )

    unit_column = next(
        (
            column
            for column in columns
            if normalize_header(column) in {"unit", "units", "measure_unit"}
        ),
        None,
    )

    result = {
        "year": year_column,
        "name": name_column,
        "population": population_column,
    }

    if iso_column:
        result["iso3"] = iso_column
    if location_code_column:
        result["location_code"] = location_code_column
    if variant_column:
        result["variant"] = variant_column
    if sex_column:
        result["sex"] = sex_column
    if unit_column:
        result["unit"] = unit_column

    return result


def population_values_are_thousands(
    population_column: str,
    unit_column: str | None,
    frame: pd.DataFrame,
    forced_unit: str,
) -> bool:
    if forced_unit == "thousands":
        return True
    if forced_unit == "people":
        return False

    column_hint = normalize_header(population_column)
    if any(token in column_hint for token in ("thousand", "tpopulation", "poptotal")):
        return True

    if unit_column:
        unit_values = " ".join(
            clean_text(value).lower() for value in frame[unit_column].dropna().head(20)
        )
        if "thousand" in unit_values:
            return True

    return False


def load_population(
    path: Path,
    forced_unit: str,
    minimum_year: int,
    maximum_year: int,
) -> tuple[pd.DataFrame, dict[str, dict[str, str | None]], dict[str, Any]]:
    frame, sheet_name, header_row = read_population_table(path)
    columns = select_population_columns(frame)

    if "sex" in columns:
        sex_values = frame[columns["sex"]].map(clean_text).str.lower()
        keep_sex = sex_values.isin({"both sexes", "both", "total", "all", "all sexes", ""})
        if keep_sex.any():
            frame = frame[keep_sex].copy()

    frame["year"] = pd.to_numeric(frame[columns["year"]], errors="coerce")
    frame["population_raw"] = frame[columns["population"]].map(parse_number)
    frame["iso3"] = (
        frame[columns["iso3"]].map(normalize_iso3)
        if "iso3" in columns
        else pd.Series([None] * len(frame), index=frame.index, dtype="object")
    )
    frame["location_code"] = (
        frame[columns["location_code"]].map(normalize_location_code)
        if "location_code" in columns
        else pd.Series([None] * len(frame), index=frame.index, dtype="object")
    )
    frame["country_name"] = frame[columns["name"]].map(clean_text)
    frame["variant_name"] = (
        frame[columns["variant"]].map(clean_text)
        if "variant" in columns
        else ""
    )

    frame = frame[
        frame["year"].notna()
        & frame["population_raw"].notna()
        & frame["year"].between(minimum_year, maximum_year)
        & frame["iso3"].notna()
    ].copy()

    if frame.empty:
        raise ValueError(
            f"No population rows remained after filtering {path.name}. "
            "Check that the file contains ISO3 country codes and year values."
        )

    frame["year"] = frame["year"].astype(int)
    use_thousands = population_values_are_thousands(
        columns["population"],
        columns.get("unit"),
        frame,
        forced_unit,
    )
    frame["total_population"] = (
        frame["population_raw"] * 1000 if use_thousands else frame["population_raw"]
    ).round().astype("int64")

    # If the file contains multiple variants, prefer estimates for historical
    # years and Medium for projected years. This keeps the output deterministic.
    if "variant" in columns:
        frame["variant_priority"] = frame.apply(
            lambda row: variant_priority(row["year"], row["variant_name"]),
            axis=1,
        )
        frame = (
            frame.sort_values(["iso3", "year", "variant_priority"])
            .drop_duplicates(["iso3", "year"], keep="first")
            .drop(columns=["variant_priority"])
        )
    else:
        frame = frame.drop_duplicates(["iso3", "year"], keep="first")

    frame["population_phase"] = frame.apply(
        lambda row: population_phase(row["year"], row["variant_name"]),
        axis=1,
    )

    population = frame[
        [
            "year",
            "iso3",
            "country_name",
            "location_code",
            "total_population",
            "population_phase",
            "variant_name",
        ]
    ].copy()

    location_map: dict[str, dict[str, str | None]] = {}
    for row in population.itertuples(index=False):
        if row.location_code and row.iso3:
            location_map[row.location_code] = {
                "iso3": row.iso3,
                "name": row.country_name,
            }

    metadata = {
        "sourceFile": path.name,
        "sheet": sheet_name,
        "headerRow": header_row,
        "populationColumn": columns["population"],
        "populationUnitInSource": "thousands" if use_thousands else "people",
        "populationUnitOutput": "people",
        "yearMin": int(population["year"].min()),
        "yearMax": int(population["year"].max()),
        "countryCount": int(population["iso3"].nunique()),
    }

    return population, location_map, metadata


def variant_priority(year: int, variant: str) -> int:
    text = variant.lower()

    if year <= 2023:
        if "estimate" in text or "histor" in text:
            return 0
        if "medium" in text:
            return 1
    else:
        if "medium" in text:
            return 0
        if "estimate" in text or "histor" in text:
            return 1

    return 2


def population_phase(year: int, variant: str) -> str:
    text = variant.lower()
    if "project" in text or "medium" in text or year >= 2024:
        return "projected" if year >= 2024 else "estimated"
    return "estimated"


def find_migration_year_columns(columns: list[str]) -> dict[int, str]:
    result: dict[int, str] = {}

    for column in columns:
        normalized = normalize_header(column)
        if not re.fullmatch(r"(?:19|20)\d{2}", normalized):
            continue

        year = int(normalized)
        if year in MIGRATION_YEARS:
            result[year] = column

    missing = [year for year in MIGRATION_YEARS if year not in result]
    if missing:
        raise ValueError(
            f"Could not find all UN migrant-stock reference-year columns. Missing: {missing}. "
            f"Found: {sorted(result)}"
        )

    return result


def load_migration_matrix(
    path: Path,
    location_map: dict[str, dict[str, str | None]],
    stock_unit: str,
) -> tuple[pd.DataFrame, pd.DataFrame, dict[str, Any]]:
    frame, sheet_name, header_row = read_excel_table(
        path,
        required_groups=(
            ("location", "code", "destination"),
            ("location", "code", "origin"),
        ),
    )
    columns = list(frame.columns)

    destination_name_column = find_column(
        columns,
        ("destination",),
        ("location_code", "notes", "coverage", "data_type", "type_of_data"),
    )
    origin_name_column = find_column(
        columns,
        ("origin",),
        ("location_code", "notes", "coverage", "data_type", "type_of_data"),
    )
    destination_code_column = find_column(columns, ("location_code", "destination"))
    origin_code_column = find_column(columns, ("location_code", "origin"))

    if not all(
        (
            destination_name_column,
            origin_name_column,
            destination_code_column,
            origin_code_column,
        )
    ):
        raise ValueError(
            "Could not identify destination/origin name and location-code columns. "
            f"Columns found: {columns}"
        )

    year_columns = find_migration_year_columns(columns)

    selected_columns = [
        destination_name_column,
        origin_name_column,
        destination_code_column,
        origin_code_column,
        *year_columns.values(),
    ]
    selected = frame[selected_columns].copy()
    selected.columns = [
        "destination_name_raw",
        "origin_name_raw",
        "destination_location_code",
        "origin_location_code",
        *[f"stock_{year}" for year in MIGRATION_YEARS],
    ]

    selected["destination_name"] = selected["destination_name_raw"].map(clean_text)
    selected["origin_name"] = selected["origin_name_raw"].map(clean_text)
    selected["destination_location_code"] = selected["destination_location_code"].map(
        normalize_location_code
    )
    selected["origin_location_code"] = selected["origin_location_code"].map(
        normalize_location_code
    )

    for year in MIGRATION_YEARS:
        selected[f"stock_{year}"] = selected[f"stock_{year}"].map(parse_number)

    long = selected.melt(
        id_vars=[
            "destination_name",
            "origin_name",
            "destination_location_code",
            "origin_location_code",
        ],
        value_vars=[f"stock_{year}" for year in MIGRATION_YEARS],
        var_name="year_column",
        value_name="migrant_stock_source",
    )
    long["year"] = long["year_column"].str.extract(r"(\d{4})").astype(int)
    long = long[long["migrant_stock_source"].notna()].copy()

    scale = 1000 if stock_unit == "thousands" else 1
    long["migrant_stock"] = (
        long["migrant_stock_source"] * scale
    ).round().astype("int64")
    long["destination_iso3"] = long["destination_location_code"].map(
        lambda code: location_map.get(code, {}).get("iso3") if code else None
    )
    long["origin_iso3"] = long["origin_location_code"].map(
        lambda code: location_map.get(code, {}).get("iso3") if code else None
    )

    long["destination_name"] = long.apply(
        lambda row: location_map.get(row["destination_location_code"], {}).get("name")
        or row["destination_name"],
        axis=1,
    )
    long["origin_name"] = long.apply(
        lambda row: location_map.get(row["origin_location_code"], {}).get("name")
        or row["origin_name"],
        axis=1,
    )

    ordered_columns = [
        "year",
        "origin_iso3",
        "origin_name",
        "origin_location_code",
        "destination_iso3",
        "destination_name",
        "destination_location_code",
        "migrant_stock",
        "migrant_stock_source",
    ]
    long = long[ordered_columns]

    # The full country-to-country matrix is the analytical output. Rows such as
    # UN regions and the special "Other" origin are retained in the audit table,
    # but only two mapped ISO3 countries become network edges.
    pairs = long[
        long["origin_iso3"].notna()
        & long["destination_iso3"].notna()
        & (long["origin_iso3"] != long["destination_iso3"])
        & (long["migrant_stock"] > 0)
    ].copy()

    metadata = {
        "sourceFile": path.name,
        "sheet": sheet_name,
        "headerRow": header_row,
        "referenceYears": list(MIGRATION_YEARS),
        "stockUnitInSource": stock_unit,
        "stockUnitOutput": "people",
        "rawRowCount": int(len(long)),
        "countryPairRowCount": int(len(pairs)),
        "unmappedOriginRowCount": int(long["origin_iso3"].isna().sum()),
        "unmappedDestinationRowCount": int(long["destination_iso3"].isna().sum()),
    }

    return long, pairs, metadata


def load_geography(path: Path | None) -> dict[str, dict[str, Any]]:
    if path is None or not path.exists():
        return {}

    with path.open("r", encoding="utf-8") as file:
        geojson = json.load(file)

    geography_by_code: dict[str, dict[str, Any]] = {}

    for feature in geojson.get("features", []):
        properties = feature.get("properties", {})
        code = None

        for key in ("ISO_A3", "ISO_A3_EH", "ADM0_A3", "WB_A3"):
            candidate = normalize_iso3(properties.get(key))
            if candidate:
                code = candidate
                break

        if code is None:
            continue

        longitude = properties.get("LABEL_X")
        latitude = properties.get("LABEL_Y")
        coordinates = None

        if longitude is not None and latitude is not None:
            coordinates = [float(longitude), float(latitude)]

        geography_by_code[code] = {
            "mapName": properties.get("NAME_EN") or properties.get("NAME"),
            "numericCode": normalize_location_code(
                properties.get("ISO_N3") or properties.get("ISO_N3_EH")
            ),
            "coordinates": coordinates,
        }

    return geography_by_code


def add_geography_location_codes(
    location_map: dict[str, dict[str, str | None]],
    geography: dict[str, dict[str, Any]],
) -> dict[str, dict[str, str | None]]:
    """Use Natural Earth M49/ISO_N3 codes as a fallback for WPP exports.

    The standard WPP CSV includes LocID. Some portal exports contain ISO3 but
    omit LocID, while the UN migration workbook uses numeric location codes.
    Natural Earth's ISO_N3 field covers most country-code joins needed here.
    """
    result = dict(location_map)

    for iso3, details in geography.items():
        numeric_code = normalize_location_code(details.get("numericCode"))
        if numeric_code and numeric_code not in result:
            result[numeric_code] = {
                "iso3": iso3,
                "name": details.get("mapName"),
            }

    return result


def build_country_year(
    population: pd.DataFrame,
    migration_audit: pd.DataFrame,
    pairs: pd.DataFrame,
) -> pd.DataFrame:
    # Table 1 contains both country rows and UN aggregate rows such as World,
    # Europe, income groups, and development regions. A destination total must
    # include country origins plus the special unattributed "Other" origin, but
    # must exclude those aggregate rows or the total will be counted repeatedly.
    destination_total_rows = migration_audit[
        migration_audit["destination_iso3"].notna()
        & (
            migration_audit["origin_iso3"].notna()
            | (migration_audit["origin_location_code"] == "2003")
        )
    ]
    destination_totals = (
        destination_total_rows
        .groupby(["year", "destination_iso3"], as_index=False)["migrant_stock"]
        .sum()
        .rename(
            columns={
                "destination_iso3": "iso3",
                "migrant_stock": "migrant_stock_destination",
            }
        )
    )

    origin_totals = (
        pairs.groupby(["year", "origin_iso3"], as_index=False)["migrant_stock"]
        .sum()
        .rename(
            columns={
                "origin_iso3": "iso3",
                "migrant_stock": "migrant_stock_origin_published_pairs",
            }
        )
    )

    country_names = (
        population[["iso3", "country_name", "location_code"]]
        .drop_duplicates("iso3")
        .copy()
    )

    migration_codes = pd.concat(
        [
            migration_audit[["origin_iso3", "origin_name", "origin_location_code"]].rename(
                columns={
                    "origin_iso3": "iso3",
                    "origin_name": "country_name",
                    "origin_location_code": "location_code",
                }
            ),
            migration_audit[
                ["destination_iso3", "destination_name", "destination_location_code"]
            ].rename(
                columns={
                    "destination_iso3": "iso3",
                    "destination_name": "country_name",
                    "destination_location_code": "location_code",
                }
            ),
        ],
        ignore_index=True,
    )
    migration_codes = migration_codes.dropna(subset=["iso3"]).drop_duplicates("iso3")
    country_names = pd.concat([country_names, migration_codes], ignore_index=True)
    country_names = country_names.drop_duplicates("iso3", keep="first")

    years = sorted(
        set(population["year"].astype(int).tolist())
        | set(migration_audit["year"].astype(int).tolist())
    )
    countries = sorted(country_names["iso3"].dropna().unique().tolist())
    index = pd.MultiIndex.from_product([years, countries], names=["year", "iso3"])
    result = index.to_frame(index=False)

    result = result.merge(
        population[
            [
                "year",
                "iso3",
                "country_name",
                "location_code",
                "total_population",
                "population_phase",
                "variant_name",
            ]
        ],
        on=["year", "iso3"],
        how="left",
    )
    result = result.merge(destination_totals, on=["year", "iso3"], how="left")
    result = result.merge(origin_totals, on=["year", "iso3"], how="left")
    result = result.merge(country_names, on="iso3", how="left", suffixes=("", "_fallback"))

    result["country_name"] = result["country_name"].fillna(result["country_name_fallback"])
    result["location_code"] = result["location_code"].fillna(result["location_code_fallback"])
    result = result.drop(columns=["country_name_fallback", "location_code_fallback"])
    result["migrant_stock_destination"] = result["migrant_stock_destination"].fillna(0).astype("int64")
    result["migrant_stock_origin_published_pairs"] = result[
        "migrant_stock_origin_published_pairs"
    ].fillna(0).astype("int64")
    result["migrant_stock_available"] = result["year"].isin(MIGRATION_YEARS)
    result["migrant_share_percent"] = (
        result["migrant_stock_destination"]
        .div(result["total_population"].replace(0, pd.NA))
        .mul(100)
        .round(4)
    )

    return result.sort_values(["year", "iso3"]).reset_index(drop=True)


def json_records(frame: pd.DataFrame) -> list[dict[str, Any]]:
    return json.loads(frame.to_json(orient="records"))


def build_ui_payload(
    country_year: pd.DataFrame,
    pairs: pd.DataFrame,
    geography: dict[str, dict[str, Any]],
    top_flows: int,
    source_metadata: dict[str, Any],
) -> dict[str, Any]:
    countries = (
        country_year[["iso3", "country_name", "location_code"]]
        .dropna(subset=["iso3"])
        .drop_duplicates("iso3")
        .sort_values("country_name")
    )

    country_records: list[dict[str, Any]] = []
    for row in countries.itertuples(index=False):
        geo = geography.get(row.iso3, {})
        country_records.append(
            {
                "code": row.iso3,
                "name": row.country_name,
                "numericCode": geo.get("numericCode") or row.location_code,
                "coordinates": geo.get("coordinates"),
            }
        )

    snapshots: list[dict[str, Any]] = []
    for year in MIGRATION_YEARS:
        country_snapshot = country_year[country_year["year"] == year].copy()
        country_snapshot = country_snapshot[
            [
                "iso3",
                "country_name",
                "total_population",
                "migrant_stock_destination",
                "migrant_stock_origin_published_pairs",
                "migrant_share_percent",
            ]
        ]

        flow_snapshot = (
            pairs[pairs["year"] == year]
            .sort_values("migrant_stock", ascending=False)
            .head(top_flows)
        )

        snapshots.append(
            {
                "year": year,
                "phase": "observed",
                "countries": json_records(country_snapshot),
                "flows": json_records(
                    flow_snapshot[
                        [
                            "origin_iso3",
                            "origin_name",
                            "destination_iso3",
                            "destination_name",
                            "migrant_stock",
                        ]
                    ]
                ),
            }
        )

    return {
        "schemaVersion": 2,
        "source": source_metadata,
        "referenceYears": list(MIGRATION_YEARS),
        "countries": country_records,
        "snapshots": snapshots,
        "note": "Flows are migrant stock at 1 July, not annual migration flows.",
    }


def write_table(frame: pd.DataFrame, path_without_suffix: Path) -> str:
    path_without_suffix.parent.mkdir(parents=True, exist_ok=True)

    parquet_path = path_without_suffix.with_suffix(".parquet")
    try:
        frame.to_parquet(parquet_path, index=False)
        return parquet_path.name
    except (ImportError, ValueError, ModuleNotFoundError):
        csv_path = path_without_suffix.with_suffix(".csv")
        frame.to_csv(csv_path, index=False)
        return csv_path.name


def resolve_input(path_value: str | None, raw_dir: Path, patterns: tuple[str, ...], label: str) -> Path:
    if path_value:
        path = Path(path_value)
        if not path.is_absolute():
            path = repository_root() / path
        if not path.exists():
            raise FileNotFoundError(f"{label} file does not exist: {path}")
        return path

    candidates = sorted(
        path
        for path in raw_dir.iterdir()
        if path.is_file() and any(pattern in path.name.lower() for pattern in patterns)
    )
    if len(candidates) == 1:
        return candidates[0]
    if not candidates:
        raise FileNotFoundError(
            f"Could not auto-detect the {label} file in {raw_dir}. "
            "Pass its path explicitly."
        )

    raise ValueError(
        f"Multiple possible {label} files were found: "
        + ", ".join(path.name for path in candidates)
        + ". Pass --"
        + label.replace(" ", "-")
        + "-file explicitly."
    )


def main() -> None:
    parser = argparse.ArgumentParser(
        description="Process UN DESA bilateral migrant stock and UN WPP 2024 population data."
    )
    parser.add_argument("--migrant-file", help="UN DESA Destination and Origin workbook")
    parser.add_argument("--population-file", help="UN WPP 2024 CSV or Excel file")
    parser.add_argument(
        "--raw-dir",
        default="data/raw/infrastructure/migration",
        help="Directory containing the downloaded source files",
    )
    parser.add_argument(
        "--output-dir",
        default="src/modules/infrastructure/migration/data/processed",
        help="Directory for frontend and analytical outputs",
    )
    parser.add_argument(
        "--geography-file",
        default="data/raw/infrastructure/migration/natural-earth-110m-admin-0.json",
        help="Optional Natural Earth GeoJSON for map coordinates",
    )
    parser.add_argument(
        "--migrant-stock-unit",
        choices=("thousands", "people"),
        default="people",
        help="Unit used by the UN migrant-stock workbook (default: people)",
    )
    parser.add_argument(
        "--population-unit",
        choices=("auto", "thousands", "people"),
        default="auto",
        help="Unit used by the WPP population file",
    )
    parser.add_argument(
        "--top-flows",
        type=int,
        default=500,
        help="Number of largest country-to-country edges included in migrationData.json",
    )
    args = parser.parse_args()

    root = repository_root()
    raw_dir = (root / args.raw_dir).resolve()
    output_dir = (root / args.output_dir).resolve()
    geography_path = (root / args.geography_file).resolve()

    if not raw_dir.exists():
        raise FileNotFoundError(f"Raw-data directory does not exist: {raw_dir}")

    migrant_path = resolve_input(
        args.migrant_file,
        raw_dir,
        ("destination_and_origin", "destination-and-origin", "origin"),
        "migrant stock",
    )
    population_path = resolve_input(
        args.population_file,
        raw_dir,
        ("wpp", "population", "demographic"),
        "population",
    )

    geography = load_geography(geography_path)
    population, location_map, population_metadata = load_population(
        population_path,
        args.population_unit,
        min(MIGRATION_YEARS),
        2100,
    )
    location_map = add_geography_location_codes(location_map, geography)
    migration_audit, pairs, migration_metadata = load_migration_matrix(
        migrant_path,
        location_map,
        args.migrant_stock_unit,
    )
    country_year = build_country_year(population, migration_audit, pairs)

    source_metadata = {
        "migration": {
            "provider": "United Nations DESA Population Division",
            "dataset": "International Migrant Stock 2024: Destination and origin",
            "referenceYears": list(MIGRATION_YEARS),
            **migration_metadata,
        },
        "population": {
            "provider": "United Nations DESA Population Division",
            "dataset": "World Population Prospects 2024",
            **population_metadata,
        },
        "processedAt": datetime.now(timezone.utc).isoformat(),
    }

    output_dir.mkdir(parents=True, exist_ok=True)
    output_files = {
        "countryYear": write_table(country_year, output_dir / "country_year"),
        "migrationPairs": write_table(pairs, output_dir / "migration_pairs"),
        "migrationAudit": write_table(migration_audit, output_dir / "migration_audit"),
    }

    ui_payload = build_ui_payload(
        country_year,
        pairs,
        geography,
        max(1, args.top_flows),
        source_metadata,
    )
    ui_path = output_dir / "migrationData.json"
    ui_path.write_text(json.dumps(ui_payload, indent=2), encoding="utf-8")
    output_files["uiPayload"] = ui_path.name

    validation = {
        "source": source_metadata,
        "outputFiles": output_files,
        "counts": {
            "populationRows": int(len(population)),
            "populationCountries": int(population["iso3"].nunique()),
            "migrationAuditRows": int(len(migration_audit)),
            "migrationPairRows": int(len(pairs)),
            "migrationOriginCountries": int(pairs["origin_iso3"].nunique()),
            "migrationDestinationCountries": int(pairs["destination_iso3"].nunique()),
        },
        "checks": {
            "migrationYearsExact": sorted(migration_audit["year"].unique().tolist())
            == list(MIGRATION_YEARS),
            "noNegativeMigrationStocks": bool((migration_audit["migrant_stock"] >= 0).all()),
            "noNegativePopulation": bool((population["total_population"] >= 0).all()),
            "populationRowsHaveIso3": bool(population["iso3"].notna().all()),
            "pairRowsHaveTwoCountries": bool(
                pairs["origin_iso3"].notna().all()
                and pairs["destination_iso3"].notna().all()
            ),
        },
        "warnings": [
            "Migration values are stock estimates at 1 July, not annual movement flows.",
            "The UI JSON contains only the largest flows per reference year; migration_pairs contains the full country-pair output.",
            "No synthetic migration years or linear migration projections were generated.",
        ],
    }
    (output_dir / "validation.json").write_text(
        json.dumps(validation, indent=2),
        encoding="utf-8",
    )

    print(f"Migration source: {migrant_path.name}")
    print(f"Population source: {population_path.name}")
    print(f"Reference years: {list(MIGRATION_YEARS)}")
    print(f"Population rows: {len(population):,}")
    print(f"Country-pair rows: {len(pairs):,}")
    print(f"Outputs written to: {output_dir}")
    for key, filename in output_files.items():
        print(f"  {key}: {filename}")
    print("  validation: validation.json")


if __name__ == "__main__":
    main()
