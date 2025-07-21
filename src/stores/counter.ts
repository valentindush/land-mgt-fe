import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import { supabase, type User } from '@/lib/supabase'

export const useAuthStore = defineStore('auth', () => {
  const user = ref<User | null>(null)
  const loading = ref(false)
  const error = ref<string | null>(null)

  const isAuthenticated = computed(() => !!user.value)

  async function signUp(email: string, password: string, fullName: string) {
    loading.value = true
    error.value = null

    try {
      const { data, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName
          }
        }
      })

      if (signUpError) throw signUpError

      if (data.user) {
        user.value = {
          id: data.user.id,
          email: data.user.email!,
          full_name: fullName
        }
      }

      return { success: true }
    } catch (err: any) {
      error.value = err.message
      return { success: false, error: err.message }
    } finally {
      loading.value = false
    }
  }

  async function signIn(email: string, password: string) {
    loading.value = true
    error.value = null

    try {
      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password
      })

      if (signInError) throw signInError

      if (data.user) {
        user.value = {
          id: data.user.id,
          email: data.user.email!,
          full_name: data.user.user_metadata?.full_name
        }
      }

      return { success: true }
    } catch (err: any) {
      error.value = err.message
      return { success: false, error: err.message }
    } finally {
      loading.value = false
    }
  }

  async function signOut() {
    loading.value = true
    error.value = null

    try {
      const { error: signOutError } = await supabase.auth.signOut()
      if (signOutError) throw signOutError

      user.value = null
      return { success: true }
    } catch (err: any) {
      error.value = err.message
      return { success: false, error: err.message }
    } finally {
      loading.value = false
    }
  }

  async function getCurrentUser() {
    try {
      const { data: { user: currentUser } } = await supabase.auth.getUser()

      if (currentUser) {
        user.value = {
          id: currentUser.id,
          email: currentUser.email!,
          full_name: currentUser.user_metadata?.full_name
        }
      }
    } catch (err: any) {
      console.error('Error getting current user:', err)
    }
  }

  function clearError() {
    error.value = null
  }

  return {
    user,
    loading,
    error,
    isAuthenticated,
    signUp,
    signIn,
    signOut,
    getCurrentUser,
    clearError
  }
})
