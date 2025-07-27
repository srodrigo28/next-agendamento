// app/admin/profissionais/page.tsx
import { GerenciadorProfissionais } from "@/components/admin/GerenciadorProfissionais";
import { createClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";
import { Profissional } from "@/lib/types";

async function getProfissionais(): Promise<Profissional[]> {
    const supabase = createClient(cookies());
    const { data, error } = await supabase.from('profissionais').select('*').order('nome');
    if (error) {
        console.error("Erro ao buscar profissionais", error);
        return [];
    }
    return data;
}

export default async function AdminProfissionaisPage() {
    const profissionais = await getProfissionais();

    return (
        <div className="p-4 md:p-8 max-w-4xl mx-auto">
            <GerenciadorProfissionais profissionaisIniciais={profissionais} />
        </div>
    );
}
