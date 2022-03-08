import add from 'date-fns/add'

import { connect, disconnect, EmailBlacklist } from '../../models'

interface SesBounceMessage {
  bounce: {
    bouncedRecipients: Array<{
      emailAddress: string
    }>
  }
}

export const handler: AWSLambda.SNSHandler = async (event): Promise<void> => {
  try {
    await connect()

    await Promise.all(
      event.Records.map(async (record) => {
        const message = JSON.parse(record.Sns.Message) as SesBounceMessage

        await Promise.all(
          message.bounce.bouncedRecipients.map(async (recipient) => {
            const entry = new EmailBlacklist({
              email: recipient.emailAddress,
              expires: add(new Date(), { weeks: 2 }),
            })

            try {
              await entry.save()
            } catch (error) {
              console.warn(error)
            }
          }),
        )
      }),
    )
  } finally {
    await disconnect()
  }
}
