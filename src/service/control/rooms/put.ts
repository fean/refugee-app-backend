import { createResponse, createValidationError, getSubject } from '../../utils'
import { ActivityState, ErrorCodes } from '../../models/enum'
import { Account, connect, disconnect, Room } from '../../models'
import { roomsRequestSchema } from '../../models/request'

export const handler: AWSLambda.APIGatewayProxyHandlerV2 = async (
  event,
): Promise<AWSLambda.APIGatewayProxyResultV2> => {
  try {
    const { error, value: request } = roomsRequestSchema.validate(JSON.parse(event.body as string))
    if (error) {
      return createValidationError(error)
    }

    const subject = getSubject(event)

    await connect()
    const account = await Account.getByExternalRef(subject)
    if (!account) {
      return createResponse(400, { code: ErrorCodes.AccountBad })
    }
    if (account.state === ActivityState.Inactive) {
      return createResponse(403, { code: ErrorCodes.AccountInactive })
    }

    const results = await Room.findInArea(
      [Number(request.lng), Number(request.lat)],
      Number(request.distance) * 4.5,
    )

    return createResponse(
      200,
      results.map((result) => ({
        id: result._id.toString(),
        address: result.location.address,
        postal: result.location.postal,
        city: result.location.city,
        country: result.location.countryCode,
        coords: result.location.coords.coordinates,
        beds: result.beds,
      })),
    )
  } catch (error) {
    console.error(error)
    return createResponse(500, { code: ErrorCodes.Generic })
  } finally {
    await disconnect()
  }
}
