import * as mongoose from 'mongoose'

import { AccountType, ApprovalState } from './enum'
import { AccountDetails } from './Account'

interface AccountDetailsRef extends AccountDetails {
  _id: mongoose.Types.ObjectId
}

export interface ContactProps {
  _id: mongoose.Types.ObjectId
  state: ApprovalState
  creator: AccountDetailsRef
  receiver: AccountDetailsRef
}

export interface ContactModel extends mongoose.Model<ContactProps> {
  findUserContacts(userId: string): Promise<ContactProps[]>
}

const contactSchema = new mongoose.Schema<ContactProps, ContactModel>({
  state: { type: String, enum: Object.values(ApprovalState) },
  creator: {
    _id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Account',
    },
    type: { type: String, enum: Object.values(AccountType) } as any,
    orgName: String,
    name: String,
    address: String,
    postal: String,
    city: String,
    country: String,
    email: String,
    phone: String,
    coords: {
      type: { type: String, enum: ['Point'] },
      coordinates: [Number],
    },
    website: String,
  },
  receiver: {
    _id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Account',
    },
    type: { type: String, enum: Object.values(AccountType) } as any,
    orgName: String,
    name: String,
    address: String,
    postal: String,
    city: String,
    country: String,
    email: String,
    phone: String,
    coords: {
      type: { type: String, enum: ['Point'] },
      coordinates: [Number],
    },
    website: String,
  },
})

contactSchema.statics.findUserContacts = async function (
  this: typeof Contact,
  userId: string,
): Promise<Array<ContactProps>> {
  const userObjectId = new mongoose.Types.ObjectId(userId)
  const results = await this.find({
    $or: [{ 'creator._id': userObjectId }, { 'receiver._id': userObjectId }],
  })

  return results
}

export const Contact = mongoose.model<ContactProps, ContactModel>('Contact', contactSchema)
