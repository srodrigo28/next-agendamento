// app/agendar/page.tsx

import { BookingForm } from "@/components/forms/BookingForm";
import { createClient } from "@/lib/supabase/server";
import { Servico } from "@/lib/types";
import { cookies } from "next/headers";

// Função que busca os serviços no servidor
async function getServicos(): Promise<Servico[]> {
  const cookieStore = cookies();
  const supabase = createClient(cookieStore);

  const { data, error } = await supabase
    .from('servicos')
    .select('*')
    .order('nome', { ascending: true })
    .returns<Servico[]>();

  if (error) {
    console.error("Erro ao buscar serviços:", error);
    return [];
  }
  return data;
}

// A página busca os dados e os passa para o componente
export default async function AgendarPage() {
  const servicos = await getServicos();

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4 bg-gray-50">
      {/* ✅ CORRETO: A prop 'servicos' está sendo passada */}
      <BookingForm servicos={servicos} />
    </div>
  );
}