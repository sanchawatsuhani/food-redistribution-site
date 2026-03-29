import { useNotifications } from '../context/NotificationContext';

export default function ToastContainer() {
  const { toasts, removeToast } = useNotifications();

  if (!toasts || toasts.length === 0) return null;

  return (
    <div className="toast-container">
      {toasts.map(toast => (
        <div key={toast.toastId} className={`toast toast-${toast.type || 'info'} animate-slideInRight`}>
          <div className="toast-content">
            <h4 className="toast-title">{toast.title}</h4>
            <p className="toast-message">{toast.message}</p>
          </div>
          <button className="toast-close" onClick={() => removeToast(toast.toastId)}>
            ✕
          </button>
        </div>
      ))}
    </div>
  );
}
