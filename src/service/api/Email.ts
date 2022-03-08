import { SES } from 'aws-sdk'
import Environment from '../env'

export enum Template {
  AccountApproval = 'approval-account',
  ConfirmEmail = 'confirm',
  HomeownerApproval = 'approval-homeowner',
  PartnerApproval = 'partner-approval',
  ContactRequest = 'contact-request',
}

export class Email {
  private static ses = new SES()

  public static async sendEmail<TModel>(
    template: Template,
    model: TModel,
    ...destinations: string[]
  ): Promise<void> {
    await Email.ses
      .sendTemplatedEmail({
        Destination: {
          ToAddresses: destinations,
        },
        Template: template,
        Source: Environment.emailIdentity,
        TemplateData: JSON.stringify(model),
      })
      .promise()
  }
}
