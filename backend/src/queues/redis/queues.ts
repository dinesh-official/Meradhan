import Bull from 'bull';
import { KeyValueStore } from '../services/KeyValueStore';
import { QueueStore } from './QueueStore';
import { config } from '@config/config';

export enum QueueNames {
    emailOtpSend = 'emailOTPSend',
    mobileOtpSend = 'mobileOTPSend'
}

// Initialize Redis connection from your QueueStore
const redisStore = QueueStore.getStore();

// Initialize your key-value cache storage (custom service)
export const cacheStorage = new KeyValueStore(redisStore);

// Create Bull Queue for sending Email OTPs
export const emailOtpSenderQueue = new Bull(QueueNames.emailOtpSend, {
    redis: config.redis
});

export const mobileOtpSenderQueue = new Bull(QueueNames.mobileOtpSend, {
    redis: config.redis
});