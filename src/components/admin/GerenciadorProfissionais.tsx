// components/admin/GerenciadorProfissionais.tsx
"use client";

import { useState } from 'react';
import { Profissional } from "@/lib/types";
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, 
    AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface GerenciadorProfissionaisProps {
  profissionaisIniciais: Profissional[];
}

export function GerenciadorProfissionais({ profissionaisIniciais }: GerenciadorProfissionaisProps) {
  const [profissionais, setProfissionais] = useState(profissionaisIniciais);
  const [nome, setNome] = useState('');
  const [profissionalEditando, setProfissionalEditando] = useState<Profissional | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSave = async () => {
    setIsLoading(true);
    const url = profissionalEditando ? '/api/profissionais' : '/api/profissionais';
    const method = profissionalEditando ? 'PATCH' : 'POST';
    const body = profissionalEditando ? JSON.stringify({ id: profissionalEditando.id, nome }) : JSON.stringify({ nome });

    try {
      const response = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body });
      if (!response.ok) throw new Error("Falha ao salvar profissional.");
      
      const profissionalSalvo = await response.json();

      if (profissionalEditando) {
        setProfissionais(profissionais.map(p => p.id === profissionalSalvo.id ? profissionalSalvo : p));
      } else {
        setProfissionais([...profissionais, profissionalSalvo]);
      }
      
      closeDialog();
    } catch (error) {
      console.error(error);
      alert((error as Error).message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/profissionais?id=${id}`, { method: 'DELETE' });
      if (!response.ok) throw new Error("Falha ao excluir profissional.");
      
      setProfissionais(profissionais.filter(p => p.id !== id));
    } catch (error) {
      console.error(error);
      alert((error as Error).message);
    } finally {
      setIsLoading(false);
    }
  };

  const openDialog = (profissional: Profissional | null = null) => {
    setProfissionalEditando(profissional);
    setNome(profissional ? profissional.nome : '');
    setIsDialogOpen(true);
  };

  const closeDialog = () => {
    setIsDialogOpen(false);
    setProfissionalEditando(null);
    setNome('');
  };

  return (
    <div className="w-full">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Gerenciar Profissionais</h1>
        <Button onClick={() => openDialog()}>Adicionar Profissional</Button>
      </div>

      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nome</TableHead>
              <TableHead className="text-right w-[180px]">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {profissionais.map((p) => (
              <TableRow key={p.id}>
                <TableCell className="font-medium">{p.nome}</TableCell>
                <TableCell className="text-right space-x-2">
                  <Button variant="outline" size="sm" onClick={() => openDialog(p)}>Editar</Button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="destructive" size="sm">Excluir</Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Você tem certeza?</AlertDialogTitle>
                        <AlertDialogDescription>
                          Essa ação não pode ser desfeita. Isso excluirá permanentemente o profissional.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction onClick={() => handleDelete(p.id)} disabled={isLoading}>
                          {isLoading ? "Excluindo..." : "Excluir"}
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent onInteractOutside={(e) => e.preventDefault()} onEscapeKeyDown={(e) => e.preventDefault()}>
          <DialogHeader>
            <DialogTitle>{profissionalEditando ? 'Editar Profissional' : 'Adicionar Profissional'}</DialogTitle>
          </DialogHeader>
          <div className="py-4 space-y-2">
            <Label htmlFor="nome">Nome do Profissional</Label>
            <Input id="nome" value={nome} onChange={(e) => setNome(e.target.value)} />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={closeDialog}>Cancelar</Button>
            <Button onClick={handleSave} disabled={isLoading}>{isLoading ? 'Salvando...' : 'Salvar'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
