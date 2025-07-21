import { ref } from 'vue'
import { defineStore } from 'pinia'
import { supabase, type Land } from '@/lib/supabase'

export const useLandStore = defineStore('land', () => {
  const lands = ref<Land[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  async function fetchUserLands(userId: string) {
    loading.value = true
    error.value = null
    
    try {
      const { data, error: fetchError } = await supabase
        .from('lands')
        .select('*')
        .eq('owner_id', userId)
        .order('created_at', { ascending: false })

      if (fetchError) throw fetchError

      lands.value = data as Land[]
      return { success: true, data }
    } catch (err: any) {
      error.value = err.message
      return { success: false, error: err.message }
    } finally {
      loading.value = false
    }
  }

  async function registerLand(landData: Omit<Land, 'id' | 'created_at'>) {
    loading.value = true
    error.value = null
    
    try {
      const { data, error: insertError } = await supabase
        .from('lands')
        .insert([landData])
        .select()
        .single()

      if (insertError) throw insertError

      lands.value = [data as Land, ...lands.value]
      return { success: true, data }
    } catch (err: any) {
      error.value = err.message
      return { success: false, error: err.message }
    } finally {
      loading.value = false
    }
  }

  async function uploadProofDocument(file: File, ownerId: string) {
    try {
      const fileExt = file.name.split('.').pop()
      const fileName = `${ownerId}-${Date.now()}.${fileExt}`
      const filePath = `proof-documents/${fileName}`

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
    lands,
    loading,
    error,
    fetchUserLands,
    registerLand,
    uploadProofDocument,
    clearError
  }
})
