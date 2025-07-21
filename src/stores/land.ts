import { ref } from 'vue'
import { defineStore } from 'pinia'
import { supabase, type Land } from '@/lib/supabase'
import { uploadDocumentToCloudinary } from '@/lib/cloudinary'

export const useLandStore = defineStore('land', () => {
  const lands = ref<Land[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  async function fetchUserLands(userId: string) {
    loading.value = true
    error.value = null

    try {
      const { data, error: fetchError } = await supabase
        .from('Land')
        .select('*')
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
        .from('Land')
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

  async function uploadSupportingDocument(file: File, ownerId: string) {
    try {
      const result = await uploadDocumentToCloudinary(file, ownerId, 'supporting')

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
    lands,
    loading,
    error,
    fetchUserLands,
    registerLand,
    uploadSupportingDocument,
    clearError
  }
})
