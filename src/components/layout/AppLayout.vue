<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/counter'
import { toast } from '@/composables/useToast'
import { Bars3Icon, UserIcon } from '@heroicons/vue/24/outline'

const router = useRouter()
const authStore = useAuthStore()

const isAuthenticated = computed(() => authStore.isAuthenticated)
const user = computed(() => authStore.user)

onMounted(async () => {
  await authStore.getCurrentUser()
})

const handleLogout = async () => {
  const { success } = await authStore.signOut()
  if (success) {
    toast.success('Logged out', 'You have been successfully logged out')
    router.push('/login')
  }
}

const navigation = [
  { name: 'My Land', href: '/my-land', current: false },
  { name: 'Transfers', href: '/transfers', current: false }
]
</script>

<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Navigation -->
    <nav class="bg-white shadow-sm border-b border-gray-200">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between h-16">
          <div class="flex">
            <div class="flex-shrink-0 flex items-center">
              <h1 class="text-xl font-bold text-gray-900">Land Management</h1>
            </div>
            <div v-if="isAuthenticated" class="hidden sm:ml-6 sm:flex sm:space-x-8">
              <router-link
                v-for="item in navigation"
                :key="item.name"
                :to="item.href"
                class="border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm"
                active-class="border-indigo-500 text-gray-900"
              >
                {{ item.name }}
              </router-link>
            </div>
          </div>
          
          <div v-if="isAuthenticated" class="flex items-center">
            <div class="flex-shrink-0">
              <div class="flex items-center space-x-4">
                <div class="flex items-center space-x-2">
                  <UserIcon class="h-5 w-5 text-gray-400" />
                  <span class="text-sm text-gray-700">{{ user?.full_name || user?.email }}</span>
                </div>
                <button
                  @click="handleLogout"
                  class="bg-white py-2 px-3 border border-gray-300 rounded-md shadow-sm text-sm leading-4 font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  Logout
                </button>
              </div>
            </div>
          </div>
          
          <div v-else class="flex items-center space-x-4">
            <router-link
              to="/login"
              class="text-gray-500 hover:text-gray-700 px-3 py-2 rounded-md text-sm font-medium"
            >
              Login
            </router-link>
            <router-link
              to="/register"
              class="bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-2 rounded-md text-sm font-medium"
            >
              Register
            </router-link>
          </div>
        </div>
      </div>
    </nav>

    <!-- Main content -->
    <main class="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
      <slot />
    </main>
  </div>
</template>
