import { useChat } from '../../context/ChatContext';
import { X, CheckCircle2, AlertCircle, Info, AlertTriangle } from 'lucide-react';

export default function ToastContainer() {
  const { toasts, removeToast } = useChat();

  if (!toasts || toasts.length === 0) return null;

  return (
    <div className="toast-container" role="region" aria-live="polite" aria-label="Notifications">
      {toasts.map((t) => {
        const Icon =
          t.type === 'success'
            ? CheckCircle2
            : t.type === 'error'
            ? AlertCircle
            : t.type === 'warning'
            ? AlertTriangle
            : Info;

        const iconColor =
          t.type === 'success'
            ? 'var(--status-online)'
            : t.type === 'error'
            ? 'var(--status-error)'
            : t.type === 'warning'
            ? 'var(--status-warning)'
            : 'var(--primary)';

        return (
          <div key={t.id} className="toast" role="alert">
            <Icon size={18} style={{ color: iconColor, flexShrink: 0 }} aria-hidden="true" />
            <span style={{ flex: 1, wordBreak: 'break-word' }}>{t.message}</span>

            {t.actionText && (
              <button
                type="button"
                className="toast-action"
                onClick={() => {
                  if (t.onAction) t.onAction();
                  removeToast(t.id);
                }}
              >
                {t.actionText}
              </button>
            )}

            <button
              type="button"
              className="btn-icon btn-sm"
              style={{ width: 24, height: 24, minHeight: 24, marginLeft: 4 }}
              onClick={() => removeToast(t.id)}
              aria-label="Dismiss notification"
            >
              <X size={14} />
            </button>
          </div>
        );
      })}
    </div>
  );
}
