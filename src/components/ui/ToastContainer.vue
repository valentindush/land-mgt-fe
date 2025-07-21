<script setup lang="ts">
import { toast } from '@/composables/useToast'
import Toast from './Toast.vue'
</script>

<template>
  <div
    aria-live="assertive"
    class="fixed inset-0 flex items-end justify-center px-4 py-6 pointer-events-none sm:p-6 sm:items-start sm:justify-end z-50"
  >
    <div class="w-full flex flex-col items-center space-y-4 sm:items-end">
      <transition-group
        name="toast"
        tag="div"
        class="space-y-4"
      >
        <Toast
          v-for="toastItem in toast.toasts.value"
          :key="toastItem.id"
          :toast="toastItem"
        />
      </transition-group>
    </div>
  </div>
</template>

<style scoped>
.toast-enter-active,
.toast-leave-active {
  transition: all 0.3s ease;
}

.toast-enter-from {
  opacity: 0;
  transform: translateX(100%);
}

.toast-leave-to {
  opacity: 0;
  transform: translateX(100%);
}

.toast-move {
  transition: transform 0.3s ease;
}
</style>
