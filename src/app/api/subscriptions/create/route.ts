import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { z } from 'zod';

const createSubscriptionSchema = z.object({
  plan: z.enum(['PREMIUM_MONTHLY', 'PREMIUM_YEARLY']),
  billingCycle: z.enum(['MONTHLY', 'YEARLY']),
});

// Pricing in INR (Rupees)
const PRICING = {
  PREMIUM_MONTHLY: 4999,
  PREMIUM_YEARLY: 49999, // ~₹4166/month (17% discount)
};

export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    if (!session || session.user.userType !== 'INDUSTRY') {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const validatedData = createSubscriptionSchema.parse(body);

    // Check if user already has active subscription
    const existingSubscription = await db.userSubscription.findFirst({
      where: {
        userId: session.user.id,
        status: 'ACTIVE',
      },
    });

    if (existingSubscription) {
      return NextResponse.json(
        { success: false, error: 'You already have an active subscription' },
        { status: 400 }
      );
    }

    // Calculate dates
    const startDate = new Date();
    const endDate = new Date();
    const nextBillingDate = new Date();

    if (validatedData.billingCycle === 'MONTHLY') {
      endDate.setMonth(endDate.getMonth() + 1);
      nextBillingDate.setMonth(nextBillingDate.getMonth() + 1);
    } else {
      endDate.setFullYear(endDate.getFullYear() + 1);
      nextBillingDate.setFullYear(nextBillingDate.getFullYear() + 1);
    }

    const priceAmount = PRICING[validatedData.plan];

    // Create subscription record
    const subscription = await db.userSubscription.create({
      data: {
        userId: session.user.id,
        plan: validatedData.plan,
        status: 'PENDING', // Will be activated after payment
        priceAmount,
        currency: 'INR',
        billingCycle: validatedData.billingCycle,
        startDate,
        endDate,
        nextBillingDate,
      },
    });

    // Update user premium status (activate immediately for demo)
    // In production, this should happen after payment confirmation
    await db.user.update({
      where: { id: session.user.id },
      data: {
        isPremium: true,
        premiumExpiresAt: endDate,
      },
    });

    // Update industry limits
    await db.industry.update({
      where: { userId: session.user.id },
      data: {
        monthlyPostLimit: 999, // Unlimited (using high number)
        canViewCandidateContacts: true,
      },
    });

    // Update subscription status to active (for demo)
    // In production, this should happen after payment webhook
    await db.userSubscription.update({
      where: { id: subscription.id },
      data: {
        status: 'ACTIVE',
        paymentId: 'demo_payment_' + Date.now(),
        activatedAt: new Date(),
      },
    });

    // TODO: Integrate with Razorpay/Stripe for actual payment
    // const paymentOrder = await createRazorpayOrder({
    //   amount: priceAmount,
    //   currency: 'INR',
    //   receipt: subscription.id,
    // });

    // Log audit trail
    await db.privacyAuditLog.create({
      data: {
        userId: session.user.id,
        action: 'ACCESS_PREMIUM_FEATURE',
        resourceType: 'SUBSCRIPTION',
        resourceId: subscription.id,
        ipAddress: request.headers.get('x-forwarded-for') || 'unknown',
        userAgent: request.headers.get('user-agent') || 'unknown',
        legalBasis: 'User subscribed to premium plan',
      },
    });

    return NextResponse.json({
      success: true,
      subscription,
      message: 'Subscription activated successfully',
      // paymentUrl: paymentOrder.short_url, // For Razorpay
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: error.issues[0].message },
        { status: 400 }
      );
    }

    console.error('POST /api/subscriptions/create error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}