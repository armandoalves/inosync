import React, { useRef, useEffect } from 'react';
import { Terminal, XCircle } from 'lucide-react';
import { SyncLog } from '../types';

export const ActivityLog = ({
    logs,
    onClearLogs
}: {
    logs: SyncLog[],
    onClearLogs: () => void
}) => {
    const logsEndRef = useRef<HTMLDivElement>(null);

    // Auto-scroll logs
    useEffect(() => {
        if (logsEndRef.current) {
            logsEndRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    }, [logs]);
    
    return (
        <section className="pt-2 animate-in fade-in slide-in-from-bottom-2">
            <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2 text-obsidian-muted">
                    <Terminal size={12} />
                    <span className="text-[10px] uppercase font-bold tracking-wider">Activity Log</span>
                </div>
                <button 
                    onClick={onClearLogs}
                    className="flex items-center gap-1 text-[10px] text-obsidian-muted hover:text-obsidian-text transition-colors px-2 py-0.5 rounded hover:bg-obsidian-ui"
                    title="Clear Log"
                >
                    <XCircle size={10} /> Clear
                </button>
            </div>
            <div className="bg-black/40 rounded border border-obsidian-border p-3 font-mono text-[10px] text-obsidian-muted h-48 overflow-y-auto">
                {logs.length === 0 ? (
                    <div className="text-center py-10 opacity-30 italic">No recent activity.</div>
                ) : (
                    logs.map(log => (
                        <div key={log.id} className="mb-1 last:mb-0 flex gap-2">
                                <span className="opacity-40 min-w-[60px]">{new Date(log.timestamp).toLocaleTimeString()}</span>
                                <span className={
                                    log.status === 'error' ? 'text-red-400' : 
                                    log.status === 'success' ? 'text-green-400' : 'text-blue-400'
                                }>
                                    [{log.status.toUpperCase()}]
                                </span>
                                <span className="text-obsidian-text/80">{log.message}</span>
                                {log.details && <span className="opacity-50">- {log.details}</span>}
                        </div>
                    ))
                )}
                <div ref={logsEndRef} />
            </div>
        </section>
    )
}