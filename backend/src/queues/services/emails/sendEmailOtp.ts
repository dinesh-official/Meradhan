import { emailOtpSenderQueue } from "../../redis/queues"

export const sendLoginOtpEmail = async (data: { email: string, userName: string, otp: string }) => {
    await emailOtpSenderQueue.createJob("send_auth_otp:" + new Date().getTime(), {
        ...data,
        subject: `Your One-Time Password (OTP) for Login - MeraDhan`
    })
}