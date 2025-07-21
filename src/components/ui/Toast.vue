<script setup lang="ts">
import { computed } from 'vue'
import { toast, type Toast } from '@/composables/useToast'
import { XMarkIcon, CheckCircleIcon, ExclamationCircleIcon, InformationCircleIcon } from '@heroicons/vue/24/outline'

const props = defineProps<{
  toast: Toast
}>()

const iconComponent = computed(() => {
  switch (props.toast.type) {
    case 'success':
      return CheckCircleIcon
    case 'error':
      return ExclamationCircleIcon
    case 'warning':
      return ExclamationCircleIcon
    case 'info':
      return InformationCircleIcon
    default:
      return InformationCircleIcon
  }
})

const bgColor = computed(() => {
  switch (props.toast.type) {
    case 'success':
      return 'bg-green-50'
    case 'error':
      return 'bg-red-50'
    case 'warning':
      return 'bg-yellow-50'
    case 'info':
      return 'bg-blue-50'
    default:
      return 'bg-gray-50'
  }
})

const iconColor = computed(() => {
  switch (props.toast.type) {
    case 'success':
      return 'text-green-500'
    case 'error':
      return 'text-red-500'
    case 'warning':
      return 'text-yellow-500'
    case 'info':
      return 'text-blue-500'
    default:
      return 'text-gray-500'
  }
})

const borderColor = computed(() => {
  switch (props.toast.type) {
    case 'success':
      return 'border-green-400'
    case 'error':
      return 'border-red-400'
    case 'warning':
      return 'border-yellow-400'
    case 'info':
      return 'border-blue-400'
    default:
      return 'border-gray-400'
  }
})

const handleClose = () => {
  toast.removeToast(props.toast.id)
}
</script>

<template>
  <div
    class="max-w-sm w-full shadow-lg rounded-lg pointer-events-auto overflow-hidden border-l-4 transition-all duration-300 ease-in-out"
    :class="[bgColor, borderColor]"
  >
    <div class="p-4">
      <div class="flex items-start">
        <div class="flex-shrink-0">
          <component :is="iconComponent" class="h-6 w-6" :class="iconColor" />
        </div>
        <div class="ml-3 w-0 flex-1 pt-0.5">
          <p class="text-sm font-medium text-gray-900">{{ toast.title }}</p>
          <p v-if="toast.message" class="mt-1 text-sm text-gray-500">{{ toast.message }}</p>
        </div>
        <div class="ml-4 flex-shrink-0 flex">
          <button
            class="bg-transparent rounded-md inline-flex text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            @click="handleClose"
          >
            <span class="sr-only">Close</span>
            <XMarkIcon class="h-5 w-5" />
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
