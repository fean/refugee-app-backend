import { createResponse, createValidationError, getSubject } from '../../../utils'
import { ErrorCodes } from '../../../models/enum'
import { Account, connect, disconnect } from '../../../models'
import { pushTokenSchema } from '../../../models/request'

export const handler: AWSLambda.APIGatewayProxyHandlerV2 = async (
  event,
  context,
): Promise<AWSLambda.APIGatewayProxyResultV2> => {
  try {
    const { error, value: request } = pushTokenSchema.validate(JSON.parse(event.body as string))
    if (error) {
      return createValidationError(error)
    }

    const subject = getSubject(event)

    await connect()
    const account = await Account.getByExternalRef(subject)
    if (!account) {
      return createResponse(404, { code: ErrorCodes.AccountBad })
    }

    await Account.updateOne({ _id: account._id }, { $push: { pushTokens: request.token } })

    return createResponse(201)
  } catch (error) {
    console.error(error)
    return createResponse(500, { code: ErrorCodes.Generic })
  } finally {
    await disconnect(context.getRemainingTimeInMillis() - 150)
  }
}
