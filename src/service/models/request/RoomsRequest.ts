import * as Joi from 'joi'

export const roomsRequestSchema = Joi.object<RoomsRequest>({
  lat: Joi.number().required(),
  lng: Joi.number().required(),
  distance: Joi.number().max(15000).required(),
})

export interface RoomsRequest {
  lat: number
  lng: number
  distance: number
}
