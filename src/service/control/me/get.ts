import { createResponse, getSubject } from '../../utils'
import { AccountType, ErrorCodes } from '../../models/enum'
import { Account, connect, disconnect, Room } from '../../models'

export const handler: AWSLambda.APIGatewayProxyHandlerV2 = async (
  event,
  context,
): Promise<AWSLambda.APIGatewayProxyResultV2> => {
  try {
    const subject = getSubject(event)

    await connect()
    const account = await Account.getByExternalRef(subject)
    if (!account) {
      return createResponse(404, { code: ErrorCodes.UnknownEntity })
    }

    let nrBeds: number | undefined
    if (account.details.type === AccountType.Homeowner) {
      const doc = await Room.findOne(
        {
          owner: account._id,
        },
        'beds',
      )
      nrBeds = doc?.beds
    }

    return createResponse(200, {
      id: account._id.toString(),
      state: account.state,
      type: account.details.type,
      name: account.details.name,
      orgName: account.details.orgName,
      mission: account.details.mission,
      contact: {
        phone: account.details.phone,
        email: account.details.email,
        website: account.details.website,
      },
      location: {
        nrBeds,
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
  } finally {
    await disconnect(context.getRemainingTimeInMillis() - 150)
  }
}
