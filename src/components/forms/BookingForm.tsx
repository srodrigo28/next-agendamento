// components/forms/BookingForm.tsx

"use client"

import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Agendamento, Servico } from "@/lib/types"
import React from "react"

// Propriedades que o componente espera receber
interface BookingFormProps {
  servicos: Servico[];
}

export function BookingForm({ servicos }: BookingFormProps) {
  // Estado único para gerenciar todos os dados do formulário
  const [formData, setFormData] = React.useState({
    service: null as Servico | null,
    date: new Date() as Date | undefined,
    time: null as string | null,
    clientName: '',
    clientPhone: ''
  });

  const [agendamentosDoDia, setAgendamentosDoDia] = React.useState<Agendamento[]>([]);
  const [isLoading, setIsLoading] = React.useState(false);

  // Efeito que busca os agendamentos do dia sempre que a data é alterada
  React.useEffect(() => {
    if (!formData.date) return;

    const fetchAgendamentos = async () => {
      setIsLoading(true);
      const dateString = formData.date!.toISOString().split('T')[0];
      try {
        const response = await fetch(`/api/agendamentos?date=${dateString}`);
        if (!response.ok) throw new Error("Erro ao buscar horários");
        const data = await response.json();
        const sortedData = data.sort((a: Agendamento, b: Agendamento) => 
          new Date(a.horario_inicio).getTime() - new Date(b.horario_inicio).getTime()
        );
        setAgendamentosDoDia(sortedData);
      } catch (error) {
        console.error(error);
        setAgendamentosDoDia([]); // Limpa em caso de erro
      } finally {
        setIsLoading(false);
      }
    };

    fetchAgendamentos();
  }, [formData.date]);

  // Lógica para gerar os horários disponíveis, já filtrando os ocupados
  const horariosDisponiveis = React.useMemo(() => {
    if (!formData.date || !formData.service) return [];
    
    const HORA_INICIO = 9, HORA_FIM = 18, INTERVALO_MINUTOS = 30;
    const slots: string[] = [];
    const inicio = new Date(formData.date);
    inicio.setHours(HORA_INICIO, 0, 0, 0);
    const fim = new Date(formData.date);
    fim.setHours(HORA_FIM, 0, 0, 0);

    while (inicio < fim) {
      slots.push(inicio.toTimeString().substring(0, 5));
      inicio.setMinutes(inicio.getMinutes() + INTERVALO_MINUTOS);
    }
    
    return slots.filter(slot => {
      const [hour, minute] = slot.split(':').map(Number);
      const slotTime = new Date(formData.date!);
      slotTime.setHours(hour, minute, 0, 0);

      const slotEndTime = new Date(slotTime);
      slotEndTime.setMinutes(slotEndTime.getMinutes() + formData.service!.duracao_minutos);

      return !agendamentosDoDia.some(agendamento => {
        const agendamentoInicio = new Date(agendamento.horario_inicio);
        const agendamentoFim = new Date(agendamento.horario_fim);
        return slotEndTime > agendamentoInicio && slotTime < agendamentoFim;
      });
    });
  }, [formData.date, formData.service, agendamentosDoDia]);

  // Função genérica para atualizar o estado do formulário
  const handleFormChange = <T extends keyof typeof formData>(key: T, value: (typeof formData)[T]) => {
    setFormData(prev => ({
      ...prev,
      [key]: value,
      ...( (key === 'service' || key === 'date') && { time: null } )
    }));
  };
  
  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsLoading(true);

    const { service, date, time, clientName, clientPhone } = formData;

    if (!service || !date || !time || !clientName || !clientPhone) {
      alert("Por favor, preencha todos os campos.");
      setIsLoading(false);
      return;
    }

    const [hours, minutes] = time.split(':').map(Number);
    const appointmentDateTime = new Date(date);
    appointmentDateTime.setHours(hours, minutes, 0, 0);

    try {
      const response = await fetch('/api/agendar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          serviceId: service.id,
          dateTime: appointmentDateTime.toISOString(),
          clientName: clientName,
          clientPhone: clientPhone,
          serviceDuration: service.duracao_minutos,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Ocorreu um erro ao agendar.");
      }
      
      const newAppointment = await response.json();
      alert("Agendamento realizado com sucesso!");
      
      setAgendamentosDoDia(prev => [...prev, newAppointment.data].sort((a, b) => 
        new Date(a.horario_inicio).getTime() - new Date(b.horario_inicio).getTime()
      ));

      handleFormChange('time', null);
      handleFormChange('clientName', '');
      handleFormChange('clientPhone', '');

    } catch (error) {
      console.error("Falha no agendamento:", error);
      alert((error as Error).message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <Card className="w-full max-w-4xl">
        <CardHeader>
          <CardTitle>Faça seu Agendamento</CardTitle>
          <CardDescription>Escolha o serviço, a data e o horário para continuar.</CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Coluna da Esquerda: Seleção de Serviço e Dados do Cliente */}
          <div className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="service">1. Escolha o Serviço</Label>
              <Select 
                onValueChange={(serviceId) => {
                  const servico = servicos.find(s => s.id === Number(serviceId)) || null;
                  handleFormChange('service', servico);
                }} 
                value={formData.service ? String(formData.service.id) : ""}
                disabled={servicos.length === 0}
              >
                <SelectTrigger id="service">
                  <SelectValue placeholder="Selecione o serviço desejado..." />
                </SelectTrigger>
                <SelectContent>
                  {servicos.map(servico => (
                    <SelectItem key={servico.id} value={String(servico.id)}>
                      {servico.nome} - R$ {servico.preco.toFixed(2)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-4">
              <div className="space-y-2">
                  <Label htmlFor="name">2. Seu Nome</Label>
                  <Input id="name" placeholder="Digite seu nome completo" value={formData.clientName} onChange={(e) => handleFormChange('clientName', e.target.value)} required />
              </div>
              <div className="space-y-2">
                  <Label htmlFor="phone">3. Seu WhatsApp</Label>
                  <Input id="phone" placeholder="(XX) XXXXX-XXXX" value={formData.clientPhone} onChange={(e) => handleFormChange('clientPhone', e.target.value)} required />
              </div>
            </div>
          </div>
          {/* Coluna da Direita: Calendário e Horários */}
          <div className="space-y-6">
            <div className="space-y-2">
              <Label>4. Escolha a Data e Horário</Label>
              <Calendar
                mode="single" 
                selected={formData.date} 
                onSelect={(newDate) => handleFormChange('date', newDate)}
                className="rounded-md border"
                disabled={(current) => current < new Date(new Date().setDate(new Date().getDate() - 1))}
              />
            </div>
            <div className="space-y-2">
              <Label>Horários Disponíveis</Label>
              <div className="grid grid-cols-4 gap-2">
                {isLoading ? <p className="text-xs col-span-4">Carregando...</p> : 
                 horariosDisponiveis.length > 0 ? horariosDisponiveis.map((time) => (
                  <Button
                    type="button" key={time}
                    variant={formData.time === time ? "default" : "outline"}
                    onClick={() => handleFormChange('time', time)}
                  >
                    {time}
                  </Button>
                )) : <p className="text-xs text-gray-500 col-span-4">Nenhum horário disponível para este serviço/data.</p>}
              </div>
            </div>
          </div>
        </CardContent>
        <CardFooter>
          <Button type="submit" className="w-full" disabled={isLoading || !formData.service || !formData.date || !formData.time}>
            {isLoading ? "Agendando..." : "Confirmar Agendamento"}
          </Button>
        </CardFooter>
      </Card>
    </form>
  )
}
