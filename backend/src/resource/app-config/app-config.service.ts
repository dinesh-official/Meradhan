import { db } from "@core/database/database";
import type { PaymentGatewayMode } from "@databases/generated/prisma/postgres";

export class AppConfigService {
  async ensureConfig(): Promise<void> {
    await db.dataBase.appConfig.upsert({
      where: { id: 1 },
      create: { id: 1, paymentGatewayMode: "INQUIRY" },
      update: {},
    });
  }

  async getPaymentGatewayMode(): Promise<PaymentGatewayMode> {
    await this.ensureConfig();
    const row = await db.dataBase.appConfig.findUniqueOrThrow({
      where: { id: 1 },
    });
    return row.paymentGatewayMode;
  }

  async setPaymentGatewayMode(mode: PaymentGatewayMode): Promise<PaymentGatewayMode> {
    await this.ensureConfig();
    await db.dataBase.appConfig.update({
      where: { id: 1 },
      data: { paymentGatewayMode: mode },
    });
    return this.getPaymentGatewayMode();
  }
}
