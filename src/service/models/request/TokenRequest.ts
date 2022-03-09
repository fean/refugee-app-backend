import * as Joi from 'joi'
import { TokenGrantType } from '../enum'

export const tokenRequestSchema = Joi.object<TokenRequest>({
  type: Joi.string()
    .valid(...Object.values(TokenGrantType))
    .required(),
  email: Joi.when('type', {
    is: 'otp',
    then: Joi.string().email().required(),
    otherwise: Joi.forbidden(),
  }),
  otp: Joi.when('type', {
    is: 'otp',
    then: Joi.string().min(6).max(6).required(),
    otherwise: Joi.forbidden(),
  }),
  refreshToken: Joi.when('type', {
    is: 'refresh',
    then: Joi.string().required(),
    otherwise: Joi.forbidden(),
  }),
})

export interface TokenRequest {
  type: TokenGrantType
  email: string
  otp: string
  refreshToken: string
}
