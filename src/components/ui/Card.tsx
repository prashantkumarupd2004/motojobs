'use client';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
  glass?: boolean;
  padding?: 'sm' | 'md' | 'lg' | 'none';
}

const paddingClasses = {
  sm:   'p-5',
  md:   'p-6',
  lg:   'p-8',
  none: 'p-0',
} as const;

export default function Card({
  children,
  className = '',
  hover = false,
  glass = false,
  padding = 'md',
}: CardProps) {
  return (
    <div
      className={[
        glass ? 'glass rounded-[20px]' : 'surface-raised sheen',
        paddingClasses[padding],
        hover ? 'lift' : '',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
    >
      {children}
    </div>
  );
}
