import { createResponse, getSubject } from '../../utils'
import { ErrorCodes } from '../../models/enum'
import { Account, connect, Contact, disconnect, Room } from '../../models'
import { Auth0API } from '../../api'

export const handler: AWSLambda.APIGatewayProxyHandlerV2 = async (
  event,
  context,
): Promise<AWSLambda.APIGatewayProxyResultV2> => {
  try {
    const subject = getSubject(event)

    if (subject.startsWith('auth0')) {
      return createResponse(204)
    }

    await connect()
    const account = await Account.getByExternalRef(subject)
    if (!account) {
      return createResponse(404, { code: ErrorCodes.UnknownEntity })
    }

    await Promise.all([
      Room.deleteOne({ owner: account._id }),
      Contact.deleteMany({
        $or: [{ 'receiver._id': account._id }, { 'creator._id': account._id }],
      }),
      Account.deleteOne({ _id: account._id }),
      Auth0API.deleteUserAccount(subject),
    ])

    return createResponse(204)
  } catch (error) {
    console.error(error)
    return createResponse(500, { code: ErrorCodes.Generic })
  } finally {
    await disconnect(context.getRemainingTimeInMillis() - 150)
  }
}
