# TransferForm.vue Unit Tests

This directory contains comprehensive unit tests for the TransferForm.vue component using Vue Test Utils and Vitest.

## Test Coverage

### 1. Component Rendering
- ✅ Form renders with all required fields (parcel dropdown, recipient input, file upload)
- ✅ Parcel options populated from user lands
- ✅ Empty state handling when no lands available
- ✅ File upload area with proper styling and instructions

### 2. Form Validation
- ✅ Parcel ID validation (positive number)
- ✅ Recipient name validation (minimum 3 characters)
- ✅ File upload validation (required, file types, size limits)

### 3. User Interactions
- ✅ Parcel selection from dropdown
- ✅ Recipient name input handling
- ✅ File upload with validation
- ✅ File type validation errors
- ✅ File size validation errors

### 4. Store Integration
- ✅ Land store integration for fetching user lands
- ✅ Auth store integration for user authentication
- ✅ Transfer store integration for creating transfers
- ✅ Proper method calls with correct parameters

### 5. Cloudinary Integration
- ✅ Document upload before transfer creation
- ✅ Upload failure handling
- ✅ Upload exception handling
- ✅ Success flow with uploaded document URL

### 6. Error Handling
- ✅ Missing authentication errors
- ✅ Missing contract document errors
- ✅ Transfer creation failures
- ✅ Network error handling

### 7. Toast Notifications
- ✅ Success toast on successful transfer
- ✅ Error toast on failures
- ✅ Proper message content

### 8. Form Reset
- ✅ Form reset after successful submission
- ✅ Contract document clearing
- ✅ Field value reset

### 9. Loading States
- ✅ Loading state during submission
- ✅ Form disabled during submission
- ✅ Button state changes

## Running Tests

```bash
# Run all tests
npm run test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage

# Run only TransferForm tests
npm run test src/components/transfer/__tests__/TransferForm.test.ts
```

## Test Structure

```
src/components/transfer/__tests__/
├── TransferForm.test.ts    # Main test file
├── setup.ts               # Test environment setup
└── README.md             # This file
```

## Mock Strategy

### Stores
- `useTransferStore`: Mocked with `createTransfer` and `uploadContractDocument` methods
- `useLandStore`: Mocked with sample land data
- `useAuthStore`: Mocked with authenticated user

### External Dependencies
- `toast`: Mocked for notification testing
- `uploadDocumentToCloudinary`: Mocked for file upload testing
- `vee-validate`: Mocked for form validation testing

### Browser APIs
- `File`: Custom mock implementation
- `FormData`: Custom mock implementation
- `fetch`: Mocked for network requests
- `crypto`: Mocked for signature generation

## Test Data

### Sample User Lands
```typescript
const mockUserLands = [
  {
    id: '1',
    parcel_id: 12345,
    size: 1000,
    ownership_type: 'Individual',
    supporting_document_url: 'https://example.com/doc1.pdf',
    status: 'Approved',
    created_at: '2024-01-01T00:00:00Z'
  }
]
```

### Sample User
```typescript
const mockUser = {
  id: 'user-123',
  email: 'test@example.com',
  full_name: 'Test User'
}
```

## Key Testing Patterns

1. **Async Testing**: Uses `await nextTick()` for DOM updates
2. **Event Simulation**: Uses `trigger()` for user interactions
3. **Mock Verification**: Uses `toHaveBeenCalledWith()` for precise assertions
4. **Error Simulation**: Uses `mockRejectedValue()` for exception testing
5. **State Testing**: Verifies component state changes

## Notes

- Tests use realistic data matching the current schema
- All async operations are properly awaited
- Mocks are reset between tests for isolation
- Coverage includes both happy path and error scenarios
- File upload testing includes proper File API mocking
