import { config } from "@config/config";
import { db } from "@core/database/database";
import { tokenUtils } from "@utils/token/JwtToken.utils";
import { sendForgetPasswordEmail } from "../../../../queues/services/sender/sentNotfyemail";
import { AppError } from "@utils/error/AppError";

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
            throw new AppError("User not found");
        }

        if (user.utility.signinWith != "CREDENTIALS") {
            throw new AppError("This email was registered using " + user.utility.signinWith.toLocaleLowerCase() + ". Please continue with " + user.utility.signinWith.toLocaleLowerCase + " below to log in.", { code: "SIGNIN_WITH_" + user.utility.signinWith });
        }

        const token = tokenUtils.generateToken(
            {
                email: user.emailAddress,
                mobile: user.phoneNo,
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

        return { status: true };

    }

}