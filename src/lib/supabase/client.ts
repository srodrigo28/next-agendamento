// lib/supabase/client.ts
import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  // Cria um cliente Supabase para ser usado no navegador.
  // As variáveis de ambiente precisam ser públicas (NEXT_PUBLIC_).
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}
