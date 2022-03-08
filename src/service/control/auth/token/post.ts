import { AxiosError } from 'axios'

import { createResponse, createValidationError } from '../../../utils'
import { Auth0API } from '../../../api'

import { tokenRequestSchema } from '../../../models/request'
import { ErrorCodes } from '../../../models/enum'

export const handler: AWSLambda.APIGatewayProxyHandlerV2 = async (
  event,
): Promise<AWSLambda.APIGatewayProxyResultV2> => {
  try {
    const { error, value: request } = tokenRequestSchema.validate(JSON.parse(event.body as string))
    if (error) {
      return createValidationError(error)
    }

    const result = await Auth0API.exchangeOTP(request.email, request.otp)
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
