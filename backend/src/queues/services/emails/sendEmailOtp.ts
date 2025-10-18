import { emailOtpSenderQueue } from "../../redis/queues"

export const sendLoginOtpEmail = async (data: { email: string, userName: string, otp: string }) => {
    await emailOtpSenderQueue.add({
        ...data,
        subject: `Your One-Time Password (OTP) for Login - MeraDhan`
    }, {
        removeOnComplete: true,
        attempts: 1,
        removeOnFail: true
    })
}