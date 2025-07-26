// app/api/agendar/route.ts

import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import { cookies } from 'next/headers';

export async function POST(request: Request) {
  // O bloco 'try' envolve toda a operação para garantir que qualquer erro seja capturado.
  try {
    // 1. Inicializa a conexão com o Supabase de forma segura no servidor.
    const cookieStore = cookies();
    const supabase = createClient(cookieStore);

    // 2. Extrai e valida os dados recebidos do formulário.
    const { serviceId, dateTime, clientName, clientPhone, serviceDuration } = await request.json();

    if (!serviceId || !dateTime || !clientName || !clientPhone || !serviceDuration) {
      return NextResponse.json({ error: "Dados incompletos para o agendamento." }, { status: 400 });
    }

    // 3. Prepara os dados para inserção no banco de dados.
    const horario_inicio = new Date(dateTime);
    // Calcula o horário de término somando a duração do serviço.
    const horario_fim = new Date(horario_inicio.getTime() + serviceDuration * 60000); 
    
    // 4. Insere o novo agendamento na tabela 'agendamentos'.
    const { data, error } = await supabase
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
      .single(); // .single() para retornar o objeto recém-criado

    // 5. Trata erros específicos do Supabase.
    if (error) {
      console.error("Erro do Supabase ao inserir agendamento:", error);
      // Retorna um erro específico se o horário já estiver ocupado (conflito de chave única)
      if (error.code === '23505') { 
        return NextResponse.json({ error: "Este horário já foi reservado por outra pessoa." }, { status: 409 });
      }
      // Lança o erro para ser capturado pelo 'catch' principal.
      throw error;
    }

    // 6. Retorna uma resposta de sucesso com os dados criados.
    return NextResponse.json({ message: "Agendamento criado com sucesso!", data }, { status: 201 });

  } catch (error: any) {
    // 7. Bloco 'catch' genérico que captura QUALQUER erro que ocorrer na função.
    // Isso garante que uma resposta JSON sempre seja enviada, evitando o erro 'Unexpected end of JSON input'.
    console.error("Falha crítica na API de agendamento:", error);
    return NextResponse.json(
      { error: "Não foi possível criar o agendamento.", details: error.message }, 
      { status: 500 }
    );
  }
}
