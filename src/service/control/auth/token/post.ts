import { AxiosError } from 'axios'

import { createResponse, createValidationError, getTokenClaims } from '../../../utils'
import { Auth0API } from '../../../api'

import { TokenRequest, tokenRequestSchema } from '../../../models/request'
import { AccountType, ActivityState, ErrorCodes, TokenGrantType } from '../../../models/enum'
import { OAuthResponse } from '@trunkrs/common/services/client/OAuthClient'
import Environment from '../../../env'
import { Account, connect, Room } from '../../../models'

const doTokenRequest = async (request: TokenRequest): Promise<OAuthResponse> => {
  const isStoreRequest =
    request.email === 'app.review@bogus.com' && request.otp === Environment.storeReviewOtp
  if (isStoreRequest) {
    return Auth0API.doPasswordAuth(request.email, Environment.storeReviewPassword)
  }

  switch (request.type) {
    case TokenGrantType.OTP:
      return Auth0API.exchangeOTP(request.email, request.otp)
    case TokenGrantType.Refresh:
      return Auth0API.refreshToken(request.refreshToken)
  }
}

export const handler: AWSLambda.APIGatewayProxyHandlerV2 = async (
  event,
): Promise<AWSLambda.APIGatewayProxyResultV2> => {
  try {
    const { error, value: request } = tokenRequestSchema.validate(JSON.parse(event.body as string))
    if (error) {
      return createValidationError(error)
    }

    const result = await doTokenRequest(request)

    const { sub } = getTokenClaims<{ sub: string }>(result.accessToken)
    await connect()
    const account = await Account.findOne({ authRef: sub }).select('_id state details.type')
    if (!account) {
      return createResponse(400, { code: ErrorCodes.AccountBad })
    }

    const isRoomReadyToBeCreated =
      account.state === ActivityState.Inactive && account.details.type === AccountType.Homeowner
    if (isRoomReadyToBeCreated) {
      const fullDetails = await Account.findById(account._id)
      if (!fullDetails) {
        return createResponse(400, { code: ErrorCodes.AccountBad })
      }

      const room = new Room({
        ownerShip: fullDetails.details.ownershipType,
        owner: fullDetails._id,
        beds: fullDetails.details.beds,
        location: {
          address: fullDetails.details.address,
          postal: fullDetails.details.postal,
          city: fullDetails.details.city,
          countryCode: fullDetails.details.country,
          coords: fullDetails.details.coords,
        },
      })

      fullDetails.state = ActivityState.Active

      await Promise.all([room.save(), fullDetails.save()])
    }

    return createResponse(200, {
      accessToken: result.accessToken,
      refreshToken: result.refreshToken,
      expiresIn: result.expiresIn,
    })
  } catch (error) {
    const axiosError = error as AxiosError
    if (axiosError.response && axiosError.response.status === 400) {
      return createResponse(400, { code: ErrorCodes.BadOTP })
    } else {
      console.error(error)
      return createResponse(500)
    }
  }
}
