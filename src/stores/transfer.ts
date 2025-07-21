import { ref } from 'vue'
import { defineStore } from 'pinia'
import { supabase, type Transfer } from '@/lib/supabase'

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
        .or(`sender_id.eq.${userId},recipient_id.eq.${userId}`)
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

  async function uploadContractDocument(file: File, senderId: string) {
    try {
      const fileExt = file.name.split('.').pop()
      const fileName = `${senderId}-${Date.now()}.${fileExt}`
      const filePath = `contract-documents/${fileName}`

      const { error: uploadError } = await supabase.storage
        .from('land-documents')
        .upload(filePath, file)

      if (uploadError) throw uploadError

      const { data } = supabase.storage
        .from('land-documents')
        .getPublicUrl(filePath)

      return { success: true, url: data.publicUrl }
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
