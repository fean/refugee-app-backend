import { createResponse, getSubject } from '../../utils'
import { ActivityState, ErrorCodes } from '../../models/enum'
import { Account, connect, Room } from '../../models'

export const handler: AWSLambda.APIGatewayProxyHandlerV2 = async (
  event,
): Promise<AWSLambda.APIGatewayProxyResultV2> => {
  try {
    const subject = getSubject(event)

    await connect()
    const account = await Account.getByExternalRef(subject)
    if (!account) {
      return createResponse(404, { code: ErrorCodes.UnknownEntity })
    }
    if (account.state === ActivityState.Inactive) {
      return createResponse(403, { code: ErrorCodes.AccountInactive })
    }

    const { distance, lat, lng } = event.queryStringParameters
    const results = await Room.findInArea([Number(lng), Number(lat)], Number(distance))

    return createResponse(
      200,
      results.map((result) => ({
        id: result._id.toString(),
        address: result.location.address,
        postal: result.location.postal,
        city: result.location.city,
        country: result.location.countryCode,
        coords: result.location.coords.coordinates,
      })),
    )
  } catch (error) {
    console.error(error)
    return createResponse(500, { code: ErrorCodes.Generic })
  }
}
