// app/api/servicos/route.ts

import { createClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

// POST: Criar um novo serviço
export async function POST(request: Request) {
  try {
    const { nome, descricao, preco, duracao_minutos } = await request.json();
    if (!nome || !preco || !duracao_minutos) {
      return NextResponse.json({ error: "Nome, preço e duração são obrigatórios." }, { status: 400 });
    }
    const supabase = createClient(cookies());
    const { data, error } = await supabase
      .from('servicos')
      .insert({ nome, descricao, preco, duracao_minutos })
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Erro desconhecido.";
    console.error("Erro ao criar serviço:", errorMessage);
    return NextResponse.json({ error: "Falha ao criar serviço.", details: errorMessage }, { status: 500 });
  }
}

// PATCH: Atualizar um serviço existente
export async function PATCH(request: Request) {
  try {
    const { id, nome, descricao, preco, duracao_minutos } = await request.json();
    if (!id || !nome || !preco || !duracao_minutos) {
      return NextResponse.json({ error: "Todos os campos são obrigatórios para atualização." }, { status: 400 });
    }
    const supabase = createClient(cookies());
    const { data, error } = await supabase
      .from('servicos')
      .update({ nome, descricao, preco, duracao_minutos })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json(data);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Erro desconhecido.";
    console.error("Erro ao atualizar serviço:", errorMessage);
    return NextResponse.json({ error: "Falha ao atualizar serviço.", details: errorMessage }, { status: 500 });
  }
}

// DELETE: Excluir um serviço
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) {
      return NextResponse.json({ error: "O ID é obrigatório." }, { status: 400 });
    }
    const supabase = createClient(cookies());
    const { error } = await supabase
      .from('servicos')
      .delete()
      .eq('id', id);

    if (error) throw error;
    return NextResponse.json({ message: "Serviço excluído com sucesso." });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Erro desconhecido.";
    console.error("Erro ao excluir serviço:", errorMessage);
    return NextResponse.json({ error: "Falha ao excluir serviço.", details: errorMessage }, { status: 500 });
  }
}
