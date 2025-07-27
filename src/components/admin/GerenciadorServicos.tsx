// components/admin/GerenciadorServicos.tsx
"use client";

import { useState } from 'react';
import { Servico } from "@/lib/types";
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, 
    AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

interface GerenciadorServicosProps {
  servicosIniciais: Servico[];
}

const formInicial = { nome: '', descricao: '', preco: 0, duracao_minutos: 30 };

export function GerenciadorServicos({ servicosIniciais }: GerenciadorServicosProps) {
  const [servicos, setServicos] = useState(servicosIniciais);
  const [formData, setFormData] = useState(formInicial);
  const [servicoEditando, setServicoEditando] = useState<Servico | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSave = async () => {
    setIsLoading(true);
    const url = '/api/servicos';
    const method = servicoEditando ? 'PATCH' : 'POST';
    const body = servicoEditando 
      ? JSON.stringify({ id: servicoEditando.id, ...formData }) 
      : JSON.stringify(formData);

    try {
      const response = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body });
      if (!response.ok) throw new Error("Falha ao salvar serviço.");
      
      const servicoSalvo = await response.json();

      if (servicoEditando) {
        setServicos(servicos.map(s => s.id === servicoSalvo.id ? servicoSalvo : s));
      } else {
        setServicos([...servicos, servicoSalvo]);
      }
      
      closeDialog();
    } catch (error) {
      alert((error as Error).message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/servicos?id=${id}`, { method: 'DELETE' });
      if (!response.ok) throw new Error("Falha ao excluir serviço.");
      
      setServicos(servicos.filter(s => s.id !== id));
    } catch (error) {
      alert((error as Error).message);
    } finally {
      setIsLoading(false);
    }
  };

  const openDialog = (servico: Servico | null = null) => {
    setServicoEditando(servico);
    setFormData(servico ? { nome: servico.nome, descricao: servico.descricao ?? '', preco: servico.preco, duracao_minutos: servico.duracao_minutos } : formInicial);
    setIsDialogOpen(true);
  };

  const closeDialog = () => {
    setIsDialogOpen(false);
    setServicoEditando(null);
    setFormData(formInicial);
  };

  return (
    <div className="w-full">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Gerenciar Serviços</h1>
        <Button onClick={() => openDialog()}>Adicionar Serviço</Button>
      </div>

      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nome</TableHead>
              <TableHead>Preço</TableHead>
              <TableHead>Duração</TableHead>
              <TableHead className="text-right w-[180px]">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {servicos.map((s) => (
              <TableRow key={s.id}>
                <TableCell className="font-medium">{s.nome}</TableCell>
                <TableCell>R$ {s.preco.toFixed(2)}</TableCell>
                <TableCell>{s.duracao_minutos} min</TableCell>
                <TableCell className="text-right space-x-2">
                  <Button variant="outline" size="sm" onClick={() => openDialog(s)}>Editar</Button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild><Button variant="destructive" size="sm">Excluir</Button></AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader><AlertDialogTitle>Você tem certeza?</AlertDialogTitle><AlertDialogDescription>Essa ação não pode ser desfeita.</AlertDialogDescription></AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction onClick={() => handleDelete(s.id)} disabled={isLoading}>{isLoading ? "Excluindo..." : "Excluir"}</AlertDialogAction>
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
        <DialogContent>
          <DialogHeader><DialogTitle>{servicoEditando ? 'Editar Serviço' : 'Adicionar Serviço'}</DialogTitle></DialogHeader>
          <div className="py-4 grid gap-4">
            <div className="space-y-2">
              <Label htmlFor="nome">Nome do Serviço</Label>
              <Input id="nome" value={formData.nome} onChange={(e) => setFormData({...formData, nome: e.target.value})} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="descricao">Descrição (Opcional)</Label>
              <Textarea id="descricao" value={formData.descricao} onChange={(e) => setFormData({...formData, descricao: e.target.value})} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="preco">Preço (R$)</Label>
                <Input id="preco" type="number" value={formData.preco} onChange={(e) => setFormData({...formData, preco: parseFloat(e.target.value) || 0})} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="duracao">Duração (minutos)</Label>
                <Input id="duracao" type="number" value={formData.duracao_minutos} onChange={(e) => setFormData({...formData, duracao_minutos: parseInt(e.target.value) || 0})} />
              </div>
            </div>
          </div>
          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={closeDialog}>Cancelar</Button>
            <Button onClick={handleSave} disabled={isLoading}>{isLoading ? 'Salvando...' : 'Salvar'}</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
