// components/admin/GerenciadorHorarios.tsx
"use client";

import { useState } from 'react';
import { Profissional } from "@/lib/types";
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Copy, Trash2 } from 'lucide-react';

interface GerenciadorHorariosProps {
  profissionais: Profissional[];
}

// Gera os slots de tempo para o dia
const timeSlots = Array.from({ length: 24 * 2 }, (_, i) => {
  const hours = Math.floor(i / 2).toString().padStart(2, '0');
  const minutes = (i % 2 === 0 ? '00' : '30');
  return `${hours}:${minutes}`;
});

const daysOfWeek = [
  { id: 1, name: 'Seg' }, { id: 2, name: 'Ter' }, { id: 3, name: 'Qua' },
  { id: 4, name: 'Qui' }, { id: 5, name: 'Sex' }, { id: 6, name: 'Sáb' }, { id: 0, name: 'Dom' }
];

export function GerenciadorHorarios({ profissionais }: GerenciadorHorariosProps) {
  const [professionalId, setProfessionalId] = useState<string | null>(null);
  const [weekTemplate, setWeekTemplate] = useState<Record<number, string[]>>({});
  const [isLoading, setIsLoading] = useState(false);

  const toggleTimeSlot = (dayId: number, time: string) => {
    setWeekTemplate(prev => {
      const daySlots = prev[dayId] || [];
      const newDaySlots = daySlots.includes(time)
        ? daySlots.filter(t => t !== time)
        : [...daySlots, time].sort();
      return { ...prev, [dayId]: newDaySlots };
    });
  };

  const copyToAllWeekdays = (sourceDayId: number) => {
    const sourceSlots = weekTemplate[sourceDayId] || [];
    const newTemplate = { ...weekTemplate };
    [1, 2, 3, 4, 5].forEach(dayId => {
      newTemplate[dayId] = sourceSlots;
    });
    setWeekTemplate(newTemplate);
  };

  const clearDay = (dayId: number) => {
    setWeekTemplate(prev => ({ ...prev, [dayId]: [] }));
  };

  const handleApplyTemplate = async (weeksToApply: number) => {
    if (!professionalId) return;
    setIsLoading(true);

    const slotsToCreate: string[] = [];
    const today = new Date();
    
    for (let i = 0; i < weeksToApply * 7; i++) {
      const targetDate = new Date(today);
      targetDate.setDate(today.getDate() + i);
      
      const dayOfWeek = targetDate.getDay();
      const templateSlots = weekTemplate[dayOfWeek] || [];

      templateSlots.forEach(time => {
        const [hour, minute] = time.split(':').map(Number);
        const slotDateTime = new Date(targetDate);
        slotDateTime.setUTCHours(hour, minute, 0, 0);
        slotsToCreate.push(slotDateTime.toISOString());
      });
    }

    if (slotsToCreate.length === 0) {
      alert("Seu modelo semanal está vazio. Adicione horários antes de aplicar.");
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch('/api/horarios', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ professionalId, slots: slotsToCreate }),
      });
      if (!response.ok) throw new Error("Falha ao aplicar o modelo.");
      alert(`Modelo aplicado com sucesso para as próximas ${weeksToApply} semanas!`);
    } catch (error) {
      alert((error as Error).message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-6xl">
      <CardHeader>
        <CardTitle>Gerenciador de Disponibilidade Semanal</CardTitle>
        <CardDescription>
          Defina o modelo de semana padrão para um profissional. Clique nos horários para adicionar ou remover.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2 max-w-sm">
          <Label>1. Selecione o Profissional</Label>
          <Select onValueChange={setProfessionalId}>
            <SelectTrigger><SelectValue placeholder="Selecione..." /></SelectTrigger>
            <SelectContent>
              {profissionais.map(p => <SelectItem key={p.id} value={String(p.id)}>{p.nome}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>

        {professionalId && (
          <div>
            <Label>2. Monte o Modelo da Semana</Label>
            <div className="grid grid-cols-8 gap-1 text-center font-bold text-sm mt-2">
              <div></div>
              {daysOfWeek.map(day => <div key={day.id}>{day.name}</div>)}
            </div>
            <div className="grid grid-cols-8 gap-1 mt-1 max-h-[60vh] overflow-y-auto">
              {/* Coluna de Horas */}
              <div className="space-y-1 text-right pr-2 text-xs font-mono">
                {timeSlots.map(time => <div key={time} className="h-6 flex items-center justify-end">{time}</div>)}
              </div>
              {/* Grid de Horários */}
              {daysOfWeek.map(day => (
                <div key={day.id} className="space-y-1">
                  {timeSlots.map(time => {
                    const isSelected = weekTemplate[day.id]?.includes(time);
                    return (
                      <div
                        key={`${day.id}-${time}`}
                        onClick={() => toggleTimeSlot(day.id, time)}
                        className={`h-6 rounded-sm cursor-pointer transition-colors ${isSelected ? 'bg-blue-500 hover:bg-blue-600' : 'bg-gray-200 hover:bg-gray-300'}`}
                      ></div>
                    );
                  })}
                  <div className="pt-2 flex justify-center space-x-1">
                      <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => copyToAllWeekdays(day.id)} title="Copiar para dias úteis">
                          <Copy className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => clearDay(day.id)} title="Limpar dia">
                          <Trash2 className="h-4 w-4" />
                      </Button>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-6 flex justify-end">
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button disabled={isLoading}>Aplicar Modelo ao Calendário</Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Aplicar modelo de semana?</AlertDialogTitle>
                    <AlertDialogDescription>
                      Isso irá gerar os horários disponíveis para as próximas semanas com base no modelo que você montou. Horários já existentes não serão duplicados.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancelar</AlertDialogCancel>
                    <AlertDialogAction onClick={() => handleApplyTemplate(4)} disabled={isLoading}>
                      {isLoading ? 'Aplicando...' : 'Aplicar para 4 semanas'}
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
