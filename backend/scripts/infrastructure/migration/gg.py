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
    """Return the Simulativ project root.

    This file is located at:
    simulativ/backend/scripts/infrastructure/migration/
    """
    root = Path(__file__).resolve().parents[4]

    if not (root / "backend").is_dir():
        raise RuntimeError(
            f"Could not identify the Simulativ project root from {__file__}. "
            f"Expected a backend directory at: {root / 'backend'}"
        )

    return root


def clean_text(value: Any) -> str:
    if value is None:
        return ""

    try:
        if bool(pd.isna(value)):
            return ""
    except (TypeError, ValueError):
        pass

    return re.sub(r"\s+", " ", str(value).replace("\u00a0", " ")).strip()


def normalized(value: Any) -> str:
    return re.sub(r"[^a-z0-9]+", "_", clean_text(value).lower()).strip("_")


def unique_columns(values: list[Any]) -> list[str]:
    result: list[str] = []
    seen: dict[str, int] = {}

    for index, value in enumerate(values):
        name = clean_text(value) or f"unnamed_{index}"
        count = seen.get(name, 0)
        seen[name] = count + 1
        result.append(name if count == 0 else f"{name}_{count}")

    return result


def number(value: Any) -> float | None:
    text = clean_text(value).replace(",", "").replace(" ", "")

    if not text or text.lower() in {"-", "—", "..", "...", "na", "n/a", "null"}:
        return None

    parsed = pd.to_numeric(text, errors="coerce")
    return None if pd.isna(parsed) else float(parsed)


def location_code(value: Any) -> str | None:
    text = clean_text(value)

    if not text:
        return None

    if re.fullmatch(r"\d+\.0+", text):
        text = text.split(".", 1)[0]

    if not text.isdigit():
        return None

    return text.zfill(3)


def iso3(value: Any) -> str | None:
    text = clean_text(value).upper()
    return text if ISO3_PATTERN.fullmatch(text) else None


def name_key(value: Any) -> str:
    return re.sub(r"[^a-z0-9]+", "", clean_text(value).lower())


def resolve_path(value: str | Path, root: Path) -> Path:
    path = Path(value)

    if path.is_absolute():
        return path

    candidates = [Path.cwd() / path, root / path]

    for candidate in candidates:
        if candidate.exists():
            return candidate.resolve()

    return (root / path).resolve()


def read_csv_or_excel(path: Path) -> pd.DataFrame:
    suffixes = {suffix.lower() for suffix in path.suffixes}

    if ".csv" in suffixes or ".txt" in suffixes or ".gz" in suffixes:
        return pd.read_csv(path, dtype=object, low_memory=False, compression="infer")

    return pd.read_excel(path, dtype=object)


def find_population_columns(frame: pd.DataFrame) -> dict[str, str]:
    columns = list(frame.columns)
    normalized_columns = {column: normalized(column) for column in columns}

    def first(*names: str) -> str | None:
        for wanted in names:
            for column, value in normalized_columns.items():
                if value == wanted:
                    return column
        return None

    year_column = first("year", "time")
    name_column = first("location", "country", "country_name", "entity", "name")
    iso_column = first("iso3_alpha_code", "iso3_code", "iso3", "iso_code")
    code_column = first("location_code", "locid", "m49", "location_id")
    population_column = first(
        "tpopulation1july",
        "population1july",
        "population",
        "total_population",
        "poptotal",
        "value",
    )
    variant_column = first("variant", "projection_variant", "scenario")

    missing = []
    if year_column is None:
        missing.append("Year")
    if name_column is None:
        missing.append("Location")
    if iso_column is None:
        missing.append("ISO3 Alpha-code")
    if population_column is None:
        missing.append("TPopulation1July")

    if missing:
        raise ValueError(
            "Could not identify these columns in the WPP file: "
            + ", ".join(missing)
            + f"\nColumns found: {columns}"
        )

    result = {
        "year": year_column,
        "name": name_column,
        "iso3": iso_column,
        "population": population_column,
    }

    if code_column:
        result["location_code"] = code_column
    if variant_column:
        result["variant"] = variant_column

    return result


def variant_priority(year: int, variant: str) -> int:
    value = variant.lower()

    if year <= 2023:
        if "estimate" in value or "histor" in value:
            return 0
        if "medium" in value:
            return 1
    else:
        if "medium" in value:
            return 0
        if "estimate" in value or "histor" in value:
            return 1

    return 2


def load_population(
    path: Path,
    unit: str,
    minimum_year: int = min(MIGRATION_YEARS),
    maximum_year: int = 2100,
) -> tuple[pd.DataFrame, dict[str, dict[str, str | None]], dict[str, Any]]:
    frame = read_csv_or_excel(path)
    columns = find_population_columns(frame)

    data = pd.DataFrame(index=frame.index)
    data["year"] = pd.to_numeric(frame[columns["year"]], errors="coerce")
    data["country_name"] = frame[columns["name"]].map(clean_text)
    data["iso3"] = frame[columns["iso3"]].map(iso3)
    data["population_raw"] = frame[columns["population"]].map(number)

    if "location_code" in columns:
        data["location_code"] = frame[columns["location_code"]].map(location_code)
    else:
        data["location_code"] = None

    if "variant" in columns:
        data["variant"] = frame[columns["variant"]].map(clean_text)
    else:
        data["variant"] = ""

    data = data[
        data["year"].notna()
        & data["population_raw"].notna()
        & data["iso3"].notna()
        & data["year"].between(minimum_year, maximum_year)
    ].copy()

    if data.empty:
        raise ValueError(
            f"No usable population rows remained after reading {path.name}. "
            "Check the WPP CSV columns and year range."
        )

    data["year"] = data["year"].astype(int)

    if unit == "auto":
        source_is_thousands = normalized(columns["population"]) in {
            "tpopulation1july",
            "population1july",
        }
    else:
        source_is_thousands = unit == "thousands"

    multiplier = 1000 if source_is_thousands else 1
    data["total_population"] = (
        data["population_raw"] * multiplier
    ).round().astype("int64")

    data["variant_priority"] = data.apply(
        lambda row: variant_priority(int(row["year"]), row["variant"]),
        axis=1,
    )
    data = (
        data.sort_values(["iso3", "year", "variant_priority"])
        .drop_duplicates(["iso3", "year"], keep="first")
        .drop(columns=["variant_priority"])
    )

    data["population_phase"] = data.apply(
        lambda row: (
            "projected"
            if int(row["year"]) >= 2024 and "estimate" not in row["variant"].lower()
            else "estimated"
        ),
        axis=1,
    )

    population = data[
        [
            "year",
            "iso3",
            "country_name",
            "location_code",
            "total_population",
            "population_phase",
            "variant",
        ]
    ].rename(columns={"variant": "variant_name"})

    location_map: dict[str, dict[str, str | None]] = {}
    for row in population.itertuples(index=False):
        if row.location_code and row.iso3:
            location_map[row.location_code] = {
                "iso3": row.iso3,
                "name": row.country_name,
            }

    metadata = {
        "provider": "United Nations DESA Population Division",
        "dataset": "World Population Prospects 2024",
        "sourceFile": path.name,
        "populationColumn": columns["population"],
        "populationUnitInSource": "thousands" if source_is_thousands else "people",
        "populationUnitOutput": "people",
        "yearMin": int(population["year"].min()),
        "yearMax": int(population["year"].max()),
        "countryCount": int(population["iso3"].nunique()),
    }

    return population, location_map, metadata


def read_migration_sheet(path: Path) -> tuple[pd.DataFrame, str, int]:
    workbook = pd.ExcelFile(path)

    for sheet in workbook.sheet_names:
        raw = pd.read_excel(path, sheet_name=sheet, header=None, dtype=object)

        for row_index in range(min(100, len(raw))):
            values = [normalized(value) for value in raw.iloc[row_index].tolist()]
            has_destination = any("destination" in value for value in values)
            has_origin = any("origin" in value for value in values)
            has_year = any(str(year) in values for year in MIGRATION_YEARS)

            if has_destination and has_origin and has_year:
                frame = raw.iloc[row_index + 1 :].copy()
                frame.columns = unique_columns(raw.iloc[row_index].tolist())
                frame = frame.dropna(how="all").reset_index(drop=True)
                return frame, sheet, row_index

    raise ValueError(
        f"Could not locate the UN DESA migration table in {path.name}. "
        f"Sheets found: {workbook.sheet_names}"
    )


def first_column(
    columns: list[str], required: tuple[str, ...], forbidden: tuple[str, ...] = ()
) -> str | None:
    for column in columns:
        value = normalized(column)
        if all(part in value for part in required) and not any(
            part in value for part in forbidden
        ):
            return column
    return None


def migration_columns(frame: pd.DataFrame) -> tuple[str, str, str | None, str | None, dict[int, str]]:
    columns = list(frame.columns)

    destination_name = first_column(columns, ("destination",), ("code",))
    origin_name = first_column(columns, ("origin",), ("code",))

    destination_code = first_column(columns, ("destination", "code"))
    origin_code = first_column(columns, ("origin", "code"))

    if destination_code is None or origin_code is None:
        code_columns = [
            column
            for column in columns
            if "location_code" in normalized(column)
            or normalized(column) in {"locid", "locationid"}
        ]

        if destination_code is None and len(code_columns) >= 1:
            destination_code = code_columns[0]
        if origin_code is None and len(code_columns) >= 2:
            origin_code = code_columns[1]

    year_columns = {
        int(normalized(column)): column
        for column in columns
        if normalized(column).isdigit()
        and int(normalized(column)) in MIGRATION_YEARS
    }

    missing = []
    if destination_name is None:
        missing.append("Destination")
    if origin_name is None:
        missing.append("Origin")
    if len(year_columns) != len(MIGRATION_YEARS):
        missing.append("all migration years")

    if missing:
        raise ValueError(
            "Could not identify "
            + ", ".join(missing)
            + f" in the UN DESA workbook.\nColumns found: {columns}"
        )

    return destination_name, origin_name, destination_code, origin_code, year_columns


def load_migration(
    path: Path,
    location_map: dict[str, dict[str, str | None]],
    stock_unit: str,
) -> tuple[pd.DataFrame, pd.DataFrame, dict[str, Any]]:
    frame, sheet, header_row = read_migration_sheet(path)
    destination_name_col, origin_name_col, destination_code_col, origin_code_col, years = (
        migration_columns(frame)
    )

    selected = pd.DataFrame()
    selected["destination_name"] = frame[destination_name_col].map(clean_text)
    selected["origin_name"] = frame[origin_name_col].map(clean_text)

    if destination_code_col:
        selected["destination_location_code"] = frame[destination_code_col].map(location_code)
    else:
        selected["destination_location_code"] = None

    if origin_code_col:
        selected["origin_location_code"] = frame[origin_code_col].map(location_code)
    else:
        selected["origin_location_code"] = None

    for year, column in years.items():
        selected[f"stock_{year}"] = frame[column].map(number)

    long = selected.melt(
        id_vars=[
            "destination_name",
            "origin_name",
            "destination_location_code",
            "origin_location_code",
        ],
        value_vars=[f"stock_{year}" for year in MIGRATION_YEARS],
        var_name="stock_year",
        value_name="migrant_stock_source",
    )
    long["year"] = long["stock_year"].str.extract(r"(\d{4})").astype(int)
    long = long[long["migrant_stock_source"].notna()].copy()

    multiplier = 1000 if stock_unit == "thousands" else 1
    long["migrant_stock"] = (
        long["migrant_stock_source"] * multiplier
    ).round().astype("int64")

    def mapped_iso(code: Any, name: Any) -> str | None:
        if code and code in location_map:
            return location_map[code].get("iso3")
        return None

    long["destination_iso3"] = long.apply(
        lambda row: mapped_iso(
            row["destination_location_code"], row["destination_name"]
        ),
        axis=1,
    )
    long["origin_iso3"] = long.apply(
        lambda row: mapped_iso(row["origin_location_code"], row["origin_name"]),
        axis=1,
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

    audit = long[
        [
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
    ].copy()

    pairs = audit[
        audit["origin_iso3"].notna()
        & audit["destination_iso3"].notna()
        & (audit["origin_iso3"] != audit["destination_iso3"])
        & (audit["migrant_stock"] > 0)
    ].copy()

    metadata = {
        "provider": "United Nations DESA Population Division",
        "dataset": "International Migrant Stock 2024: Destination and origin",
        "sourceFile": path.name,
        "sheet": sheet,
        "headerRowZeroBased": header_row,
        "referenceYears": list(MIGRATION_YEARS),
        "stockUnitInSource": stock_unit,
        "stockUnitOutput": "people",
        "auditRows": int(len(audit)),
        "countryPairRows": int(len(pairs)),
    }

    return audit, pairs, metadata


def build_country_year(
    population: pd.DataFrame,
    audit: pd.DataFrame,
    pairs: pd.DataFrame,
) -> pd.DataFrame:
    # The workbook contains country rows and aggregate rows such as World,
    # Europe, and income groups. Aggregate rows must not be summed into totals.
    destination_rows = audit[
        audit["destination_iso3"].notna()
        & (
            audit["origin_iso3"].notna()
            | (audit["origin_location_code"] == "2003")
        )
    ]

    destination_totals = (
        destination_rows.groupby(
            ["year", "destination_iso3"], as_index=False
        )["migrant_stock"]
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

    country_names = population[
        ["iso3", "country_name", "location_code"]
    ].drop_duplicates("iso3")

    migration_names = pd.concat(
        [
            audit[["origin_iso3", "origin_name", "origin_location_code"]].rename(
                columns={
                    "origin_iso3": "iso3",
                    "origin_name": "country_name",
                    "origin_location_code": "location_code",
                }
            ),
            audit[
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
    ).dropna(subset=["iso3"])

    country_names = pd.concat([country_names, migration_names], ignore_index=True)
    country_names = country_names.drop_duplicates("iso3", keep="first")

    years = sorted(population["year"].unique().tolist())
    countries = sorted(country_names["iso3"].unique().tolist())
    result = pd.MultiIndex.from_product(
        [years, countries], names=["year", "iso3"]
    ).to_frame(index=False)

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
    result = result.merge(
        country_names,
        on="iso3",
        how="left",
        suffixes=("", "_fallback"),
    )

    result["country_name"] = result["country_name"].fillna(
        result["country_name_fallback"]
    )
    result["location_code"] = result["location_code"].fillna(
        result["location_code_fallback"]
    )
    result = result.drop(columns=["country_name_fallback", "location_code_fallback"])

    for column in [
        "migrant_stock_destination",
        "migrant_stock_origin_published_pairs",
    ]:
        result[column] = result[column].fillna(0).round().astype("int64")

    result["migrant_stock_available"] = result["year"].isin(MIGRATION_YEARS)
    population_denominator = result["total_population"].where(
        result["total_population"] > 0
    )
    result["migrant_share_percent"] = (
        result["migrant_stock_destination"]
        .div(population_denominator)
        .mul(100)
        .round(4)
    )

    return result.sort_values(["year", "iso3"]).reset_index(drop=True)


def json_records(frame: pd.DataFrame) -> list[dict[str, Any]]:
    return json.loads(frame.to_json(orient="records"))


def build_ui_payload(
    country_year: pd.DataFrame,
    pairs: pd.DataFrame,
    metadata: dict[str, Any],
) -> dict[str, Any]:
    countries = (
        country_year[
            ["iso3", "country_name", "location_code"]
        ]
        .dropna(subset=["iso3"])
        .drop_duplicates("iso3")
        .sort_values("country_name")
    )

    snapshots = []

    for year in MIGRATION_YEARS:
        country_snapshot = country_year[
            country_year["year"] == year
        ][
            [
                "iso3",
                "country_name",
                "total_population",
                "migrant_stock_destination",
                "migrant_stock_origin_published_pairs",
                "migrant_share_percent",
            ]
        ]

        # Preserve every valid pair.
        # The frontend selects the top five destinations.
        flow_snapshot = (
            pairs[pairs["year"] == year]
            .sort_values(
                [
                    "origin_iso3",
                    "migrant_stock",
                    "destination_iso3",
                ],
                ascending=[True, False, True],
            )
        )

        snapshots.append(
            {
                "year": year,
                "flowCount": int(len(flow_snapshot)),
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
        "schemaVersion": 1,
        "referenceYears": list(MIGRATION_YEARS),
        "countries": [
            {
                "code": row.iso3,
                "name": row.country_name,
                "numericCode": row.location_code,
            }
            for row in countries.itertuples(index=False)
        ],
        "snapshots": snapshots,
        "source": metadata,
        "note": (
            "UN DESA values are migrant-stock estimates, "
            "not annual migration flows."
        ),
    }


def write_json(path: Path, value: Any) -> None:
    path.write_text(
        json.dumps(value, indent=2, ensure_ascii=False, allow_nan=False),
        encoding="utf-8",
    )


def write_table(frame: pd.DataFrame, output_dir: Path, name: str) -> None:
    write_json(output_dir / f"{name}.json", json_records(frame))

    try:
        frame.to_parquet(output_dir / f"{name}.parquet", index=False)
    except ImportError as error:
        raise RuntimeError(
            "Parquet output requires pyarrow. Install the backend requirements with "
            "'.\\.venv\\Scripts\\python.exe -m pip install -r requirements.txt'."
        ) from error


def main() -> None:
    root = repository_root()
    backend = root / "backend"
    default_raw = backend / "data" / "raw" / "infrastructure" / "migration"
    default_output = (
        backend / "data" / "processed" / "infrastructure" / "migration"
    )

    parser = argparse.ArgumentParser(
        description="Process UN DESA migrant stock and UN WPP 2024 data."
    )
    parser.add_argument(
        "--migrant-file",
        default=str(
            default_raw / "undesa_pd_2024_ims_stock_by_sex_destination_and_origin.xlsx"
        ),
    )
    parser.add_argument(
        "--population-file",
        default=str(default_raw / "WPP2024_Demographic_Indicators_Medium.csv"),
    )
    parser.add_argument("--output-dir", default=str(default_output))
    parser.add_argument(
        "--migrant-stock-unit",
        choices=("people", "thousands"),
        default="people",
    )
    parser.add_argument(
        "--population-unit",
        choices=("auto", "people", "thousands"),
        default="auto",
    )
    
    args = parser.parse_args()

    migrant_file = resolve_path(args.migrant_file, root)
    population_file = resolve_path(args.population_file, root)
    output_dir = resolve_path(args.output_dir, root)

    for path in (migrant_file, population_file):
        if not path.is_file():
            raise FileNotFoundError(f"Input file does not exist: {path}")

    output_dir.mkdir(parents=True, exist_ok=True)

    population, location_map, population_metadata = load_population(
        population_file,
        args.population_unit,
    )
    audit, pairs, migration_metadata = load_migration(
        migrant_file,
        location_map,
        args.migrant_stock_unit,
    )
    country_year = build_country_year(population, audit, pairs)

    source_metadata = {
        "processedAt": datetime.now(timezone.utc).isoformat(),
        "migration": migration_metadata,
        "population": population_metadata,
    }

    write_table(country_year, output_dir, "country_year")
    write_table(pairs, output_dir, "migration_pairs")
    write_table(audit, output_dir, "migration_audit")

    write_json(
        output_dir / "migrationData.json",
        build_ui_payload(country_year, pairs, source_metadata, max(1, args.top_flows)),
    )

    validation = {
        "source": source_metadata,
        "counts": {
            "populationRows": int(len(population)),
            "populationCountries": int(population["iso3"].nunique()),
            "migrationAuditRows": int(len(audit)),
            "migrationPairRows": int(len(pairs)),
        },
        "checks": {
            "migrationYearsExact": sorted(audit["year"].unique().tolist())
            == list(MIGRATION_YEARS),
            "noNegativePopulation": bool(
                (population["total_population"] >= 0).all()
            ),
            "noNegativeMigrationStock": bool((audit["migrant_stock"] >= 0).all()),
            "countryPairsHaveIso3": bool(
                pairs["origin_iso3"].notna().all()
                and pairs["destination_iso3"].notna().all()
            ),
        },
        "warnings": [
            "UN DESA values are migrant-stock estimates, not annual migration flows.",
            "No synthetic migration years or migration projections were generated.",
            "The UI payload contains the largest --top-flows edges per reference year; migration_pairs.json contains all mapped country pairs.",
        ],
    }
    write_json(output_dir / "validation.json", validation)

    print(f"Processed migration file: {migrant_file}")
    print(f"Processed population file: {population_file}")
    print(f"Output directory: {output_dir}")
    print(f"Population rows: {len(population):,}")
    print(f"Country-pair rows: {len(pairs):,}")


if __name__ == "__main__":
    main()
