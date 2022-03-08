import {
  createResponse,
  createValidationError,
  getRandomToken,
  sanitizePhone,
  sanitizeUrl,
} from '../../utils'
import { Auth0API, CaptchaAPI, MapBoxApi } from '../../api'

import { AccountType, ActivityState, ErrorCodes } from '../../models/enum'
import { partnerCreationSchema } from '../../models/request'
import { connect, disconnect, Account } from '../../models'

export const handler: AWSLambda.APIGatewayProxyHandlerV2 = async (
  event,
): Promise<AWSLambda.APIGatewayProxyResultV2> => {
  try {
    const { error, value: request } = partnerCreationSchema.validate(
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
      activationKey: getRandomToken(),
      mailActivationKey: getRandomToken(),
      approvalReason: request.approvalReason,
      details: {
        type: AccountType.Partner,
        orgName: request.orgName,
        name: request.contact,
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
        website: sanitizeUrl(request.website),
        mission: request.mission,
      },
    })

    await account.save()

    // TODO: Send email confirm email with $.mailActivationKey

    return createResponse(201, {
      id: account._id.toString(),
      state: account.state,
      name: account.details.name,
      orgName: account.details.orgName,
      contact: {
        phone: account.details.phone,
        email: account.details.email,
        website: account.details.website,
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
    return { statusCode: 500 }
  } finally {
    await disconnect()
  }
}
