import Stripe from 'stripe';
import { PLANS, CREDIT_COSTS } from '@/lib/plans';

// Re-export from plans for backward compatibility
export { PLANS, CREDIT_COSTS };

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-12-15.clover',
  typescript: true,
});
