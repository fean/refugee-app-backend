import { createResponse, createValidationError, getRandomToken, sanitizePhone } from '../../utils'
import { Auth0API, CaptchaAPI, MapBoxApi } from '../../api'

import { AccountType, ActivityState, ErrorCodes } from '../../models/enum'
import { homeownerCreationSchema } from '../../models/request'
import { connect, disconnect, Account, Room } from '../../models'

export const handler: AWSLambda.APIGatewayProxyHandlerV2 = async (
  event,
): Promise<AWSLambda.APIGatewayProxyResultV2> => {
  try {
    const { error, value: request } = homeownerCreationSchema.validate(
      JSON.parse(event.body as string),
    )
    if (error) {
      return createValidationError(error)
    }

    const isValid = CaptchaAPI.verifyRequestToken(request.captchaToken)
    if (!isValid) {
      return {
        statusCode: 400,
        body: JSON.stringify({
          code: ErrorCodes.InvalidCaptcha,
        }),
      }
    }

    await connect()
    const exists = await Account.exists({ 'details.email': request.email })
    if (exists) {
      return createResponse(409, {
        code: ErrorCodes.EmailAlreadyExists,
      })
    }

    const coordinates = await MapBoxApi.geocodeAddress(
      request.address,
      request.postal,
      request.city,
    )

    if (!coordinates) {
      return {
        statusCode: 404,
        body: JSON.stringify({
          code: ErrorCodes.AddressNotFound,
        }),
      }
    }

    const userId = await Auth0API.createUserAccount(request.email)
    const account = new Account({
      authRef: userId,
      state: ActivityState.Inactive,
      mailActivationKey: getRandomToken(),
      pushTokens: [],
      details: {
        type: AccountType.Homeowner,
        name: request.name,
        address: request.address,
        postal: request.postal,
        city: request.city,
        country: request.country.toUpperCase(),
        email: request.email,
        phone: sanitizePhone(request.phone, request.phoneCountry),
        coords: {
          type: 'Point',
          coordinates,
        },
      },
    })

    await account.save()

    const room = new Room({
      ownerShip: request.ownershipType,
      owner: account._id,
      location: {
        address: account.details.address,
        postal: account.details.postal,
        city: account.details.city,
        countryCode: account.details.country,
        coords: account.details.coords,
      },
    })
    await room.save()

    // TODO: Send email confirm email with $.mailActivationKey

    return createResponse(201, {
      id: account._id.toString(),
      state: account.state,
      name: account.details.name,
      contact: {
        phone: account.details.phone,
        email: account.details.email,
      },
      location: {
        address: account.details.address,
        postal: account.details.postal,
        city: account.details.city,
        country: account.details.country,
        coords: account.details.coords?.coordinates as [number, number],
      },
    })
  } catch (error) {
    console.error(error)
    return createResponse(500, { code: ErrorCodes.Generic })
  } finally {
    await disconnect()
  }
}
