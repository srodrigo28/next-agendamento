// app/api/profissionais/route.ts

import { createClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

// POST: Criar um novo profissional
export async function POST(request: Request) {
  try {
    const { nome } = await request.json();
    if (!nome) {
      return NextResponse.json({ error: "O nome é obrigatório." }, { status: 400 });
    }
    const supabase = createClient(cookies());
    const { data, error } = await supabase
      .from('profissionais')
      .insert({ nome })
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Erro desconhecido.";
    console.error("Erro ao criar profissional:", errorMessage);
    return NextResponse.json({ error: "Falha ao criar profissional.", details: errorMessage }, { status: 500 });
  }
}

// PATCH: Atualizar um profissional existente
export async function PATCH(request: Request) {
  try {
    const { id, nome } = await request.json();
    if (!id || !nome) {
      return NextResponse.json({ error: "ID e nome são obrigatórios." }, { status: 400 });
    }
    const supabase = createClient(cookies());
    const { data, error } = await supabase
      .from('profissionais')
      .update({ nome })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json(data);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Erro desconhecido.";
    console.error("Erro ao atualizar profissional:", errorMessage);
    return NextResponse.json({ error: "Falha ao atualizar profissional.", details: errorMessage }, { status: 500 });
  }
}

// DELETE: Excluir um profissional
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) {
      return NextResponse.json({ error: "O ID é obrigatório." }, { status: 400 });
    }
    const supabase = createClient(cookies());
    const { error } = await supabase
      .from('profissionais')
      .delete()
      .eq('id', id);

    if (error) throw error;
    return NextResponse.json({ message: "Profissional excluído com sucesso." });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Erro desconhecido.";
    console.error("Erro ao excluir profissional:", errorMessage);
    return NextResponse.json({ error: "Falha ao excluir profissional.", details: errorMessage }, { status: 500 });
  }
}
