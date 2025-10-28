import Bull from 'bull';
import { KeyValueStore } from '../services/KeyValueStore';
import { QueueStore } from './QueueStore';

export enum QueueNames {
    emailOtpSend = 'emailOTPSend',
    welComeEmail = 'welcomeEmail',
    mobileOtpSend = 'mobileOTPSend',
    forgotPasswordEmail = 'forgotPasswordEmail',
    successResetPassword = 'successResetPassword'
}

// 🔹 Create a shared Redis connection using QueueStore (recommended)
const sharedConnection = QueueStore.getStore();
// 🔹 Initialize your key-value cache storage
export const cacheStorage = new KeyValueStore(sharedConnection);

// 🔹 Reuse shared Redis clients across all queues
const sharedRedisOpts = {
    createClient: (type: string) => {
        switch (type) {
            case 'client':
                return sharedConnection.getInstance().duplicate();
            case 'subscriber':
                return sharedConnection.getInstance().duplicate();
            default:
                return sharedConnection.getInstance().duplicate();
        }
    },
};


// 🔹 Initialize all queues using shared redis connections
export const welcomeEmailSenderQueue = new Bull(QueueNames.welComeEmail, sharedRedisOpts);
export const emailOtpSenderQueue = new Bull(QueueNames.emailOtpSend, sharedRedisOpts);
export const mobileOtpSenderQueue = new Bull(QueueNames.mobileOtpSend, sharedRedisOpts);
export const forgotPasswordLinkSenderQueue = new Bull(QueueNames.forgotPasswordEmail, sharedRedisOpts);
export const successResetPasswordQueue = new Bull(QueueNames.successResetPassword, sharedRedisOpts);
