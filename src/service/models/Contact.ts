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
  receiver: AccountDetailsRef & { beds?: number }
}

export interface ContactModel extends mongoose.Model<ContactProps> {
  findUserContacts(
    userId: string | mongoose.Types.ObjectId,
    type: AccountType,
  ): Promise<ContactProps[]>
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
    beds: Number,
    website: String,
  },
})

contactSchema.statics.findUserContacts = async function (
  this: typeof Contact,
  userId: mongoose.Types.ObjectId,
  type: AccountType,
): Promise<Array<ContactProps>> {
  const userObjectId = typeof userId === 'string' ? new mongoose.Types.ObjectId(userId) : userId
  const field = type === AccountType.Homeowner ? 'receiver._id' : 'creator._id'

  const results = await this.find({
    [field]: userObjectId,
  })

  return results
}

export const Contact = mongoose.model<ContactProps, ContactModel>('Contact', contactSchema)
