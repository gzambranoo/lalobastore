import { createClient } from '@supabase/supabase-js'
export const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
)
export const ADMIN_PASSWORD = import.meta.env.VITE_ADMIN_PASSWORD
export const STORAGE_URL = `${import.meta.env.VITE_SUPABASE_URL}/storage/v1/object/public/Camisetas/`
