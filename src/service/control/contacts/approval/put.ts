import { createResponse, createValidationError, getSubject } from '../../../utils'

import { contactApprovalSchema } from '../../../models/request'
import { ActivityState, ApprovalState, ErrorCodes } from '../../../models/enum'
import { Account, connect, Contact, disconnect } from '../../../models'
import { Email, FCMAPI, Template } from '../../../api'

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

    if (contact.receiver._id.toString() !== account._id.toString()) {
      return createResponse(403, { code: ErrorCodes.NotOwner })
    }

    if (request.approval === ApprovalState.Approved) {
      contact.state = ApprovalState.Approved
      await contact.save()

      const creatorAccount = await Account.findOne({ _id: contact.creator._id }, 'pushTokens')

      await Promise.all([
        Email.sendEmail(
          Template.HomeownerApproval,
          {
            homeowner_name: contact.receiver.name,
            homeowner_address: contact.receiver.address,
            homeowner_post: contact.receiver.postal,
            homeowner_city: contact.receiver.city,
            homeowner_beds: contact.receiver.beds,
            homeowner_phone: contact.receiver.phone,
            homeowner_email: contact.receiver.email,
          },
          contact.creator.email as string,
        ),
        ...(creatorAccount?.pushTokens || []).map((target) =>
          FCMAPI.sendMessage(
            target,
            'Details have been shared with you',
            `${contact.receiver.name} has just shared their details with you. All of their details are now available to you in the app.`,
          ),
        ),
      ])

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
