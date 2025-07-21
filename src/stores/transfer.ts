import { ref } from 'vue'
import { defineStore } from 'pinia'
import { supabase, type Transfer } from '@/lib/supabase'
import { uploadDocumentToCloudinary } from '@/lib/cloudinary'

export const useTransferStore = defineStore('transfer', () => {
  const transfers = ref<Transfer[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  async function fetchUserTransfers(userId: string) {
    loading.value = true
    error.value = null

    try {
      const { data, error: fetchError } = await supabase
        .from('transfers')
        .select('*')
        .order('created_at', { ascending: false })

      if (fetchError) throw fetchError

      transfers.value = data as Transfer[]
      return { success: true, data }
    } catch (err: any) {
      error.value = err.message
      return { success: false, error: err.message }
    } finally {
      loading.value = false
    }
  }

  async function createTransfer(transferData: Omit<Transfer, 'id' | 'created_at'>) {
    loading.value = true
    error.value = null
    
    try {
      const { data, error: insertError } = await supabase
        .from('transfers')
        .insert([transferData])
        .select()
        .single()

      if (insertError) throw insertError

      transfers.value = [data as Transfer, ...transfers.value]
      return { success: true, data }
    } catch (err: any) {
      error.value = err.message
      return { success: false, error: err.message }
    } finally {
      loading.value = false
    }
  }

  async function updateTransfer(id: string, updates: Partial<Transfer>) {
    loading.value = true
    error.value = null
    
    try {
      const { data, error: updateError } = await supabase
        .from('transfers')
        .update(updates)
        .eq('id', id)
        .select()
        .single()

      if (updateError) throw updateError

      const index = transfers.value.findIndex(t => t.id === id)
      if (index !== -1) {
        transfers.value[index] = data as Transfer
      }

      return { success: true, data }
    } catch (err: any) {
      error.value = err.message
      return { success: false, error: err.message }
    } finally {
      loading.value = false
    }
  }

  async function deleteTransfer(id: string) {
    loading.value = true
    error.value = null
    
    try {
      const { error: deleteError } = await supabase
        .from('transfers')
        .delete()
        .eq('id', id)

      if (deleteError) throw deleteError

      transfers.value = transfers.value.filter(t => t.id !== id)
      return { success: true }
    } catch (err: any) {
      error.value = err.message
      return { success: false, error: err.message }
    } finally {
      loading.value = false
    }
  }

  async function uploadContractDocument(file: File, userId: string) {
    try {
      const result = await uploadDocumentToCloudinary(file, userId, 'contract')

      if (!result.success) {
        throw new Error(result.error || 'Upload failed')
      }

      return { success: true, url: result.url }
    } catch (err: any) {
      error.value = err.message
      return { success: false, error: err.message }
    }
  }

  function clearError() {
    error.value = null
  }

  return {
    transfers,
    loading,
    error,
    fetchUserTransfers,
    createTransfer,
    updateTransfer,
    deleteTransfer,
    uploadContractDocument,
    clearError
  }
})
