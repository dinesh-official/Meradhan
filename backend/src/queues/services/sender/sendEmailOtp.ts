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

export const sendCustomerSignupOtpEmail = async (data: { email: string, userName: string, otp: string }) => {
    await emailOtpSenderQueue.add({
        ...data,
        subject: `Your One-Time Password (OTP) for Signup - MeraDhan`
    }, {
        removeOnComplete: true,
        attempts: 1,
        removeOnFail: true
    })
}

export const sendCustomerSigninOtpEmail = async (data: { email: string, userName: string, otp: string }) => {
    await emailOtpSenderQueue.add({
        ...data,
        subject: `Your One-Time Password (OTP) for Signup - MeraDhan`
    }, {
        removeOnComplete: true,
        attempts: 1,
        removeOnFail: true
    })
}