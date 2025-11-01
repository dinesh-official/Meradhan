# Simple KYC Manager

A straightforward implementation for mapping KYC data to customer profiles.

## Usage

```typescript
const kycManager = new CustomerKycManager();

// Save KYC data to customer profile
await kycManager.saveKycToCustomer(customerId);

// Check if KYC is complete
const isComplete = await kycManager.isKycComplete(customerId);

// Get KYC status
const status = await kycManager.getKycStatus(customerId);
```

## What it does

1. **Gets KYC data** from the `kYC_FLOW` table
2. **Maps the data** to the customer profile and related tables:
   - Aadhaar card information
   - PAN card information
   - Personal information
   - Current and permanent addresses
   - Bank accounts
   - Demat accounts
   - Risk profile
3. **Updates everything** in a single database transaction

## Simple and Direct

- No complex abstractions
- No custom error classes
- No multiple mapper files
- Just one class with clear methods
- Easy to read and modify