import * as Joi from 'joi'

export const createValidationError = (
  error: Joi.ValidationError,
): AWSLambda.APIGatewayProxyResultV2 => {
  return createResponse(422, error)
}

export const createResponse = <TModel = unknown>(
  statusCode: number,
  payload?: TModel,
): AWSLambda.APIGatewayProxyResultV2 => {
  return {
    statusCode,
    headers: payload
      ? {
          'Content-Type': 'application/json',
        }
      : undefined,
    body: payload ? JSON.stringify(payload) : undefined,
  }
}
