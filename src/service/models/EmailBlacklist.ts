import * as mongoose from "mongoose"

interface EmailBlacklistModel {
  email: string
  expires: number
}

const emailBlacklistSchema = new mongoose.Schema<EmailBlacklistModel>({
  email: { type: String, unique: true },
  expires: Number,
})

export const EmailBlacklist = mongoose.model<EmailBlacklistModel>('EmailBlacklist', emailBlacklistSchema)
