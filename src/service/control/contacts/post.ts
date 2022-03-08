import * as mongoose from 'mongoose'

import { createResponse, createValidationError } from '../../utils'

import { getSubject } from '../../utils'

import { partnerContactRequestSchema } from '../../models/request'
import { ErrorCodes, ActivityState, ApprovalState } from '../../models/enum'
import { Account, connect, Contact, disconnect, Room } from '../../models'

import { mapToPartnerContact } from './get'

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
      state: ApprovalState.Pending,
      creator: { _id: account._id, ...account.details },
      receiver: { _id: roomOwner._id, ...roomOwner.details },
    })
    await contact.save()

    // TODO: Do push request & email

    return createResponse(201, mapToPartnerContact(contact))
  } catch (error) {
    console.error(error)
    return createResponse(500, { code: ErrorCodes.Generic })
  } finally {
    await disconnect()
  }
}
