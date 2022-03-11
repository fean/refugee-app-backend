import { createResponse, getSubject } from '../../utils'
import { AccountType, ActivityState, ApprovalState, ErrorCodes } from '../../models/enum'
import { Account, connect, Contact, ContactProps, disconnect } from '../../models'

export const mapToHomeownerContact = (contact: ContactProps) => ({
  id: contact._id.toString(),
  state: contact.state,
  name: contact.creator.orgName,
  mission: contact.creator.mission,
  contact: {
    phone: contact.creator.phone,
    email: contact.creator.email,
    website: contact.creator.website,
  },
  location: {
    address: contact.creator.address,
    postal: contact.creator.postal,
    city: contact.creator.city,
    country: contact.creator.country,
    coords: contact.creator.coords?.coordinates,
  },
})

export const mapToPartnerContact = (contact: ContactProps) => ({
  id: contact._id.toString(),
  state: contact.state,
  origin: contact.origin.toString(),
  name: contact.state === ApprovalState.Approved ? contact.receiver.name : undefined,
  contact:
    contact.state === ApprovalState.Approved
      ? {
          phone: contact.receiver.phone,
          email: contact.receiver.email,
        }
      : undefined,
  location: {
    address: contact.receiver.address,
    postal: contact.receiver.postal,
    city: contact.receiver.city,
    country: contact.receiver.country,
    coords: contact.receiver.coords?.coordinates,
    nrBeds: contact.receiver.beds,
  },
})

export const handler: AWSLambda.APIGatewayProxyHandlerV2 = async (
  event,
): Promise<AWSLambda.APIGatewayProxyResultV2> => {
  try {
    const subject = getSubject(event)

    await connect()
    const account = await Account.getByExternalRef(subject)
    if (!account) {
      return createResponse(400, { code: ErrorCodes.AccountBad })
    }
    if (account.state === ActivityState.Inactive) {
      return createResponse(403, { code: ErrorCodes.AccountInactive })
    }

    const contacts = await Contact.findUserContacts(account._id, account.details.type)

    const mapper =
      account.details.type === AccountType.Homeowner ? mapToHomeownerContact : mapToPartnerContact
    return createResponse(200, contacts.map(mapper as any))
  } catch (error) {
    console.error(error)
    return createResponse(500, { code: ErrorCodes.Generic })
  } finally {
    await disconnect()
  }
}
