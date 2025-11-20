// packages/config/src/constants.ts

export const API_VERSION = 'v1';

export const QueueNames = {
  Email: 'queue.email',
  Notifications: 'queue.notifications',
} as const;

export const Cookies = {
  Session: 'session_id',
} as const;

export const RateLimits = {
  DefaultWindow: 60 * 1000, // 1 minute
  DefaultMax: 100,
};
