import * as crypto from 'crypto'

export const getRandomToken = (size = 24): string => {
  return crypto.randomBytes(size).toString('base64')
}
