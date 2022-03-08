import * as Joi from 'joi'
import { OwnerShipType } from '../enum'

export const homeownerCreationSchema = Joi.object<HomeownerCreationRequest>({
  captchaToken: Joi.string().required(),
  name: Joi.string().required(),
  email: Joi.string().email().required(),
  phoneCountry: Joi.string().max(5).min(2).required(),
  phone: Joi.string().required(),
  address: Joi.string().required(),
  postal: Joi.string().required(),
  city: Joi.string().required(),
  country: Joi.string().min(2).max(2).required(),
  ownershipType: Joi.string()
    .valid(...Object.values(OwnerShipType))
    .required(),
})

export interface HomeownerCreationRequest {
  captchaToken: string
  name: string
  email: string
  phoneCountry: string
  phone: string
  address: string
  postal: string
  city: string
  country: string
  ownershipType: OwnerShipType
}
