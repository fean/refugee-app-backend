import { AxiosClient } from "@trunkrs/common/services/client"
import Environment from "../env"

interface GeocodingResult {
  features: Array<{ center: [number, number] }>
}

export class MapBoxApi {
  private static http = new AxiosClient()

  public static async geocodeAddress(
    address: string,
    postal: string,
    city: string,
  ): Promise<[number, number] | undefined> {
    const query = encodeURIComponent(`${address},${postal},${city}`)
    const result = await MapBoxApi.http.get<GeocodingResult>({
      url: `https://api.mapbox.com/geocoding/v5/mapbox.places/${query}.json`,
      params: {
        autocomplete: false,
        access_token: Environment.mapBoxApiToken,
        types: "address",
        limit: 1,
      }
    })

    return result.features[0]?.center
  }
}
