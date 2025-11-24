import React from 'react';
import { CheckCircle2, AlertCircle, Zap } from 'lucide-react';
import { ToastMessage } from '../types';

export const ToastContainer = ({ toasts }: { toasts: ToastMessage[] }) => {
    return (
        <div className="fixed bottom-4 right-4 z-[100] flex flex-col gap-2 pointer-events-none">
            {toasts.map(toast => (
                <div key={toast.id} className="bg-obsidian-ui border border-obsidian-border text-obsidian-text px-4 py-3 rounded shadow-xl flex items-center gap-3 animate-in slide-in-from-bottom-2 fade-in duration-200 max-w-sm pointer-events-auto">
                    {toast.type === 'success' && <CheckCircle2 size={16} className="text-green-400" />}
                    {toast.type === 'error' && <AlertCircle size={16} className="text-red-400" />}
                    {toast.type === 'info' && <Zap size={16} className="text-blue-400" />}
                    <span className="text-sm font-medium">{toast.message}</span>
                </div>
            ))}
        </div>
    );
};