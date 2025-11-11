# PDF Generation System - Documentation

## 📁 Project Structure

```
src/app/pdf/
├── MdPdf.tsx           # Main PDF document component
├── dataMapper.ts       # Centralized data mapping logic with TypeScript types
├── data.ts             # Old data structure (legacy)
├── helper.ts           # Helper functions
├── elements/           # Reusable UI components
│   ├── BankAccount.tsx
│   ├── CheckBoxRow.tsx
│   ├── DemateAccount.tsx
│   └── ...
└── pages/              # Individual PDF pages
    ├── Page1.tsx
    ├── Page2.tsx
    └── ...
```

## 🎯 How It Works

### 1. Data Flow

```
Your API Data (Root type) 
    ↓
mapAllPages(data) : AllPagesData
    ↓
pageData object (fully typed)
    ↓
Individual Page Components
    ↓
Rendered PDF
```

### 2. Type-Safe Architecture

All page props are explicitly typed for maximum maintainability:

```typescript
// Each page has its own prop type
export type Page1Props = {
  applicationType: "NEW" | "UPDATE";
  kycType: "NORMAL" | "PAN_EXEMPTED";
  panNo: string;
  name: string;
  // ... all other fields with strict types
};

// Mapper functions are type-safe
export const mapDataForPage1 = (data: Root): Page1Props => ({
  // TypeScript ensures all required fields are provided
});

// AllPagesData combines all page types
export type AllPagesData = {
  page1: Page1Props;
  page2: Page2Props;
  // ... all pages
};
```

### 3. Benefits of Typed Return Values

✅ **Autocomplete**: IDE shows all available properties
✅ **Type Safety**: Compile-time errors for missing/wrong fields
✅ **Refactoring**: Easy to find all usages when changing prop types
✅ **Documentation**: Types serve as inline documentation
✅ **Maintainability**: Clear contract between mappers and components

## 📝 Available Types

### Page Prop Types (All 48+ Pages)

**Pages with Dynamic Data:**
- `Page1Props` - KYC application form data
- `Page2Props` - Address details
- `Page3Props` - FATCA and PEP declaration
- `Page4Props` - Signature and date
- `Page5Props` - Document verification
- `Page6Props` - e-Aadhaar document
- `Page7Props` - e-PAN document
- `Page8Props` - Face/selfie photo
- `Page9Props` - Signature image
- `Page10Props` - Static content
- `Page11Props` - Bank and demat account details
- `Page12Props` - Financial information
- `Page13Props` - Introducer details
- `Page14Props` - Participant information
- `Page15Props` - Primary accounts summary
- `Page16Props` - Additional bank accounts
- `Page17Props` - Additional demat accounts
- `Page38Props` - Nominee information
- `Page39Props` - Nominee declaration
- `Page42Props` - Opt-out nomination
- `Page47Props` - Acknowledgement
- `Page48Props` - Final acknowledgement

**Static Content Pages (No Props):**
- `Page18Props` through `Page37Props` - Rights, obligations, terms & conditions
- `Page40Props`, `Page41Props`, `Page43Props` through `Page46Props` - Legal documents

All static pages use empty prop types `{}` - they don't require any data.

### Shared Types

- `AddressType` - Address structure used across multiple pages
- `AllPagesData` - Complete mapped data for all 48+ pages

## 📊 Page Status Table

| Page Range | Count | Status | Description |
|------------|-------|--------|-------------|
| 1-11 | 11 | ✅ Mapped | User info, addresses, documents |
| 12-17 | 6 | ✅ Mapped | Bank, demat, financial details |
| 18-37 | 20 | ✅ Static | Terms, conditions, rights |
| 38-39 | 2 | ✅ Mapped | Nominee information |
| 40-41 | 2 | ✅ Static | Additional legal documents |
| 42 | 1 | ✅ Mapped | Opt-out nomination |
| 43-46 | 4 | ✅ Static | Final legal documents |
| 47-48 | 2 | ✅ Mapped | Acknowledgements |
| **Total** | **48** | **100%** | **All pages type-safe** |

## 🚀 Usage Examples

### Basic Usage with Types
```typescript
import { mapAllPages, AllPagesData, Root } from "./dataMapper";

// Your API data
const apiData: Root = {
  step_1: { /* ... */ },
  step_2: { /* ... */ },
  // ... other steps
};

// Map all pages - result is fully typed
const pageData: AllPagesData = mapAllPages(apiData);

// TypeScript knows all properties
pageData.page1.panNo // string
pageData.page1.applicationType // "NEW" | "UPDATE"
pageData.page2.permanentAddress // AddressType

// Use in components - props are type-checked
<Page1 {...pageData.page1} />
<Page2 {...pageData.page2} />
```

### Individual Page Mapper with Types
```typescript
import { mapDataForPage1, Page1Props } from "./dataMapper";

const page1Data: Page1Props = mapDataForPage1(apiData);

// TypeScript ensures all required fields exist
console.log(page1Data.panNo); // ✅ OK
console.log(page1Data.invalidField); // ❌ TypeScript error
```

### Extending with New Pages
```typescript
// 1. Define the prop type
export type Page99Props = {
  customField: string;
  optionalField?: number;
};

// 2. Create the mapper with return type
export const mapDataForPage99 = (data: Root): Page99Props => ({
  customField: data.someField || "",
  optionalField: data.optionalValue,
});

// 3. Add to AllPagesData type
export type AllPagesData = {
  // ... existing pages
  page99: Page99Props;
};

// 4. Add to mapAllPages function
export const mapAllPages = (data: Root): AllPagesData => ({
  // ... existing pages
  page99: mapDataForPage99(data),
});
```

## 🔧 Utility Functions

Located in `dataMapper.ts`:

- **`getFullName(data)`** - Returns full name with middle name
- **`getFirstLastName(data)`** - Returns object with firstName and lastName
- **`getAddress(data)`** - Returns address in multiple formats
- **`getSignatureUrl(data)`** - Returns signature URL
- **`getPrimaryBank(data)`** - Returns primary bank details
- **`getPrimaryDemat(data)`** - Returns primary demat account details
- **`getInvestmentExperience(data)`** - Extracts from step_5 questions

## 📝 Currently Mapped Pages

| Page | Status | Props Source |
|------|--------|--------------|
| Page12 | ✅ Mapped | `pageData.page12` |
| Page13 | ✅ Mapped | `pageData.page13` |
| Page14 | ✅ Mapped | `pageData.page14` |
| Page15 | ✅ Mapped | `pageData.page15` |
| Page16 | ✅ Mapped | `pageData.page16` |
| Page17 | ✅ Mapped | `pageData.page17` |
| Page38 | ✅ Mapped | `pageData.page38` |
| Page39 | ✅ Mapped | `pageData.page39` |
| Page42 | ✅ Mapped | `pageData.page42` |
| Page47 | ✅ Mapped | `pageData.page47` |
| Page48 | ✅ Mapped | `pageData.page48` |

## 🚀 Usage

### Basic Usage
```tsx
import { mapAllPages, Root } from "./dataMapper";

// Your API data
const apiData: Root = {
  step_1: { /* ... */ },
  step_2: { /* ... */ },
  // ... other steps
};

// Map all pages at once
const pageData = mapAllPages(apiData);

// Use in components
<Page12 {...pageData.page12} />
<Page13 {...pageData.page13} />
```

### Individual Mapper Usage
```tsx
import { mapDataForPage12 } from "./dataMapper";

const page12Props = mapDataForPage12(apiData);
<Page12 {...page12Props} />
```

## 🎨 Benefits of This Structure

1. **Single Source of Truth**: Data mapping logic is centralized in `dataMapper.ts`
2. **Type Safety**: Full TypeScript support with the `Root` type
3. **Easy Maintenance**: Change data structure in one place
4. **Reusable Utilities**: Common extraction logic in utility functions
5. **Performance**: Data mapped once, used multiple times
6. **Testability**: Each mapper can be tested independently
7. **Clear Separation**: Data transformation separate from presentation

## 🔍 Debugging Tips

1. **Check mapped data**: `console.log(pageData)` to see all mapped values
2. **Individual mapper**: Test specific mapper: `console.log(mapDataForPage12(data))`
3. **Utility functions**: Test utilities: `console.log(getAddress(data))`
4. **Type errors**: Ensure your API data matches the `Root` type definition

## 📦 Sample Data

Sample data is defined in `MdPdf.tsx` as `sampleData`. This is used for testing and development.
Replace with real API data in production.

## 🛠️ Future Improvements

- Add mappers for remaining pages (Page1-11, Page18-37, Page40-41, Page43-46)
- Add validation for required fields
- Create helper for date formatting
- Add support for multiple nominees
- Add UCC ID to Root type definition
