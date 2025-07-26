// app/meus-agendamentos/page.tsx

import { createClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { Button } from "@/components/ui/button";

// Tipo para representar o formato do agendamento quando ele vem com o nome do serviço junto.
// Idealmente, este tipo estaria no arquivo `types/index.ts`.
type AgendamentoComServico = {
  id: number;
  horario_inicio: string;
  nome_cliente: string;
  status: 'confirmado' | 'cancelado' | 'concluido';
  servicos: {
    nome: string;
  } | null;
};

export default async function MeusAgendamentosPage() {
  const cookieStore = cookies();
  const supabase = createClient(cookieStore);

  // Busca os agendamentos e o nome do serviço relacionado em uma única consulta
  const { data: agendamentos, error } = await supabase
    .from('agendamentos')
    .select(`
      id,
      horario_inicio,
      nome_cliente,
      status,
      servicos ( nome ) 
    `)
    .order('horario_inicio', { ascending: false })
    .returns<AgendamentoComServico[]>(); // Aplica a tipagem na resposta

  if (error) {
    return <p className="text-center text-red-500 p-8">Ocorreu um erro ao carregar os agendamentos.</p>;
  }
  
  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Meus Agendamentos</h1>
        <Link href="/agendar">
          <Button>Novo Agendamento</Button>
        </Link>
      </div>
      
      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[200px]">Data e Hora</TableHead>
              <TableHead>Cliente</TableHead>
              <TableHead>Serviço</TableHead>
              <TableHead className="text-right">Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {agendamentos.map((agendamento) => (
              <TableRow key={agendamento.id}>
                <TableCell className="font-medium">
                  {new Date(agendamento.horario_inicio).toLocaleString('pt-BR', {
                    dateStyle: 'short',
                    timeStyle: 'short',
                  })}
                </TableCell>
                <TableCell>{agendamento.nome_cliente}</TableCell>
                <TableCell>{agendamento.servicos?.nome ?? 'Serviço não encontrado'}</TableCell>
                <TableCell className="text-right">
                   <Badge variant={agendamento.status === 'confirmado' ? 'default' : 'secondary'}>
                      {agendamento.status}
                   </Badge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        {agendamentos.length === 0 && (
          <div className="text-center p-8 text-sm text-gray-500">
            Nenhum agendamento encontrado.
          </div>
        )}
      </div>
    </div>
  );
}
