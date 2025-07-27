// app/meus-agendamentos/page.tsx

import { createClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AgendamentoComServico } from "@/lib/types";

export default async function MeusAgendamentosPage() {
  const cookieStore = cookies();
  const supabase = createClient(cookieStore);

  const { data: agendamentos, error } = await supabase
    .from('agendamentos')
    .select(`id, horario_inicio, nome_cliente, status, servicos ( nome )`)
    .order('horario_inicio', { ascending: false })
    .returns<AgendamentoComServico[]>();

  if (error) {
    return <p className="text-center text-red-500 p-8">Ocorreu um erro ao carregar os agendamentos.</p>;
  }
  
  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Meus Agendamentos</h1>
      
      {/* Tabela para Desktop */}
      <div className="hidden md:block border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Data e Hora</TableHead>
              <TableHead>Cliente</TableHead>
              <TableHead>Serviço</TableHead>
              <TableHead className="text-right">Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {agendamentos.map((agendamento) => (
              <TableRow key={agendamento.id}>
                <TableCell>{new Date(agendamento.horario_inicio).toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' })}</TableCell>
                <TableCell>{agendamento.nome_cliente}</TableCell>
                <TableCell>{agendamento.servicos?.nome ?? 'N/A'}</TableCell>
                <TableCell className="text-right"><Badge>{agendamento.status}</Badge></TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Lista de Cards para Mobile */}
      <div className="md:hidden space-y-4">
        {agendamentos.map((agendamento) => (
          <Card key={agendamento.id}>
            <CardHeader>
              <CardTitle className="text-base">{agendamento.nome_cliente}</CardTitle>
              <p className="text-sm text-muted-foreground">
                {new Date(agendamento.horario_inicio).toLocaleString('pt-BR', { dateStyle: 'long', timeStyle: 'short' })}
              </p>
            </CardHeader>
            <CardContent className="space-y-1 text-sm">
              <p><strong>Serviço:</strong> {agendamento.servicos?.nome ?? 'N/A'}</p>
              <div className="flex justify-between items-center pt-2">
                <strong>Status:</strong>
                <Badge>{agendamento.status}</Badge>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {agendamentos.length === 0 && (
        <div className="text-center p-8 text-sm text-gray-500">
          Nenhum agendamento encontrado.
        </div>
      )}
    </div>
  );
}
