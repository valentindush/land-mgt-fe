<script setup lang="ts">
import { onMounted } from 'vue'
import AppLayout from '@/components/layout/AppLayout.vue'
import TransferForm from '@/components/transfer/TransferForm.vue'
import TransferList from '@/components/transfer/TransferList.vue'
import ToastContainer from '@/components/ui/ToastContainer.vue'
import { useLandStore } from '@/stores/land'
import { useAuthStore } from '@/stores/counter'

const landStore = useLandStore()
const authStore = useAuthStore()

onMounted(async () => {
  if (authStore.user) {
    await landStore.fetchUserLands(authStore.user.id)
  }
})
</script>

<template>
  <AppLayout>
    <div class="px-4 py-6 sm:px-0">
      <div class="mb-8">
        <h1 class="text-2xl font-semibold text-gray-900">Land Transfers</h1>
        <p class="mt-1 text-sm text-gray-600">
          Initiate new land transfers and manage your existing transfers
        </p>
      </div>
      
      <div class="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div>
          <TransferForm />
        </div>
        <div>
          <TransferList />
        </div>
      </div>
    </div>
    
    <ToastContainer />
  </AppLayout>
</template>
