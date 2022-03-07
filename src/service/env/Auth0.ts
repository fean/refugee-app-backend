const managementEnvironment = {
  clientId: process.env.AUTH0_MGMT_CLIENT_ID as string,
  clientSecret: process.env.AUTH0_MGMT_CLIENT_SECRET as string,
}

const publicEnvironment = {
  audience: 'https://api.samaritan-app.eu',
  clientId: process.env.AUTH0_PUBLIC_CLIENT_ID as string,
  clientSecret: process.env.AUTH0_PUBLIC_CLIENT_SECRET as string,
}

export class Auth0Environment {
  public static get domain():string {
    return process.env.AUTH0_DOMAIN as string
  }

  public static get management() {
    return managementEnvironment
  }

  public static get public() {
    return publicEnvironment
  }
}
