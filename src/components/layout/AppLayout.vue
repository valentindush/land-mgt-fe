<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/counter'
import { toast } from '@/composables/useToast'
import {
  Bars3Icon,
  XMarkIcon,
  UserIcon,
  MapIcon,
  ArrowsRightLeftIcon,
  ArrowRightOnRectangleIcon
} from '@heroicons/vue/24/outline'

const router = useRouter()
const authStore = useAuthStore()

// Mobile sidebar state
const sidebarOpen = ref(false)

const isAuthenticated = computed(() => authStore.isAuthenticated)
const user = computed(() => authStore.user)

onMounted(async () => {
  await authStore.getCurrentUser()

  // Close sidebar when window is resized to desktop size
  const handleResize = () => {
    if (window.innerWidth >= 1024) { // lg breakpoint
      sidebarOpen.value = false
    }
  }

  window.addEventListener('resize', handleResize)

  // Cleanup on unmount
  onUnmounted(() => {
    window.removeEventListener('resize', handleResize)
  })
})

const toggleSidebar = () => {
  sidebarOpen.value = !sidebarOpen.value
}

const closeSidebar = () => {
  sidebarOpen.value = false
}

// Get current page title based on route
const currentPageTitle = computed(() => {
  const currentRoute = router.currentRoute.value
  const navItem = navigation.find(item => item.href === currentRoute.path)
  return navItem?.name || 'Land Management'
})

const handleLogout = async () => {
  const { success } = await authStore.signOut()
  if (success) {
    toast.success('Logged out', 'You have been successfully logged out')
    router.push('/login')
  }
}

const navigation = [
  { name: 'My Land', href: '/my-land', icon: MapIcon, current: false },
  { name: 'Transfers', href: '/transfers', icon: ArrowsRightLeftIcon, current: false }
]
</script>

<template>
  <!-- Authenticated users: Responsive sidebar layout -->
  <div v-if="isAuthenticated" class="flex h-screen bg-gray-50">
    <!-- Mobile sidebar overlay -->
    <div
      v-if="sidebarOpen"
      class="fixed inset-0 z-40 lg:hidden"
      @click="closeSidebar"
    >
      <div class="fixed inset-0 bg-gray-600 bg-opacity-75 backdrop-blur-sm transition-opacity duration-300"></div>
    </div>

    <!-- Desktop sidebar -->
    <div class="hidden lg:flex lg:flex-col lg:w-64 lg:fixed lg:inset-y-0 bg-white shadow-lg">
      <!-- Logo/Brand -->
      <div class="flex items-center justify-center h-16 px-4 bg-indigo-600">
        <h1 class="text-xl font-bold text-white">Land Management</h1>
      </div>

      <!-- Navigation -->
      <nav class="flex-1 px-4 py-6 space-y-2">
        <router-link
          v-for="item in navigation"
          :key="item.name"
          :to="item.href"
          class="flex items-center px-4 py-3 text-sm font-medium text-gray-700 rounded-lg hover:bg-gray-100 hover:text-gray-900 transition-colors duration-150"
          active-class="bg-indigo-50 text-indigo-700 border-r-2 border-indigo-600"
        >
          <component :is="item.icon" class="w-5 h-5 mr-3" />
          {{ item.name }}
        </router-link>
      </nav>

      <!-- User section -->
      <div class="px-4 py-4 border-t border-gray-200">
        <div class="flex items-center space-x-3 mb-4">
          <div class="flex-shrink-0">
            <div class="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center">
              <UserIcon class="w-5 h-5 text-indigo-600" />
            </div>
          </div>
          <div class="flex-1 min-w-0">
            <p class="text-sm font-medium text-gray-900 truncate">
              {{ user?.full_name || user?.email }}
            </p>
            <p class="text-xs text-gray-500 truncate">
              {{ user?.email }}
            </p>
          </div>
        </div>

        <button
          @click="handleLogout"
          class="flex items-center w-full px-4 py-2 text-sm font-medium text-gray-700 rounded-lg hover:bg-gray-100 hover:text-gray-900 transition-colors duration-150"
        >
          <ArrowRightOnRectangleIcon class="w-5 h-5 mr-3" />
          Logout
        </button>
      </div>
    </div>

    <!-- Mobile sidebar -->
    <div
      class="lg:hidden fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out"
      :class="sidebarOpen ? 'translate-x-0' : '-translate-x-full'"
    >
      <!-- Mobile sidebar header with close button -->
      <div class="flex items-center justify-between h-16 px-4 bg-indigo-600">
        <h1 class="text-xl font-bold text-white">Land Management</h1>
        <button
          @click="closeSidebar"
          class="text-white hover:text-gray-200 focus:outline-none focus:ring-2 focus:ring-white focus:ring-opacity-50 rounded-md p-1"
        >
          <XMarkIcon class="w-6 h-6" />
        </button>
      </div>

      <!-- Mobile navigation -->
      <nav class="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
        <router-link
          v-for="item in navigation"
          :key="item.name"
          :to="item.href"
          @click="closeSidebar"
          class="flex items-center px-4 py-4 text-base font-medium text-gray-700 rounded-lg hover:bg-gray-100 hover:text-gray-900 transition-colors duration-150 touch-manipulation"
          active-class="bg-indigo-50 text-indigo-700 border-r-2 border-indigo-600"
        >
          <component :is="item.icon" class="w-6 h-6 mr-3" />
          {{ item.name }}
        </router-link>
      </nav>

      <!-- Mobile user section -->
      <div class="px-4 py-4 border-t border-gray-200">
        <div class="flex items-center space-x-3 mb-4">
          <div class="flex-shrink-0">
            <div class="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center">
              <UserIcon class="w-5 h-5 text-indigo-600" />
            </div>
          </div>
          <div class="flex-1 min-w-0">
            <p class="text-sm font-medium text-gray-900 truncate">
              {{ user?.full_name || user?.email }}
            </p>
            <p class="text-xs text-gray-500 truncate">
              {{ user?.email }}
            </p>
          </div>
        </div>

        <button
          @click="handleLogout"
          class="flex items-center w-full px-4 py-2 text-sm font-medium text-gray-700 rounded-lg hover:bg-gray-100 hover:text-gray-900 transition-colors duration-150"
        >
          <ArrowRightOnRectangleIcon class="w-5 h-5 mr-3" />
          Logout
        </button>
      </div>
    </div>

    <!-- Main content area -->
    <div class="flex-1 flex flex-col lg:ml-64">
      <!-- Mobile header with hamburger menu -->
      <div class="lg:hidden bg-white shadow-sm border-b border-gray-200">
        <div class="flex items-center justify-between h-16 px-4">
          <button
            @click="toggleSidebar"
            class="text-gray-500 hover:text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-opacity-50 rounded-md p-2"
          >
            <Bars3Icon class="w-6 h-6" />
          </button>
          <h1 class="text-lg font-semibold text-gray-900">{{ currentPageTitle }}</h1>
          <div class="w-10"></div> <!-- Spacer for centering -->
        </div>
      </div>

      <!-- Main content -->
      <main class="flex-1 overflow-x-hidden overflow-y-auto bg-gray-50 p-4 lg:p-6">
        <slot />
      </main>
    </div>
  </div>

  <!-- Unauthenticated users: Top navigation layout -->
  <div v-else class="min-h-screen bg-gray-50">
    <!-- Navigation -->
    <nav class="bg-white shadow-sm border-b border-gray-200">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between h-16">
          <div class="flex">
            <div class="flex-shrink-0 flex items-center">
              <h1 class="text-xl font-bold text-gray-900">Land Management</h1>
            </div>
          </div>

          <div class="flex items-center space-x-4">
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
