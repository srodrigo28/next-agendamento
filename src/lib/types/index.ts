// types/index.ts

// ... (outros tipos permanecem os mesmos)

export type StatusAgendamento = 'confirmado' | 'cancelado' | 'concluido';
export type StatusHorario = 'disponivel' | 'reservado';

export interface Profissional {
  id: number;
  nome: string;
  foto_url: string | null;
  created_at: string;
}

export interface Servico {
  id: number;
  nome: string;
  descricao: string | null;
  preco: number;
  duracao_minutos: number;
  created_at: string;
}

export interface HorarioDisponivel {
  id: number;
  id_profissional: number;
  horario_inicio: string;
  status: StatusHorario;
  created_at: string;
}

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

// ==================================================================
// A CORREÇÃO ESTÁ AQUI
// ==================================================================
/**
 * Representa um agendamento com o nome do serviço e o telefone do cliente.
 * Removemos 'telefone_cliente' da lista de campos a serem omitidos.
 */
export type AgendamentoComServico = Omit<Agendamento, 'id_servico' | 'horario_fim'> & {
  servicos: {
    nome: string;
  } | null;
};
