import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { db } from '@/lib/db';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-08-27.basil',
});

const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET!;

export async function POST(request: NextRequest) {
  const body = await request.text();
  const signature = request.headers.get('stripe-signature')!;

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(body, signature, endpointSecret);
  } catch (err) {
    console.error('Webhook signature verification failed:', err);
    return NextResponse.json(
      { error: 'Webhook signature verification failed' },
      { status: 400 }
    );
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        const workspaceId = session.metadata?.workspaceId;

        if (!workspaceId) {
          console.error('No workspace ID in session metadata');
          break;
        }

        // Update workspace to premium
        await db.workspace.update({
          where: { id: workspaceId },
          data: {
            isPremium: true,
            stripeCustomerId: session.customer as string,
            stripeSubscriptionId: session.subscription as string,
          },
        });

        console.log(`Workspace ${workspaceId} upgraded to premium`);
        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription;
        
        // Find workspace by subscription ID and downgrade
        await db.workspace.updateMany({
          where: { stripeSubscriptionId: subscription.id },
          data: {
            isPremium: false,
            stripeSubscriptionId: null,
          },
        });

        console.log(`Subscription ${subscription.id} cancelled`);
        break;
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as any;
        console.log(`Payment failed for subscription: ${invoice.subscription}`);
        // You might want to send an email notification here
        break;
      }

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Error processing webhook:', error);
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    );
  }
}