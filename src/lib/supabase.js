import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export const ADMIN_PASSWORD = import.meta.env.VITE_ADMIN_PASSWORD

// Las fotos ahora viven en Cloudflare R2 (sin límite de egress), no en Supabase Storage.
const R2_URL = import.meta.env.VITE_R2_PUBLIC_URL || 'https://pub-88e3eaefac864b04ad310f41c9744813.r2.dev'
export const STORAGE_URL = R2_URL.replace(/\/+$/, '') + '/'
