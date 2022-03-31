import { createResponse } from '../../../utils'
import { ActivityState, ErrorCodes } from '../../../models/enum'
import { Account, connect, disconnect } from '../../../models'
import { Email, FCMAPI, Template } from '../../../api'
import Environment from '../../../env'

export const handler: AWSLambda.APIGatewayProxyHandlerV2 = async (
  event,
  context,
): Promise<AWSLambda.APIGatewayProxyResultV2> => {
  try {
    const { token, key } =
      (event.queryStringParameters as AWSLambda.APIGatewayProxyEventQueryStringParameters) ?? {}
    if (!token) {
      return {
        statusCode: 400,
        body: '❌ Partner could not be approved!',
      }
    }

    if (!key || key !== Environment.approvalKey) {
      return {
        statusCode: 400,
        body: '❌ Provider the approval key!',
      }
    }

    await connect()
    const account = await Account.findOne({ activationKey: token as string })
    if (!account) {
      return {
        statusCode: 404,
        body: '❌ Partner could not be approved!',
      }
    }

    account.activationKey = undefined
    account.state = ActivityState.Active

    await account.save()

    await Promise.all([
      Email.sendEmail(
        Template.AccountApproval,
        {
          org_name: account.details.orgName,
        },
        account.details.email as string,
      ),
      ...account.pushTokens.map((target) =>
        FCMAPI.sendMessage(
          target,
          "You've been approved",
          'Your profile has just been approved by the Samaritan crew. Welcome to Samaritan!',
        ),
      ),
    ])

    return {
      statusCode: 200,
      body: '✅ Partner has been approved!',
    }
  } catch (error) {
    console.error(error)
    return createResponse(500, { code: ErrorCodes.Generic })
  } finally {
    await disconnect(context.getRemainingTimeInMillis() - 150)
  }
}
