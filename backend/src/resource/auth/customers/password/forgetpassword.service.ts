import { config } from "@config/config";
import { db } from "@core/database/database";
import { tokenUtils } from "@utils/token/JwtToken.utils";
import { sendForgetPasswordEmail } from "../../../../queues/services/sender/sentNotfyemail";
import { AppError } from "@utils/error/AppError";
import { hashingUtils } from "@utils/hash/hashing.utils";

export class ForgetPasswordService {

    async sendForgetPassword(data: { email: string }) {
        const user = await db.dataBase.customerProfileDataModel.findUnique({
            where: {
                emailAddress: data.email
            },
            include: {
                utility: true
            }
        })

        if (!user) {
            throw new AppError("User not exist on this email address");
        }

        if (user.utility.signinWith != "CREDENTIALS") {
            throw new AppError("This email was registered using " + user.utility.signinWith.toLocaleLowerCase() + ". Please continue with " + user.utility.signinWith.toLocaleLowerCase + " below to log in.", { code: "SIGNIN_WITH_" + user.utility.signinWith });
        }

        const token = tokenUtils.generateToken(
            {
                id: user.id,
            },
            '30m'
        );

        const url = `${config.clientUrl}/reset-password?token=${token}`;
        await sendForgetPasswordEmail({
            email: user.emailAddress,
            link: url,
            userName: user.firstName + " " + user.lastName
        })

        return true;
    }

    async resetPassword(data: { token: string, password: string }) {
        const token = tokenUtils.verifyToken<{

            id: string
        }>(data.token);
        const user = await db.dataBase.customerProfileDataModel.findUnique({
            where: {
                id: Number(token.id)
            },
            include: {
                utility: true
            }
        })

        if (!user) {
            throw new AppError("User not exist on this reset link");
        }

        const hashedPassword = await hashingUtils.hashPassword(data.password);
        await db.dataBase.customerProfileDataModel.update({
            where: {
                id: Number(token.id)
            },
            data: {
                utility: {
                    update: {
                        password: hashedPassword
                    }
                }
            }
        })

        return true;
    }

}