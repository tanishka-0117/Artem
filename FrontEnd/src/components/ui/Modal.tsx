import React, { useEffect, useCallback } from 'react';
import { cn } from '@/lib/utils';
import { X } from 'lucide-react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children, size = 'md', className }) => {
  const handleEscape = useCallback((e: KeyboardEvent) => {
    if (e.key === 'Escape') onClose();
  }, [onClose]);

  useEffect(() => {
    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = '';
    };
  }, [isOpen, handleEscape]);

  if (!isOpen) return null;

  const sizes = {
    sm: 'max-w-sm',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm animate-fade-in"
        onClick={onClose}
        aria-hidden="true"
      />
      <div
        className={cn(
          'relative w-full bg-surface border border-border rounded-xl shadow-modal animate-scale-in',
          sizes[size],
          className,
        )}
        role="dialog"
        aria-modal="true"
        aria-label={title}
      >
        {title && (
          <div className="flex items-center justify-between px-6 py-4 border-b border-border">
            <h2 className="text-heading-3 text-text-primary">{title}</h2>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-text-muted hover:text-text-primary hover:bg-surface-soft transition-colors"
              aria-label="Close dialog"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        )}
        <div className="px-6 py-5">{children}</div>
      </div>
    </div>
  );
};

interface DialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'default' | 'danger';
}

const Dialog: React.FC<DialogProps> = ({
  isOpen, onClose, onConfirm, title, message,
  confirmText = 'Confirm', cancelText = 'Cancel', variant = 'default',
}) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} size="sm">
      <p className="text-body text-text-secondary mb-6">{message}</p>
      <div className="flex justify-end gap-3">
        <button
          onClick={onClose}
          className="h-10 px-4 text-body font-medium text-text-secondary bg-surface border border-border rounded-lg hover:bg-surface-soft transition-colors"
        >
          {cancelText}
        </button>
        <button
          onClick={() => { onConfirm(); onClose(); }}
          className={cn(
            'h-10 px-4 text-body font-medium text-white rounded-lg transition-colors',
            variant === 'danger' ? 'bg-error hover:bg-error/90' : 'bg-primary hover:bg-primary-hover',
          )}
        >
          {confirmText}
        </button>
      </div>
    </Modal>
  );
};

export { Modal, Dialog };
export default Modal;
