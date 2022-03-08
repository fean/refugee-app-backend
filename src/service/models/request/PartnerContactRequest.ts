import * as Joi from 'joi'

export const partnerContactRequestSchema = Joi.object<PartnerContactRequest>({
  roomId: Joi.string().required(),
})

export interface PartnerContactRequest {
  roomId: string
}
