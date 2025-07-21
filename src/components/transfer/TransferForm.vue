<script setup lang="ts">
import { ref, computed } from 'vue'
import { useForm } from 'vee-validate'
import { z } from 'zod'
import { toFormValidator } from '@vee-validate/zod'
import { useTransferStore } from '@/stores/transfer'
import { useLandStore } from '@/stores/land'
import { useAuthStore } from '@/stores/counter'
import { toast } from '@/composables/useToast'

const transferStore = useTransferStore()
const landStore = useLandStore()
const authStore = useAuthStore()

const validationSchema = toFormValidator(
  z.object({
    parcel_id: z.coerce.number().positive('Please select a parcel to transfer'),
    recipient_name: z.string().min(3, 'Recipient name must be at least 3 characters')
  })
)

const { handleSubmit, errors, defineField, resetForm } = useForm({
  validationSchema
})

const [parcel_id] = defineField('parcel_id')
const [recipient_name] = defineField('recipient_name')

const contractDocument = ref<File | null>(null)
const isSubmitting = ref(false)
const documentError = ref('')


const userLands = computed(() => landStore.lands)

const handleFileChange = (event: Event) => {
  const target = event.target as HTMLInputElement
  if (target.files && target.files.length > 0) {
    const file = target.files[0]
    
    // Check file type
    const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png']
    if (!allowedTypes.includes(file.type)) {
      documentError.value = 'Only PDF, JPEG, and PNG files are allowed'
      contractDocument.value = null
      return
    }
    
    // Check file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      documentError.value = 'File size must be less than 5MB'
      contractDocument.value = null
      return
    }
    
    documentError.value = ''
    contractDocument.value = file
  }
}

const onSubmit = handleSubmit(async (values) => {
  if (!contractDocument.value) {
    documentError.value = 'Contract document is required'
    return
  }

  if (!authStore.user) {
    toast.error('Authentication error', 'You must be logged in to initiate a transfer')
    return
  }

  isSubmitting.value = true

  try {
    // Upload document first
    const { success: uploadSuccess, url, error: uploadError } = await transferStore.uploadContractDocument(
      contractDocument.value,
      authStore.user.id
    )

    if (!uploadSuccess || !url) {
      throw new Error(uploadError || 'Failed to upload document')
    }

    // Create transfer with document URL
    const { success, error } = await transferStore.createTransfer({
      parcel_id: values.parcel_id,
      recipient_name: values.recipient_name,
      contract_document_url: url,
      status: 'Pending'
    })

    if (success) {
      toast.success('Transfer initiated', 'Your transfer request has been submitted successfully')
      resetForm()
      contractDocument.value = null
    } else {
      toast.error('Transfer failed', error || 'Failed to initiate transfer')
    }
  } catch (err: any) {
    toast.error('Transfer failed', err.message || 'An unexpected error occurred')
  } finally {
    isSubmitting.value = false
  }
})
</script>

<template>
  <div class="bg-white shadow overflow-hidden sm:rounded-lg">
    <div class="px-4 py-5 sm:px-6">
      <h3 class="text-lg leading-6 font-medium text-gray-900">Initiate Land Transfer</h3>
      <p class="mt-1 max-w-2xl text-sm text-gray-500">
        Fill in the details to transfer land ownership
      </p>
    </div>
    
    <div class="border-t border-gray-200">
      <form @submit.prevent="onSubmit" class="px-4 py-5 sm:p-6">
        <div class="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
          <div class="sm:col-span-3">
            <label for="parcel_id" class="block text-sm font-medium text-gray-700 mb-1">Parcel ID</label>
            <div class="relative">
              <select
                id="parcel_id"
                v-model.number="parcel_id"
                class="px-4 py-2.5 block w-full rounded-lg border-gray-300 bg-gray-50 text-gray-900 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500 focus:ring-opacity-30 transition duration-150 ease-in-out appearance-none"
                :class="{
                  'border-red-500 bg-red-50 focus:border-red-500 focus:ring-red-500': errors.parcel_id,
                  'border-green-500 bg-green-50': parcel_id && !errors.parcel_id
                }"
                aria-describedby="parcel_id-error"
              >
                <option value="">Select a parcel to transfer</option>
                <option v-for="land in userLands" :key="land.id" :value="land.parcel_id">
                  Parcel ID: {{ land.parcel_id }} - Size: {{ land.size }} sq m
                </option>
              </select>
              <div class="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                <svg class="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                  <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
                </svg>
              </div>
              <div v-if="errors.parcel_id" class="absolute inset-y-0 right-6 flex items-center pr-3 pointer-events-none">
                <svg class="h-5 w-5 text-red-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                  <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clip-rule="evenodd" />
                </svg>
              </div>
              <div v-else-if="parcel_id" class="absolute inset-y-0 right-6 flex items-center pr-3 pointer-events-none">
                <svg class="h-5 w-5 text-green-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                  <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
                </svg>
              </div>
            </div>
            <p v-if="errors.parcel_id" id="parcel_id-error" class="mt-2 text-sm text-red-600 flex items-center">
              <svg class="h-4 w-4 mr-1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd" />
              </svg>
              {{ errors.parcel_id }}
            </p>
            <p v-else-if="userLands.length === 0" class="mt-2 text-sm text-gray-500 flex items-center">
              <svg class="h-4 w-4 mr-1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd" />
              </svg>
              No registered land available for transfer
            </p>
          </div>

          <div class="sm:col-span-3">
            <label for="recipient_name" class="block text-sm font-medium text-gray-700 mb-1">Recipient Name</label>
            <div class="relative">
              <input
                id="recipient_name"
                v-model="recipient_name"
                type="text"
                placeholder="Enter recipient's name"
                class="px-4 py-2.5 block w-full rounded-lg border-gray-300 bg-gray-50 text-gray-900 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500 focus:ring-opacity-30 transition duration-150 ease-in-out"
                :class="{
                  'border-red-500 bg-red-50 focus:border-red-500 focus:ring-red-500': errors.recipient_name,
                  'border-green-500 bg-green-50': recipient_name && !errors.recipient_name
                }"
                aria-describedby="recipient_name-error"
              />
              <div v-if="errors.recipient_name" class="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                <svg class="h-5 w-5 text-red-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                  <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clip-rule="evenodd" />
                </svg>
              </div>
              <div v-else-if="recipient_name" class="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                <svg class="h-5 w-5 text-green-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                  <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
                </svg>
              </div>
            </div>
            <p v-if="errors.recipient_name" id="recipient_name-error" class="mt-2 text-sm text-red-600 flex items-center">
              <svg class="h-4 w-4 mr-1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd" />
              </svg>
              {{ errors.recipient_name }}
            </p>
          </div>

          <div class="sm:col-span-6">
            <label for="contract_document" class="block text-sm font-medium text-gray-700 mb-1">
              Contract Document (PDF, JPEG, PNG)
            </label>
            <div
              class="mt-1 flex justify-center px-6 pt-6 pb-6 border-2 border-dashed rounded-lg transition-colors duration-200 ease-in-out"
              :class="{
                'border-red-300 bg-red-50': documentError,
                'border-green-300 bg-green-50': contractDocument && !documentError,
                'border-gray-300 bg-gray-50 hover:border-indigo-300 hover:bg-indigo-50': !documentError && !contractDocument
              }"
            >
              <div class="space-y-2 text-center">
                <div v-if="contractDocument && !documentError" class="mx-auto h-12 w-12 text-green-500">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div v-else-if="documentError" class="mx-auto h-12 w-12 text-red-500">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
                  </svg>
                </div>
                <svg
                  v-else
                  class="mx-auto h-12 w-12 text-gray-400"
                  stroke="currentColor"
                  fill="none"
                  viewBox="0 0 48 48"
                  aria-hidden="true"
                >
                  <path
                    d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                    stroke-width="2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  />
                </svg>

                <div class="flex text-sm text-gray-600">
                  <label
                    for="contract-file-upload"
                    class="relative cursor-pointer bg-white rounded-md font-medium text-indigo-600 hover:text-indigo-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-indigo-500 px-2 py-1 transition-colors duration-150"
                  >
                    <span>Upload a file</span>
                    <input
                      id="contract-file-upload"
                      name="contract-file-upload"
                      type="file"
                      class="sr-only"
                      accept=".pdf,.jpg,.jpeg,.png"
                      @change="handleFileChange"
                      aria-describedby="contract-file-upload-description"
                    />
                  </label>
                  <p class="pl-1">or drag and drop</p>
                </div>

                <p id="contract-file-upload-description" class="text-xs text-gray-500">PDF, PNG, JPG up to 5MB</p>

                <div v-if="contractDocument && !documentError" class="mt-3 p-3 bg-green-100 rounded-lg border border-green-200">
                  <div class="flex items-center justify-center space-x-2">
                    <svg class="h-5 w-5 text-green-600" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                      <path fill-rule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clip-rule="evenodd" />
                    </svg>
                    <span class="text-sm font-medium text-green-800">{{ contractDocument.name }}</span>
                    <button
                      type="button"
                      @click="contractDocument = null"
                      class="text-green-600 hover:text-green-800 transition-colors duration-150"
                    >
                      <svg class="h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                        <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            </div>
            <p v-if="documentError" class="mt-2 text-sm text-red-600 flex items-center">
              <svg class="h-4 w-4 mr-1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd" />
              </svg>
              {{ documentError }}
            </p>
          </div>
        </div>

        <div class="pt-8 border-t border-gray-200">
          <div class="flex justify-end space-x-3">
            <button
              type="button"
              class="px-6 py-2.5 border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition duration-150 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed"
              @click="() => resetForm()"
              :disabled="isSubmitting"
            >
              <svg v-if="isSubmitting" class="animate-spin -ml-1 mr-2 h-4 w-4 text-gray-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Cancel
            </button>
            <button
              type="submit"
              class="inline-flex items-center px-6 py-2.5 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition duration-150 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed"
              :disabled="isSubmitting"
            >
              <svg v-if="isSubmitting" class="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <svg v-else class="-ml-1 mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" d="M7.5 21L3 16.5m0 0L7.5 12M3 16.5h13.5m0-13.5L21 7.5m0 0L16.5 12M21 7.5H7.5" />
              </svg>
              <span v-if="isSubmitting">Submitting...</span>
              <span v-else>Initiate Transfer</span>
            </button>
          </div>
        </div>
      </form>
    </div>
  </div>
</template>
