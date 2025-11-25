import React from 'react';
import { Link as LinkIcon, Download } from 'lucide-react';
import { PluginSettings } from '../types';

export const ConnectionSettings = ({
    settings,
    onUpdateSettings,
    feedUrl,
    setFeedUrl,
    parseFeedUrl,
    parseUrlError
}: {
    settings: PluginSettings,
    onUpdateSettings: (s: PluginSettings) => void,
    feedUrl: string,
    setFeedUrl: (url: string) => void,
    parseFeedUrl: (url:string) => void,
    parseUrlError: string | null
}) => {
    return (
        <section>
            <h3 className="text-sm font-bold text-obsidian-accent uppercase tracking-wider mb-6 flex items-center gap-2">
                <LinkIcon size={14} /> Connection
            </h3>
            
            <div className="space-y-6">
                <div className="flex justify-between items-start gap-12 group">
                    <div className="flex-1">
                        <label className="block text-sm font-medium text-obsidian-text mb-1">Parse from RSS Link</label>
                        <div className="text-xs text-obsidian-muted">
                            Paste a public feed URL to automatically configure User ID and Tag.
                            <br/>
                            <span className="opacity-70">Example: https://www.inoreader.com/stream/user/1005.../tag/Tech</span>
                        </div>
                    </div>
                    <div className="flex flex-col">
                        <div className="flex gap-2 items-center">
                            <input 
                                type="text"
                                placeholder="Paste Feed URL..."
                                value={feedUrl}
                                onChange={e => setFeedUrl(e.target.value)}
                                className={`w-64 bg-obsidian-ribbon border rounded px-3 py-1.5 text-xs text-obsidian-text focus:outline-none focus:border-obsidian-accent focus:ring-1 focus:ring-obsidian-accent ${parseUrlError ? 'border-red-500' : 'border-obsidian-border'}`}
                            />
                            <button 
                                onClick={() => parseFeedUrl(feedUrl)}
                                disabled={!feedUrl}
                                className="flex items-center gap-2 bg-obsidian-ribbon hover:bg-obsidian-active border border-obsidian-border px-3 py-1.5 rounded text-xs font-medium transition-colors disabled:opacity-50"
                            >
                                <Download size={12} /> Auto-Fill
                            </button>
                        </div>
                        {parseUrlError && <p className="text-xs text-red-500 mt-1">{parseUrlError}</p>}
                    </div>
                </div>
                
                <div className="h-px bg-obsidian-border/30" />

                <div className="flex justify-between items-start gap-12">
                    <div className="flex-1">
                        <label className="block text-sm font-medium text-obsidian-text mb-1">User ID</label>
                        <div className="text-xs text-obsidian-muted">Your numeric Inoreader ID.</div>
                    </div>
                    <input 
                        type="text"
                        value={settings.userId}
                        onChange={e => onUpdateSettings({...settings, userId: e.target.value})}
                        className="w-64 bg-obsidian-ribbon border border-obsidian-border rounded px-3 py-1.5 text-sm text-obsidian-text focus:outline-none focus:border-obsidian-accent font-mono"
                        placeholder="e.g. 10059283"
                    />
                </div>
            </div>
        </section>
    )
}