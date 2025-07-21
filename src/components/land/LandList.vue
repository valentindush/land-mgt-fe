<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { useLandStore } from '@/stores/land'
import { useAuthStore } from '@/stores/counter'
import { CheckCircleIcon, ClockIcon, ExclamationCircleIcon } from '@heroicons/vue/24/outline'

const landStore = useLandStore()
const authStore = useAuthStore()

const lands = computed(() => landStore.lands)
const loading = computed(() => landStore.loading)

onMounted(async () => {
  if (authStore.user) {
    await landStore.fetchUserLands(authStore.user.id)
  }
})

const getStatusIcon = (status: string) => {
  switch (status.toLowerCase()) {
    case 'approved':
      return CheckCircleIcon
    case 'under review':
      return ClockIcon
    case 'pending':
      return ClockIcon
    default:
      return ExclamationCircleIcon
  }
}

const getStatusColor = (status: string) => {
  switch (status.toLowerCase()) {
    case 'approved':
      return 'text-green-500'
    case 'under review':
      return 'text-yellow-500'
    case 'pending':
      return 'text-blue-500'
    default:
      return 'text-gray-500'
  }
}

const getStatusBadgeColor = (status: string) => {
  switch (status.toLowerCase()) {
    case 'approved':
      return 'bg-green-100 text-green-800'
    case 'under review':
      return 'bg-yellow-100 text-yellow-800'
    case 'pending':
      return 'bg-blue-100 text-blue-800'
    default:
      return 'bg-gray-100 text-gray-800'
  }
}

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString()
}
</script>

<template>
  <div class="bg-white shadow overflow-hidden sm:rounded-md">
    <div class="px-4 py-5 sm:px-6">
      <h3 class="text-lg leading-6 font-medium text-gray-900">My Land Applications</h3>
      <p class="mt-1 max-w-2xl text-sm text-gray-500">
        Track the status of your land registration applications
      </p>
    </div>
    
    <div v-if="loading" class="px-4 py-5 sm:px-6">
      <div class="flex justify-center">
        <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    </div>
    
    <div v-else-if="lands.length === 0" class="px-4 py-5 sm:px-6">
      <div class="text-center">
        <svg
          class="mx-auto h-12 w-12 text-gray-400"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          aria-hidden="true"
        >
          <path
            vector-effect="non-scaling-stroke"
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M9 13h6m-3-3v6m-9 1V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z"
          />
        </svg>
        <h3 class="mt-2 text-sm font-medium text-gray-900">No land applications</h3>
        <p class="mt-1 text-sm text-gray-500">Get started by registering your first piece of land.</p>
      </div>
    </div>
    
    <ul v-else role="list" class="divide-y divide-gray-200">
      <li v-for="land in lands" :key="land.id">
        <div class="px-4 py-4 sm:px-6">
          <div class="flex items-center justify-between">
            <div class="flex items-center">
              <div class="flex-shrink-0">
                <component
                  :is="getStatusIcon(land.statusa)"
                  class="h-6 w-6"
                  :class="getStatusColor(land.statusa)"
                />
              </div>
              <div class="ml-4">
                <div class="flex items-center">
                  <p class="text-sm font-medium text-indigo-600 truncate">
                    Parcel ID: {{ land.parcel_id }}
                  </p>
                  <span
                    class="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
                    :class="getStatusBadgeColor(land.statusa)"
                  >
                    {{ land.statusa }}
                  </span>
                </div>
                <div class="mt-2 flex">
                  <div class="flex items-center text-sm text-gray-500">
                    <p>{{ land.ownership_type }} ownership</p>
                  </div>
                </div>
              </div>
            </div>
            <div class="flex flex-col items-end">
              <p class="text-sm text-gray-900">{{ land.size }} sq meters</p>
              <p v-if="land.created_at" class="text-xs text-gray-400 mt-1">
                Applied: {{ formatDate(land.created_at) }}
              </p>
            </div>
          </div>

          <div v-if="land.supporting_documents" class="mt-2">
            <a
              :href="land.supporting_documents"
              target="_blank"
              class="text-sm text-indigo-600 hover:text-indigo-500"
            >
              View supporting documents →
            </a>
          </div>
        </div>
      </li>
    </ul>
  </div>
</template>
