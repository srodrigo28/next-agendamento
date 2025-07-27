// components/forms/BookingForm.tsx
"use client";

import { useState, useEffect } from 'react';
import { Servico, Profissional, HorarioDisponivel } from "@/lib/types";
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { CalendarDays, Clock, User, Scissors } from 'lucide-react';

interface BookingFormProps {
  servicos: Servico[];
  profissionais: Profissional[];
}

export function BookingForm({ servicos, profissionais }: BookingFormProps) {
  const [formData, setFormData] = useState({
    professionalId: null as string | null,
    service: null as Servico | null,
    date: new Date() as Date | undefined,
    horarioDisponivel: null as HorarioDisponivel | null,
    clientName: '',
    clientPhone: ''
  });
  const [horariosDisponiveis, setHorariosDisponiveis] = useState<HorarioDisponivel[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isDateModalOpen, setIsDateModalOpen] = useState(false);

  useEffect(() => {
    if (!formData.date || !formData.professionalId) return;
    setIsLoading(true);
    const dateString = formData.date!.toISOString().split('T')[0];
    fetch(`/api/horarios?professionalId=${formData.professionalId}&date=${dateString}`)
      .then(res => res.json())
      .then(data => {
        setHorariosDisponiveis(data.filter((h: HorarioDisponivel) => h.status === 'disponivel'));
        setIsLoading(false);
      });
  }, [formData.date, formData.professionalId]);

  const handleFormChange = <T extends keyof typeof formData>(key: T, value: (typeof formData)[T]) => {
    setFormData(prev => {
      const newState = { ...prev, [key]: value };
      if (key === 'professionalId' || key === 'service' || key === 'date') {
        newState.horarioDisponivel = null;
      }
      return newState;
    });
  };
  
  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsLoading(true);
    const { horarioDisponivel, service, clientName, clientPhone } = formData;
    if (!horarioDisponivel || !service || !clientName || !clientPhone) {
      alert("Por favor, preencha todos os campos.");
      setIsLoading(false);
      return;
    }
    try {
      const response = await fetch('/api/agendar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          horarioDisponivelId: horarioDisponivel.id,
          serviceId: service.id,
          clientName: clientName,
          clientPhone: clientPhone,
          serviceDuration: service.duracao_minutos,
        }),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Ocorreu um erro ao agendar.");
      }
      alert("Agendamento realizado com sucesso!");
      setHorariosDisponiveis(prev => prev.filter(h => h.id !== horarioDisponivel.id));
      setFormData({
        professionalId: null, service: null, date: new Date(),
        horarioDisponivel: null, clientName: '', clientPhone: ''
      });
    } catch (error) {
      alert((error as Error).message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      {/* ================================================================== */}
      {/* A CORREÇÃO ESTÁ AQUI: w-[90vw] para mobile                         */}
      {/* ================================================================== */}
      <Card className="w-[90vw] max-w-lg md:w-full md:max-w-4xl border-0 md:border md:shadow-lg">
        <CardHeader>
          <CardTitle>Faça o seu Agendamento</CardTitle>
          <CardDescription>Preencha os dados abaixo para garantir o seu horário.</CardDescription>
        </CardHeader>
        
        {/* Layout para Desktop */}
        <CardContent className="hidden md:grid md:grid-cols-2 gap-8">
          <div className="space-y-6">
            <div className="space-y-2">
              <Label>Profissional e Serviço</Label>
              <Select onValueChange={(id) => handleFormChange('professionalId', id)} value={formData.professionalId ?? undefined}>
                <SelectTrigger><SelectValue placeholder="Selecione o profissional..." /></SelectTrigger>
                <SelectContent>{profissionais.map(p => <SelectItem key={p.id} value={String(p.id)}>{p.nome}</SelectItem>)}</SelectContent>
              </Select>
              <Select onValueChange={(id) => handleFormChange('service', servicos.find(s => s.id === Number(id)) || null)} value={formData.service ? String(formData.service.id) : undefined} disabled={!formData.professionalId}>
                <SelectTrigger><SelectValue placeholder="Selecione o serviço..." /></SelectTrigger>
                <SelectContent>{servicos.map(s => <SelectItem key={s.id} value={String(s.id)}>{s.nome}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="space-y-4">
              <Label>Seus Dados</Label>
              <Input placeholder="Seu nome completo" value={formData.clientName} onChange={(e) => handleFormChange('clientName', e.target.value)} required />
              <Input placeholder="Seu WhatsApp" value={formData.clientPhone} onChange={(e) => handleFormChange('clientPhone', e.target.value)} required />
            </div>
          </div>
          <div className="space-y-4">
            <Label>Data e Horário</Label>
            <Calendar mode="single" selected={formData.date} onSelect={(d) => handleFormChange('date', d)} className="rounded-md border" disabled={!formData.service} />
            <div className="grid grid-cols-4 gap-2 pt-2 max-h-48 overflow-y-auto">
              {isLoading ? <p className="col-span-4 text-center">Carregando...</p> : 
               horariosDisponiveis.length > 0 ? horariosDisponiveis.map((h) => (
                <Button type="button" key={h.id} variant={formData.horarioDisponivel?.id === h.id ? "default" : "outline"} onClick={() => handleFormChange('horarioDisponivel', h)}>
                  {new Date(h.horario_inicio).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                </Button>
              )) : <p className="text-xs text-gray-500 col-span-4 text-center">Nenhum horário disponível.</p>}
            </div>
          </div>
        </CardContent>

        {/* Layout para Mobile */}
        <CardContent className="md:hidden space-y-4">
            <div className="space-y-2">
              <Label>1. Selecione</Label>
              <Select onValueChange={(id) => handleFormChange('professionalId', id)} value={formData.professionalId ?? undefined}>
                <SelectTrigger className="w-full justify-start"><User className="mr-2 h-4 w-4" /> <SelectValue placeholder="Escolha o profissional..." /></SelectTrigger>
                <SelectContent>{profissionais.map(p => <SelectItem key={p.id} value={String(p.id)}>{p.nome}</SelectItem>)}</SelectContent>
              </Select>
              <Select onValueChange={(id) => handleFormChange('service', servicos.find(s => s.id === Number(id)) || null)} value={formData.service ? String(formData.service.id) : undefined} disabled={!formData.professionalId}>
                <SelectTrigger className="w-full justify-start"><Scissors className="mr-2 h-4 w-4" /> <SelectValue placeholder="Escolha o serviço..." /></SelectTrigger>
                <SelectContent>{servicos.map(s => <SelectItem key={s.id} value={String(s.id)}>{s.nome}</SelectItem>)}</SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>2. Escolha a Data e Hora</Label>
              <Dialog open={isDateModalOpen} onOpenChange={setIsDateModalOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline" className="w-full justify-start font-normal" disabled={!formData.service}><CalendarDays className="mr-2 h-4 w-4" /> {formData.date ? formData.date.toLocaleDateString('pt-BR') : "Selecione a data"}</Button>
                </DialogTrigger>
                <DialogContent className="w-auto">
                  <DialogHeader><DialogTitle>Selecione a Data</DialogTitle></DialogHeader>
                  <Calendar mode="single" selected={formData.date} onSelect={(d) => { handleFormChange('date', d); setIsDateModalOpen(false); }} className="rounded-md" />
                </DialogContent>
              </Dialog>
              <Select onValueChange={(horarioId) => handleFormChange('horarioDisponivel', horariosDisponiveis.find(h => h.id === Number(horarioId)) || null)} value={formData.horarioDisponivel ? String(formData.horarioDisponivel.id) : undefined} disabled={!formData.date}>
                <SelectTrigger className="w-full justify-start"><Clock className="mr-2 h-4 w-4" /> <SelectValue placeholder="Escolha o horário..." /></SelectTrigger>
                <SelectContent>
                  {isLoading ? <div className="p-2">Carregando...</div> :
                   horariosDisponiveis.map(h => <SelectItem key={h.id} value={String(h.id)}>{new Date(h.horario_inicio).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>3. Seus Dados</Label>
              <Input placeholder="Seu nome completo" value={formData.clientName} onChange={(e) => handleFormChange('clientName', e.target.value)} required />
              <Input placeholder="Seu WhatsApp" value={formData.clientPhone} onChange={(e) => handleFormChange('clientPhone', e.target.value)} required />
            </div>
        </CardContent>

        <CardFooter>
          <Button type="submit" className="w-full" disabled={isLoading || !formData.horarioDisponivel || !formData.clientName || !formData.clientPhone}>
            {isLoading ? "Aguarde..." : "Confirmar Agendamento"}
          </Button>
        </CardFooter>
      </Card>
    </form>
  )
}
