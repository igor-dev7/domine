import type { CategoriaChamado } from '@/types';

export type CategoriaArtigo = 'Hardware' | 'Software' | 'Rede' | 'Acesso' | 'Outros';

export interface Artigo {
  id: number;
  titulo: string;
  resumo: string;
  categoria: CategoriaArtigo;
  autor: string;
  visualizacoes: number;
  uteis: number;
  criadoEm: string;
}

export const ARTIGOS: Artigo[] = [
  {
    id: 1,
    titulo: 'Como resetar a senha do Wi-Fi corporativo',
    resumo:
      'Passo a passo pra trocar a senha do roteador principal sem derrubar a rede do escritório. Inclui janela de manutenção sugerida.',
    categoria: 'Rede',
    autor: 'Admin Domine',
    visualizacoes: 312,
    uteis: 47,
    criadoEm: '2026-04-22',
  },
  {
    id: 2,
    titulo: 'Instalação do Microsoft Office via portal corporativo',
    resumo:
      'Procedimento oficial pra novos colaboradores instalarem o pacote Office com a licença do plano Microsoft 365 da empresa.',
    categoria: 'Software',
    autor: 'Bruno Lima',
    visualizacoes: 264,
    uteis: 38,
    criadoEm: '2026-04-30',
  },
  {
    id: 3,
    titulo: 'Solicitação de acesso a sistemas internos',
    resumo:
      'Fluxo de aprovação pra liberar acesso a ERP, CRM e ferramentas restritas. Inclui matriz RACI e SLA típico de 1 dia útil.',
    categoria: 'Acesso',
    autor: 'Ana Costa',
    visualizacoes: 189,
    uteis: 29,
    criadoEm: '2026-05-02',
  },
  {
    id: 4,
    titulo: 'Diagnóstico de problemas comuns no notebook Dell Latitude',
    resumo:
      'Checklist rápido pra triagem antes de abrir chamado: bateria, drivers, ventilação e indicadores de hardware.',
    categoria: 'Hardware',
    autor: 'Admin Domine',
    visualizacoes: 152,
    uteis: 22,
    criadoEm: '2026-05-05',
  },
  {
    id: 5,
    titulo: 'Configuração de e-mail corporativo no celular pessoal',
    resumo:
      'Tutorial passo a passo pra Android e iOS, com aplicação de perfil MDM e ativação de PIN obrigatório.',
    categoria: 'Software',
    autor: 'Carla Mendes',
    visualizacoes: 198,
    uteis: 31,
    criadoEm: '2026-05-08',
  },
  {
    id: 6,
    titulo: 'O que fazer se sua impressora não imprime',
    resumo:
      'Lista de causas comuns (driver, fila travada, IP duplicado) e como resolver antes de abrir chamado pra TI.',
    categoria: 'Hardware',
    autor: 'Bruno Lima',
    visualizacoes: 174,
    uteis: 28,
    criadoEm: '2026-05-10',
  },
  {
    id: 7,
    titulo: 'Boas práticas de segurança da informação',
    resumo:
      'Política da empresa: senhas, 2FA, dispositivos pessoais, phishing e canais de denúncia.',
    categoria: 'Outros',
    autor: 'Admin Domine',
    visualizacoes: 421,
    uteis: 67,
    criadoEm: '2026-04-15',
  },
  {
    id: 8,
    titulo: 'VPN corporativa: instalação e troubleshooting',
    resumo:
      'Como instalar o cliente VPN, configurar perfil e resolver os erros mais comuns (timeout, DNS, certificado expirado).',
    categoria: 'Rede',
    autor: 'Ana Costa',
    visualizacoes: 245,
    uteis: 35,
    criadoEm: '2026-04-28',
  },
];

// Mapeia a categoria do chamado pra categoria do artigo.
const MAP_CATEGORIA: Record<CategoriaChamado, CategoriaArtigo> = {
  HARDWARE: 'Hardware',
  SOFTWARE: 'Software',
  REDE: 'Rede',
  ACESSO: 'Acesso',
  EMAIL: 'Software',
  IMPRESSAO: 'Hardware',
  OUTRO: 'Outros',
};

const STOP_WORDS = new Set([
  'a', 'as', 'o', 'os', 'um', 'uma', 'uns', 'umas', 'de', 'da', 'do', 'das', 'dos',
  'em', 'no', 'na', 'nos', 'nas', 'pra', 'para', 'por', 'com', 'sem', 'sob', 'sobre',
  'que', 'e', 'ou', 'mas', 'se', 'meu', 'minha', 'seu', 'sua', 'meus', 'minhas',
  'ao', 'aos', 'à', 'foi', 'esta', 'estao', 'tem', 'ter', 'pode', 'qual', 'quais',
  'nao', 'ja', 'so', 'mais',
]);

function tokens(texto: string): string[] {
  return texto
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .split(/[^a-z0-9]+/)
    .filter((t) => t.length > 2 && !STOP_WORDS.has(t));
}

/**
 * Sugere até `limite` artigos da KB relevantes para um chamado.
 * Ranking: categoria correspondente vale +5, cada termo do título/descrição
 * que aparece no título/resumo do artigo vale +1.
 */
export function sugerirArtigos(
  chamado: { categoria: CategoriaChamado; titulo: string; descricao?: string | null },
  limite = 3,
): Artigo[] {
  const catAlvo = MAP_CATEGORIA[chamado.categoria];
  const termos = new Set([
    ...tokens(chamado.titulo ?? ''),
    ...tokens(chamado.descricao ?? ''),
  ]);

  const ranqueados = ARTIGOS.map((a) => {
    let score = 0;
    if (a.categoria === catAlvo) score += 5;
    const corpus = (a.titulo + ' ' + a.resumo).toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
    termos.forEach((t) => {
      if (corpus.includes(t)) score += 1;
    });
    return { artigo: a, score };
  })
    .filter((x) => x.score > 0)
    .sort((a, b) => b.score - a.score);

  return ranqueados.slice(0, limite).map((x) => x.artigo);
}
