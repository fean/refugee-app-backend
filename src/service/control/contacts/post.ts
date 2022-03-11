import * as mongoose from 'mongoose'

import { createResponse, createValidationError, getSubject } from '../../utils'

import { partnerContactRequestSchema } from '../../models/request'
import { ActivityState, ApprovalState, ErrorCodes } from '../../models/enum'
import { Account, connect, Contact, disconnect, Room } from '../../models'

import { mapToPartnerContact } from './get'
import { Email, FCMAPI, Template } from '../../api'

export const handler: AWSLambda.APIGatewayProxyHandlerV2 = async (
  event,
): Promise<AWSLambda.APIGatewayProxyResultV2> => {
  try {
    const { error, value: request } = partnerContactRequestSchema.validate(
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

    const room = await Room.findById(new mongoose.Types.ObjectId(request.roomId))
    if (!room) {
      return createResponse(404, { code: ErrorCodes.UnknownEntity })
    }

    const roomOwner = await Account.findById(room.owner)
    if (!roomOwner) {
      return createResponse(404, { code: ErrorCodes.UnknownEntity })
    }

    const contact = new Contact({
      origin: room._id,
      state: ApprovalState.Pending,
      creator: { _id: account._id, ...account.details },
      receiver: { _id: roomOwner._id, ...roomOwner.details, beds: room.beds },
    })
    await contact.save()

    await Promise.all([
      Email.sendEmail(
        Template.ContactRequest,
        {
          org_name: contact.creator.orgName,
        },
        contact.receiver.email as string,
      ),
      ...roomOwner.pushTokens.map((target) =>
        FCMAPI.sendMessage(
          target,
          'New contact request',
          `${contact.creator.orgName} has requested your details. Check it out now in the app.`,
        ),
      ),
    ])

    return createResponse(201, mapToPartnerContact(contact))
  } catch (error) {
    console.error(error)
    return createResponse(500, { code: ErrorCodes.Generic })
  } finally {
    await disconnect()
  }
}
