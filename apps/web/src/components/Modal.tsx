import { useEffect, useRef, type ReactNode } from "react";
import { createPortal } from "react-dom";

export function Modal({
  open,
  onClose,
  eyebrow,
  title,
  size = "md",
  children
}: {
  open: boolean;
  onClose: () => void;
  eyebrow?: string;
  title: string;
  size?: "md" | "lg";
  children: ReactNode;
}) {
  const cardRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!open) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKeyDown);
    document.body.classList.add("modal-open");

    const firstField = cardRef.current?.querySelector("input, select, textarea, button:not(.modal-close)");
    if (firstField instanceof HTMLElement) {
      window.setTimeout(() => firstField.focus(), 70);
    }

    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.classList.remove("modal-open");
    };
  }, [open, onClose]);

  if (!open) return null;

  return createPortal(
    <div className="modal-overlay" onClick={onClose}>
      <div
        className={`modal-card modal-${size}`}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        ref={cardRef}
        onClick={(event) => event.stopPropagation()}
      >
        <div className="modal-head">
          <div>
            {eyebrow ? <p className="eyebrow">{eyebrow}</p> : null}
            <h2>{title}</h2>
          </div>
          <button className="modal-close" onClick={onClose} type="button" aria-label="Cerrar">
            &times;
          </button>
        </div>
        <div className="modal-body">{children}</div>
      </div>
    </div>,
    document.body
  );
}
