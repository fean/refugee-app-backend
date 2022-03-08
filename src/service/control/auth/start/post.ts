import { createResponse, createValidationError } from '../../../utils'
import { Auth0API } from '../../../api'

import { authStartSchema } from '../../../models/request'
import { ErrorCodes } from '../../../models/enum'
import { AxiosError } from 'axios'

export const handler: AWSLambda.APIGatewayProxyHandlerV2 = async (
  event,
): Promise<AWSLambda.APIGatewayProxyResultV2> => {
  try {
    const { error, value: request } = authStartSchema.validate(JSON.parse(event.body as string))
    if (error) {
      return createValidationError(error)
    }

    try {
      await Auth0API.sendOTPEmail(request.email)
    } catch (error) {
      const axiosError = error as AxiosError
      if (axiosError.response && axiosError.response.status === 400) {
        return createResponse(400, { code: ErrorCodes.UnknownAccount })
      } else {
        throw error
      }
    }

    return createResponse(201)
  } catch (error) {
    console.error(error)
    return createResponse(500, { code: ErrorCodes.Generic })
  }
}
