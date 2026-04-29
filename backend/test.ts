import { makeRazorpayRouteTransition } from "@services/razorpay-route/RPay-route";

const data = await makeRazorpayRouteTransition({
    amount: 100,
    payId: "pay_SbnnB9dBv2LYL0",
    userId: 25
});

console.log(data);
