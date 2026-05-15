import { useMemo, useState } from 'react';
import { Eye, FileText, Plus, Search, ThumbsUp } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { formatarData } from '@/lib/format';
import { cn } from '@/lib/utils';

type CategoriaArtigo = 'Hardware' | 'Software' | 'Rede' | 'Acesso' | 'Outros';

interface Artigo {
  id: number;
  titulo: string;
  resumo: string;
  categoria: CategoriaArtigo;
  autor: string;
  visualizacoes: number;
  uteis: number;
  criadoEm: string;
}

const ARTIGOS: Artigo[] = [
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

const CATEGORIAS: { valor: CategoriaArtigo | 'TODAS'; label: string; cor: string }[] = [
  { valor: 'TODAS', label: 'Todas', cor: 'border-hairline bg-canvas-soft text-body' },
  {
    valor: 'Hardware',
    label: 'Hardware',
    cor: 'border-amber-500/40 bg-amber-500/10 text-amber-300',
  },
  {
    valor: 'Software',
    label: 'Software',
    cor: 'border-blue-500/40 bg-blue-500/10 text-blue-300',
  },
  { valor: 'Rede', label: 'Rede', cor: 'border-emerald-500/40 bg-emerald-500/10 text-emerald-300' },
  { valor: 'Acesso', label: 'Acesso', cor: 'border-orange-500/40 bg-orange-500/10 text-orange-300' },
  { valor: 'Outros', label: 'Outros', cor: 'border-mute/40 bg-canvas-soft text-mute' },
];

export function BaseConhecimento() {
  const [categoria, setCategoria] = useState<CategoriaArtigo | 'TODAS'>('TODAS');
  const [busca, setBusca] = useState('');

  const artigos = useMemo(() => {
    const buscaLower = busca.toLowerCase();
    return ARTIGOS.filter((a) => {
      const passaCategoria = categoria === 'TODAS' || a.categoria === categoria;
      const passaBusca =
        !busca ||
        a.titulo.toLowerCase().includes(buscaLower) ||
        a.resumo.toLowerCase().includes(buscaLower);
      return passaCategoria && passaBusca;
    });
  }, [categoria, busca]);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">
            Conhecimento
          </p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight text-ink-strong">
            Base de conhecimento
          </h1>
          <p className="mt-2 max-w-3xl text-sm text-body">
            Artigos e procedimentos internos. Self-service pros colaboradores reduz volume de
            chamados repetidos.
          </p>
        </div>
        <Button onClick={() => toast.info('Editor de artigos em breve.')}>
          <Plus className="mr-2 h-4 w-4" />
          Novo artigo
        </Button>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <div className="relative min-w-[260px] flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-mute" />
          <Input
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            placeholder="Buscar artigos pelo título ou resumo"
            className="pl-9"
          />
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        {CATEGORIAS.map((c) => (
          <button
            key={c.valor}
            type="button"
            onClick={() => setCategoria(c.valor)}
            className={cn(
              'inline-flex items-center rounded-full border px-3 py-1 text-xs font-medium uppercase tracking-wider transition-all',
              categoria === c.valor
                ? c.cor
                : 'border-hairline bg-transparent text-mute hover:border-hairline-soft hover:text-ink',
            )}
          >
            {c.label}
          </button>
        ))}
      </div>

      {artigos.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-sm text-mute">
            Nenhum artigo encontrado.
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {artigos.map((art) => {
            const corCategoria = CATEGORIAS.find((c) => c.valor === art.categoria)?.cor;
            return (
              <button
                key={art.id}
                type="button"
                onClick={() => toast.info(`Abrindo artigo: "${art.titulo}" (página em breve).`)}
                className="group flex h-full flex-col rounded-md border border-hairline bg-canvas-soft p-5 text-left transition-all hover:border-primary/40 hover:bg-canvas"
              >
                <div className="flex items-start gap-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-sm border border-hairline text-primary">
                    <FileText className="h-4 w-4" />
                  </div>
                  <span
                    className={cn(
                      'inline-flex items-center rounded-sm border px-2 py-0.5 text-xs font-semibold uppercase tracking-wider',
                      corCategoria,
                    )}
                  >
                    {art.categoria}
                  </span>
                </div>
                <h3 className="mt-3 text-sm font-semibold text-ink transition-colors group-hover:text-primary">
                  {art.titulo}
                </h3>
                <p className="mt-2 line-clamp-3 flex-1 text-sm text-body">{art.resumo}</p>
                <div className="mt-4 flex items-center justify-between border-t border-hairline pt-3 text-xs text-mute">
                  <span>{art.autor}</span>
                  <span>{formatarData(art.criadoEm)}</span>
                </div>
                <div className="mt-2 flex items-center gap-3 text-xs text-mute">
                  <span className="flex items-center gap-1">
                    <Eye className="h-3 w-3" />
                    {art.visualizacoes}
                  </span>
                  <span className="flex items-center gap-1">
                    <ThumbsUp className="h-3 w-3" />
                    {art.uteis} úteis
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
