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
}

export default Environment
