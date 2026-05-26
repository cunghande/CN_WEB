import React from 'react';
import { X } from 'lucide-react';

const Modal = ({ isOpen, onClose, title, children, maxWidth = 'max-w-lg' }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div
        className="fixed inset-0 bg-slate-950/55 backdrop-blur-sm"
        onClick={onClose}
      />

      <div className="flex min-h-screen items-center justify-center p-4">
        <div className={`relative w-full ${maxWidth} overflow-hidden rounded-lg bg-white text-left shadow-2xl`}>
          {title ? (
            <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
              <h3 className="text-base font-bold text-slate-950">{title}</h3>
              <button
                onClick={onClose}
                className="rounded-md p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
                aria-label="Đóng"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          ) : (
            <button
              onClick={onClose}
              className="absolute right-3 top-3 z-10 rounded-md bg-white/90 p-1.5 text-slate-500 shadow-sm transition hover:bg-white hover:text-slate-900"
              aria-label="Đóng"
            >
              <X className="h-5 w-5" />
            </button>
          )}

          <div className="max-h-[78vh] overflow-y-auto px-5 py-5">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Modal;
