import * as Joi from 'joi'

export const tokenRequestSchema = Joi.object<TokenRequest>({
  email: Joi.string().email().required(),
  otp: Joi.string().min(6).max(6).required(),
})

export interface TokenRequest {
  email: string
  otp: string
}
