import env from './env'

export const emailTemplate = ({
  subject,
  name,
  intro,
  details,
  info,
  cta = {},
  outro,
  footer
}: {
  subject: string
  name: string
  intro: string
  details?: Record<string, unknown>
  info?: string
  cta?: {
    intro?: string
    buttonLabel?: string
    href?: string
  }
  outro?: string
  footer?: string
}) => {
  return `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width,initial-scale=1">
    <title>${subject}</title>
    <style>
      * {
        box-sizing: border-box;
        padding: 0;
        text-decoration: none;
        margin: 0;
      }
    </style>
  </head>
  <body style="font-family: Arial, sans-serif; color: #333; background-color: #f9f9f9; line-height: 1.6; margin: 0; padding: 1rem 0.5rem;">
    <div style="width: 100%; max-width: 600px; margin: 20px auto; padding: 20px; background-color: #fff; border: 1px solid #ddd; border-radius: 8px;">
      <!-- Header -->
      <div style="text-align: center; border-bottom: 1px solid #eee; margin-bottom: 20px; padding-bottom: 10px;">
        <div>
          <img src="${env.get('BASE_URL')}/logo.png" />
        </div>
        <h1 style="font-size: 20px; margin: 0; color: #285baa;">
          ${subject}
        </h1>
      </div>

      <!-- Content -->
      <div style="padding: 10px 0;">
        <div>
          <p>Hi there, <span style="font-weight: 600;">${name}.</span></p>
          <p style="white-space: pre-wrap; margin-top: 1rem;">${intro}</p>
        </div>

        ${
          details
            ? `
          <div style="margin-left: 1rem; margin-top: 1rem;">
          ${Object.entries(details)
            .map(
              ([key, value]) =>
                `<p><span>${key}:</span> <span style="font-weight: bold;">${value}</span></p>`
            )
            .join('')}
          </div>`
            : ''
        }

        ${info ? `<div style="margin-top: 1rem;"><p style="white-space: pre-wrap;">${info}</p></div>` : ''}
    
        ${
          Object.keys(cta).length
            ? `
          <div style="text-align: center; margin-top: 1.5rem;">
            <p style="text-align: left; white-space: pre-wrap;">${cta.intro}</p>
            <a href="${cta.href}" style="display: inline-block; margin-top: 1rem; text-decoration: none;">
              <button style="padding: 0.75rem 1.25rem; border: none; border-radius: 5px; cursor: pointer; background-color: #285baa; color: #fff; font-weight: 500;">
                ${cta.buttonLabel}
              </button>
            </a>
          </div>`
            : ''
        }

        ${outro ? `<div><p style="margin-top: 1rem; white-space: pre-wrap;">${outro}</p></div>` : ''}

        <div style="margin-top: 1rem; font-size: 0.875rem;">
          <p>Thanks,</p>
          <p style="font-weight: 600;">Invest Tracker</p>
        </div>
      </div>

      <!-- Footer -->
      <div style="margin-top: 20px; text-align: center; font-size: 12px; color: #fff; background-color: #6f9add; padding: 0.5rem; border-radius: 5px;">
        ${footer ? `<p style="white-space: pre-wrap;">${footer}</p>` : ''}
        <p>&copy; Invest Tracker. All rights reserved.</p>
      </div>
    </div>
  </body>
</html>`
}
