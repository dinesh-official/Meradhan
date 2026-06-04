
import "@packages/config/env";
import { db } from "@core/database/database";
import { OrderService } from "@resource/customer/order/order.service";
import { CrmOrdersService } from "@resource/crm/orders/orders.service";

interface AssignOrderToCustomerInput {
  customerProfileId: number;
  isin: string;
  orderNumber: string;
  dryRun?: boolean;
}

async function createOrderForCustomer(input: AssignOrderToCustomerInput) {
  const { customerProfileId, isin, orderNumber, dryRun = false } = input;

  const customer = await db.dataBase.customerProfileDataModel.findUnique({
    where: { id: customerProfileId },
    select: {
      id: true,
      userName: true,
      firstName: true,
      lastName: true,
      emailAddress: true,
      kycStatus: true,
      isDeleted: true,
      bankAccounts: {
        where: { isPrimary: true },
        select: { id: true, bankName: true, accountNumber: true, ifscCode: true },
      },
    },
  });

  if (!customer) {
    throw new Error(`Customer profile not found: id=${customerProfileId}`);
  }
  if (customer.isDeleted) {
    throw new Error(`Customer ${customerProfileId} is marked deleted. Aborting.`);
  }
  if (customer.bankAccounts.length === 0) {
    throw new Error(
      `Customer ${customerProfileId} has no primary bank account. createOrder will fail.`,
    );
  }

  const bond = await db.dataBase.bonds.findFirst({
    where: { isin },
    select: { isin: true, bondName: true, sellPrice: true, faceValue: true, maturityDate: true },
  });
  if (!bond) {
    throw new Error(`Bond not found for ISIN ${isin}`);
  }

  const orderService = new CrmOrdersService();

  console.log("── Customer ─────────────────────────────────");
  console.log({
    id: customer.id,
    userName: customer.userName,
    name: [customer.firstName, customer.lastName].filter(Boolean).join(" "),
    email: customer.emailAddress,
    kycStatus: customer.kycStatus,
    primaryBank: customer.bankAccounts[0]?.bankName,
  });
  console.log("── Bond ─────────────────────────────────────");
  console.log({
    isin: bond.isin,
    bondName: bond.bondName,
    sellPrice: bond.sellPrice,
    faceValue: bond.faceValue,
    maturityDate: bond.maturityDate,
  });


  if (dryRun) {
    console.log("\n[dryRun=true] No order written.");
    return;
  }

  const result = await orderService.createOrderFromRfq(
    orderNumber,
    customer.id,
    { orderSide: "BUY", skipExistsCheck: true },
  );

  console.log("\n✅ Order created");
  console.log(result);

  const saved = await db.dataBase.order.findUnique({
    where: { id: result.id },
    select: {
      id: true,
      orderNumber: true,
      customerProfileId: true,
      isin: true,
      bondName: true,
      quantity: true,
      totalAmount: true,
      status: true,
      paymentStatus: true,
      paymentOrderId: true,
      metadata: true,
      createdAt: true,
    },
  });
  console.log("\n── Persisted row ────────────────────────────");
  console.log(saved);
}

async function main() {
  // ────────────────────────────────────────────────────────────────────
  // EDIT THESE BEFORE RUNNING
  // ────────────────────────────────────────────────────────────────────
  const CUSTOMER_PROFILE_UCC = "MD1HRXWON"; // UCC of the customer to create the order for
  const ISIN = "INE0NES07279"; // ISIN of the bond to order
  const ORDER_NUMBER = "260529990010538"; // Order number of the order to create
  const DRY_RUN = false; // true to skip actual order creation
  // ────────────────────────────────────────────────────────────────────

  const Customer = await db.dataBase.customerProfileDataModel.findUnique({
    where: { userName: CUSTOMER_PROFILE_UCC },
    select: { id: true },
  });

  if (!Customer) {
    throw new Error(`Customer not found for UCC ${CUSTOMER_PROFILE_UCC}`);
  }


  await db.dataBase.$connect();
  try {
    await createOrderForCustomer({
      customerProfileId: Customer?.id,
      isin: ISIN,
      orderNumber: ORDER_NUMBER,
      dryRun: DRY_RUN,
    });
  } finally {
    await db.dataBase.$disconnect();
  }
}

main().catch((err) => {
  console.error("❌ Script failed:", err);
  process.exit(1);
});
