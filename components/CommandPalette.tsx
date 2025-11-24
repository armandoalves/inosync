import React, { useState, useEffect, useRef } from 'react';
import { Search, RefreshCw } from 'lucide-react';

export const CommandPalette = ({ 
    isOpen, 
    onClose, 
    onSync 
}: { 
    isOpen: boolean; 
    onClose: () => void; 
    onSync: (force: boolean) => void;
}) => {
    const inputRef = useRef<HTMLInputElement>(null);
    const [search, setSearch] = useState('');
    const [selectedIndex, setSelectedIndex] = useState(0);

    const commands = [
        { id: 'sync', label: 'InoSync: Sync Now', action: () => onSync(false) },
        { id: 'force-sync', label: 'InoSync: Force Sync', action: () => onSync(true) },
        { id: 'settings', label: 'Open Settings', action: () => onClose() }, // Already open
        { id: 'reload', label: 'Reload App without saving', action: () => window.location.reload() }
    ];

    const filtered = commands.filter(c => c.label.toLowerCase().includes(search.toLowerCase()));

    useEffect(() => {
        if (isOpen) {
            setTimeout(() => inputRef.current?.focus(), 50);
            setSearch('');
            setSelectedIndex(0);
        }
    }, [isOpen]);

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'ArrowDown') {
            e.preventDefault();
            setSelectedIndex(prev => Math.min(prev + 1, filtered.length - 1));
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            setSelectedIndex(prev => Math.max(prev - 1, 0));
        } else if (e.key === 'Enter') {
            e.preventDefault();
            if (filtered[selectedIndex]) {
                filtered[selectedIndex].action();
                onClose();
            }
        } else if (e.key === 'Escape') {
            onClose();
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[60] flex items-start justify-center pt-[20vh] bg-black/60 backdrop-blur-[1px]" onClick={onClose}>
            <div 
                className="w-[600px] bg-obsidian-ui border border-obsidian-border rounded-lg shadow-2xl overflow-hidden flex flex-col max-h-[50vh]"
                onClick={e => e.stopPropagation()}
            >
                <div className="border-b border-obsidian-border p-3 flex items-center gap-3">
                    <Search size={18} className="text-obsidian-muted" />
                    <input 
                        ref={inputRef}
                        type="text" 
                        className="flex-1 bg-transparent border-none outline-none text-obsidian-text placeholder-obsidian-muted text-lg"
                        placeholder="Type a command..."
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        onKeyDown={handleKeyDown}
                    />
                    <div className="text-xs text-obsidian-muted px-1.5 py-0.5 border border-obsidian-border rounded">ESC</div>
                </div>
                <div className="overflow-y-auto p-2">
                    {filtered.length === 0 ? (
                        <div className="text-center py-8 text-obsidian-muted">No commands found.</div>
                    ) : (
                        filtered.map((cmd, idx) => (
                            <div 
                                key={cmd.id}
                                className={`
                                    px-3 py-2 rounded flex items-center justify-between cursor-pointer text-sm
                                    ${idx === selectedIndex ? 'bg-obsidian-accent text-white' : 'text-obsidian-text hover:bg-obsidian-active'}
                                `}
                                onClick={() => { cmd.action(); onClose(); }}
                                onMouseEnter={() => setSelectedIndex(idx)}
                            >
                                <span className="flex items-center gap-2">
                                    {cmd.id.includes('sync') && <RefreshCw size={14} className={idx === selectedIndex ? 'opacity-100' : 'opacity-50'} />}
                                    {cmd.label}
                                </span>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
};