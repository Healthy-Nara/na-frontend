import type { ReactNode } from 'react';
import { Loader2 } from 'lucide-react';

interface PageShellProps {
  children: ReactNode;
  className?: string;
  fitContent?: boolean;
}

export function PageShell({ children, className = '', fitContent = false }: PageShellProps) {
  return (
    <div className={`app-bg ${fitContent ? 'app-bg-fit' : ''} ${className}`}>
      {children}
    </div>
  );
}

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  onBack?: () => void;
  backLabel?: string;
  actions?: ReactNode;
}

export function PageHeader({ title, subtitle, onBack, backLabel, actions }: PageHeaderProps) {
  return (
    <header className="page-header">
      <div className="page-header-inner">
        {onBack && (
          <button
            type="button"
            onClick={onBack}
            className="btn btn-ghost btn-icon shrink-0 -ml-1"
            aria-label={backLabel || 'နောက်သို့'}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M19 12H5M12 19l-7-7 7-7" />
            </svg>
          </button>
        )}
        <div className="flex-1 min-w-0">
          <h1 className="font-bold text-[1.0625rem] text-slate-900 truncate leading-tight">{title}</h1>
          {subtitle && (
            <p className="text-xs text-slate-500 truncate mt-0.5">{subtitle}</p>
          )}
        </div>
        {actions && (
          <div className="flex items-center gap-0.5 shrink-0">{actions}</div>
        )}
      </div>
    </header>
  );
}

export function LoadingScreen() {
  return (
    <PageShell>
      <div className="flex items-center justify-center min-h-[100dvh]">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="spinner h-8 w-8 text-primary" />
          <p className="text-sm text-slate-500">ခဏစောင့်ပါ...</p>
        </div>
      </div>
    </PageShell>
  );
}

interface EmptyStateProps {
  icon: ReactNode;
  title: string;
  description?: string;
  compact?: boolean;
}

export function EmptyState({ icon, title, description, compact = false }: EmptyStateProps) {
  return (
    <div className={`empty-state ${compact ? 'empty-state-compact' : ''}`}>
      <div className="empty-state-icon">{icon}</div>
      <p className="font-semibold text-slate-700">{title}</p>
      {description && (
        <p className="text-sm text-slate-500 mt-1 max-w-[16rem]">{description}</p>
      )}
    </div>
  );
}

interface ModalProps {
  title: string;
  children: ReactNode;
  onClose: () => void;
  footer?: ReactNode;
}

export function Modal({ title, children, onClose, footer }: ModalProps) {
  return (
    <div
      className="modal-overlay"
      onClick={(e) => e.target === e.currentTarget && onClose()}
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      <div className="modal-panel">
        <div className="modal-handle" aria-hidden="true" />
        <h2 id="modal-title" className="text-lg font-bold text-slate-900 mb-4">{title}</h2>
        {children}
        {footer && <div className="flex gap-3 mt-6">{footer}</div>}
      </div>
    </div>
  );
}

interface BottomBarProps {
  children: ReactNode;
}

export function BottomBar({ children }: BottomBarProps) {
  return (
    <div className="bottom-bar">
      <div className="app-container !px-0 flex gap-3">{children}</div>
    </div>
  );
}
