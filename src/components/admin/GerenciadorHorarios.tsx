// components/admin/GerenciadorHorarios.tsx
"use client";

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';

// Tipos simples para este componente
type Profissional = { id: number; nome: string; };
type HorarioDisponivel = { id: number; horario_inicio: string; status: 'disponivel' | 'reservado'; };

interface GerenciadorHorariosProps {
  profissionais: Profissional[];
}

export function GerenciadorHorarios({ profissionais }: GerenciadorHorariosProps) {
  const [professionalId, setProfessionalId] = useState<string | null>(null);
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [horarios, setHorarios] = useState<HorarioDisponivel[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Busca os horários existentes quando o profissional ou a data mudam
  useEffect(() => {
    if (!professionalId || !date) return;
    setIsLoading(true);
    const dateString = date.toISOString().split('T')[0];
    fetch(`/api/horarios?professionalId=${professionalId}&date=${dateString}`)
      .then(res => res.json())
      .then(data => {
        setHorarios(data);
        setIsLoading(false);
      });
  }, [professionalId, date]);

  const handleGenerateSlots = async () => {
    if (!professionalId || !date) return;
    
    const HORA_INICIO = 9, HORA_FIM = 18, INTERVALO_MINUTOS = 30;
    const slotsToCreate: string[] = [];
    const inicio = new Date(date);
    inicio.setUTCHours(HORA_INICIO, 0, 0, 0);
    const fim = new Date(date);
    fim.setUTCHours(HORA_FIM, 0, 0, 0);

    while (inicio < fim) {
      // Verifica se o horário já existe antes de adicionar
      const horarioJaExiste = horarios.some(h => new Date(h.horario_inicio).getTime() === inicio.getTime());
      if (!horarioJaExiste) {
        slotsToCreate.push(inicio.toISOString());
      }
      inicio.setMinutes(inicio.getMinutes() + INTERVALO_MINUTOS);
    }

    if (slotsToCreate.length === 0) {
      alert("Todos os horários para este dia já foram gerados.");
      return;
    }

    setIsLoading(true);
    const response = await fetch('/api/horarios', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ professionalId, slots: slotsToCreate }),
    });
    const newSlots = await response.json();
    setHorarios(prev => [...prev, ...newSlots].sort((a,b) => new Date(a.horario_inicio).getTime() - new Date(b.horario_inicio).getTime()));
    setIsLoading(false);
  };

  const handleRemoveSlot = async (slotId: number) => {
    setIsLoading(true);
    await fetch(`/api/horarios?slotId=${slotId}`, { method: 'DELETE' });
    setHorarios(prev => prev.filter(h => h.id !== slotId));
    setIsLoading(false);
  };

  return (
    <Card className="w-full max-w-4xl">
      <CardHeader>
        <CardTitle>Gerenciar Horários Disponíveis</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <Label>1. Selecione o Profissional</Label>
          <Select onValueChange={setProfessionalId}>
            <SelectTrigger>
              <SelectValue placeholder="Selecione um profissional..." />
            </SelectTrigger>
            <SelectContent>
              {profissionais.map(p => (
                <SelectItem key={p.id} value={String(p.id)}>{p.nome}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {professionalId && (
          <div className="grid md:grid-cols-2 gap-8">
            <div className="space-y-4">
              <Label>2. Selecione a Data</Label>
              <Calendar mode="single" selected={date} onSelect={setDate} className="rounded-md border" />
              <Button onClick={handleGenerateSlots} disabled={isLoading}>
                {isLoading ? 'Gerando...' : 'Gerar Horários (9h às 18h)'}
              </Button>
            </div>
            <div className="space-y-4">
              <Label>Horários Cadastrados</Label>
              <div className="space-y-2 max-h-72 overflow-y-auto">
                {isLoading && horarios.length === 0 ? <p>Carregando...</p> :
                 horarios.length > 0 ? horarios.map(h => (
                  <div key={h.id} className={`flex justify-between items-center p-2 rounded-md ${h.status === 'reservado' ? 'bg-yellow-100' : 'bg-green-100'}`}>
                    <span>{new Date(h.horario_inicio).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })} - {h.status}</span>
                    {h.status === 'disponivel' && (
                      <Button variant="destructive" size="sm" onClick={() => handleRemoveSlot(h.id)}>Remover</Button>
                    )}
                  </div>
                 )) : <p className="text-sm text-gray-500">Nenhum horário cadastrado para este dia.</p>
                }
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
