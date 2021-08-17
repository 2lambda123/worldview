The Land Surface Temperature (Night) layer is from the new Land Surface Temperature and Emissivity (LST&E) product (MOD/MYD21), which is in addition to the heritage MOD11/MYD11 Land Surface Temperature (LST) product. It show the temperature of the land surface in Kelvin (K).

The MOD/MYD21 Temperature/Emissivity Separation (TES) algorithm is a physics-based algorithm used to dynamically retrieve both LST and spectral emissivity simultaneously from the MODIS thermal infrared (TIR) bands 29, 31, and 32. The TES algorithm is combined with an improved Water Vapor Scaling (WVS) atmospheric correction scheme to stabilize the retrieval during warm and humid conditions. The MOD/MYD21 LST&E algorithm differs from the MOD11/MYD11 L2 algorithm in that the MOD21/MYD21 algorithm is based on the ASTER TES technique, whereas the MOD11/MYD11 L2 products uses a generalized split-window (GSW) technique. MOD/MYD21 addresses the 3-5 K cold bias over desert regions that currently exists with the MOD/MYD11 LST product, and using the TES algorithm allows a dynamical retrieval of land surface emissivity for all MODIS TIR bands 29, 31, and 32. Users are encourage to read the [current validation status report](https://modis-land.gsfc.nasa.gov/pdf/MOD21_MOD11_report.pdf) to better understand differences between these two products.

The MODIS Land Surface Temperature product is available from both Terra (MOD21) and Aqua (MYD21) satellites. The sensor and imagery resolution is 1 km, and the temporal resolution is daily.

References: MYD21 [doi:10.5067/MODIS/MYD21.061](https://doi.org/10.5067/MODIS/MYD21.061)