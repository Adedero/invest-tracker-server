import { transporter } from '../config/nodemailer.config'
import env from './env'

const EMAIL_USER = env.get('EMAIL_USER', 'support@investtrackeer.live')

interface MailerOptions {
  toEmail: string
  fromEmail?: string
  subject?: string
  text?: string
  html?: string
}

export async function sendEmail(options: MailerOptions): Promise<null | Error> {
  try {
    const result = await transporter.sendMail({
      from: EMAIL_USER,
      to: options.toEmail,
      ...(options.fromEmail && { replyTo: options.fromEmail }),
      subject: options.subject,
      text: options.text ?? '',
      html: options.html ?? ''
    })
    if (result.rejected.length > 0) {
      throw new Error(result.response)
    }
    return null
  } catch (err) {
    return err as Error
  }
}
