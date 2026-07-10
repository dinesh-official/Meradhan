// packages/config/src/secrets.ts

import { env } from './env';

// This is a placeholder for future integrations.
// You can expand this to load secrets from AWS Secrets Manager, Vault, etc.

export const Secrets = {
  jwtSecret: env.JWT_SECRET,

  // Example for future AWS users:
  // stripeKey: async () => {
  //   const key = await awsSecretManager.getSecret("STRIPE_KEY");
  //   return key;
  // },
};
