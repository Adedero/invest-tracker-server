import { Request, Response } from 'express'
import { sendResponse } from '../../../utils/helpers'
import { sendEmail } from '../../../utils/mail'
import { emailTemplate } from '../../../utils/emails'

export const contact = async (req: Request, res: Response) => {
  const { name, email, subject, message } = req.body

  if (!name || !email || !message) {
    sendResponse(res, 400, 'No name, email or message provided')
    return
  }

  const error = await sendEmail({
    toEmail: email,
    subject,
    html: emailTemplate({
      subject: 'Support Request',
      name: 'Invest Tracker Admin',
      intro: 'You have received a support request',
      details: {
        'Name': name,
        'Email': email,
        'Subject': subject,
        'Message': message
      }
    })
  })

  if (error) {
    sendResponse(res, 500, error.message)
    return
  }
  sendResponse(res, 200, 'Message delivered')
}
