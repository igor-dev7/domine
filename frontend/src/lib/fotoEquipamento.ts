import type { TipoEquipamento } from '@/types';

// PNGs transparentes hospedados em frontend/public/equipamentos/.
const BASE = '/equipamentos';

function normalizar(texto: string): string {
  return texto
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '');
}

/**
 * Resolve a foto local pelo tipo, com discriminação Apple/não-Apple para
 * notebooks e celulares e por palavra-chave de modelo para periféricos.
 * Retorna `null` apenas para `OUTRO` (caller mostra ícone fallback).
 */
export function fotoDoEquipamento(eq: {
  tipo: TipoEquipamento;
  marca: string;
  modelo: string;
}): string | null {
  const chave = normalizar(`${eq.marca} ${eq.modelo}`);
  const isApple = /apple|macbook|iphone|ipad|imac|airpods/.test(chave);

  switch (eq.tipo) {
    case 'NOTEBOOK':
      return `${BASE}/${isApple ? 'macbook' : 'windows'}.png`;
    case 'DESKTOP':
      return `${BASE}/desktop.png`;
    case 'MONITOR':
      return `${BASE}/monitor.png`;
    case 'IMPRESSORA':
      return `${BASE}/impressora.png`;
    case 'CELULAR':
      return `${BASE}/${isApple ? 'iphone' : 'android'}.png`;
    case 'PERIFERICO':
      if (/teclado|keyboard/.test(chave)) return `${BASE}/teclado.png`;
      if (/mouse/.test(chave)) return `${BASE}/mouse.png`;
      if (/fone|headset|headphone|earphone|audio/.test(chave)) {
        return `${BASE}/fone.png`;
      }
      return `${BASE}/mouse.png`;
    case 'OUTRO':
      return null;
  }
}
