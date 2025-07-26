// lib/supabase/server.ts

import { createServerClient, type CookieOptions } from '@supabase/ssr'

// Esta linha é um truque de TypeScript para descobrir o tipo de retorno da função 'cookies'
// sem precisar importá-lo por um nome que pode não existir na sua versão do Next.js.
// Ele cria um "apelido" chamado 'CookieStore' para o tipo correto.
type CookieStore = ReturnType<typeof import('next/headers')['cookies']>

// A função 'createClient' agora usa nosso apelido 'CookieStore' como o tipo do argumento.
// Ela espera receber o objeto de cookies, em vez de tentar encontrá-lo sozinha.
export function createClient(cookieStore: CookieStore) {
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        // Agora, o TypeScript sabe que 'cookieStore' é um objeto com os métodos .get(), .set(), etc.
        async get(name: string) {
          return (await cookieStore).get(name)?.value
        },
        async set(name: string, value: string, options: CookieOptions) {
          try {
           (await cookieStore).set({ name, value, ...options })
          } catch (error) {
            console.error("Erro ao definir cookie:", error);
            // Ignorar erro que pode ocorrer em Server Actions ou Route Handlers
          }
        },
       async remove(name: string, options: CookieOptions) {
           try {
            (await cookieStore).set({ name, value: '', ...options })
          } catch (error) {
            console.error("Erro ao definir cookie:", error);
            // Ignorar erro que pode ocorrer nas mesmas condições
          }
        },
      },
    }
  )
}