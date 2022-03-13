import * as mongoose from 'mongoose'

import { AccountType, ActivityState, OwnerShipType } from './enum'

export interface AccountDetails {
  type: AccountType
  orgName?: string
  name: string
  address?: string
  postal?: string
  city: string
  country: string
  email?: string
  phone?: string
  coords?: {
    type: 'Point'
    coordinates: [number, number]
  }
  website?: string
  mission?: string
  ownershipType?: OwnerShipType
  beds?: number
}

interface AccountProps {
  _id: mongoose.Types.ObjectId
  authRef: string
  state: ActivityState
  mailActivationKey?: string
  activationKey?: string
  pushTokens: string[]
  approvalReason?: string
  details: AccountDetails
}

interface AccountModel extends mongoose.Model<AccountProps> {
  getByExternalRef: (reference: string) => Promise<AccountProps>
}

const accountSchema = new mongoose.Schema<AccountProps, AccountModel>({
  authRef: String,
  state: { type: String, enum: Object.values(ActivityState) } as any,
  mailActivationKey: String,
  activationKey: String,
  pushTokens: [String],
  approvalReason: String,
  details: {
    type: { type: String, enum: Object.values(AccountType) } as any,
    orgName: String,
    name: String,
    address: String,
    postal: String,
    city: String,
    country: String,
    email: { type: String, unique: true },
    phone: String,
    coords: {
      type: { type: String, enum: ['Point'] },
      coordinates: [Number],
    },
    website: String,
    mission: String,
    ownershipType: { type: String, enum: Object.values(OwnerShipType) },
    beds: Number,
  },
})

accountSchema.statics.getByExternalRef = async function (
  this: typeof Account,
  reference: string,
): Promise<typeof Account> {
  const result = await this.findOne(
    {
      authRef: reference,
    },
    '_id state details',
  )

  return result as any
} as any

export const Account = mongoose.model<AccountProps, AccountModel>('Account', accountSchema)
