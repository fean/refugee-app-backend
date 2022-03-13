import { AxiosClient } from '@trunkrs/common/services/client'
import Environment from '../env'

export class FCMAPI {
  private static http = new AxiosClient()

  public static async sendMessage(target: string, title: string, body: string): Promise<void> {
    await FCMAPI.http.post({
      url: 'https://fcm.googleapis.com/fcm/send',
      headers: {
        Authorization: `key=${Environment.fcmServerKey}`,
      },
      params: {
        notification: { title, body },
        to: target,
      },
    })
  }
}
