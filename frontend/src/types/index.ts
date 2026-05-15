export type PerfilUsuario = 'ADMIN' | 'COMUM';

export type StatusChamado =
  | 'ABERTO'
  | 'EM_ATENDIMENTO'
  | 'AGUARDANDO_USUARIO'
  | 'RESOLVIDO'
  | 'FECHADO';

export type PrioridadeChamado = 'BAIXA' | 'MEDIA' | 'ALTA' | 'CRITICA';

export type CategoriaChamado =
  | 'HARDWARE'
  | 'SOFTWARE'
  | 'REDE'
  | 'ACESSO'
  | 'EMAIL'
  | 'IMPRESSAO'
  | 'OUTRO';

export type TipoEquipamento =
  | 'NOTEBOOK'
  | 'DESKTOP'
  | 'MONITOR'
  | 'IMPRESSORA'
  | 'CELULAR'
  | 'PERIFERICO'
  | 'OUTRO';

export type StatusEquipamento = 'EM_USO' | 'ESTOQUE' | 'MANUTENCAO' | 'BAIXADO';

export type TipoEventoHistorico =
  | 'CRIADO'
  | 'STATUS_ALTERADO'
  | 'TECNICO_ATRIBUIDO'
  | 'PRIORIDADE_ALTERADA'
  | 'COMENTARIO_ADICIONADO';

export interface UsuarioMin {
  id: number;
  nome: string;
  email: string;
  perfil: PerfilUsuario;
}

export interface UsuarioResponse {
  id: number;
  nome: string;
  email: string;
  telefone: string | null;
  departamento: string | null;
  perfil: PerfilUsuario;
  ativo: boolean;
  criadoEm: string;
  atualizadoEm: string;
}

export interface LoginRequest {
  email: string;
  senha: string;
}

export interface LoginResponse {
  token: string;
  usuario: UsuarioMin;
}

export interface ErroResponse {
  timestamp: string;
  status: number;
  erro: string;
  mensagens: string[];
}

export interface ComentarioResponse {
  id: number;
  texto: string;
  autorId: number;
  autorNome: string;
  criadoEm: string;
}

export interface ComentarioRequest {
  texto: string;
}

export interface HistoricoResponse {
  id: number;
  tipoEvento: TipoEventoHistorico;
  descricao: string;
  autorId: number | null;
  autorNome: string | null;
  criadoEm: string;
}

export interface ChamadoResponse {
  id: number;
  titulo: string;
  descricao: string;
  categoria: CategoriaChamado;
  prioridade: PrioridadeChamado;
  status: StatusChamado;
  solicitanteId: number;
  solicitanteNome: string;
  tecnicoResponsavelId: number | null;
  tecnicoResponsavelNome: string | null;
  equipamentoId: number | null;
  equipamentoPatrimonio: string | null;
  resolvidoEm: string | null;
  criadoEm: string;
  atualizadoEm: string;
  comentarios: ComentarioResponse[];
}

export interface ChamadoRequest {
  titulo: string;
  descricao: string;
  categoria: CategoriaChamado;
  prioridade: PrioridadeChamado;
  equipamentoId?: number | null;
}

export interface ChamadoUpdateRequest {
  titulo: string;
  descricao: string;
  categoria?: CategoriaChamado | null;
  prioridade?: PrioridadeChamado | null;
  equipamentoId?: number | null;
}

export interface DashboardResponse {
  totalAbertos: number;
  totalEmAtendimento: number;
  totalResolvidosMes: number;
  porPrioridade: Record<string, number>;
  porCategoria: Record<string, number>;
}

export interface EquipamentoResponse {
  id: number;
  patrimonio: string;
  tipo: TipoEquipamento;
  marca: string;
  modelo: string;
  numeroSerie: string | null;
  localizacao: string | null;
  status: StatusEquipamento;
  responsavelId: number | null;
  responsavelNome: string | null;
  dataAquisicao: string | null;
  observacoes: string | null;
  criadoEm: string;
  atualizadoEm: string;
}

export interface SpringPage<T> {
  content: T[];
  number: number;
  size: number;
  totalElements: number;
  totalPages: number;
  first: boolean;
  last: boolean;
  numberOfElements: number;
  empty: boolean;
}

export interface ChamadoFiltro {
  status?: StatusChamado | null;
  prioridade?: PrioridadeChamado | null;
  categoria?: CategoriaChamado | null;
  tecnicoResponsavelId?: number | null;
  busca?: string | null;
  page?: number;
  size?: number;
}
