import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendOutreachEmail({ to, subject, body, from }) {
  try {
    const { data, error } = await resend.emails.send({
      from: from || 'RentGuard <outreach@rentguard.co>',
      to: [to],
      subject: subject,
      html: body.replace(/\n/g, '<br>'),
    });

    if (error) {
      console.error('Resend Error:', error);
      return { success: false, error };
    }

    return { success: true, data };
  } catch (err) {
    console.error('Mailing Service Error:', err);
    return { success: false, error: err.message };
  }
}
