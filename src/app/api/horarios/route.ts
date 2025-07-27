// app/api/horarios/route.ts

import { createClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { HorarioDisponivel } from "@/lib/types";

// Função GET: Busca os horários disponíveis para um profissional em uma data específica.
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const professionalId = searchParams.get('professionalId');
    const date = searchParams.get('date'); // Ex: '2025-07-26'

    if (!professionalId || !date) {
      return NextResponse.json({ error: 'ID do profissional e data são obrigatórios' }, { status: 400 });
    }

    const supabase = createClient(cookies());

    // --- CORREÇÃO DE FUSO HORÁRIO ---
    // Constrói as datas de início e fim do dia em UTC para evitar problemas de fuso.
    // Isso garante que estamos buscando das 00:00 às 23:59 no padrão universal.
    const startDate = `${date}T00:00:00.000Z`;
    const endDate = `${date}T23:59:59.999Z`;

    const { data, error } = await supabase
      .from('horarios_disponiveis')
      .select('*')
      .eq('id_profissional', professionalId)
      .gte('horario_inicio', startDate) // Maior ou igual ao início do dia em UTC
      .lte('horario_inicio', endDate)   // Menor ou igual ao fim do dia em UTC
      .order('horario_inicio')
      .returns<HorarioDisponivel[]>();

    if (error) throw error;

    // Retorna os dados encontrados (que agora devem ser os corretos)
    return NextResponse.json(data);

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Erro desconhecido ao buscar horários.";
    console.error("Erro em GET /api/horarios:", errorMessage);
    return NextResponse.json({ error: "Falha ao buscar horários.", details: errorMessage }, { status: 500 });
  }
}

// (As funções POST e DELETE podem permanecer as mesmas da versão anterior)
export async function POST(request: Request) {
  try {
    const { professionalId, slots } = await request.json();
    if (!professionalId || !slots || !Array.isArray(slots) || slots.length === 0) {
      return NextResponse.json({ error: 'Dados inválidos para criação de horários.' }, { status: 400 });
    }
    const supabase = createClient(cookies());
    const horariosParaInserir = slots.map(slot => ({
      id_profissional: Number(professionalId),
      horario_inicio: slot,
      status: 'disponivel',
    }));
    const { data, error } = await supabase
      .from('horarios_disponiveis')
      .insert(horariosParaInserir)
      .select()
      .returns<HorarioDisponivel[]>();
    if (error) throw error;
    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Erro desconhecido ao criar horários.";
    console.error("Erro em POST /api/horarios:", errorMessage);
    return NextResponse.json({ error: "Falha ao criar horários.", details: errorMessage }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const slotId = searchParams.get('slotId');
        if (!slotId) {
            return NextResponse.json({ error: 'ID do horário é obrigatório para remoção.' }, { status: 400 });
        }
        const supabase = createClient(cookies());
        const { error } = await supabase
            .from('horarios_disponiveis')
            .delete()
            .eq('id', slotId);
        if (error) throw error;
        return NextResponse.json({ message: 'Horário removido com sucesso.' }, { status: 200 });
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "Erro desconhecido ao remover horário.";
        console.error("Erro em DELETE /api/horarios:", errorMessage);
        return NextResponse.json({ error: "Falha ao remover horário.", details: errorMessage }, { status: 500 });
    }
}