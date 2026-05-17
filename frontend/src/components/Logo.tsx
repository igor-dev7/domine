type Variante = 'completo' | 'icone';
type Cor = 'branca' | 'degrade';

interface LogoProps {
  variant?: Variante;
  cor?: Cor;
  height?: number;
  className?: string;
}

// Aspect ratios reais dos SVGs (largura / altura).
const ASPECT: Record<Variante, number> = {
  completo: 1498 / 249, // ~6.016
  icone: 1, // 241 / 241
};

const SRC: Record<`${Variante}-${Cor}`, string> = {
  'completo-branca': '/logos/logo-completo-branca.svg',
  'completo-degrade': '/logos/logo-completo-colorido.svg',
  'icone-branca': '/logos/icone-branca.svg',
  'icone-degrade': '/logos/icone-degrade.svg',
};

export function Logo({
  variant = 'completo',
  cor = 'branca',
  height = 24,
  className,
}: LogoProps) {
  const src = SRC[`${variant}-${cor}`];
  const width = Math.round(height * ASPECT[variant]);
  return (
    <img
      src={src}
      alt="Domine"
      height={height}
      width={width}
      style={{ height, width }}
      className={className}
      draggable={false}
    />
  );
}
