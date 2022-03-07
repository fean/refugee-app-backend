import * as Joi from "joi"

export const partnerCreationSchema = Joi.object<PartnerCreationRequest>({
  captchaToken: Joi.string().required(),
  contact: Joi.string().required(),
  orgName: Joi.string().required(),
  email: Joi.string().email().required(),
  phoneCountry: Joi.string().max(2).min(2).required(),
  phone: Joi.string().required(),
  website: Joi.string().required(),
  address: Joi.string().required(),
  postal: Joi.string().required(),
  city: Joi.string().required(),
  country: Joi.string().min(2).max(2).required(),
  mission: Joi.string().max(90).required(),
  approvalReason: Joi.string().required(),
})

export interface PartnerCreationRequest {
  captchaToken: string
  contact: string
  orgName: string
  email: string
  phoneCountry: string
  phone: string
  website: string
  address: string
  postal: string
  city: string
  country: string
  mission: string
  approvalReason: string
}
