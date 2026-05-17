import { useEffect, useMemo, useState } from 'react';
import { Calendar, ChevronLeft, ChevronRight, X } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';

const MES_LABEL = [
  'Janeiro',
  'Fevereiro',
  'Março',
  'Abril',
  'Maio',
  'Junho',
  'Julho',
  'Agosto',
  'Setembro',
  'Outubro',
  'Novembro',
  'Dezembro',
];

const DIA_LABEL = ['D', 'S', 'T', 'Q', 'Q', 'S', 'S'];

// Parse e formatação no fuso local — evita o off-by-one de `new Date('YYYY-MM-DD')` (UTC).
function parseISO(valor?: string | null): Date | null {
  if (!valor) return null;
  const [ano, mes, dia] = valor.split('-').map(Number);
  if (!ano || !mes || !dia) return null;
  return new Date(ano, mes - 1, dia);
}

function toISO(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

const dataFmt = new Intl.DateTimeFormat('pt-BR', {
  day: '2-digit',
  month: '2-digit',
  year: 'numeric',
});

export interface DatePickerProps {
  value?: string | null;
  onChange?: (valor: string | null) => void;
  placeholder?: string;
  id?: string;
  className?: string;
  disabled?: boolean;
  /** Permite limpar o valor selecionado. Default: true. */
  permiteLimpar?: boolean;
}

export function DatePicker({
  value,
  onChange,
  placeholder = 'Selecione uma data',
  id,
  className,
  disabled,
  permiteLimpar = true,
}: DatePickerProps) {
  const selecionada = useMemo(() => parseISO(value), [value]);
  const hoje = useMemo(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  }, []);

  const [open, setOpen] = useState(false);
  const [cursor, setCursor] = useState<Date>(selecionada ?? hoje);

  // Reposiciona o cursor pro mês da data selecionada toda vez que o popover abre.
  useEffect(() => {
    if (open) setCursor(selecionada ?? hoje);
  }, [open, selecionada, hoje]);

  const ano = cursor.getFullYear();
  const mes = cursor.getMonth();

  const dias = useMemo(() => {
    const primeiroDia = new Date(ano, mes, 1);
    const ultimoDia = new Date(ano, mes + 1, 0);
    const offset = primeiroDia.getDay();
    const out: { date: Date; isCurrentMonth: boolean }[] = [];
    for (let i = offset; i > 0; i--) {
      out.push({ date: new Date(ano, mes, 1 - i), isCurrentMonth: false });
    }
    for (let d = 1; d <= ultimoDia.getDate(); d++) {
      out.push({ date: new Date(ano, mes, d), isCurrentMonth: true });
    }
    // completa última semana
    let extra = 1;
    while (out.length % 7 !== 0) {
      out.push({ date: new Date(ano, mes + 1, extra++), isCurrentMonth: false });
    }
    return out;
  }, [ano, mes]);

  const formatado = selecionada ? dataFmt.format(selecionada) : '';

  function selecionarDia(d: Date) {
    onChange?.(toISO(d));
    setOpen(false);
  }

  function limpar(e: React.MouseEvent) {
    e.stopPropagation();
    e.preventDefault();
    onChange?.(null);
  }

  return (
    <DropdownMenu open={open} onOpenChange={(o) => !disabled && setOpen(o)}>
      <DropdownMenuTrigger asChild>
        <button
          id={id}
          type="button"
          disabled={disabled}
          aria-label={selecionada ? `Data selecionada: ${formatado}` : placeholder}
          className={cn(
            'flex h-10 w-full items-center justify-between gap-2 rounded-md border border-hairline bg-canvas-soft px-3 text-sm transition-colors',
            'hover:border-primary/40 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30',
            'disabled:cursor-not-allowed disabled:opacity-60',
            !selecionada && 'text-mute',
            selecionada && 'text-ink',
            className,
          )}
        >
          <span className="flex min-w-0 items-center gap-2">
            <Calendar className="h-4 w-4 shrink-0 text-mute" />
            <span className="truncate">{selecionada ? formatado : placeholder}</span>
          </span>
          {selecionada && permiteLimpar && !disabled && (
            <span
              role="button"
              tabIndex={-1}
              aria-label="Limpar data"
              onClick={limpar}
              className="rounded-sm p-0.5 text-mute transition-colors hover:bg-[#2a2a2a] hover:text-ink"
            >
              <X className="h-3.5 w-3.5" />
            </span>
          )}
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="start" className="w-[296px] p-3">
        {/* Cabeçalho mês/ano + navegação */}
        <div className="flex items-center justify-between pb-2">
          <button
            type="button"
            onClick={() => setCursor(new Date(ano, mes - 1, 1))}
            aria-label="Mês anterior"
            className="inline-flex h-7 w-7 items-center justify-center rounded-md text-mute transition-colors hover:bg-[#3a3a3a] hover:text-ink"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <div className="text-sm font-semibold text-ink-strong">
            {MES_LABEL[mes]} <span className="font-normal text-mute">{ano}</span>
          </div>
          <button
            type="button"
            onClick={() => setCursor(new Date(ano, mes + 1, 1))}
            aria-label="Próximo mês"
            className="inline-flex h-7 w-7 items-center justify-center rounded-md text-mute transition-colors hover:bg-[#3a3a3a] hover:text-ink"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>

        {/* Cabeçalho dias da semana */}
        <div className="grid grid-cols-7 gap-1 pb-1">
          {DIA_LABEL.map((d, i) => (
            <div
              key={i}
              className="flex h-7 items-center justify-center text-[10px] font-semibold uppercase tracking-wider text-mute/70"
            >
              {d}
            </div>
          ))}
        </div>

        {/* Grid de dias */}
        <div className="grid grid-cols-7 gap-1">
          {dias.map(({ date, isCurrentMonth }, i) => {
            const isToday = date.getTime() === hoje.getTime();
            const isSelected =
              selecionada != null && date.getTime() === selecionada.getTime();
            return (
              <button
                key={i}
                type="button"
                onClick={() => selecionarDia(date)}
                className={cn(
                  'inline-flex h-9 w-9 items-center justify-center rounded-md text-sm transition-colors',
                  isCurrentMonth ? 'text-body' : 'text-mute/40',
                  !isSelected && 'hover:bg-[#3a3a3a] hover:text-ink',
                  isToday &&
                    !isSelected &&
                    'border border-primary/40 text-ink',
                  isSelected && 'bg-primary text-on-primary hover:bg-primary',
                )}
              >
                {date.getDate()}
              </button>
            );
          })}
        </div>

        {/* Rodapé */}
        <div className="mt-3 flex items-center justify-between border-t border-[#3a3a3a] pt-2.5">
          <button
            type="button"
            onClick={() => selecionarDia(hoje)}
            className="text-xs font-medium text-primary transition-colors hover:underline"
          >
            Hoje
          </button>
          {selecionada && permiteLimpar && (
            <button
              type="button"
              onClick={() => {
                onChange?.(null);
                setOpen(false);
              }}
              className="text-xs font-medium text-mute transition-colors hover:text-ink"
            >
              Limpar
            </button>
          )}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
