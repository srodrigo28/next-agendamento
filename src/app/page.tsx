// app/page.tsx

import { redirect } from 'next/navigation';

/**
 * Esta é a página raiz do site.
 * Sua única função é redirecionar o usuário para a página principal do sistema,
 * que é '/agendar'. Isso evita erros e melhora a experiência do usuário.
 */
export default function HomePage() {
  redirect('/agendar');
}
