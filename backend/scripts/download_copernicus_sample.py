from pathlib import Path

import copernicusmarine


OUTPUT_DIRECTORY = Path("data/raw/copernicus_marine")

OUTPUT_DIRECTORY.mkdir(parents=True, exist_ok=True)


copernicusmarine.subset(
    dataset_id="cmems_mod_glo_phy_my_0.083deg_P1D-m",
    variables=["thetao"],
    minimum_longitude=2,
    maximum_longitude=8,
    minimum_latitude=50,
    maximum_latitude=54,
    start_datetime="2020-01-01T00:00:00",
    end_datetime="2020-01-07T23:59:59",
    minimum_depth=0,
    maximum_depth=1,
    output_filename="north_sea_temperature_january_2020.nc",
    output_directory=str(OUTPUT_DIRECTORY),
)