import { createResponse, createValidationError, getSubject } from '../../../utils'

import { contactApprovalSchema } from '../../../models/request'
import { ActivityState, ApprovalState, ErrorCodes } from '../../../models/enum'
import { Account, connect, Contact, disconnect } from '../../../models'

export const handler: AWSLambda.APIGatewayProxyHandlerV2 = async (
  event,
): Promise<AWSLambda.APIGatewayProxyResultV2> => {
  try {
    const { error, value: request } = contactApprovalSchema.validate(
      JSON.parse(event.body as string),
    )
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

    const contact = await Contact.findById(request.contactId)
    if (!contact) {
      return createResponse(404, { code: ErrorCodes.UnknownEntity })
    }

    if (request.approval === ApprovalState.Approved) {
      contact.state = ApprovalState.Approved
      await contact.save()

      // TODO: Send email & push

      return createResponse(204)
    }

    await contact.delete()
    return createResponse(204)
  } catch (error) {
    console.error(error)
    return createResponse(500, { code: ErrorCodes.Generic })
  } finally {
    await disconnect()
  }
}
