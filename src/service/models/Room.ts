import * as mongoose from "mongoose"

import { OwnerShipType } from "./enum"

interface RoomProps {
  _id: mongoose.Types.ObjectId,
  owner: mongoose.Types.ObjectId,
  ownerShip: OwnerShipType,
  location: {
    address: string
    postal: string
    city: string
    countryCode: string
    coords: {
      type: 'Point',
      coordinates: [number, number],
    }
  }
}

interface RoomModel extends mongoose.Model<RoomProps> {
  findInArea(
    coords: [number, number],
    maxDistance?: number,
  ): Promise<typeof Room[]>
}

const roomSchema = new mongoose.Schema<RoomProps, RoomModel>({
  owner: mongoose.Types.ObjectId,
  ownerShip: {
    type: String,
    enum: Object.values(OwnerShipType),
  } as any,
  location: {
    address: String,
    postal: String,
    city: String,
    countryCode: String,
    coords: {
      type: { type: String, enum: ['Point'] },
      coordinates: [Number],
    },
  }
})

roomSchema.index({ "location.coords": "2dsphere" })

roomSchema.statics.findInArea = async function findInArea(
  this: typeof Room,
  center: [number, number],
  maxDistance: number = 10000,
): Promise<RoomProps[]> {
  const results = await this.aggregate<RoomProps>([
    {
      "$geoNear": {
        near: {
          type: 'Point',
          coordinates: center,
        },
        distanceField: "distance",
        spherical: true,
        maxDistance,
      }
    }
  ])

  return results
}

export const Room = mongoose.model<RoomProps, RoomModel>("Room", roomSchema)
