import React from 'react';
import { RefreshCw, Terminal } from 'lucide-react';
import { PluginSettings } from '../types';

export const Actions = ({
    settings,
    onUpdateSettings,
    onSync,
    onReset,
    isSyncing
}: {
    settings: PluginSettings,
    onUpdateSettings: (s: PluginSettings) => void,
    onSync: (force: boolean) => void,
    onReset: () => void,
    isSyncing: boolean
}) => {
    return (
        <section>
            <h3 className="text-sm font-bold text-obsidian-accent uppercase tracking-wider mb-6 flex items-center gap-2">
                <Terminal size={14} /> Actions & Behavior
            </h3>
            
            <div className="bg-obsidian-ui/50 border border-obsidian-border rounded-lg divide-y divide-obsidian-border">
                
                {/* Sync on Startup */}
                <div className="p-4 flex items-center justify-between">
                    <div>
                        <div className="text-sm font-medium">Sync on Startup</div>
                        <div className="text-xs text-obsidian-muted mt-0.5">Automatically check for new articles when Obsidian opens.</div>
                    </div>
                    <button 
                        onClick={() => onUpdateSettings({...settings, syncOnStartup: !settings.syncOnStartup})}
                        className={`inosync-toggle ${settings.syncOnStartup ? 'mod-active' : ''}`}
                    >
                        <div className="inosync-toggle-thumb" />
                    </button>
                </div>

                {/* Sync */}
                <div className="p-4 flex items-center justify-between">
                    <div>
                        <div className="text-sm font-medium">Sync Now</div>
                        <div className="text-xs text-obsidian-muted mt-0.5">Fetch new articles. Use Force Sync to overwrite existing notes.</div>
                    </div>
                    <div className="flex gap-2 items-center">
                        <button 
                            onClick={() => onSync(false)}
                            disabled={isSyncing}
                            className={`
                                flex items-center gap-2 px-4 py-1.5 rounded text-xs font-medium transition-all border
                                ${isSyncing 
                                    ? 'bg-transparent border-obsidian-border text-obsidian-muted' 
                                    : 'bg-obsidian-accent border-obsidian-accent text-white hover:bg-obsidian-accentHover'
                                }
                            `}
                        >
                            {isSyncing ? <RefreshCw size={12} className="animate-spin" /> : <RefreshCw size={12} />}
                            {isSyncing ? 'Syncing...' : 'Sync'}
                        </button>
                        <button 
                            onClick={() => onSync(true)}
                            disabled={isSyncing}
                            className={`
                                px-3 py-1.5 rounded text-xs font-medium transition-all border border-obsidian-border
                                ${isSyncing 
                                    ? 'text-obsidian-muted cursor-not-allowed' 
                                    : 'text-obsidian-muted hover:text-white hover:bg-obsidian-active'
                                }
                            `}
                            title="Force Sync (Overwrite existing notes)"
                        >
                            Force
                        </button>
                    </div>
                </div>

                {/* Reset */}
                <div className="p-4 flex items-center justify-between">
                    <div>
                        <div className="text-sm font-medium text-red-400">Reset Plugin</div>
                        <div className="text-xs text-obsidian-muted mt-0.5">Restore default settings and clear caches.</div>
                    </div>
                    <button 
                        onClick={onReset}
                        className="px-4 py-1.5 rounded text-xs font-medium bg-transparent border border-obsidian-border hover:bg-red-900/30 hover:border-red-900 text-obsidian-muted hover:text-red-400 transition-all"
                    >
                        Reset Defaults
                    </button>
                </div>
            </div>
        </section>
    )
}