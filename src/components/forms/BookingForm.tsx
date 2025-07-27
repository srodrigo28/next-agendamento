// components/forms/BookingForm.tsx (MODIFICADO)
"use client"

import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Servico } from "@/lib/types"

import React from "react"

// Tipos simples para este componente
type Profissional = { id: number; nome: string; };
type HorarioDisponivel = { id: number; horario_inicio: string; status: 'disponivel' | 'reservado'; };

interface BookingFormProps {
  servicos: Servico[];
  profissionais: Profissional[]; // Adicionamos profissionais aqui
}

export function BookingForm({ servicos, profissionais }: BookingFormProps) {
  const [formData, setFormData] = React.useState({
    professionalId: null as string | null,
    service: null as Servico | null,
    date: new Date() as Date | undefined,
    horarioDisponivel: null as HorarioDisponivel | null,
    clientName: '',
    clientPhone: ''
  });

  const [horariosDisponiveis, setHorariosDisponiveis] = React.useState<HorarioDisponivel[]>([]);
  const [isLoading, setIsLoading] = React.useState(false);

  // Busca os horários disponíveis
  React.useEffect(() => {
    if (!formData.date || !formData.professionalId) return;

    setIsLoading(true);
    const dateString = formData.date!.toISOString().split('T')[0];
    fetch(`/api/horarios?professionalId=${formData.professionalId}&date=${dateString}`)
      .then(res => res.json())
      .then(data => {
        // Filtra para mostrar apenas os disponíveis
        setHorariosDisponiveis(data.filter((h: HorarioDisponivel) => h.status === 'disponivel'));
        setIsLoading(false);
      });
  }, [formData.date, formData.professionalId]);

  const handleFormChange = <T extends keyof typeof formData>(key: T, value: (typeof formData)[T]) => {
    setFormData(prev => ({ ...prev, [key]: value, horarioDisponivel: null }));
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

      if (!response.ok) throw new Error("Ocorreu um erro ao agendar.");
      
      alert("Agendamento realizado com sucesso!");
      // Remove o horário agendado da lista de disponíveis
      setHorariosDisponiveis(prev => prev.filter(h => h.id !== horarioDisponivel.id));
      setFormData(prev => ({ ...prev, horarioDisponivel: null, clientName: '', clientPhone: '' }));

    } catch (error) {
      alert((error as Error).message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <Card className="w-full max-w-4xl">
        <CardHeader><CardTitle>Faça seu Agendamento</CardTitle></CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-6">
            <div className="space-y-2">
              <Label>1. Escolha o Profissional</Label>
              <Select onValueChange={(id) => handleFormChange('professionalId', id)}>
                <SelectTrigger><SelectValue placeholder="Selecione..." /></SelectTrigger>
                <SelectContent>
                  {profissionais.map(p => <SelectItem key={p.id} value={String(p.id)}>{p.nome}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>2. Escolha o Serviço</Label>
              <Select onValueChange={(serviceId) => handleFormChange('service', servicos.find(s => s.id === Number(serviceId)) || null)}>
                <SelectTrigger><SelectValue placeholder="Selecione..." /></SelectTrigger>
                <SelectContent>
                  {servicos.map(s => <SelectItem key={s.id} value={String(s.id)}>{s.nome}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-4">
              <div className="space-y-2">
                  <Label>3. Seu Nome</Label>
                  <Input value={formData.clientName} onChange={(e) => handleFormChange('clientName', e.target.value)} required />
              </div>
              <div className="space-y-2">
                  <Label>4. Seu WhatsApp</Label>
                  <Input value={formData.clientPhone} onChange={(e) => handleFormChange('clientPhone', e.target.value)} required />
              </div>
            </div>
          </div>
          <div className="space-y-6">
            <div className="space-y-2">
              <Label>5. Escolha a Data e Horário</Label>
              <Calendar mode="single" selected={formData.date} onSelect={(d) => handleFormChange('date', d)} className="rounded-md border" />
            </div>
            <div className="space-y-2">
              <Label>Horários Disponíveis</Label>
              <div className="grid grid-cols-4 gap-2">
                {isLoading ? <p>Carregando...</p> : 
                 horariosDisponiveis.length > 0 ? horariosDisponiveis.map((h) => (
                  <Button type="button" key={h.id}
                    variant={formData.horarioDisponivel?.id === h.id ? "default" : "outline"}
                    onClick={() => handleFormChange('horarioDisponivel', h)}>
                    {new Date(h.horario_inicio).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                  </Button>
                )) : <p className="text-xs text-gray-500 col-span-4">Nenhum horário disponível.</p>}
              </div>
            </div>
          </div>
        </CardContent>
        <CardFooter>
          <Button type="submit" className="w-full" disabled={isLoading || !formData.horarioDisponivel}>
            {isLoading ? "Agendando..." : "Confirmar Agendamento"}
          </Button>
        </CardFooter>
      </Card>
    </form>
  )
}
