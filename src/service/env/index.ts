class Environment {
  public static get connectionString(): string {
    return process.env.CONNECTION_STRING as string
  }

  public static get captchaSecretKey(): string {
    return process.env.CAPTCHA_SECRET_KEY as string
  }

  public static get mapBoxApiToken(): string {
    return process.env.MAPBOX_API_TOKEN as string
  }

  public static get fcmServerKey(): string {
    return process.env.FCM_SERVER_KEY as string
  }

  public static get emailIdentity(): string {
    return 'Samaritan <crew@samaritan-app.eu>'
  }

  public static get approvalKey(): string {
    return process.env.APPROVAL_KEY as string
  }

  public static get storeReviewPassword(): string {
    return process.env.STORE_REVIEW_PASSWORD as string
  }

  public static get storeReviewOtp(): string {
    return process.env.STORE_REVIEW_OTP as string
  }

  public static get crewDestinations(): string[] {
    return [
      'feanaro101@gmail.com',
      'loekhertog@gmail.com',
      'jagoverzuu@gmail.com',
      'bramschabbink@hotmail.com',
    ]
  }
}

export default Environment
