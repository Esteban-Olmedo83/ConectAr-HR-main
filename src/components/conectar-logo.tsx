import { SVGProps, HTMLAttributes } from 'react';

/**
 * @fileOverview Componente de Logo ConectAr HR
 * 
 * USO:
 *  - Logo en SVG con el Sol de Mayo integrado
 *  - Mantiene consistencia en login, header y sidebar
 *  - Soporta tamaños personalizados vía props
 */

interface ConectArLogoProps {
  /** Tamaño del logo: 'sm' (24px), 'md' (32px), 'lg' (48px), 'xl' (64px) */
  size?: 'sm' | 'md' | 'lg' | 'xl';
  /** Mostrar solo el ícono o también el texto */
  showText?: boolean;
  /** Clase CSS adicional para el contenedor */
  className?: string;
}

export function ConectArLogo({
  size = 'md',
  showText = true,
  className = '',
}: ConectArLogoProps) {
  const sizeMap = {
    sm: 24,
    md: 32,
    lg: 48,
    xl: 64,
  };

  const iconSize = sizeMap[size];
  const fontSize = size === 'sm' ? 'text-sm' : size === 'md' ? 'text-base' : size === 'lg' ? 'text-xl' : 'text-3xl';
  const subtextSize = size === 'sm' ? 'text-[6px]' : size === 'md' ? 'text-[8px]' : size === 'lg' ? 'text-[10px]' : 'text-xs';
  const sunSize = size === 'sm' ? 'w-3 h-3' : size === 'md' ? 'w-4 h-4' : size === 'lg' ? 'w-5 h-5' : 'w-6 h-6';

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      {/* Ícono "C" estilizado */}
      <svg
        width={iconSize}
        height={iconSize}
        viewBox="0 0 40 40"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="shrink-0"
      >
        {/* Fondo cuadrado redondeado */}
        <rect
          x="2"
          y="2"
          width="36"
          height="36"
          rx="8"
          fill="hsl(var(--primary))"
          className="drop-shadow-lg"
        />

        {/* Letra "C" estilizada */}
        <path
          d="M28 12H20C15.5817 12 12 15.5817 12 20V20C12 24.4183 15.5817 28 20 28H28"
          stroke="hsl(var(--primary-foreground))"
          strokeWidth="4"
          strokeLinecap="round"
        />

        {/* Sol de Mayo en la esquina superior derecha */}
        <g transform="translate(24, 4)">
          {Array.from({ length: 8 }).map((_, i) => {
            const angle = (i * 360) / 8 - 90;
            const rad = (angle * Math.PI) / 180;
            const isStraight = i % 2 === 0;
            const inner = 5.5;
            const outer = isStraight ? 9.75 : 7.75;
            const x1 = 10 + inner * Math.cos(rad);
            const y1 = 10 + inner * Math.sin(rad);
            const x2 = 10 + outer * Math.cos(rad);
            const y2 = 10 + outer * Math.sin(rad);
            return (
              <line
                key={i}
                x1={x1}
                y1={y1}
                x2={x2}
                y2={y2}
                stroke="hsl(45 95% 62%)"
                strokeWidth={isStraight ? "1.1" : "0.7"}
                strokeLinecap="round"
              />
            );
          })}
          <circle cx="10" cy="10" r="4.75" fill="hsl(45 95% 62%)" stroke="hsl(38 85% 42%)" strokeWidth="0.65" />
          <circle cx="8.5" cy="9.25" r="0.65" fill="hsl(32 70% 25%)" />
          <circle cx="11.5" cy="9.25" r="0.65" fill="hsl(32 70% 25%)" />
          <circle cx="10" cy="10.5" r="0.4" fill="hsl(32 70% 25%)" />
          <path d="M 8.25 11.5 Q 10 13.5 11.75 11.5" stroke="hsl(32 70% 25%)" strokeWidth="0.7" fill="none" strokeLinecap="round" />
        </g>
      </svg>

      {/* Texto "ConectAr RRHH" */}
      {showText && (
        <div className="flex flex-col">
          <h1 className={`font-headline font-bold leading-tight text-foreground ${fontSize}`}>
            Conect<span className="text-primary">Ar</span>
          </h1>
          <p className={`${subtextSize} uppercase tracking-widest text-muted-foreground`}>
            RRHH
          </p>
        </div>
      )}
    </div>
  );
}

/**
 * Componente de Logo con Imagen (para usar con archivo JPG/PNG)
 * Útil cuando se tiene el logo diseñado externamente
 */
interface ImageLogoProps {
  src: string;
  alt?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

export function ImageLogo({
  src,
  alt = 'ConectAr RRHH',
  size = 'md',
  className = ''
}: ImageLogoProps) {
  const sizeMap = {
    sm: 'w-6 h-6',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
    xl: 'w-16 h-16',
  };

  return (
    <img
      src={src}
      alt={alt}
      className={`${sizeMap[size]} object-contain ${className}`}
      style={{
        filter: "drop-shadow(0 0 8px hsl(var(--primary) / 0.4))",
      }}
      onError={(e) => {
        // Fallback: mostrar ícono placeholder si la imagen falla
        (e.target as HTMLImageElement).src = "https://avatar.iran.liara.run/public/42";
      }}
    />
  );
}
