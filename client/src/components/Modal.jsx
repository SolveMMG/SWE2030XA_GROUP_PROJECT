import { useEffect } from 'react';
import { createPortal } from 'react-dom';

export default function Modal({ children, isOpen, onClose, title }) {
  useEffect(() => {
    if (!isOpen) return undefined;
    const onKeyDown = (event) => event.key === 'Escape' && onClose();
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" role="presentation">
      <button className="absolute inset-0 cursor-default bg-ink/45" aria-label="Close dialog" onClick={onClose} />
      <section className="relative z-10 w-full max-w-lg rounded-2xl bg-surface p-6 shadow-2xl" role="dialog" aria-modal="true" aria-labelledby="modal-title">
        <div className="mb-5 flex items-start justify-between gap-4">
          {title && <h2 id="modal-title" className="font-display text-xl font-bold text-ink">{title}</h2>}
          <button className="rounded-lg p-1 text-muted hover:bg-slate-100 hover:text-ink" aria-label="Close dialog" onClick={onClose}>×</button>
        </div>
        {children}
      </section>
    </div>,
    document.body,
  );
}
