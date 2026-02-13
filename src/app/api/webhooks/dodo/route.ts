
import { Webhooks } from '@dodopayments/nextjs';
import { getFirestore } from 'firebase-admin/firestore';
import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { adminConfig } from '@/lib/firebase-admin-config';
import { addMonths } from 'date-fns';
import type { SubscriptionPlan } from '@/lib/types';

// Initialize Firebase Admin SDK
if (!getApps().length) {
    initializeApp({
        credential: cert(adminConfig.credential),
    });
}
const db = getFirestore();

const planDetails: Record<SubscriptionPlan, { interviews: number; durationMonths: number }> = {
    'free': { interviews: 0, durationMonths: 0 },
    'pro-1m': { interviews: 10, durationMonths: 1 },
    'pro-2m': { interviews: 25, durationMonths: 2 },
    'pro-3m': { interviews: 40, durationMonths: 3 },
};

export const POST = Webhooks({
    webhookKey: process.env.DODO_PAYMENTS_WEBHOOK_SECRET!,
    onPayload: async ({ type, data }: any) => {
        console.log(`Dodo Webhook received: ${type}`, data);

        if (type === 'payment.succeeded') {
            const { metadata, id: paymentId } = data as any;
            const { uid, planId } = metadata || {};

            if (!uid || !planId) {
                console.error('Missing uid or planId in Dodo webhook metadata');
                return;
            }

            const selectedPlan = planDetails[planId as SubscriptionPlan];
            if (!selectedPlan) {
                console.error(`Invalid plan ID in Dodo webhook: ${planId}`);
                return;
            }

            const currentDate = new Date();
            const endDate = addMonths(currentDate, selectedPlan.durationMonths);

            const subscriptionData = {
                plan: planId,
                status: 'active',
                startDate: currentDate.toISOString(),
                endDate: endDate.toISOString(),
                paymentId: paymentId,
                source: 'dodo',
                interviewUsage: {
                    limit: selectedPlan.interviews,
                    count: 0
                },
                resumeExports: {
                    date: currentDate.toISOString().slice(0, 7), // YYYY-MM
                    count: 0
                },
            };

            try {
                await db.collection('users').doc(uid).set({ subscription: subscriptionData }, { merge: true });
                console.log(`Successfully updated subscription for user ${uid} via Dodo`);
            } catch (error) {
                console.error('Error updating user subscription via Dodo webhook:', error);
            }
        }
    },
});
