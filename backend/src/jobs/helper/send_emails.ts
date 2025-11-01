import { emailOtpSenderQueue, forgotPasswordLinkSenderQueue, successResetPasswordQueue, welcomeEmailSenderQueue } from "@jobs/queue/worker_queues"
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

export const sendCustomerWelcomeEmail = async (data: { email: string, userName: string }) => {
    await welcomeEmailSenderQueue.add({
        ...data,
        subject: `Welcome to MeraDhan – Your Journey to Secure Investments Begins!`
    }, {
        removeOnComplete: true,
        attempts: 1,
        removeOnFail: true
    })
}

export const sendForgetPasswordEmail = async (data: { email: string, userName: string, link: string }) => {
    await forgotPasswordLinkSenderQueue.add({
        ...data,
        subject: `Reset Your Password – MeraDhan`
    }, {
        removeOnComplete: true,
        attempts: 1,
        removeOnFail: true
    })
}

export const sendPasswordResetSuccessEmail = async (data: { email: string, userName: string }) => {
    await successResetPasswordQueue.add({
        ...data,
        subject: `Password Reset Successful – MeraDhan`
    }, {
        removeOnComplete: true,
        attempts: 1,
        removeOnFail: true
    })
}