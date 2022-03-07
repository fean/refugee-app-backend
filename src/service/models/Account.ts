import * as mongoose from "mongoose";

import { AccountType, ActivityState } from "./enum"

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
    type: 'Point',
    coordinates: [number, number],
  }
  website?: string
}

interface AccountModel {
  _id: mongoose.Types.ObjectId,
  authRef: string
  state: ActivityState
  mailActivationKey?: string
  activationKey?: string
  pushTokens: string[]
  details: AccountDetails
}

const accountSchema = new mongoose.Schema<AccountModel>({
  authRef: String,
  state: { type: String, enum: Object.values(ActivityState) } as any,
  mailActivationKey: String,
  activationKey: String,
  pushTokens: [String],
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
  }
})

export const Account = mongoose.model<AccountModel>('Account', accountSchema)
