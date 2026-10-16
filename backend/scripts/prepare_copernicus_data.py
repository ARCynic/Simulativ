from pathlib import Path
import json

import pandas as pd
import xarray as xr


RAW_DIRECTORY = Path("data/raw/copernicus_marine")
PROCESSED_DIRECTORY = Path("data/processed/copernicus_marine")

PROCESSED_DIRECTORY.mkdir(parents=True, exist_ok=True)

files = sorted(RAW_DIRECTORY.glob("*.nc"))

if not files:
    raise FileNotFoundError(
        f"No NetCDF files found in {RAW_DIRECTORY.resolve()}"
    )

input_file = files[-1]

with xr.open_dataset(input_file) as dataset:
    temperature = dataset["thetao"]

    dataframe = (
        temperature
        .to_dataframe(name="temperature_c")
        .reset_index()
    )

dataframe = dataframe.dropna(subset=["temperature_c"])

dataframe["time"] = (
    pd.to_datetime(dataframe["time"], utc=True)
    .dt.strftime("%Y-%m-%dT%H:%M:%SZ")
)

dataframe["latitude"] = dataframe["latitude"].astype(float).round(5)
dataframe["longitude"] = dataframe["longitude"].astype(float).round(5)
dataframe["depth"] = dataframe["depth"].astype(float).round(3)
dataframe["temperature_c"] = (
    dataframe["temperature_c"].astype(float).round(4)
)

records = dataframe.to_dict(orient="records")

output = {
    "source": "Copernicus Marine",
    "product": "Global Ocean Physics Reanalysis",
    "dataset": "cmems_mod_glo_phy_my_0.083deg_P1D-m",
    "variable": "thetao",
    "unit": "degrees_C",
    "records": records,
}

output_file = PROCESSED_DIRECTORY / "temperature.json"

output_file.write_text(
    json.dumps(output, indent=2),
    encoding="utf-8",
)

print(f"Input file: {input_file}")
print(f"Output file: {output_file}")
print(f"Records written: {len(records)}")