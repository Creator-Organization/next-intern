import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const session = await auth();

    if (!session || session.user.userType !== 'INDUSTRY') {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get all subscriptions for this user
    const subscriptions = await db.userSubscription.findMany({
      where: {
        userId: session.user.id,
        status: { in: ['ACTIVE', 'CANCELLED', 'EXPIRED'] },
      },
      orderBy: {
        startDate: 'desc',
      },
    });

    // Get industry info for invoice
    const industry = await db.industry.findUnique({
      where: { userId: session.user.id },
      select: {
        companyName: true,
        email: true,
        address: true,
        city: true,
        state: true,
        country: true,
      },
    });

    // Format as invoices
    const invoices = subscriptions.map((sub) => ({
      id: sub.id,
      date: sub.startDate,
      amount: sub.priceAmount,
      currency: sub.currency,
      status: sub.status,
      plan: sub.plan,
      billingCycle: sub.billingCycle,
      // In production, this would be a real invoice URL from payment gateway
      url: `/api/subscriptions/invoices/${sub.id}/download`,
      companyName: industry?.companyName || 'Unknown',
      address: industry?.address || '',
    }));

    return NextResponse.json({
      success: true,
      invoices,
    });
  } catch (error) {
    console.error('GET /api/subscriptions/invoices error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}