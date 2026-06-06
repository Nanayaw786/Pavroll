import { NextRequest, NextResponse } from 'next/server'
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function POST(req: NextRequest) {
  try {
    const { name, email, company, subject, message } = await req.json()

    if (!name || !email || !message) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    await resend.emails.send({
      from: 'Pavroll Contact <onboarding@resend.dev>',
      to: 'hello.pavroll@proton.me',
      subject: `[Pavroll Contact] ${subject || 'New message'} — from ${name}`,
      html: `
        <div style="font-family: Inter, Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #f8fafc; padding: 40px; border-radius: 12px;">
          <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 32px;">
            <div style="width: 36px; height: 36px; border-radius: 8px; background: linear-gradient(135deg, #6366F1, #818CF8); display: flex; align-items: center; justify-content: center; color: white; font-weight: 800; font-size: 16px;">P</div>
            <span style="font-size: 20px; font-weight: 800; color: #1a1a2e;">Pav<span style="color: #6366F1;">roll</span></span>
          </div>
          <h2 style="font-size: 22px; font-weight: 700; color: #1a1a2e; margin-bottom: 24px;">New Contact Form Submission</h2>
          <table style="width: 100%; border-collapse: collapse;">
            <tr style="background: #fff; border-radius: 8px;">
              <td style="padding: 12px 16px; font-size: 13px; font-weight: 600; color: #94a3b8; width: 120px;">Name</td>
              <td style="padding: 12px 16px; font-size: 14px; color: #1a1a2e; font-weight: 600;">${name}</td>
            </tr>
            <tr style="background: #f8fafc;">
              <td style="padding: 12px 16px; font-size: 13px; font-weight: 600; color: #94a3b8;">Email</td>
              <td style="padding: 12px 16px; font-size: 14px; color: #6366F1;"><a href="mailto:${email}" style="color: #6366F1;">${email}</a></td>
            </tr>
            <tr style="background: #fff;">
              <td style="padding: 12px 16px; font-size: 13px; font-weight: 600; color: #94a3b8;">Company</td>
              <td style="padding: 12px 16px; font-size: 14px; color: #1a1a2e;">${company || 'Not provided'}</td>
            </tr>
            <tr style="background: #f8fafc;">
              <td style="padding: 12px 16px; font-size: 13px; font-weight: 600; color: #94a3b8;">Subject</td>
              <td style="padding: 12px 16px; font-size: 14px; color: #1a1a2e;">${subject || 'Not provided'}</td>
            </tr>
          </table>
          <div style="margin-top: 24px; padding: 20px; background: #fff; border-radius: 10px; border-left: 4px solid #6366F1;">
            <p style="font-size: 13px; font-weight: 600; color: #94a3b8; margin-bottom: 8px;">MESSAGE</p>
            <p style="font-size: 14px; color: #334155; line-height: 1.7; white-space: pre-wrap;">${message}</p>
          </div>
          <div style="margin-top: 24px; padding: 16px; background: #ede9fe; border-radius: 10px; text-align: center;">
            <p style="font-size: 13px; color: #6366F1; font-weight: 500;">Reply directly to <strong>${email}</strong> to respond to this message.</p>
          </div>
          <p style="font-size: 11px; color: #94a3b8; text-align: center; margin-top: 24px;">Sent via Pavroll Contact Form • pavroll-nwvm.vercel.app</p>
        </div>
      `,
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: 'Failed to send message' }, { status: 500 })
  }
}
