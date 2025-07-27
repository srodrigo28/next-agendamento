// app/admin/horarios/page.tsx
import { GerenciadorHorarios } from "@/components/admin/GerenciadorHorarios";
import { createClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";
import Link from "next/link";
import { Button } from "@/components/ui/button";

async function getProfissionais() {
    const supabase = createClient(cookies());
    const { data, error } = await supabase.from('profissionais').select('*');
    if (error) {
        console.error("Erro ao buscar profissionais", error);
        return [];
    }
    return data;
}

export default async function AdminHorariosPage() {
    const profissionais = await getProfissionais();

    return (
        <div className="w-full">
            <header className="p-4 border-b bg-white shadow-sm">
                <nav className="max-w-7xl mx-auto flex justify-between">
                    <Link href="/agendar"><Button variant="outline">Fazer Agendamento</Button></Link>
                    <Link href="/meus-agendamentos"><Button variant="outline">Ver Agendamentos</Button></Link>
                </nav>
            </header>
            <main className="min-h-screen w-full flex items-center justify-center p-4 bg-gray-50">
                <GerenciadorHorarios profissionais={profissionais} />
            </main>
        </div>
    );
}
