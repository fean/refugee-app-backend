import { ActivityState } from "../enum"

export interface AccountResponse {
  id: string,
  state: ActivityState
  name: string
  orgName?: string
  location: {
    address?: string
    postal?: string
    city: string
    country: string
    coords: [number, number]
  }
  contact: {
    email: string
    phone: string
    website: string
  }
}
