<script setup lang="ts">
import { ref } from 'vue'
import AppLayout from '@/components/layout/AppLayout.vue'
import LandRegistrationForm from '@/components/land/LandRegistrationForm.vue'
import LandList from '@/components/land/LandList.vue'
import ToastContainer from '@/components/ui/ToastContainer.vue'
</script>

<template>
  <AppLayout>
    <div class="px-4 py-6 sm:px-0">
      <div class="mb-8">
        <h1 class="text-2xl font-semibold text-gray-900">My Land</h1>
        <p class="mt-1 text-sm text-gray-600">
          Register new land and manage your existing land registrations
        </p>
      </div>
      
      <div class="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div>
          <LandRegistrationForm />
        </div>
        <div>
          <LandList />
        </div>
      </div>
    </div>
    
    <ToastContainer />
  </AppLayout>
</template>
