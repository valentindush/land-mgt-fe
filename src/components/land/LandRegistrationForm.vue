<script setup lang="ts">
import { ref } from 'vue'
import { useForm } from 'vee-validate'
import { z } from 'zod'
import { toFormValidator } from '@vee-validate/zod'
import { useLandStore } from '@/stores/land'
import { useAuthStore } from '@/stores/counter'
import { toast } from '@/composables/useToast'

const landStore = useLandStore()
const authStore = useAuthStore()

const validationSchema = toFormValidator(
  z.object({
    parcel_id: z.string().min(3, 'Parcel ID must be at least 3 characters'),
    address: z.string().min(5, 'Address must be at least 5 characters'),
    land_size: z.number().positive('Land size must be a positive number'),
    ownership_type: z.string().min(1, 'Ownership type is required')
  })
)

const { handleSubmit, errors, defineField, resetForm } = useForm({
  validationSchema
})

const [parcel_id] = defineField('parcel_id')
const [address] = defineField('address')
const [land_size, land_sizeProps] = defineField('land_size', {
  initialValue: 0,
  validateOnValueUpdate: false
})
const [ownership_type] = defineField('ownership_type')

const proofDocument = ref<File | null>(null)
const isSubmitting = ref(false)
const documentError = ref('')

const handleFileChange = (event: Event) => {
  const target = event.target as HTMLInputElement
  if (target.files && target.files.length > 0) {
    const file = target.files[0]
    
    // Check file type
    const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png']
    if (!allowedTypes.includes(file.type)) {
      documentError.value = 'Only PDF, JPEG, and PNG files are allowed'
      proofDocument.value = null
      return
    }
    
    // Check file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      documentError.value = 'File size must be less than 5MB'
      proofDocument.value = null
      return
    }
    
    documentError.value = ''
    proofDocument.value = file
  }
}

const onSubmit = handleSubmit(async (values) => {
  if (!proofDocument.value) {
    documentError.value = 'Proof of ownership document is required'
    return
  }
  
  if (!authStore.user) {
    toast.error('Authentication error', 'You must be logged in to register land')
    return
  }
  
  isSubmitting.value = true
  
  try {
    // Upload document first
    const { success: uploadSuccess, url, error: uploadError } = await landStore.uploadProofDocument(
      proofDocument.value,
      authStore.user.id
    )
    
    if (!uploadSuccess || !url) {
      throw new Error(uploadError || 'Failed to upload document')
    }
    
    // Register land with document URL
    const { success, error } = await landStore.registerLand({
      parcel_id: values.parcel_id,
      address: values.address,
      land_size: values.land_size,
      ownership_type: values.ownership_type,
      proof_document: url,
      status: 'Pending',
      owner_id: authStore.user.id
    })
    
    if (success) {
      toast.success('Land registration submitted', 'Your application has been submitted successfully')
      resetForm()
      proofDocument.value = null
    } else {
      toast.error('Registration failed', error || 'Failed to register land')
    }
  } catch (err: any) {
    toast.error('Registration failed', err.message || 'An unexpected error occurred')
  } finally {
    isSubmitting.value = false
  }
})
</script>

<template>
  <div class="bg-white shadow overflow-hidden sm:rounded-lg">
    <div class="px-4 py-5 sm:px-6">
      <h3 class="text-lg leading-6 font-medium text-gray-900">Register New Land</h3>
      <p class="mt-1 max-w-2xl text-sm text-gray-500">
        Fill in the details to register your land
      </p>
    </div>
    
    <div class="border-t border-gray-200">
      <form @submit.prevent="onSubmit" class="px-4 py-5 sm:p-6">
        <div class="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
          <div class="sm:col-span-3">
            <label for="parcel_id" class="block text-sm font-medium text-gray-700 mb-1">Parcel ID</label>
            <div class="relative">
              <input
                id="parcel_id"
                v-model="parcel_id"
                type="text"
                placeholder="Enter parcel ID"
                class="px-4 py-2.5 block w-full rounded-lg border-gray-300 bg-gray-50 text-gray-900 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500 focus:ring-opacity-30 transition duration-150 ease-in-out"
                :class="{
                  'border-red-500 bg-red-50 focus:border-red-500 focus:ring-red-500': errors.parcel_id,
                  'border-green-500 bg-green-50': parcel_id && !errors.parcel_id
                }"
                aria-describedby="parcel_id-error"
              />
              <div v-if="errors.parcel_id" class="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                <svg class="h-5 w-5 text-red-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                  <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clip-rule="evenodd" />
                </svg>
              </div>
              <div v-else-if="parcel_id" class="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
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
          </div>

          <div class="sm:col-span-3">
            <label for="land_size" class="block text-sm font-medium text-gray-700 mb-1">Land Size (sq meters)</label>
            <div class="relative">
              <input
                id="land_size"
                v-model="land_size"
                type="number"
                min="0"
                step="0.01"
                placeholder="Enter land size"
                class="px-4 py-2.5 block w-full rounded-lg border-gray-300 bg-gray-50 text-gray-900 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500 focus:ring-opacity-30 transition duration-150 ease-in-out"
                :class="{
                  'border-red-500 bg-red-50 focus:border-red-500 focus:ring-red-500': errors.land_size,
                  'border-green-500 bg-green-50': land_size > 0 && !errors.land_size
                }"
                aria-describedby="land_size-error"
              />
              <div v-if="errors.land_size" class="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                <svg class="h-5 w-5 text-red-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                  <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clip-rule="evenodd" />
                </svg>
              </div>
              <div v-else-if="land_size > 0" class="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                <svg class="h-5 w-5 text-green-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                  <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
                </svg>
              </div>
            </div>
            <p v-if="errors.land_size" id="land_size-error" class="mt-2 text-sm text-red-600 flex items-center">
              <svg class="h-4 w-4 mr-1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd" />
              </svg>
              {{ errors.land_size }}
            </p>
          </div>

          <div class="sm:col-span-6">
            <label for="address" class="block text-sm font-medium text-gray-700 mb-1">Address</label>
            <div class="relative">
              <input
                id="address"
                v-model="address"
                type="text"
                placeholder="Enter full property address"
                class="px-4 py-2.5 block w-full rounded-lg border-gray-300 bg-gray-50 text-gray-900 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500 focus:ring-opacity-30 transition duration-150 ease-in-out"
                :class="{
                  'border-red-500 bg-red-50 focus:border-red-500 focus:ring-red-500': errors.address,
                  'border-green-500 bg-green-50': address && !errors.address
                }"
                aria-describedby="address-error"
              />
              <div v-if="errors.address" class="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                <svg class="h-5 w-5 text-red-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                  <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clip-rule="evenodd" />
                </svg>
              </div>
              <div v-else-if="address" class="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                <svg class="h-5 w-5 text-green-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                  <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
                </svg>
              </div>
            </div>
            <p v-if="errors.address" id="address-error" class="mt-2 text-sm text-red-600 flex items-center">
              <svg class="h-4 w-4 mr-1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd" />
              </svg>
              {{ errors.address }}
            </p>
          </div>

          <div class="sm:col-span-3">
            <label for="ownership_type" class="block text-sm font-medium text-gray-700 mb-1">Ownership Type</label>
            <div class="relative">
              <select
                id="ownership_type"
                v-model="ownership_type"
                class="px-4 py-2.5 block w-full rounded-lg border-gray-300 bg-gray-50 text-gray-900 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500 focus:ring-opacity-30 transition duration-150 ease-in-out appearance-none"
                :class="{
                  'border-red-500 bg-red-50 focus:border-red-500 focus:ring-red-500': errors.ownership_type,
                  'border-green-500 bg-green-50': ownership_type && !errors.ownership_type
                }"
                aria-describedby="ownership_type-error"
              >
                <option value="">Select ownership type</option>
                <option value="Individual">Individual</option>
                <option value="Joint">Joint</option>
                <option value="Corporate">Corporate</option>
                <option value="Trust">Trust</option>
              </select>
              <div class="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                <svg class="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                  <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
                </svg>
              </div>
              <div v-if="errors.ownership_type" class="absolute inset-y-0 right-6 flex items-center pr-3 pointer-events-none">
                <svg class="h-5 w-5 text-red-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                  <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clip-rule="evenodd" />
                </svg>
              </div>
              <div v-else-if="ownership_type" class="absolute inset-y-0 right-6 flex items-center pr-3 pointer-events-none">
                <svg class="h-5 w-5 text-green-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                  <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
                </svg>
              </div>
            </div>
            <p v-if="errors.ownership_type" id="ownership_type-error" class="mt-2 text-sm text-red-600 flex items-center">
              <svg class="h-4 w-4 mr-1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd" />
              </svg>
              {{ errors.ownership_type }}
            </p>
          </div>

          <div class="sm:col-span-6">
            <label for="proof_document" class="block text-sm font-medium text-gray-700 mb-1">
              Proof of Ownership (PDF, JPEG, PNG)
            </label>
            <div
              class="mt-1 flex justify-center px-6 pt-6 pb-6 border-2 border-dashed rounded-lg transition-colors duration-200 ease-in-out"
              :class="{
                'border-red-300 bg-red-50': documentError,
                'border-green-300 bg-green-50': proofDocument && !documentError,
                'border-gray-300 bg-gray-50 hover:border-indigo-300 hover:bg-indigo-50': !documentError && !proofDocument
              }"
            >
              <div class="space-y-2 text-center">
                <div v-if="proofDocument && !documentError" class="mx-auto h-12 w-12 text-green-500">
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
                    for="file-upload"
                    class="relative cursor-pointer bg-white rounded-md font-medium text-indigo-600 hover:text-indigo-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-indigo-500 px-2 py-1 transition-colors duration-150"
                  >
                    <span>Upload a file</span>
                    <input
                      id="file-upload"
                      name="file-upload"
                      type="file"
                      class="sr-only"
                      accept=".pdf,.jpg,.jpeg,.png"
                      @change="handleFileChange"
                      aria-describedby="file-upload-description"
                    />
                  </label>
                  <p class="pl-1">or drag and drop</p>
                </div>

                <p id="file-upload-description" class="text-xs text-gray-500">PDF, PNG, JPG up to 5MB</p>

                <div v-if="proofDocument && !documentError" class="mt-3 p-3 bg-green-100 rounded-lg border border-green-200">
                  <div class="flex items-center justify-center space-x-2">
                    <svg class="h-5 w-5 text-green-600" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                      <path fill-rule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clip-rule="evenodd" />
                    </svg>
                    <span class="text-sm font-medium text-green-800">{{ proofDocument.name }}</span>
                    <button
                      type="button"
                      @click="proofDocument = null"
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
              @click="resetForm"
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
                <path stroke-linecap="round" stroke-linejoin="round" d="M12 16.5V9.75m0 0l3 3m-3-3l-3 3M6.75 19.5a4.5 4.5 0 01-1.41-8.775 5.25 5.25 0 0110.233-2.33 3 3 0 013.758 3.848A3.752 3.752 0 0118 19.5H6.75z" />
              </svg>
              <span v-if="isSubmitting">Submitting...</span>
              <span v-else>Submit Application</span>
            </button>
          </div>
        </div>
      </form>
    </div>
  </div>
</template>
