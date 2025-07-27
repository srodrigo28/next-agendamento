// types/index.ts

// ===================================
// TIPOS ENUM (Status)
// ===================================

/**
 * Define os possíveis status de um agendamento.
 * Corresponde ao ENUM 'status_agendamento' no Supabase.
 */
export type StatusAgendamento = 'confirmado' | 'cancelado' | 'concluido';

/**
 * Define os possíveis status de um horário disponível.
 * Corresponde ao ENUM 'status_horario' no Supabase.
 */
export type StatusHorario = 'disponivel' | 'reservado';


// ===================================
// INTERFACES BASE (Espelham as tabelas do DB)
// ===================================

/**
 * Representa a tabela 'profissionais'.
 */
export interface Profissional {
  id: number;
  nome: string;
  created_at: string;
}

/**
 * Representa a tabela 'servicos'.
 */
export interface Servico {
  id: number;
  nome: string;
  descricao: string | null;
  preco: number;
  duracao_minutos: number;
  created_at: string;
}

/**
 * Representa a tabela 'horarios_disponiveis'.
 */
export interface HorarioDisponivel {
  id: number;
  id_profissional: number;
  horario_inicio: string;
  status: StatusHorario;
  created_at: string;
}

/**
 * Representa a tabela 'agendamentos'.
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


// ===================================
// TIPOS DERIVADOS (Para Consultas e Componentes)
// ===================================

/**
 * Representa um agendamento quando ele é retornado com o nome do serviço junto (JOIN).
 * Usado na página 'meus-agendamentos'.
 */
export type AgendamentoComServico = Omit<Agendamento, 'id_servico' | 'horario_fim' | 'telefone_cliente'> & {
  servicos: {
    nome: string;
  } | null; // O serviço pode ter sido deletado, então pode ser nulo.
};
