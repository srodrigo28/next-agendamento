// app/admin/servicos/page.tsx
import { GerenciadorServicos } from "@/components/admin/GerenciadorServicos";
import { createClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";
import { Servico } from "@/lib/types";

async function getServicos(): Promise<Servico[]> {
    const supabase = createClient(cookies());
    const { data, error } = await supabase.from('servicos').select('*').order('nome');
    if (error) {
        console.error("Erro ao buscar serviços", error);
        return [];
    }
    return data;
}

export default async function AdminServicosPage() {
    const servicos = await getServicos();

    return (
        <div className="p-4 md:p-8 max-w-4xl mx-auto">
            <GerenciadorServicos servicosIniciais={servicos} />
        </div>
    );
}
