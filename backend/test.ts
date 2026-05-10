import { PaymentReconciliationService } from "@services/payment/payment_reconciliation.service";

const svc = new PaymentReconciliationService();

const result = await svc.reconcilePendingRazorpayOrders({
    lookbackHours: 72,
    maxOrders: 75,
});

console.log(result);
