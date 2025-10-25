import { X, CheckCircle2, AlertCircle, Info, AlertTriangle } from 'lucide-react';
import { cn } from '../lib/utils';

const toastIcons = {
  success: CheckCircle2,
  error: AlertCircle,
  warning: AlertTriangle,
  info: Info,
};

const toastStyles = {
  success: 'bg-success/15 border-success/30 text-success shadow-lg shadow-success/10',
  error: 'bg-danger/15 border-danger/30 text-danger shadow-lg shadow-danger/10',
  warning: 'bg-warning/15 border-warning/30 text-warning shadow-lg shadow-warning/10',
  info: 'bg-primary/15 border-primary/30 text-primary shadow-lg shadow-primary/10',
};

export function Toast({ message, type = 'info', onClose }) {
  const Icon = toastIcons[type];

  return (
    <div
      className={cn(
        'flex items-center gap-3 px-5 py-3.5 rounded-xl border backdrop-blur-sm',
        'animate-in slide-in-from-right-full duration-300',
        toastStyles[type]
      )}
    >
      {Icon && <Icon className="w-5 h-5 flex-shrink-0" />}
      <p className="flex-1 text-sm font-semibold">{message}</p>
      <button
        onClick={onClose}
        className="flex-shrink-0 hover:opacity-70 transition-opacity p-1 hover:bg-white/10 rounded-md"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}

export function ToastContainer({ toasts, onRemove }) {
  return (
    <div className="fixed top-4 right-4 z-50 flex flex-col gap-2 max-w-md">
      {toasts.map((toast) => (
        <Toast
          key={toast.id}
          message={toast.message}
          type={toast.type}
          onClose={() => onRemove(toast.id)}
        />
      ))}
    </div>
  );
}

