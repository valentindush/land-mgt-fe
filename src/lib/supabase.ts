import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://rsbecnvflaozcakhjcph.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJzYmVjbnZmbGFvemNha2hqY3BoIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1Mjk5Nzg4MCwiZXhwIjoyMDY4NTczODgwfQ.0w4CUKzI1bnJxWfWjxKPIG8_rSfC-6l89YWQwIoMJPI'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export type User = {
  id: string
  email: string
  full_name?: string
  created_at?: string
}

export type Land = {
  id: string
  parcel_id: string
  address: string
  land_size: number
  ownership_type: string
  proof_document?: string
  status: 'Pending' | 'Under Review' | 'Approved'
  owner_id: string
  created_at?: string
}

export type Transfer = {
  id: string
  parcel_id: string
  sender_id: string
  recipient_id: string
  contract_document?: string
  status: 'Pending' | 'Approved' | 'Rejected'
  created_at?: string
}
