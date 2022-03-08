export const getTokenClaims = <TClaims>(token: string): TClaims => {
  const [, payloadBas64] = token.split('.')
  const payloadString = Buffer.from(payloadBas64, 'base64').toString('utf-8')

  return JSON.parse(payloadString)
}

export const getEventClaims = <TClaims>(event: AWSLambda.APIGatewayProxyEventV2): TClaims => {
  const { authorization: headerValue } = event.headers
  const eventToken = headerValue?.split(' ')[1]

  return getTokenClaims<TClaims>(eventToken as string)
}

export const getSubject = (event: AWSLambda.APIGatewayProxyEventV2): string =>
  getEventClaims<{ sub: string }>(event).sub
