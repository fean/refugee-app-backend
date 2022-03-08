import * as Joi from 'joi'

export const authStartSchema = Joi.object<AuthStartRequest>({
  email: Joi.string().email().required(),
})

export interface AuthStartRequest {
  email: string
}
