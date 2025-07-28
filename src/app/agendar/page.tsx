// app/agendar/page.tsx

import { BookingForm } from "@/components/forms/BookingForm";
import { createClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";
import { Servico, Profissional } from "@/lib/types";
import Link from "next/link";
import Image from "next/image";

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
    <div className="min-h-screen w-full flex mt-10 justify-center p-4 relative">
      <BookingForm servicos={servicos} profissionais={profissionais} />

      <div className="fixed bottom-10 right-10">
        <Link href="https://wa.me/5569999210459" className=" flex items-center relative animate-pulse">
          <p className="text-lg md:text-2xl text-white font-semibold bg-green-500 py-1 absolute right-[60px] w-48 px-3 rounded-l-full z-10 ">
            Contato rápido
          </p>
          <Image src="/whatsApp2.webp" alt="WhatsApp" width={70} height={70} className="z-20 " />
        </Link>
        
      </div>
    </div>
  );
}
