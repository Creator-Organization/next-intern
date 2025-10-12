import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    if (!session || session.user.userType !== 'INDUSTRY') {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get active subscription
    const subscription = await db.userSubscription.findFirst({
      where: {
        userId: session.user.id,
        status: 'ACTIVE',
      },
    });

    if (!subscription) {
      return NextResponse.json(
        { success: false, error: 'No active subscription found' },
        { status: 404 }
      );
    }

    // Update subscription to cancelled
    // User retains access until end of billing period
    await db.userSubscription.update({
      where: { id: subscription.id },
      data: {
        status: 'CANCELLED',
        cancelledAt: new Date(),
        // Don't update endDate - user keeps access until then
      },
    });

    // TODO: Cancel recurring payment with payment gateway
    // await cancelRazorpaySubscription(subscription.paymentId);

    // Log audit trail
    await db.privacyAuditLog.create({
      data: {
        userId: session.user.id,
        action: 'ACCESS_PREMIUM_FEATURE',
        resourceType: 'SUBSCRIPTION_CANCEL',
        resourceId: subscription.id,
        ipAddress: request.headers.get('x-forwarded-for') || 'unknown',
        userAgent: request.headers.get('user-agent') || 'unknown',
        legalBasis: 'User cancelled subscription',
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Subscription cancelled. You will retain access until ' + subscription.endDate,
      subscription,
    });
  } catch (error) {
    console.error('POST /api/subscriptions/cancel error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}