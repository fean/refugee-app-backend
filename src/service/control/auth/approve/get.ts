import { createResponse } from '../../../utils'
import { ActivityState, ErrorCodes } from '../../../models/enum'
import { Account, connect, disconnect } from '../../../models'
import { Email, Template } from '../../../api'

export const handler: AWSLambda.APIGatewayProxyHandlerV2 = async (
  event,
): Promise<AWSLambda.APIGatewayProxyResultV2> => {
  try {
    const { token } =
      event.queryStringParameters as AWSLambda.APIGatewayProxyEventQueryStringParameters
    if (!token) {
      return {
        statusCode: 400,
        body: '❌ Partner could not be approved!',
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
    if (!account.mailActivationKey) {
      account.state = ActivityState.Active
    }

    await account.save()

    await Email.sendEmail(
      Template.AccountApproval,
      {
        org_name: account.details.orgName,
      },
      account.details.email as string,
    )

    return {
      statusCode: 200,
      body: '✅ Partner has been approved!',
    }
  } catch (error) {
    console.error(error)
    return createResponse(500, { code: ErrorCodes.Generic })
  } finally {
    await disconnect()
  }
}
