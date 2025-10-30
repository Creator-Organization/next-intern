import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();

    if (!session) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const resolvedParams = await params;

    // Get subscription
    const subscription = await db.userSubscription.findUnique({
      where: { id: resolvedParams.id },
    });

    if (!subscription) {
      return NextResponse.json(
        { success: false, error: 'Invoice not found' },
        { status: 404 }
      );
    }

    // Verify subscription belongs to user
    if (subscription.userId !== session.user.id) {
      return NextResponse.json(
        { success: false, error: 'Forbidden' },
        { status: 403 }
      );
    }

    // Get user and industry info
    const user = await db.user.findUnique({
      where: { id: session.user.id },
      select: { email: true },
    });

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

    // Generate simple HTML invoice
    // In production, use a proper PDF generation library like puppeteer or jsPDF
    const invoiceHTML = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Invoice - ${subscription.id}</title>
        <style>
          body { font-family: Arial, sans-serif; max-width: 800px; margin: 40px auto; padding: 20px; }
          .header { text-align: center; margin-bottom: 40px; }
          .details { margin-bottom: 30px; }
          .table { width: 100%; border-collapse: collapse; }
          .table th, .table td { border: 1px solid #ddd; padding: 12px; text-align: left; }
          .table th { background-color: #0d9488; color: white; }
          .total { text-align: right; font-size: 20px; font-weight: bold; margin-top: 20px; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>INVOICE</h1>
          <p>Internship And Project Platform</p>
        </div>
        
        <div class="details">
          <p><strong>Invoice #:</strong> ${subscription.id}</p>
          <p><strong>Date:</strong> ${new Date(subscription.startDate).toLocaleDateString()}</p>
          <p><strong>Status:</strong> ${subscription.status}</p>
        </div>

        <div class="details">
          <h3>Bill To:</h3>
          <p><strong>${industry?.companyName || 'N/A'}</strong></p>
          <p>${industry?.address || ''}</p>
          <p>${industry?.city || ''}, ${industry?.state || ''}</p>
          <p>${industry?.country || ''}</p>
          <p>Email: ${user?.email || ''}</p>
        </div>

        <table class="table">
          <thead>
            <tr>
              <th>Description</th>
              <th>Period</th>
              <th>Amount</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>${subscription.plan.replace('_', ' ')}</td>
              <td>${subscription.billingCycle}</td>
              <td>₹${subscription.priceAmount.toLocaleString()}</td>
            </tr>
          </tbody>
        </table>

        <div class="total">
          <p>Total: ₹${subscription.priceAmount.toLocaleString()} ${subscription.currency}</p>
        </div>

        <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #ddd; text-align: center; color: #666;">
          <p>Thank you for your business!</p>
          <p>Internship And Project - Privacy-focused internship marketplace</p>
        </div>
      </body>
      </html>
    `;

    return new NextResponse(invoiceHTML, {
      headers: {
        'Content-Type': 'text/html',
        'Content-Disposition': `inline; filename="invoice-${subscription.id}.html"`,
      },
    });
  } catch (error) {
    console.error('GET /api/subscriptions/invoices/[id]/download error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}