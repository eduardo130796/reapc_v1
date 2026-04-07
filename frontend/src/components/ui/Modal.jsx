import { XMarkIcon } from "@heroicons/react/24/outline";

export default function Modal({
  open,
  onClose,
  title,
  children,
  footer
}) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-in fade-in duration-200">
      <div 
        className="bg-card border-2 border-border w-full max-w-lg rounded-[32px] shadow-2xl shadow-black/60 overflow-hidden animate-in zoom-in-95 slide-in-from-bottom-4 duration-300 ring-4 ring-white/5"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-8 py-6 flex items-center justify-between border-b-2 border-border bg-secondary">
          <div className="flex items-center gap-3">
             <div className="w-2 h-6 bg-primary rounded-full shadow-lg shadow-primary/40" />
             <h3 className="text-2xl font-black text-foreground tracking-tight">{title}</h3>
          </div>
          <button 
            onClick={onClose}
            className="p-2 text-muted-foreground hover:text-foreground hover:bg-background rounded-xl transition-all border-2 border-transparent hover:border-border shadow-sm active:translate-y-1"
          >
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-10 bg-card text-foreground">
          {children}
        </div>

        {/* Footer */}
        {footer && (
          <div className="px-8 py-6 bg-secondary border-t-2 border-border flex justify-end gap-4">
             {/* Note: the custom buttons in footer should pass the styles, but we handle standard ones if they were here */}
             {footer}
          </div>
        )}
      </div>
      
      {/* Click outside to close */}
      <div className="fixed inset-0 -z-10" onClick={onClose} />
    </div>
  );
}
