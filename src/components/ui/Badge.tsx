'use client';

type BadgeVariant = 'default' | 'success' | 'warning' | 'danger' | 'info' | 'purple';

interface BadgeProps {
  children: React.ReactNode;
  variant?: BadgeVariant;
  dot?: boolean;
  className?: string;
}

const variantStyles: Record<BadgeVariant, { badge: string; dot: string }> = {
  default: {
    badge: 'bg-canvas text-ink-soft border border-line',
    dot:   'bg-ink-faint',
  },
  success: {
    badge: 'bg-positive-soft text-[#0A7A54] border border-[#BEE7D8]',
    dot:   'bg-positive',
  },
  warning: {
    badge: 'bg-caution-soft text-[#9A5D00] border border-[#F3DBB4]',
    dot:   'bg-caution',
  },
  danger: {
    badge: 'bg-critical-soft text-[#B32B2B] border border-[#F3C9C9]',
    dot:   'bg-critical',
  },
  info: {
    badge: 'bg-brand-50 text-brand-700 border border-brand-100',
    dot:   'bg-brand-600',
  },
  purple: {
    badge: 'bg-ignite-50 text-ignite-700 border border-ignite-100',
    dot:   'bg-ignite-500',
  },
};

export default function Badge({
  children,
  variant = 'default',
  dot = false,
  className = '',
}: BadgeProps) {
  const styles = variantStyles[variant];

  return (
    <span
      className={[
        'inline-flex items-center gap-1.5 rounded-full px-3 py-1',
        'text-[11px] font-semibold tracking-[0.01em] uppercase',
        styles.badge,
        className,
      ].join(' ')}
    >
      {dot && (
        <span
          className={['w-1.5 h-1.5 rounded-full shrink-0', styles.dot].join(' ')}
          aria-hidden="true"
        />
      )}
      {children}
    </span>
  );
}
