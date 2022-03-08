import * as Joi from 'joi'

export const pushTokenSchema = Joi.object<PushTokenRequest>({
  token: Joi.string().required(),
})

export interface PushTokenRequest {
  token: string
}
