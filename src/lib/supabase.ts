import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export type User = {
  id: string
  email: string
  full_name?: string
  created_at?: string
}

export type Land = {
  id: string
  parcel_id: number
  size: number
  ownership_type: string
  supporting_documents?: string
  statusa: string
  owner_id: string
  created_at?: string
}

export type Transfer = {
  id: string
  parcel_id: string
  recipient_name: string
  contract_document_url?: string
  status: string
  created_at?: string
}
