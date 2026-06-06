import { NextRequest, NextResponse } from 'next/server'
import { rateLimit, getClientIP } from '@/lib/rateLimit'

const PAYSTACK_SECRET = process.env.PAYSTACK_SECRET_KEY!

// Plan amounts in kobo (GHS * 100)
const PLANS = {
  starter: { amount: 12000, name: 'Starter Plan', description: 'Up to 10 employees, 50 SMS/month' },
  growth: { amount: 35000, name: 'Growth Plan', description: 'Up to 50 employees, 200 SMS/month' },
  business: { amount: 80000, name: 'Business Plan', description: 'Unlimited employees & SMS' },
}

// Initialize transaction
export async function POST(req: NextRequest) {
  // Rate limit: 10 payment attempts per hour per IP
  const ip = getClientIP(req)
  const limit = rateLimit(`paystack_${ip}`, { maxRequests: 10, windowMs: 60 * 60 * 1000 })
  if (!limit.success) {
    return NextResponse.json({ error: 'Too many requests. Please try again later.' }, { status: 429 })
  }
  try {
    const { email, plan, companyName } = await req.json()
    const selectedPlan = PLANS[plan as keyof typeof PLANS]
    if (!selectedPlan) return NextResponse.json({ error: 'Invalid plan' }, { status: 400 })

    const response = await fetch('https://api.paystack.co/transaction/initialize', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${PAYSTACK_SECRET}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email,
        amount: selectedPlan.amount,
        currency: 'GHS',
        metadata: {
          plan,
          company_name: companyName,
          plan_name: selectedPlan.name,
        },
        callback_url: `${process.env.NEXT_PUBLIC_APP_URL || 'https://pavroll-nwvm.vercel.app'}/billing/success`,
      }),
    })

    const data = await response.json()
    if (data.status) {
      return NextResponse.json({ success: true, url: data.data.authorization_url, reference: data.data.reference })
    }
    return NextResponse.json({ error: data.message }, { status: 400 })
  } catch (error) {
    return NextResponse.json({ error: 'Payment initialization failed' }, { status: 500 })
  }
}

// Verify transaction
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const reference = searchParams.get('reference')
    if (!reference) return NextResponse.json({ error: 'No reference provided' }, { status: 400 })

    const response = await fetch(`https://api.paystack.co/transaction/verify/${reference}`, {
      headers: { Authorization: `Bearer ${PAYSTACK_SECRET}` },
    })
    const data = await response.json()
    if (data.status && data.data.status === 'success') {
      return NextResponse.json({ success: true, data: data.data })
    }
    return NextResponse.json({ error: 'Payment verification failed' }, { status: 400 })
  } catch (error) {
    return NextResponse.json({ error: 'Verification failed' }, { status: 500 })
  }
}
