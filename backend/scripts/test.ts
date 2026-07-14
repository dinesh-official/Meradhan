import { PaymentGatewayMode, type OrderStatus, type PaymentStatus } from "@core/database/database";

const orderStatus = ({
  orderStatus,
  paymentProvider,
  paymentStatus,
}: {
  paymentProvider: string,
  paymentStatus: PaymentStatus,
  orderStatus: OrderStatus,
}): OrderStatus => {
  if (paymentProvider === "RAZORPAY") {
    if (paymentStatus === "COMPLETED") {
      if (orderStatus === "PENDING") {
        return "IN_PROGRESS";
      }
    }
  }
  return orderStatus;
}