import { createResponse, getSubject } from '../../utils'
import { ErrorCodes } from '../../models/enum'
import { Account, connect } from '../../models'

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

    return createResponse(200, {
      id: account._id.toString(),
      state: account.state,
      name: account.details.name,
      orgName: account.details.orgName,
      contact: {
        phone: account.details.phone,
        email: account.details.email,
        website: account.details.website,
      },
      location: {
        address: account.details.address,
        postal: account.details.postal,
        city: account.details.city,
        country: account.details.country,
        coords: account.details.coords?.coordinates as [number, number],
      },
    })
  } catch (error) {
    console.error(error)
    return createResponse(500, { code: ErrorCodes.Generic })
  }
}
