import { XMarkIcon } from "@heroicons/react/24/outline";

export default function Modal({
  open,
  onClose,
  title,
  children,
  footer,
  maxWidth = "max-w-lg"
}) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/90 animate-in fade-in duration-300">
      <div 
        className={`bg-white dark:bg-background border-2 border-border w-full ${maxWidth} max-h-[90vh] flex flex-col rounded-3xl shadow-2xl shadow-black overflow-hidden animate-in zoom-in-95 slide-in-from-bottom-4 duration-300 ring-1 ring-white/10`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-8 py-5 flex items-center justify-between border-b border-border bg-slate-50 dark:bg-slate-900/50">
          <div className="flex items-center gap-3">
             <div className="w-1.5 h-6 bg-primary rounded-full shadow-lg shadow-primary/40" />
             <h3 className="text-xl font-black text-foreground tracking-tight">{title}</h3>
          </div>
          <button 
            onClick={onClose}
            className="p-2 text-muted-foreground hover:text-foreground hover:bg-background rounded-xl transition-all border-2 border-transparent hover:border-border shadow-sm active:translate-y-1"
          >
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-8 bg-white dark:bg-background text-foreground custom-scrollbar">
          {children}
        </div>

        {/* Footer */}
        {footer && (
          <div className="px-8 py-5 bg-slate-50 dark:bg-slate-900/50 border-t border-border flex justify-end gap-3 shrink-0">
             {footer}
          </div>
        )}
      </div>
      
      {/* Click outside to close */}
      <div className="fixed inset-0 -z-10" onClick={onClose} />
    </div>
  );
}
