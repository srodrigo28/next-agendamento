// components/admin/GerenciadorProfissionais.tsx
"use client";

import { useState, useRef } from 'react';
import { Profissional } from "@/lib/types";
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { PlusCircle, Trash2, Upload } from 'lucide-react';
import Image from 'next/image';

interface GerenciadorProfissionaisProps {
  profissionaisIniciais: Profissional[];
}

// ==================================================================
// A NOVA FUNÇÃO DE CORREÇÃO ESTÁ AQUI
// ==================================================================
/**
 * Remove caracteres especiais de um nome de arquivo para torná-lo seguro para upload.
 * @param filename O nome original do arquivo.
 * @returns O nome do arquivo sanitizado.
 */
const sanitizeFilename = (filename: string) => {
  // Substitui qualquer caractere que não seja letra, número, ponto, underscore ou hífen por um underscore.
  return filename.replace(/[^a-zA-Z0-9._-]/g, '_');
};

export function GerenciadorProfissionais({ profissionaisIniciais }: GerenciadorProfissionaisProps) {
  const [profissionais, setProfissionais] = useState<Profissional[]>(profissionaisIniciais);
  const [profissionalEditando, setProfissionalEditando] = useState<Profissional | null>(null);
  const [nome, setNome] = useState('');
  const [fotoFile, setFotoFile] = useState<File | null>(null);
  const [fotoPreview, setFotoPreview] = useState<string | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isAlertOpen, setIsAlertOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const supabase = createClient();

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setFotoFile(file);
      setFotoPreview(URL.createObjectURL(file));
    }
  };

  const handleSave = async () => {
    setIsLoading(true);
    let foto_url = profissionalEditando?.foto_url ?? null;

    try {
      if (fotoFile) {
        // A sanitização é aplicada aqui antes de criar o caminho do arquivo
        const sanitizedName = sanitizeFilename(fotoFile.name);
        const filePath = `perfil/${Date.now()}_${sanitizedName}`;
        
        const { error: uploadError } = await supabase.storage.from('box').upload(filePath, fotoFile);
        if (uploadError) throw uploadError;
        
        const { data: urlData } = supabase.storage.from('box').getPublicUrl(filePath);
        foto_url = urlData.publicUrl;
      }

      const url = '/api/profissionais';
      const method = profissionalEditando ? 'PATCH' : 'POST';
      const body = JSON.stringify({ id: profissionalEditando?.id, nome, foto_url });

      const response = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body });
      if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || "Falha ao salvar profissional.");
      }
      
      const profissionalSalvo: Profissional = await response.json();

      if (profissionalEditando) {
        setProfissionais(profissionais.map(p => p.id === profissionalSalvo.id ? profissionalSalvo : p));
      } else {
        setProfissionais([...profissionais, profissionalSalvo]);
      }
      
      closeDialog();
    } catch (error) {
      console.error("ERRO DETALHADO AO SALVAR:", error);
      alert(`Falha ao salvar: ${(error as Error).message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!profissionalEditando) return;
    setIsLoading(true);
    try {
      const response = await fetch(`/api/profissionais?id=${profissionalEditando.id}`, { method: 'DELETE' });
      if (!response.ok) throw new Error("Falha ao excluir profissional.");
      
      setProfissionais(profissionais.filter(p => p.id !== profissionalEditando.id));
      closeDialog();
    } catch (error) {
      alert((error as Error).message);
    } finally {
      setIsLoading(false);
      setIsAlertOpen(false);
    }
  };

  const openDialog = (profissional: Profissional | null = null) => {
    setProfissionalEditando(profissional);
    setNome(profissional?.nome ?? '');
    setFotoPreview(profissional?.foto_url ?? null);
    setFotoFile(null);
    setIsDialogOpen(true);
  };

  const closeDialog = () => setIsDialogOpen(false);

  return (
    // O JSX permanece o mesmo
    <div className="w-full">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
        {profissionais.map((p) => (
          <div key={p.id} onClick={() => openDialog(p)} className="group cursor-pointer space-y-4">
            <div className="aspect-square rounded-lg overflow-hidden relative">
              <Image
                src={p.foto_url || '/placeholder-perfil.jpg'}
                alt={p.nome}
                fill
                className="object-cover transition-transform duration-300 group-hover:scale-105"
                onError={(e) => { e.currentTarget.src = '/placeholder-perfil.jpg'; }}
              />
            </div>
            <h3 className="text-center text-lg font-medium">{p.nome}</h3>
          </div>
        ))}
        <div onClick={() => openDialog()} className="group cursor-pointer flex flex-col items-center justify-center aspect-square rounded-lg border-2 border-dashed border-gray-300 hover:border-gray-400 transition-colors">
            <PlusCircle className="h-12 w-12 text-gray-400 group-hover:text-gray-500" />
            <p className="mt-2 text-sm text-gray-500">Adicionar Profissional</p>
        </div>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>{profissionalEditando ? 'Editar Profissional' : 'Adicionar Profissional'}</DialogTitle></DialogHeader>
          <div className="py-4 space-y-4">
            <div className="relative w-48 h-48 mx-auto">
              <Image
                src={fotoPreview || '/placeholder-perfil.jpg'}
                alt="Preview"
                fill
                className="object-cover rounded-full"
                onError={(e) => { e.currentTarget.src = '/placeholder-perfil.jpg'; }}
              />
              <Button size="icon" className="absolute bottom-2 right-2 rounded-full" onClick={() => fileInputRef.current?.click()}>
                <Upload className="h-4 w-4" />
              </Button>
              <Input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileChange} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="nome">Nome do Profissional</Label>
              <Input id="nome" value={nome} onChange={(e) => setNome(e.target.value)} />
            </div>
          </div>
          <div className="flex justify-between">
            {profissionalEditando && (
              <Button variant="destructive" onClick={() => setIsAlertOpen(true)}><Trash2 className="mr-2 h-4 w-4"/> Excluir</Button>
            )}
            <div className="flex space-x-2 ml-auto">
              <Button variant="outline" onClick={closeDialog}>Cancelar</Button>
              <Button onClick={handleSave} disabled={isLoading}>{isLoading ? 'Salvando...' : 'Salvar'}</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <AlertDialog open={isAlertOpen} onOpenChange={setIsAlertOpen}>
        <AlertDialogContent>
          <AlertDialogHeader><AlertDialogTitle>Você tem certeza?</AlertDialogTitle><AlertDialogDescription>Essa ação não pode ser desfeita e excluirá o profissional e sua foto.</AlertDialogDescription></AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} disabled={isLoading}>{isLoading ? "Excluindo..." : "Confirmar Exclusão"}</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
