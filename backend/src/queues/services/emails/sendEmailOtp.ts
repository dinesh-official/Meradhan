import { emailSenderQueue } from "../../redis/queues"

export const sendLoginOtpEmail = async (data: { email: string, userName: string, otp: string }) => {
    await emailSenderQueue.createJob("send_auth_otp", {
        ...data,
        subject: `Your One-Time Password (OTP) for Login - MeraDhan`
    })
}