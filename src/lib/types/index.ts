// types/index.ts

/**
 * Representa um serviço oferecido pelo salão.
 * Corresponde à tabela 'servicos' no Supabase.
 */
export interface Servico {
  id: number;
  nome: string;
  descricao: string | null; // A descrição pode ser nula
  preco: number;
  duracao_minutos: number;
  created_at: string; // Supabase retorna timestamps como strings ISO 8601
}

/**
 * Define os possíveis status de um agendamento.
 * Corresponde ao tipo ENUM 'status_agendamento' no Supabase.
 */
export type StatusAgendamento = 'confirmado' | 'cancelado' | 'concluido';

/**
 * Representa um agendamento no sistema.
 * Corresponde à tabela 'agendamentos' no Supabase.
 */
export interface Agendamento {
  id: number;
  id_servico: number;
  horario_inicio: string;
  horario_fim: string;
  nome_cliente: string;
  telefone_cliente: string;
  status: StatusAgendamento;
  created_at: string;
}