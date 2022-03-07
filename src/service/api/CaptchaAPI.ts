import Axios from 'axios'
import Environment from "../env"

export class CaptchaAPI {
  public static async verifyRequestToken(token: string): Promise<boolean> {
    try {
      const response = await Axios.post<{ success: boolean }>(
        'https://www.google.com/recaptcha/api/siteverify',
        {
          secret: Environment.captchaSecretKey,
          response: token
        }
      )

      return response.data?.success ?? false
    } catch (error) {
      console.warn('Captcha request failed', error.message)
      return false
    }
  }
}
