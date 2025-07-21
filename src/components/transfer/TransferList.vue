<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useTransferStore } from '@/stores/transfer'
import { useAuthStore } from '@/stores/counter'
import { toast } from '@/composables/useToast'
import { CheckCircleIcon, ClockIcon, XCircleIcon, PencilIcon, TrashIcon } from '@heroicons/vue/24/outline'

const transferStore = useTransferStore()
const authStore = useAuthStore()

const transfers = computed(() => transferStore.transfers)
const loading = computed(() => transferStore.loading)

const editingTransfer = ref<string | null>(null)
const editRecipientId = ref('')
const showDeleteModal = ref(false)
const transferToDelete = ref<string | null>(null)

onMounted(async () => {
  if (authStore.user) {
    await transferStore.fetchUserTransfers(authStore.user.id)
  }
})

const getStatusIcon = (status: string) => {
  switch (status) {
    case 'Approved':
      return CheckCircleIcon
    case 'Rejected':
      return XCircleIcon
    case 'Pending':
      return ClockIcon
    default:
      return ClockIcon
  }
}

const getStatusColor = (status: string) => {
  switch (status) {
    case 'Approved':
      return 'text-green-500'
    case 'Rejected':
      return 'text-red-500'
    case 'Pending':
      return 'text-yellow-500'
    default:
      return 'text-gray-500'
  }
}

const getStatusBadgeColor = (status: string) => {
  switch (status) {
    case 'Approved':
      return 'bg-green-100 text-green-800'
    case 'Rejected':
      return 'bg-red-100 text-red-800'
    case 'Pending':
      return 'bg-yellow-100 text-yellow-800'
    default:
      return 'bg-gray-100 text-gray-800'
  }
}

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString()
}

const canEdit = (transfer: any) => {
  return transfer.sender_id === authStore.user?.id && transfer.status === 'Pending'
}

const canDelete = (transfer: any) => {
  return transfer.sender_id === authStore.user?.id && transfer.status === 'Pending'
}

const startEdit = (transfer: any) => {
  editingTransfer.value = transfer.id
  editRecipientId.value = transfer.recipient_id
}

const cancelEdit = () => {
  editingTransfer.value = null
  editRecipientId.value = ''
}

const saveEdit = async (transferId: string) => {
  if (!editRecipientId.value.trim()) {
    toast.error('Validation error', 'Recipient ID cannot be empty')
    return
  }

  const { success, error } = await transferStore.updateTransfer(transferId, {
    recipient_id: editRecipientId.value.trim()
  })

  if (success) {
    toast.success('Transfer updated', 'The transfer has been updated successfully')
    editingTransfer.value = null
    editRecipientId.value = ''
  } else {
    toast.error('Update failed', error || 'Failed to update transfer')
  }
}

const confirmDelete = (transferId: string) => {
  transferToDelete.value = transferId
  showDeleteModal.value = true
}

const cancelDelete = () => {
  transferToDelete.value = null
  showDeleteModal.value = false
}

const deleteTransfer = async () => {
  if (!transferToDelete.value) return

  const { success, error } = await transferStore.deleteTransfer(transferToDelete.value)

  if (success) {
    toast.success('Transfer deleted', 'The transfer has been deleted successfully')
  } else {
    toast.error('Delete failed', error || 'Failed to delete transfer')
  }

  transferToDelete.value = null
  showDeleteModal.value = false
}

const getTransferDirection = (transfer: any) => {
  if (transfer.sender_id === authStore.user?.id) {
    return 'Outgoing'
  } else {
    return 'Incoming'
  }
}
</script>

<template>
  <div class="bg-white shadow overflow-hidden sm:rounded-md">
    <div class="px-4 py-5 sm:px-6">
      <h3 class="text-lg leading-6 font-medium text-gray-900">Land Transfers</h3>
      <p class="mt-1 max-w-2xl text-sm text-gray-500">
        View and manage your land transfer requests
      </p>
    </div>
    
    <div v-if="loading" class="px-4 py-5 sm:px-6">
      <div class="flex justify-center">
        <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    </div>
    
    <div v-else-if="transfers.length === 0" class="px-4 py-5 sm:px-6">
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
            d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"
          />
        </svg>
        <h3 class="mt-2 text-sm font-medium text-gray-900">No transfers</h3>
        <p class="mt-1 text-sm text-gray-500">Get started by initiating your first land transfer.</p>
      </div>
    </div>
    
    <ul v-else role="list" class="divide-y divide-gray-200">
      <li v-for="transfer in transfers" :key="transfer.id">
        <div class="px-4 py-4 sm:px-6">
          <div class="flex items-center justify-between">
            <div class="flex items-center">
              <div class="flex-shrink-0">
                <component
                  :is="getStatusIcon(transfer.status)"
                  class="h-6 w-6"
                  :class="getStatusColor(transfer.status)"
                />
              </div>
              <div class="ml-4">
                <div class="flex items-center">
                  <p class="text-sm font-medium text-indigo-600 truncate">
                    Parcel ID: {{ transfer.parcel_id }}
                  </p>
                  <span
                    class="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
                    :class="getStatusBadgeColor(transfer.status)"
                  >
                    {{ transfer.status }}
                  </span>
                  <span
                    class="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800"
                  >
                    {{ getTransferDirection(transfer) }}
                  </span>
                </div>
                <div class="mt-2 flex items-center text-sm text-gray-500">
                  <div v-if="editingTransfer === transfer.id" class="flex items-center space-x-2">
                    <span>To:</span>
                    <input
                      v-model="editRecipientId"
                      type="text"
                      class="border border-gray-300 rounded px-2 py-1 text-sm"
                      placeholder="Recipient ID"
                    />
                    <button
                      @click="saveEdit(transfer.id)"
                      class="text-green-600 hover:text-green-500"
                    >
                      Save
                    </button>
                    <button
                      @click="cancelEdit"
                      class="text-gray-600 hover:text-gray-500"
                    >
                      Cancel
                    </button>
                  </div>
                  <div v-else>
                    <p>
                      <span v-if="getTransferDirection(transfer) === 'Outgoing'">To: {{ transfer.recipient_id }}</span>
                      <span v-else>From: {{ transfer.sender_id }}</span>
                    </p>
                  </div>
                </div>
              </div>
            </div>
            <div class="flex items-center space-x-2">
              <div class="flex flex-col items-end">
                <p v-if="transfer.created_at" class="text-xs text-gray-400">
                  {{ formatDate(transfer.created_at) }}
                </p>
              </div>
              
              <div v-if="canEdit(transfer) || canDelete(transfer)" class="flex space-x-1">
                <button
                  v-if="canEdit(transfer)"
                  @click="startEdit(transfer)"
                  class="text-indigo-600 hover:text-indigo-500"
                  title="Edit transfer"
                >
                  <PencilIcon class="h-4 w-4" />
                </button>
                <button
                  v-if="canDelete(transfer)"
                  @click="confirmDelete(transfer.id)"
                  class="text-red-600 hover:text-red-500"
                  title="Delete transfer"
                >
                  <TrashIcon class="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
          
          <div v-if="transfer.contract_document" class="mt-2">
            <a
              :href="transfer.contract_document"
              target="_blank"
              class="text-sm text-indigo-600 hover:text-indigo-500"
            >
              View contract document →
            </a>
          </div>
        </div>
      </li>
    </ul>
    
    <!-- Delete Confirmation Modal -->
    <div v-if="showDeleteModal" class="fixed z-10 inset-0 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
      <div class="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div class="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" aria-hidden="true"></div>

        <span class="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

        <div class="inline-block align-bottom bg-white rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full sm:p-6">
          <div>
            <div class="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100">
              <svg class="h-6 w-6 text-red-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <div class="mt-3 text-center sm:mt-5">
              <h3 class="text-lg leading-6 font-medium text-gray-900" id="modal-title">
                Delete Transfer
              </h3>
              <div class="mt-2">
                <p class="text-sm text-gray-500">
                  Are you sure you want to delete this transfer? This action cannot be undone.
                </p>
              </div>
            </div>
          </div>
          <div class="mt-5 sm:mt-6 sm:grid sm:grid-cols-2 sm:gap-3 sm:grid-flow-row-dense">
            <button
              type="button"
              class="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:col-start-2 sm:text-sm"
              @click="deleteTransfer"
            >
              Delete
            </button>
            <button
              type="button"
              class="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:col-start-1 sm:text-sm"
              @click="cancelDelete"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
