// app/api/profissionais/route.ts

import { createClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

// POST: Criar um novo profissional (agora aceita foto_url)
export async function POST(request: Request) {
  try {
    const { nome, foto_url } = await request.json();
    if (!nome) return NextResponse.json({ error: "O nome é obrigatório." }, { status: 400 });
    
    const supabase = createClient(cookies());
    const { data, error } = await supabase
      .from('profissionais')
      .insert({ nome, foto_url })
      .select().single();

    if (error) throw error;
    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Erro desconhecido.";
    return NextResponse.json({ error: "Falha ao criar profissional.", details: errorMessage }, { status: 500 });
  }
}

// PATCH: Atualizar um profissional (agora aceita foto_url)
export async function PATCH(request: Request) {
  try {
    const { id, nome, foto_url } = await request.json();
    if (!id || !nome) return NextResponse.json({ error: "ID e nome são obrigatórios." }, { status: 400 });

    const supabase = createClient(cookies());
    const { data, error } = await supabase
      .from('profissionais')
      .update({ nome, foto_url })
      .eq('id', id)
      .select().single();

    if (error) throw error;
    return NextResponse.json(data);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Erro desconhecido.";
    return NextResponse.json({ error: "Falha ao atualizar profissional.", details: errorMessage }, { status: 500 });
  }
}

// DELETE: Excluir um profissional E a sua foto do armazenamento
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) return NextResponse.json({ error: "O ID é obrigatório." }, { status: 400 });

    const supabase = createClient(cookies());

    // 1. Primeiro, busca o URL da foto antes de apagar o registo
    const { data: profissional, error: fetchError } = await supabase
      .from('profissionais')
      .select('foto_url')
      .eq('id', id)
      .single();
    
    if (fetchError) throw fetchError;

    // 2. Apaga o registo do profissional da tabela
    const { error: deleteError } = await supabase.from('profissionais').delete().eq('id', id);
    if (deleteError) throw deleteError;

    // 3. Se havia uma foto, apaga-a do Storage
    if (profissional?.foto_url) {
      const filePath = profissional.foto_url.split('/perfil/')[1];
      if (filePath) {
        await supabase.storage.from('box').remove([`perfil/${filePath}`]);
      }
    }

    return NextResponse.json({ message: "Profissional excluído com sucesso." });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Erro desconhecido.";
    return NextResponse.json({ error: "Falha ao excluir profissional.", details: errorMessage }, { status: 500 });
  }
}
