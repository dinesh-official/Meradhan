import { db } from "@core/database/database";
import { sendMobileOtp } from "@jobs/helper/send_sms";
import { OtpVerificationService } from "@services/otp_verification.service";
import { ParticipantManager } from "@services/refq/nse/cbrics_manager.service";
import { AppError } from "@utils/error/AppError";

export class CustomerProfileService {
  private optManager = new OtpVerificationService("MOBILE_VERIFY");
  private participantManager = new ParticipantManager();

  async updateMobileRequest({
    customerId,
    newMobile,
    newWhatsAppNo,
  }: {
    newMobile: string;
    newWhatsAppNo?: string;
    customerId: number;
  }): Promise<boolean> {
    // Logic to handle mobile update request

    // check if newMobile is already in use can be added here

    const existingOtp = await db.dataBase.customerProfileDataModel.findFirst({
      where: {
        phoneNo: newMobile,
      },
    });
    if (existingOtp) {
      throw new AppError(
        "Mobile number is already associated with another account.",
      );
    }

    const user = await db.dataBase.customerProfileDataModel.update({
      where: {
        id: customerId,
      },
      data: {
        whatsAppNo: newWhatsAppNo,
        phoneNo: newMobile,
        utility: {
          update: {
            isPhoneVerified: false,
          },
        },
      },
    });

    if (user.kycStatus == "VERIFIED") {
      await this.participantManager.updateParticipant(customerId);
    }

    return true;
  }

  async sendMobileOtpVerification({
    newMobile,
  }: {
    newMobile: string;
  }): Promise<string> {
    const otp = await this.optManager.generateOtp(newMobile);
    // Send OTP to new mobile number (implementation not shown)
    if (process.env.NODE_ENV !== "production") {
      console.log(`OTP sent to ${newMobile}: ${otp}`);
    }

    await sendMobileOtp({
      mobile: newMobile,
      otp: otp.otp,
      template: "verify",
    });

    return otp.token;
  }

  async verifyAndUpdateMobile({
    customerId,
    newMobile,
    otpToken,
    otpCode,
  }: {
    customerId: number;
    newMobile: string;
    otpToken: string;
    otpCode: string;
  }): Promise<boolean> {
    const isValid = await this.optManager.verifyOtp(otpToken, otpCode);
    if (isValid) {
      // Update the customer's mobile number in the database (implementation not shown)
      console.log(
        `Mobile number for customer ${customerId} updated to ${newMobile}`,
      );

      await db.dataBase.customerProfileDataModel.update({
        data: {
          phoneNo: newMobile,
          utility: {
            update: {
              isPhoneVerified: true,
            },
          },
        },
        where: {
          id: customerId,
        },
      });

      return true;
    } else {
      console.log(`OTP verification failed for customer ${customerId}`);
      return false;
    }
  }

  async toggleWhatsAppNotifications(
    customerId: number,
    enable: boolean,
  ): Promise<boolean> {
    await db.dataBase.customerProfileDataModel.update({
      data: {
        utility: {
          update: {
            whatsAppNotificationAllow: enable,
          },
        },
      },
      where: {
        id: customerId,
      },
    });

    return true;
  }
}
