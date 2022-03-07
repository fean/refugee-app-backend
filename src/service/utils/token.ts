export const getTokenClaims = <TClaims>(token: string): TClaims => {
  const [,payloadBas64] = token.split('.')
  const payloadString = Buffer
    .from(payloadBas64, 'base64')
    .toString('utf-8')

  return JSON.parse(payloadString)
}
