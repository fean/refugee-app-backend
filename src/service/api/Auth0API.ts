import { OAuthClient, AxiosClient } from "@trunkrs/common/services/client"
import { Auth0Environment } from "../env/Auth0"
import { OAuthResponse } from "@trunkrs/common/services/client/OAuthClient"
import { getTokenClaims } from "../utils"


export class Auth0API {
  private static http = new AxiosClient()
  private static client = new OAuthClient(Auth0API.http)

  private static lastToken?: string
  private static lastTokenExp?: number

  private static async getMgmtApiToken(): Promise<string> {
    const isTokenValid = Auth0API.lastToken && Date.now() < (Auth0API.lastTokenExp ?? 8640000000000000) * 1000
    if (!isTokenValid) {
      const result = await Auth0API.client.clientCredentialsFlow({
        domain: `https://${Auth0Environment.domain}`,
        audience: `https://${Auth0Environment.domain}/api/v2`,
        clientId: Auth0Environment.management.clientId,
        clientSecret: Auth0Environment.management.clientSecret
      })

      Auth0API.lastToken = result.accessToken
      Auth0API.lastTokenExp = getTokenClaims<{ exp: number }>(result.accessToken).exp
    }

    return Auth0API.lastToken as string
  }

  public static async createUserAccount(email: string): Promise<string> {
    const token = await Auth0API.getMgmtApiToken()

    const result = await Auth0API.http.post<{ user_id: string }>({
      url: `https://${Auth0Environment.domain}/api/v2/users`,
      headers: {
        Authorization: `Bearer ${token}`,
      },
      params: {
        connect: 'passwordless',
        email,
        email_verified: true,
      }
    })

    return result.user_id
  }

  public static async sendOTPEmail(email: string): Promise<void> {
    await Auth0API.http.post({
      url: `https://${Auth0Environment.domain}/passwordless/start`,
      params: {
        client_id: Auth0Environment.public.clientId,
        client_secret: Auth0Environment.public.clientSecret,
        connection: 'email',
        email,
        send: 'code',
      }
    })
  }

  public static async exchangeOTP(email: string, otp: string): Promise<OAuthResponse> {
    const result = await Auth0API.http.post<OAuthResponse>({
      url: `https://${Auth0Environment.domain}/oauth/token`,
      params: {
        client_id: Auth0Environment.public.clientId,
        client_secret: Auth0Environment.public.clientSecret,
        audience: Auth0Environment.public.audience,
        username: email,
        realm: 'email',
        grant_type: 'http://auth0.com/oauth/grant-type/passwordless/otp',
        otp,
        scope: 'offline_access',
      }
    })

    return result
  }
}
