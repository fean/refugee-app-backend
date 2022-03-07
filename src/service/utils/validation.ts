import * as Joi from 'joi'

export const createValidationError = (error: Joi.ValidationError): AWSLambda.APIGatewayProxyResultV2 => {
  return {
    statusCode: 422,
    body: JSON.stringify(error)
  }
}
