from pathlib import Path

import xarray as xr


DATA_DIRECTORY = Path("data/raw/copernicus_marine")
FILES = sorted(DATA_DIRECTORY.glob("*.nc"))

if not FILES:
    raise FileNotFoundError(
        f"No NetCDF files found in: {DATA_DIRECTORY.resolve()}"
    )

data_file = FILES[-1]

print(f"\nFile: {data_file}")
print(f"Size: {data_file.stat().st_size / 1024 / 1024:.2f} MB\n")

with xr.open_dataset(data_file) as dataset:
    print("Dimensions:")
    for name, size in dataset.sizes.items():
        print(f"  {name}: {size}")

    print("\nCoordinates:")
    print(list(dataset.coords))

    print("\nData variables:")
    for name, variable in dataset.data_vars.items():
        print(f"  {name}: {variable.dims} {variable.shape}")

    print("\nVariable metadata:")
    for name, variable in dataset.data_vars.items():
        print(f"\n{name}")
        print(variable.attrs)