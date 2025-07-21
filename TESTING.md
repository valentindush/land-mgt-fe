# TransferForm.vue Unit Tests

## Overview

Comprehensive unit tests for the TransferForm.vue component using Vue Test Utils and Vitest. These tests ensure the component works correctly with the updated schema, Cloudinary integration, and all user interactions.

## 🧪 Test Coverage

### ✅ Component Rendering (8 tests)
- Form renders with all required fields
- Parcel dropdown populated from user lands
- Empty state handling
- File upload area styling

### ✅ Form Validation (3 tests)
- Parcel ID validation (positive number)
- Recipient name validation (min 3 characters)
- File upload validation (types, size)

### ✅ User Interactions (6 tests)
- Parcel selection
- Recipient name input
- File upload handling
- File type validation errors
- File size validation errors

### ✅ Store Integration (3 tests)
- Land store for fetching user lands
- Auth store for authentication
- Transfer store for creating transfers

### ✅ Cloudinary Integration (3 tests)
- Document upload before transfer creation
- Upload failure handling
- Upload exception handling

### ✅ Error Handling (4 tests)
- Missing authentication
- Missing contract document
- Transfer creation failures
- Network errors

### ✅ Toast Notifications (2 tests)
- Success notifications
- Error notifications

### ✅ Form Reset (2 tests)
- Form reset after success
- Document clearing

### ✅ Loading States (2 tests)
- Loading state during submission
- Form disabled during submission

**Total: 33 comprehensive test cases**

## 🚀 Quick Start

### Prerequisites
```bash
npm install
```

### Run Tests

#### Option 1: Using Test Runner Scripts

**Windows:**
```bash
# Interactive mode
scripts/test-transfer-form.bat

# Direct commands
scripts/test-transfer-form.bat basic
scripts/test-transfer-form.bat coverage
scripts/test-transfer-form.bat watch
```

**Linux/Mac:**
```bash
# Interactive mode
./scripts/test-transfer-form.sh

# Direct commands
./scripts/test-transfer-form.sh basic
./scripts/test-transfer-form.sh coverage
./scripts/test-transfer-form.sh watch
```

#### Option 2: Direct NPM Commands

```bash
# Run all tests
npm run test

# Run only TransferForm tests
npx vitest run src/components/transfer/__tests__/TransferForm.test.ts

# Watch mode
npx vitest src/components/transfer/__tests__/TransferForm.test.ts

# Coverage report
npx vitest run src/components/transfer/__tests__/TransferForm.test.ts --coverage

# UI mode
npx vitest --ui src/components/transfer/__tests__/TransferForm.test.ts
```

## 📁 File Structure

```
src/components/transfer/__tests__/
├── TransferForm.test.ts    # Main test file (33 tests)
├── setup.ts               # Test environment setup
└── README.md              # Detailed test documentation

scripts/
├── test-transfer-form.sh   # Linux/Mac test runner
└── test-transfer-form.bat  # Windows test runner

vitest.config.ts            # Updated with test setup
TESTING.md                  # This file
```

## 🔧 Test Configuration

### Mocked Dependencies
- **Stores**: `useTransferStore`, `useLandStore`, `useAuthStore`
- **Toast**: `useToast` for notifications
- **Cloudinary**: `uploadDocumentToCloudinary`
- **Form Validation**: `vee-validate`
- **Browser APIs**: File, FormData, fetch, crypto

### Test Data
```typescript
// Sample user lands
const mockUserLands = [
  {
    id: '1',
    parcel_id: 12345,
    size: 1000,
    ownership_type: 'Individual',
    supporting_document_url: 'https://example.com/doc1.pdf',
    status: 'Approved'
  }
]

// Sample authenticated user
const mockUser = {
  id: 'user-123',
  email: 'test@example.com',
  full_name: 'Test User'
}
```

## 📊 Expected Test Results

When all tests pass, you should see:
```
✓ Component Rendering (8)
✓ Form Validation (3)
✓ User Interactions (6)
✓ Store Integration (3)
✓ Cloudinary Integration (3)
✓ Error Handling (4)
✓ Toast Notifications (2)
✓ Form Reset (2)
✓ Loading States (2)

Test Files  1 passed (1)
Tests       33 passed (33)
```

## 🐛 Troubleshooting

### Common Issues

1. **Import Errors**
   ```bash
   # Make sure all dependencies are installed
   npm install
   ```

2. **Mock Errors**
   ```bash
   # Clear node modules and reinstall
   rm -rf node_modules package-lock.json
   npm install
   ```

3. **Path Resolution**
   ```bash
   # Ensure you're running from project root
   cd /path/to/warmup-fe
   ```

### Debug Mode
```bash
# Run with debug output
DEBUG=1 npx vitest run src/components/transfer/__tests__/TransferForm.test.ts
```

## 🎯 Test Philosophy

These tests follow best practices:

1. **Isolation**: Each test is independent with proper setup/teardown
2. **Realistic Data**: Uses actual schema-compliant data
3. **User-Centric**: Tests user workflows, not implementation details
4. **Error Coverage**: Tests both happy path and error scenarios
5. **Async Handling**: Properly handles async operations
6. **Mock Strategy**: Mocks external dependencies while testing component logic

## 📈 Coverage Goals

- **Statements**: > 90%
- **Branches**: > 85%
- **Functions**: > 90%
- **Lines**: > 90%

## 🔄 Continuous Integration

Add to your CI pipeline:
```yaml
- name: Run TransferForm Tests
  run: npx vitest run src/components/transfer/__tests__/TransferForm.test.ts --coverage
```

## 📝 Adding New Tests

When adding new features to TransferForm.vue:

1. Add corresponding test cases
2. Update mock data if schema changes
3. Test both success and error scenarios
4. Verify user interactions work correctly
5. Update this documentation

## 🤝 Contributing

When modifying tests:
1. Keep test names descriptive
2. Group related tests in describe blocks
3. Use realistic test data
4. Add comments for complex test logic
5. Update documentation
