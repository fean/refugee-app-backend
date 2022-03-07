export const sanitizeUrl = (urlOrDomain: string): string =>
  urlOrDomain.startsWith('http') ? urlOrDomain : `https://${urlOrDomain}`

export const sanitizePhone = (phone: string, dialingCode: string): string => {
  if (phone.startsWith('+') || phone.startsWith('00')) {
    return phone
  }

  return phone.startsWith('0')
    ? `${dialingCode}${phone.substring(1)}`
    : `${dialingCode}${phone}`
}
