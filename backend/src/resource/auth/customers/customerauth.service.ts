import { CustomerProfileManager } from "@lib/manager/customer/customer.manager";
import type { appSchema } from "@root/schema";
import { tokenUtils } from "@utils/token/JwtToken.utils";
import type z from "zod";

export class CustomerAuthService {
    private customerProfileService = new CustomerProfileManager();

    async signUpWithCredentials(data: z.infer<typeof appSchema.customer.createNewCustomerSchema>) {
        const user = await this.customerProfileService.createCustomerProfile(data);
        const authToken = tokenUtils.generateToken({
            email: user.emailAddress,
            id: user.id,
        }, '1d');
        await this.customerProfileService.setLatestLoginTime(user.id);
        return {
            id: user.id,
            email: user.emailAddress,
            avatar: user.avatar,
            token: authToken,
        };
    }

    async checkEmailOrPhoneExists(email: string) {
        const user = await this.customerProfileService.getCustomerProfileByEmail(email);
        if (user) {
            throw new Error("Email already exists");
        }
        const userByPhone = await this.customerProfileService.getCustomerProfileByPhone(email);
        if (userByPhone) {
            throw new Error("Phone number already exists");
        }
        return user;
    }
}