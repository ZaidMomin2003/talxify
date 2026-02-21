
import { Webhooks } from '@dodopayments/nextjs';
import { getFirestore } from 'firebase-admin/firestore';
import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { adminConfig } from '@/lib/firebase-admin-config';
import { addMonths } from 'date-fns';
import type { SubscriptionPlan } from '@/lib/types';

export const dynamic = 'force-dynamic';

// Initialize Firebase Admin SDK safely
try {
    if (!getApps().length) {
        if (adminConfig.credential.projectId && adminConfig.credential.clientEmail && adminConfig.credential.privateKey) {
            initializeApp({
                credential: cert(adminConfig.credential),
            });
        } else {
            console.warn('[DODO-WEBHOOK] Firebase Admin credentials missing; subscription sync may fail.');
        }
    }
} catch (error) {
    console.error('[DODO-WEBHOOK] Firebase Admin Initialization Error:', error);
}

const db = getFirestore();

const planDetails: Record<SubscriptionPlan, { interviews: number; durationMonths: number }> = {
    'free': { interviews: 1, durationMonths: 0 },
    'pro-1m': { interviews: 10, durationMonths: 1 },
    'pro-2m': { interviews: 20, durationMonths: 1 },
    'pro-3m': { interviews: 30, durationMonths: 1 },
};

export const POST = Webhooks({
    webhookKey: process.env.DODO_PAYMENTS_WEBHOOK_SECRET || '',
    onPayload: async ({ type, data }: any) => {
        console.log(`[DODO-WEBHOOK] Event received: ${type}`, data);

        if (!process.env.DODO_PAYMENTS_WEBHOOK_SECRET) {
            console.error('[DODO-WEBHOOK] DODO_PAYMENTS_WEBHOOK_SECRET is not configured!');
            return;
        }

        if (type === 'payment.succeeded') {
            const { metadata, id: paymentId } = data as any;

            // Handle potentially stringified metadata
            let parsedMetadata = metadata;
            if (typeof metadata === 'string') {
                try {
                    parsedMetadata = JSON.parse(metadata);
                } catch (e) {
                    console.error('[DODO-WEBHOOK] Failed to parse metadata string:', metadata);
                }
            }

            const { uid, planId } = parsedMetadata || {};

            if (!uid || !planId) {
                console.error('[DODO-WEBHOOK] Missing uid or planId in metadata:', parsedMetadata);
                return;
            }

            const selectedPlan = planDetails[planId as SubscriptionPlan];
            if (!selectedPlan) {
                console.error(`[DODO-WEBHOOK] Invalid plan ID: ${planId}`);
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
                subscriptionId: data.subscription_id || null,
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
                await db.collection('users').doc(uid).set({
                    subscription: subscriptionData,
                    updatedAt: new Date().toISOString()
                }, { merge: true });
                console.log(`[DODO-WEBHOOK] Successfully updated subscription for user ${uid}`);
            } catch (error) {
                console.error('[DODO-WEBHOOK] Firestore update failure:', error);
            }
        }
    },
});
