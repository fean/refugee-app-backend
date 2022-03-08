import * as Joi from 'joi'

import { ApprovalState } from '../enum'

export const contactApprovalSchema = Joi.object<ContactApprovalRequest>({
  contactId: Joi.string().required(),
  approval: Joi.string()
    .valid(...Object.values(ApprovalState))
    .required(),
})

export interface ContactApprovalRequest {
  contactId: string
  approval: ApprovalState
}
