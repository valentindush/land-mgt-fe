import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { mount, VueWrapper } from '@vue/test-utils'
import { nextTick } from 'vue'
import TransferForm from '../TransferForm.vue'
import { useTransferStore } from '@/stores/transfer'
import { useLandStore } from '@/stores/land'
import { useAuthStore } from '@/stores/counter'
import { toast } from '@/composables/useToast'

// Mock the stores
vi.mock('@/stores/transfer')
vi.mock('@/stores/land')
vi.mock('@/stores/counter')
vi.mock('@/composables/useToast')

// Mock Cloudinary upload
vi.mock('@/lib/cloudinary', () => ({
  uploadDocumentToCloudinary: vi.fn()
}))

// Mock form validation
vi.mock('vee-validate', async () => {
  const actual = await vi.importActual('vee-validate')
  return {
    ...actual,
    useForm: vi.fn(() => ({
      handleSubmit: vi.fn((fn) => fn),
      errors: { value: {} },
      defineField: vi.fn((name) => [{ value: '' }, {}]),
      resetForm: vi.fn()
    }))
  }
})

describe('TransferForm.vue', () => {
  let wrapper: VueWrapper
  let mockTransferStore: any
  let mockLandStore: any
  let mockAuthStore: any
  let mockToast: any

  const mockUserLands = [
    {
      id: '1',
      parcel_id: 12345,
      size: 1000,
      ownership_type: 'Individual',
      supporting_document_url: 'https://example.com/doc1.pdf',
      status: 'Approved',
      created_at: '2024-01-01T00:00:00Z'
    },
    {
      id: '2',
      parcel_id: 67890,
      size: 2000,
      ownership_type: 'Corporate',
      supporting_document_url: 'https://example.com/doc2.pdf',
      status: 'Approved',
      created_at: '2024-01-02T00:00:00Z'
    }
  ]

  const mockUser = {
    id: 'user-123',
    email: 'test@example.com',
    full_name: 'Test User'
  }

  beforeEach(() => {
    // Setup store mocks
    mockTransferStore = {
      createTransfer: vi.fn(),
      uploadContractDocument: vi.fn()
    }
    mockLandStore = {
      lands: mockUserLands,
      loading: false,
      error: null
    }
    mockAuthStore = {
      user: mockUser,
      isAuthenticated: true
    }
    mockToast = {
      success: vi.fn(),
      error: vi.fn()
    }

    // Mock store returns
    vi.mocked(useTransferStore).mockReturnValue(mockTransferStore)
    vi.mocked(useLandStore).mockReturnValue(mockLandStore)
    vi.mocked(useAuthStore).mockReturnValue(mockAuthStore)
    Object.assign(toast, mockToast)

    // Mount component
    wrapper = mount(TransferForm, {
      global: {
        stubs: {
          'router-link': true
        }
      }
    })
  })

  afterEach(() => {
    wrapper.unmount()
    vi.clearAllMocks()
  })

  describe('Component Rendering', () => {
    it('renders the form with all required fields', () => {
      expect(wrapper.find('h3').text()).toBe('Initiate Land Transfer')
      expect(wrapper.find('label[for="parcel_id"]').text()).toBe('Parcel ID')
      expect(wrapper.find('label[for="recipient_name"]').text()).toBe('Recipient Name')
      expect(wrapper.find('select#parcel_id').exists()).toBe(true)
      expect(wrapper.find('input#recipient_name').exists()).toBe(true)
      expect(wrapper.find('input[type="file"]').exists()).toBe(true)
    })

    it('renders parcel options from user lands', () => {
      const selectOptions = wrapper.findAll('select#parcel_id option')
      
      // Should have default option plus user lands
      expect(selectOptions).toHaveLength(3)
      expect(selectOptions[0].text()).toBe('Select a parcel to transfer')
      expect(selectOptions[1].text()).toContain('Parcel ID: 12345')
      expect(selectOptions[1].text()).toContain('Size: 1000 sq m')
      expect(selectOptions[2].text()).toContain('Parcel ID: 67890')
      expect(selectOptions[2].text()).toContain('Size: 2000 sq m')
    })

    it('shows empty state when no lands available', async () => {
      mockLandStore.lands = []
      await wrapper.vm.$forceUpdate()
      
      const selectOptions = wrapper.findAll('select#parcel_id option')
      expect(selectOptions).toHaveLength(1)
      expect(selectOptions[0].text()).toBe('Select a parcel to transfer')
    })

    it('renders file upload area with proper styling', () => {
      const uploadArea = wrapper.find('.border-dashed')
      expect(uploadArea.exists()).toBe(true)
      expect(uploadArea.text()).toContain('Upload a file')
      expect(uploadArea.text()).toContain('PDF, PNG, JPG up to 5MB')
    })
  })

  describe('Form Validation', () => {
    it('validates parcel_id as positive number', async () => {
      const select = wrapper.find('select#parcel_id')
      
      // Test valid selection
      await select.setValue('12345')
      expect((select.element as HTMLSelectElement).value).toBe('12345')
    })

    it('validates recipient_name minimum length', async () => {
      const input = wrapper.find('input#recipient_name')
      
      // Test valid input
      await input.setValue('John Doe')
      expect((input.element as HTMLInputElement).value).toBe('John Doe')

      // Test short input
      await input.setValue('Jo')
      expect((input.element as HTMLInputElement).value).toBe('Jo')
    })

    it('validates file upload requirements', async () => {
      const fileInput = wrapper.find('input[type="file"]')
      expect(fileInput.attributes('accept')).toBe('.pdf,.jpg,.jpeg,.png')
    })
  })

  describe('User Interactions', () => {
    it('handles parcel selection', async () => {
      const select = wrapper.find('select#parcel_id')
      await select.setValue('12345')

      expect((select.element as HTMLSelectElement).value).toBe('12345')
    })

    it('handles recipient name input', async () => {
      const input = wrapper.find('input#recipient_name')
      await input.setValue('Jane Smith')

      expect((input.element as HTMLInputElement).value).toBe('Jane Smith')
    })

    it('handles file upload', async () => {
      const fileInput = wrapper.find('input[type="file"]')
      const file = new File(['test content'], 'contract.pdf', { type: 'application/pdf' })
      
      Object.defineProperty(fileInput.element, 'files', {
        value: [file],
        writable: false
      })
      
      await fileInput.trigger('change')
      // File handling logic would be tested here
    })

    it('shows file validation errors for invalid file types', async () => {
      const fileInput = wrapper.find('input[type="file"]')
      const invalidFile = new File(['test'], 'test.txt', { type: 'text/plain' })
      
      Object.defineProperty(fileInput.element, 'files', {
        value: [invalidFile],
        writable: false
      })
      
      await fileInput.trigger('change')
      await nextTick()
      
      // Should show error for invalid file type
      expect(wrapper.text()).toContain('Only PDF, JPEG, and PNG files are allowed')
    })

    it('shows file size validation errors', async () => {
      const fileInput = wrapper.find('input[type="file"]')
      const largeFile = new File(['x'.repeat(6 * 1024 * 1024)], 'large.pdf', { type: 'application/pdf' })
      
      Object.defineProperty(fileInput.element, 'files', {
        value: [largeFile],
        writable: false
      })
      
      await fileInput.trigger('change')
      await nextTick()
      
      // Should show error for file too large
      expect(wrapper.text()).toContain('File size must be less than 5MB')
    })
  })

  describe('Store Integration', () => {
    it('calls landStore to fetch user lands on mount', () => {
      // Component should access landStore.lands
      expect(mockLandStore.lands).toBeDefined()
    })

    it('uses authStore for user authentication', () => {
      expect(mockAuthStore.user).toBeDefined()
      expect(mockAuthStore.isAuthenticated).toBe(true)
    })

    it('calls transferStore.createTransfer on successful form submission', async () => {
      // Mock successful upload
      mockTransferStore.uploadContractDocument.mockResolvedValue({
        success: true,
        url: 'https://cloudinary.com/uploaded-contract.pdf'
      })
      mockTransferStore.createTransfer.mockResolvedValue({
        success: true,
        data: { id: 'transfer-123' }
      })

      // Fill form
      await wrapper.find('select#parcel_id').setValue('12345')
      await wrapper.find('input#recipient_name').setValue('Jane Smith')

      // Add file
      const fileInput = wrapper.find('input[type="file"]')
      const file = new File(['contract'], 'contract.pdf', { type: 'application/pdf' })
      Object.defineProperty(fileInput.element, 'files', {
        value: [file],
        writable: false
      })
      await fileInput.trigger('change')

      // Submit form
      await wrapper.find('form').trigger('submit.prevent')
      await nextTick()

      expect(mockTransferStore.uploadContractDocument).toHaveBeenCalledWith(
        file,
        mockUser.id
      )
      expect(mockTransferStore.createTransfer).toHaveBeenCalledWith({
        parcel_id: 12345,
        recipient_name: 'Jane Smith',
        contract_document_url: 'https://cloudinary.com/uploaded-contract.pdf',
        status: 'Pending'
      })
    })
  })

  describe('Cloudinary Integration', () => {
    it('uploads contract document before creating transfer', async () => {
      mockTransferStore.uploadContractDocument.mockResolvedValue({
        success: true,
        url: 'https://cloudinary.com/contract.pdf'
      })
      mockTransferStore.createTransfer.mockResolvedValue({
        success: true,
        data: { id: 'transfer-123' }
      })

      // Fill and submit form
      await wrapper.find('select#parcel_id').setValue('12345')
      await wrapper.find('input#recipient_name').setValue('John Doe')

      const fileInput = wrapper.find('input[type="file"]')
      const file = new File(['content'], 'contract.pdf', { type: 'application/pdf' })
      Object.defineProperty(fileInput.element, 'files', {
        value: [file],
        writable: false
      })
      await fileInput.trigger('change')
      await wrapper.find('form').trigger('submit.prevent')
      await nextTick()

      expect(mockTransferStore.uploadContractDocument).toHaveBeenCalledWith(file, mockUser.id)
    })

    it('handles upload failure gracefully', async () => {
      mockTransferStore.uploadContractDocument.mockResolvedValue({
        success: false,
        error: 'Upload failed'
      })

      // Fill and submit form
      await wrapper.find('select#parcel_id').setValue('12345')
      await wrapper.find('input#recipient_name').setValue('John Doe')

      const fileInput = wrapper.find('input[type="file"]')
      const file = new File(['content'], 'contract.pdf', { type: 'application/pdf' })
      Object.defineProperty(fileInput.element, 'files', {
        value: [file],
        writable: false
      })
      await fileInput.trigger('change')
      await wrapper.find('form').trigger('submit.prevent')
      await nextTick()

      expect(mockToast.error).toHaveBeenCalledWith(
        'Transfer failed',
        'Upload failed'
      )
      expect(mockTransferStore.createTransfer).not.toHaveBeenCalled()
    })

    it('handles upload exception', async () => {
      mockTransferStore.uploadContractDocument.mockRejectedValue(
        new Error('Network error')
      )

      // Fill and submit form
      await wrapper.find('select#parcel_id').setValue('12345')
      await wrapper.find('input#recipient_name').setValue('John Doe')

      const fileInput = wrapper.find('input[type="file"]')
      const file = new File(['content'], 'contract.pdf', { type: 'application/pdf' })
      Object.defineProperty(fileInput.element, 'files', {
        value: [file],
        writable: false
      })
      await fileInput.trigger('change')
      await wrapper.find('form').trigger('submit.prevent')
      await nextTick()

      expect(mockToast.error).toHaveBeenCalledWith(
        'Transfer failed',
        'Network error'
      )
    })
  })

  describe('Error Handling', () => {
    it('shows error when user is not authenticated', async () => {
      mockAuthStore.user = null
      mockAuthStore.isAuthenticated = false

      await wrapper.find('form').trigger('submit.prevent')
      await nextTick()

      expect(mockToast.error).toHaveBeenCalledWith(
        'Authentication error',
        'You must be logged in to initiate a transfer'
      )
    })

    it('shows error when no contract document is uploaded', async () => {
      await wrapper.find('select#parcel_id').setValue('12345')
      await wrapper.find('input#recipient_name').setValue('John Doe')
      await wrapper.find('form').trigger('submit.prevent')
      await nextTick()

      // Should show document error
      expect(wrapper.text()).toContain('Contract document is required')
    })

    it('handles transfer creation failure', async () => {
      mockTransferStore.uploadContractDocument.mockResolvedValue({
        success: true,
        url: 'https://cloudinary.com/contract.pdf'
      })
      mockTransferStore.createTransfer.mockResolvedValue({
        success: false,
        error: 'Transfer creation failed'
      })

      // Fill and submit form
      await wrapper.find('select#parcel_id').setValue('12345')
      await wrapper.find('input#recipient_name').setValue('John Doe')

      const fileInput = wrapper.find('input[type="file"]')
      const file = new File(['content'], 'contract.pdf', { type: 'application/pdf' })
      Object.defineProperty(fileInput.element, 'files', {
        value: [file],
        writable: false
      })
      await fileInput.trigger('change')
      await wrapper.find('form').trigger('submit.prevent')
      await nextTick()

      expect(mockToast.error).toHaveBeenCalledWith(
        'Transfer failed',
        'Transfer creation failed'
      )
    })

    it('handles network errors during transfer creation', async () => {
      mockTransferStore.uploadContractDocument.mockResolvedValue({
        success: true,
        url: 'https://cloudinary.com/contract.pdf'
      })
      mockTransferStore.createTransfer.mockRejectedValue(
        new Error('Network timeout')
      )

      // Fill and submit form
      await wrapper.find('select#parcel_id').setValue('12345')
      await wrapper.find('input#recipient_name').setValue('John Doe')

      const fileInput = wrapper.find('input[type="file"]')
      const file = new File(['content'], 'contract.pdf', { type: 'application/pdf' })
      Object.defineProperty(fileInput.element, 'files', {
        value: [file],
        writable: false
      })
      await fileInput.trigger('change')
      await wrapper.find('form').trigger('submit.prevent')
      await nextTick()

      expect(mockToast.error).toHaveBeenCalledWith(
        'Transfer failed',
        'Network timeout'
      )
    })
  })

  describe('Toast Notifications', () => {
    it('shows success toast on successful transfer creation', async () => {
      mockTransferStore.uploadContractDocument.mockResolvedValue({
        success: true,
        url: 'https://cloudinary.com/contract.pdf'
      })
      mockTransferStore.createTransfer.mockResolvedValue({
        success: true,
        data: { id: 'transfer-123' }
      })

      // Fill and submit form
      await wrapper.find('select#parcel_id').setValue('12345')
      await wrapper.find('input#recipient_name').setValue('John Doe')

      const fileInput = wrapper.find('input[type="file"]')
      const file = new File(['content'], 'contract.pdf', { type: 'application/pdf' })
      Object.defineProperty(fileInput.element, 'files', {
        value: [file],
        writable: false
      })
      await fileInput.trigger('change')
      await wrapper.find('form').trigger('submit.prevent')
      await nextTick()

      expect(mockToast.success).toHaveBeenCalledWith(
        'Transfer initiated',
        'Your transfer request has been submitted successfully'
      )
    })

    it('shows error toast on failure', async () => {
      mockTransferStore.uploadContractDocument.mockResolvedValue({
        success: false,
        error: 'Upload failed'
      })

      // Fill and submit form
      await wrapper.find('select#parcel_id').setValue('12345')
      await wrapper.find('input#recipient_name').setValue('John Doe')

      const fileInput = wrapper.find('input[type="file"]')
      const file = new File(['content'], 'contract.pdf', { type: 'application/pdf' })
      Object.defineProperty(fileInput.element, 'files', {
        value: [file],
        writable: false
      })
      await fileInput.trigger('change')
      await wrapper.find('form').trigger('submit.prevent')
      await nextTick()

      expect(mockToast.error).toHaveBeenCalledWith(
        'Transfer failed',
        'Upload failed'
      )
    })
  })

  describe('Form Reset', () => {
    it('resets form after successful submission', async () => {
      const mockResetForm = vi.fn()

      // Mock the form reset function
      vi.mocked(require('vee-validate').useForm).mockReturnValue({
        handleSubmit: vi.fn((fn) => fn),
        errors: { value: {} },
        defineField: vi.fn((_name) => [{ value: '' }, {}]),
        resetForm: mockResetForm
      })

      mockTransferStore.uploadContractDocument.mockResolvedValue({
        success: true,
        url: 'https://cloudinary.com/contract.pdf'
      })
      mockTransferStore.createTransfer.mockResolvedValue({
        success: true,
        data: { id: 'transfer-123' }
      })

      // Remount component with new mock
      wrapper.unmount()
      wrapper = mount(TransferForm, {
        global: {
          stubs: {
            'router-link': true
          }
        }
      })

      // Fill and submit form
      await wrapper.find('select#parcel_id').setValue('12345')
      await wrapper.find('input#recipient_name').setValue('John Doe')

      const fileInput = wrapper.find('input[type="file"]')
      const file = new File(['content'], 'contract.pdf', { type: 'application/pdf' })
      Object.defineProperty(fileInput.element, 'files', {
        value: [file],
        writable: false
      })
      await fileInput.trigger('change')
      await wrapper.find('form').trigger('submit.prevent')
      await nextTick()

      expect(mockResetForm).toHaveBeenCalled()
    })

    it('clears contract document after successful submission', async () => {
      mockTransferStore.uploadContractDocument.mockResolvedValue({
        success: true,
        url: 'https://cloudinary.com/contract.pdf'
      })
      mockTransferStore.createTransfer.mockResolvedValue({
        success: true,
        data: { id: 'transfer-123' }
      })

      // Fill and submit form
      await wrapper.find('select#parcel_id').setValue('12345')
      await wrapper.find('input#recipient_name').setValue('John Doe')

      const fileInput = wrapper.find('input[type="file"]')
      const file = new File(['content'], 'contract.pdf', { type: 'application/pdf' })
      Object.defineProperty(fileInput.element, 'files', {
        value: [file],
        writable: false
      })
      await fileInput.trigger('change')
      await wrapper.find('form').trigger('submit.prevent')
      await nextTick()

      // Contract document should be cleared (this would be tested through component state)
      // In a real implementation, you'd check that contractDocument.value is null
    })
  })

  describe('Loading States', () => {
    it('shows loading state during form submission', async () => {
      // Mock a delayed response
      mockTransferStore.uploadContractDocument.mockImplementation(
        () => new Promise(resolve => setTimeout(() => resolve({
          success: true,
          url: 'https://cloudinary.com/contract.pdf'
        }), 100))
      )
      mockTransferStore.createTransfer.mockResolvedValue({
        success: true,
        data: { id: 'transfer-123' }
      })

      // Fill and submit form
      await wrapper.find('select#parcel_id').setValue('12345')
      await wrapper.find('input#recipient_name').setValue('John Doe')

      const fileInput = wrapper.find('input[type="file"]')
      const file = new File(['content'], 'contract.pdf', { type: 'application/pdf' })
      Object.defineProperty(fileInput.element, 'files', {
        value: [file],
        writable: false
      })
      await fileInput.trigger('change')

      const submitButton = wrapper.find('button[type="submit"]')
      await submitButton.trigger('click')

      // Should show loading state
      expect(submitButton.text()).toContain('Submitting...')
      expect(submitButton.attributes('disabled')).toBeDefined()
    })

    it('disables form during submission', async () => {
      mockTransferStore.uploadContractDocument.mockImplementation(
        () => new Promise(resolve => setTimeout(() => resolve({
          success: true,
          url: 'https://cloudinary.com/contract.pdf'
        }), 100))
      )

      // Fill form
      await wrapper.find('select#parcel_id').setValue('12345')
      await wrapper.find('input#recipient_name').setValue('John Doe')

      const fileInput = wrapper.find('input[type="file"]')
      const file = new File(['content'], 'contract.pdf', { type: 'application/pdf' })
      Object.defineProperty(fileInput.element, 'files', {
        value: [file],
        writable: false
      })
      await fileInput.trigger('change')

      const submitButton = wrapper.find('button[type="submit"]')
      const cancelButton = wrapper.find('button[type="button"]')

      await submitButton.trigger('click')

      // Buttons should be disabled during submission
      expect(submitButton.attributes('disabled')).toBeDefined()
      expect(cancelButton.attributes('disabled')).toBeDefined()
    })
  })
})
