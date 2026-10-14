import { useEffect, useRef } from 'react';
import { X } from 'lucide-react';

// Native <dialog>: focus trap, Escape to close and the backdrop come from the browser.
export default function Modal({ title, onClose, children }) {
  const ref = useRef(null);
  useEffect(() => {
    const d = ref.current;
    if (d && !d.open) d.showModal?.() ?? d.setAttribute('open', '');
  }, []);
  return (
    <dialog
      ref={ref}
      onClose={onClose}
      onClick={(e) => e.target === ref.current && onClose()}
      className="m-auto w-[calc(100%-2rem)] max-w-lg rounded-xl border border-line bg-white p-0 text-ink backdrop:bg-ink/50"
    >
      <div className="flex items-center justify-between border-b border-line px-5 py-4">
        <h2 className="text-lg font-extrabold">{title}</h2>
        <button type="button" onClick={onClose} aria-label="Close" className="grid size-10 place-items-center rounded-lg hover:bg-cream"><X className="size-5" /></button>
      </div>
      <div className="max-h-[75vh] overflow-y-auto p-5">{children}</div>
    </dialog>
  );
}
