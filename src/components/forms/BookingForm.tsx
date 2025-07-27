// components/forms/BookingForm.tsx
"use client"

import { useState, useEffect } from 'react';
import { Servico, Profissional, HorarioDisponivel } from "@/lib/types";
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface BookingFormProps {
  servicos: Servico[];
  profissionais: Profissional[];
}

export function BookingForm({ servicos, profissionais }: BookingFormProps) {
  const [step, setStep] = useState(1);
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

  // ==================================================================
  // A CORREÇÃO ESTÁ AQUI
  // ==================================================================
  const handleFormChange = <T extends keyof typeof formData>(key: T, value: (typeof formData)[T]) => {
    setFormData(prev => {
      const newState = { ...prev, [key]: value };
      // Reseta o horário APENAS se o profissional, serviço ou data mudarem.
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
      setFormData(prev => ({ ...prev, horarioDisponivel: null, clientName: '', clientPhone: '' }));
      setStep(1); // Volta para a primeira etapa após o sucesso

    } catch (error) {
      alert((error as Error).message);
    } finally {
      setIsLoading(false);
    }
  };

  // Lógica dos botões de navegação do wizard
  const nextStep = () => setStep(s => s + 1);
  const prevStep = () => setStep(s => s - 1);

  const isNextDisabled = () => {
    if (step === 1) return !formData.professionalId || !formData.service;
    if (step === 2) return !formData.horarioDisponivel;
    return false;
  }

  return (
    <form onSubmit={handleSubmit}>
      <Card className="w-full max-w-lg">
        <CardHeader>
          <CardTitle>Faça seu Agendamento</CardTitle>
          <CardDescription>Passo {step} de 3</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6 min-h-[300px]">
          {/* Etapa 1: Selecionar Profissional e Serviço */}
          {step === 1 && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>1. Escolha o Profissional</Label>
                <Select onValueChange={(id) => handleFormChange('professionalId', id)} value={formData.professionalId ?? undefined}>
                  <SelectTrigger><SelectValue placeholder="Selecione..." /></SelectTrigger>
                  <SelectContent>{profissionais.map(p => <SelectItem key={p.id} value={String(p.id)}>{p.nome}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>2. Escolha o Serviço</Label>
                <Select onValueChange={(id) => handleFormChange('service', servicos.find(s => s.id === Number(id)) || null)} value={formData.service ? String(formData.service.id) : undefined}>
                  <SelectTrigger><SelectValue placeholder="Selecione..." /></SelectTrigger>
                  <SelectContent>{servicos.map(s => <SelectItem key={s.id} value={String(s.id)}>{s.nome}</SelectItem>)}</SelectContent>
                </Select>
              </div>
            </div>
          )}

          {/* Etapa 2: Selecionar Data e Hora */}
          {step === 2 && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>3. Escolha a Data</Label>
                <Calendar mode="single" selected={formData.date} onSelect={(d) => handleFormChange('date', d)} className="rounded-md border mx-auto" />
              </div>
              <div className="space-y-2">
                <Label>Horários Disponíveis</Label>
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                  {isLoading ? <p>Carregando...</p> : 
                   horariosDisponiveis.length > 0 ? horariosDisponiveis.map((h) => (
                    <Button type="button" key={h.id} variant={formData.horarioDisponivel?.id === h.id ? "default" : "outline"} onClick={() => handleFormChange('horarioDisponivel', h)}>
                      {new Date(h.horario_inicio).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                    </Button>
                  )) : <p className="text-xs text-gray-500 col-span-full">Nenhum horário disponível.</p>}
                </div>
              </div>
            </div>
          )}

          {/* Etapa 3: Dados do Cliente */}
          {step === 3 && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">4. Seu Nome</Label>
                <Input id="name" value={formData.clientName} onChange={(e) => handleFormChange('clientName', e.target.value)} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">5. Seu WhatsApp</Label>
                <Input id="phone" value={formData.clientPhone} onChange={(e) => handleFormChange('clientPhone', e.target.value)} required />
              </div>
            </div>
          )}
        </CardContent>
        <CardFooter className="flex justify-between">
          {step > 1 ? <Button type="button" variant="outline" onClick={prevStep}>Voltar</Button> : <div></div>}
          {step < 3 ? <Button type="button" onClick={nextStep} disabled={isNextDisabled()}>Próximo</Button> : null}
          {step === 3 ? <Button type="submit" disabled={isLoading || !formData.clientName || !formData.clientPhone}>Confirmar Agendamento</Button> : null}
        </CardFooter>
      </Card>
    </form>
  )
}
