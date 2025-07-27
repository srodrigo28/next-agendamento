// app/api/agendar/route.ts

import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import { cookies } from 'next/headers';
import { Agendamento } from "@/lib/types"; // Importamos o tipo

export async function POST(request: Request) {
  try {
    const supabase = createClient(cookies());

    // Agora recebemos o ID do horário disponível
    const { horarioDisponivelId, serviceId, clientName, clientPhone, serviceDuration } = await request.json();

    if (!horarioDisponivelId || !serviceId || !clientName || !clientPhone || !serviceDuration) {
      return NextResponse.json({ error: "Dados incompletos para o agendamento." }, { status: 400 });
    }

    // 1. Busca o horário de início do slot selecionado
    const { data: horarioData, error: horarioError } = await supabase
      .from('horarios_disponiveis')
      .select('horario_inicio')
      .eq('id', horarioDisponivelId)
      .eq('status', 'disponivel') // Garante que só pode agendar em um horário disponível
      .single();

    if (horarioError || !horarioData) {
      throw new Error("Horário não encontrado ou já reservado. Por favor, atualize a página.");
    }

    const horario_inicio = new Date(horarioData.horario_inicio);
    const horario_fim = new Date(horario_inicio.getTime() + serviceDuration * 60000);

    // 2. Cria o novo agendamento
    const { data: agendamentoData, error: agendamentoError } = await supabase
      .from("agendamentos")
      .insert([{
        id_servico: serviceId,
        horario_inicio: horario_inicio.toISOString(),
        horario_fim: horario_fim.toISOString(),
        nome_cliente: clientName,
        telefone_cliente: clientPhone,
        status: 'confirmado',
      }])
      .select()
      .single<Agendamento>(); // Aplica o tipo na resposta
    
    if (agendamentoError) throw agendamentoError;

    // 3. Atualiza o status do horário para 'reservado'
    const { error: updateError } = await supabase
      .from('horarios_disponiveis')
      .update({ status: 'reservado' })
      .eq('id', horarioDisponivelId);

    if (updateError) {
      // Se a atualização falhar, idealmente deveríamos reverter o agendamento (transação)
      // Por simplicidade, vamos apenas logar o erro por enquanto.
      console.error("Falha ao atualizar o status do horário:", updateError);
    }

    return NextResponse.json({ message: "Agendamento realizado com sucesso!", data: agendamentoData }, { status: 201 });

  } catch (error) {
    // Tratamento de erro seguro, sem usar 'any'
    const errorMessage = error instanceof Error ? error.message : "Ocorreu um erro desconhecido.";
    console.error("Falha na API de agendamento:", errorMessage);
    return NextResponse.json({ error: "Não foi possível criar o agendamento.", details: errorMessage }, { status: 500 });
  }
}
