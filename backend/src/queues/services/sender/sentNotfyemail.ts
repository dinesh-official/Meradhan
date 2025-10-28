import { forgotPasswordLinkSenderQueue, welcomeEmailSenderQueue } from "../../redis/queues"

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