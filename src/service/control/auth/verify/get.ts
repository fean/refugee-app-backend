import { createResponse } from '../../../utils'
import { AccountType, ActivityState, ErrorCodes } from '../../../models/enum'
import { Account, connect, disconnect } from '../../../models'

export const handler: AWSLambda.APIGatewayProxyHandlerV2 = async (
  event,
): Promise<AWSLambda.APIGatewayProxyResultV2> => {
  try {
    const { token } =
      (event.queryStringParameters as AWSLambda.APIGatewayProxyEventQueryStringParameters) ?? {}
    if (!token) {
      return {
        statusCode: 400,
        body: '❌ Email could not be verified!',
      }
    }

    await connect()
    const account = await Account.findOne({ mailActivationKey: token as string })
    if (!account) {
      return {
        statusCode: 404,
        body: '✅ Email has been confirmed! Continue in the app!',
      }
    }

    account.mailActivationKey = undefined

    const isAccountReadyForActivation =
      account.details.type !== AccountType.Partner || !account.activationKey
    if (isAccountReadyForActivation) {
      account.state = ActivityState.Active
    }

    await account.save()

    return {
      statusCode: 200,
      body: '✅ Email has been confirmed! Continue in the app!',
    }
  } catch (error) {
    console.error(error)
    return createResponse(500, { code: ErrorCodes.Generic })
  } finally {
    await disconnect()
  }
}
