import React from 'react';
import { useStateContext } from '../contexts/ContextProvider';

const Toast = () => {
  const { toasts, removeToast } = useStateContext();

  return (
    <div className="fixed right-4 top-4 z-50 flex flex-col gap-2">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={`max-w-sm w-full px-4 py-3 rounded shadow-lg text-white flex items-start justify-between gap-4 ` +
            (t.type === 'success'
              ? 'bg-green-500'
              : t.type === 'error'
              ? 'bg-red-500'
              : 'bg-gray-800')}
        >
          <div className="flex-1 text-sm">{t.message}</div>
          <button
            onClick={() => removeToast(t.id)}
            className="ml-2 opacity-80 hover:opacity-100"
            aria-label="close"
          >
            ×
          </button>
        </div>
      ))}
    </div>
  );
};

export default Toast;
