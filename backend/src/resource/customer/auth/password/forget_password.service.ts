import { db } from "@core/database/database";
import {
  sendForgetPasswordEmail,
  sendPasswordResetSuccessEmail,
} from "@jobs/helper/send_emails";
import { env } from "@packages/config/src/env";
import { AppError } from "@utils/error/AppError";
import { hashingUtils } from "@utils/hash/hashing_utils";
import { tokenUtils } from "@utils/token/JwtToken_utils";
import { cacheStorage } from "@store/redis_store";

export class ForgetPasswordService {
  async sendForgetPassword(data: { email: string }) {
    const user = await db.dataBase.customerProfileDataModel.findUnique({
      where: {
        emailAddress: data.email,
        isDeleted: false,
      },
      include: {
        utility: true,
      },
    });

    if (!user) {
      throw new AppError("User not exist on this email address");
    }

    if (user.utility.signinWith != "CREDENTIALS") {
      throw new AppError(
        "This email was registered using " +
          user.utility.signinWith.toLocaleLowerCase() +
          ". Please continue with " +
          user.utility.signinWith.toLocaleLowerCase +
          " below to log in.",
        { code: "SIGNIN_WITH_" + user.utility.signinWith },
      );
    }

    const token = tokenUtils.generateToken(
      {
        id: user.id,
        role: "USER",
      },
      "30m",
    );

    const url = `${env.NEXT_PUBLIC_HOST_URL}/reset-password?token=${token}`;
    await cacheStorage.set("RESET_PASSWORD_TOKEN:" + user.id, token, 30 * 60);
    await sendForgetPasswordEmail({
      email: user.emailAddress,
      link: url,
      userName: user.firstName + " " + user.lastName,
    });

    return true;
  }

  async resetPassword(data: { token: string; password: string }) {
    const token = tokenUtils.verifyToken<{
      id: string;
    }>(data.token);
    const user = await db.dataBase.customerProfileDataModel.findUnique({
      where: {
        id: Number(token.id),
      },
      include: {
        utility: true,
      },
    });

    if (!user) {
      throw new AppError("User not exist on this reset link");
    }

    const checkToken = await cacheStorage.get(
      "RESET_PASSWORD_TOKEN:" + user.id,
    );

    if (checkToken != data.token) {
      throw new AppError("link is no longer valid please try again", {
        code: "LINK_EXPIRED",
      });
    }

    const hashedPassword = await hashingUtils.hashPassword(data.password);
    await db.dataBase.customerProfileDataModel.update({
      where: {
        id: Number(token.id),
      },
      data: {
        utility: {
          update: {
            password: hashedPassword,
          },
        },
      },
    });

    await cacheStorage.delete("RESET_PASSWORD_TOKEN:" + user.id);
    await sendPasswordResetSuccessEmail({
      email: user.emailAddress,
      userName: user.firstName + " " + user.lastName,
    });
    return true;
  }
}
