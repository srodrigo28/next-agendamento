// app/agendar/page.tsx

import { BookingForm } from "@/components/forms/BookingForm";
import { createClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";
import { Servico, Profissional } from "@/lib/types";

async function getData(): Promise<{ servicos: Servico[], profissionais: Profissional[] }> {
  const supabase = createClient(cookies());
  const [servicosResult, profissionaisResult] = await Promise.all([
    supabase.from('servicos').select('*'),
    supabase.from('profissionais').select('*')
  ]);
  return { 
    servicos: servicosResult.data ?? [], 
    profissionais: profissionaisResult.data ?? [] 
  };
}

export default async function AgendarPage() {
  const { servicos, profissionais } = await getData();

  return (
    // O antigo <header> com o link foi removido daqui.
    <div className="min-h-screen w-full flex mt-10 justify-center p-4">
      <BookingForm servicos={servicos} profissionais={profissionais} />
    </div>
  );
}
