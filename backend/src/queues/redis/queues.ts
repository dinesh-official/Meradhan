import Bull from 'bull';
import { KeyValueStore } from '../services/KeyValueStore';
import { QueueStore } from './QueueStore';
import { config } from '@config/config';

export enum QueueNames {
    emailOtpSend = 'emailOTPSend',
    welComeEmail = 'welcomeEmail',
    mobileOtpSend = 'mobileOTPSend',
    forgotPasswordEmail = 'forgotPasswordEmail'
}

// Initialize Redis connection from your QueueStore
const redisStore = QueueStore.getStore();

// Initialize your key-value cache storage (custom service)
export const cacheStorage = new KeyValueStore(redisStore);

// Create Bull Queue for sending Welcome Emails
export const welcomeEmailSenderQueue = new Bull(QueueNames.welComeEmail, {
    redis: config.redis
});

// Create Bull Queue for sending Email OTPs
export const emailOtpSenderQueue = new Bull(QueueNames.emailOtpSend, {
    redis: config.redis
});

// use for send mobile otp
export const mobileOtpSenderQueue = new Bull(QueueNames.mobileOtpSend, {
    redis: config.redis
});

// use for send for forgot password
export const forgotPasswordLinkSenderQueue = new Bull(QueueNames.forgotPasswordEmail, {
    redis: config.redis
});

// Create Bull Queue for sending Welcome Emails
export const successResetPasswordQueue = new Bull(QueueNames.welComeEmail, {
    redis: config.redis
});