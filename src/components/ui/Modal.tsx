'use client';
import { useEffect, useCallback, useRef } from 'react';
import { X } from 'lucide-react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  footer?: React.ReactNode;
}

const sizeClasses = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-lg',
  xl: 'max-w-2xl',
} as const;

export default function Modal({
  isOpen,
  onClose,
  title,
  children,
  size = 'md',
  footer,
}: ModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);

  // Close on Escape key
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    },
    [onClose]
  );

  useEffect(() => {
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      // Prevent body scroll while modal is open
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [isOpen, handleKeyDown]);

  // Close on overlay click (not on modal itself)
  const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) onClose();
  };

  if (!isOpen) return null;

  return (
    <div
      className={[
        'fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6',
        'bg-[#0B1220]/35 backdrop-blur-[6px]',
        'animate-fade-in',
      ].join(' ')}
      role="dialog"
      aria-modal="true"
      aria-labelledby={title ? 'modal-title' : undefined}
      onClick={handleOverlayClick}
    >
      <div
        ref={modalRef}
        className={[
          'relative w-full bg-white border border-line rounded-[24px]',
          'shadow-[0_16px_32px_rgba(16,24,40,0.07),0_40px_80px_rgba(16,24,40,0.14)]',
          'flex flex-col max-h-[90vh] animate-scale-in sheen',
          sizeClasses[size],
        ].join(' ')}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        {(title !== undefined) && (
          <div className="flex items-center justify-between px-7 py-5 border-b border-line-soft shrink-0">
            <h2
              id="modal-title"
              className="text-[17px] font-bold text-ink leading-snug tracking-[-0.02em]"
            >
              {title}
            </h2>
            <button
              onClick={onClose}
              className="text-ink-faint hover:text-ink hover:bg-canvas transition-all duration-200 rounded-[10px] p-2 -mr-2"
              aria-label="Close modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        )}

        {/* If no title, show floating close button */}
        {title === undefined && (
          <button
            onClick={onClose}
            className="absolute top-5 right-5 text-ink-faint hover:text-ink hover:bg-canvas transition-all duration-200 rounded-[10px] p-2 z-10"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        )}

        {/* Body */}
        <div className="px-7 py-6 overflow-y-auto flex-1 min-h-0 scroll-slim text-ink-soft">
          {children}
        </div>

        {/* Footer */}
        {footer && (
          <div className="px-7 py-5 border-t border-line-soft shrink-0 bg-canvas/60 rounded-b-[24px]">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}
