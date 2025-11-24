import React, { useState, useEffect, useRef } from 'react';
import { 
  RefreshCw, 
  Folder,
  Terminal,
  Plus,
  Trash2,
  Link as LinkIcon,
  XCircle,
  Download
} from 'lucide-react';
import { PluginSettings, SyncLog } from '../types';

export const SettingsContent = ({ 
  settings, 
  onUpdateSettings,
  onSync,
  onReset,
  onClearLogs,
  isSyncing,
  logs
}: { 
  settings: PluginSettings, 
  onUpdateSettings: (s: PluginSettings) => void,
  onSync: (force: boolean) => void,
  onReset: () => void,
  onClearLogs: () => void,
  isSyncing: boolean,
  logs: SyncLog[]
}) => {
  
  const [newTag, setNewTag] = useState('');
  const [newTagFolder, setNewTagFolder] = useState('');
  const [feedUrl, setFeedUrl] = useState('');
  const logsEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll logs
  useEffect(() => {
    if (logsEndRef.current) {
        logsEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [logs]);

  const handleAddTag = () => {
    if (newTag && !settings.tags.find(t => t.name === newTag)) {
      onUpdateSettings({
          ...settings, 
          tags: [...settings.tags, { name: newTag, folder: newTagFolder }]
      });
      setNewTag('');
      setNewTagFolder('');
    }
  };

  const handleRemoveTag = (tagName: string) => {
    onUpdateSettings({...settings, tags: settings.tags.filter(t => t.name !== tagName)});
  };

  const handleUpdateTagFolder = (tagName: string, newFolder: string) => {
      const newTags = settings.tags.map(t => 
          t.name === tagName ? { ...t, folder: newFolder } : t
      );
      onUpdateSettings({ ...settings, tags: newTags });
  };

  const parseFeedUrl = (url: string) => {
    // Regex to handle various Inoreader public URL formats
    // e.g., https://www.inoreader.com/stream/user/10059283/tag/Technology
    const regex = /(?:user|u)\/(\d+)\/tag\/([^/?#&]+)/;
    const match = url.trim().match(regex);
    if (match) {
        const userId = match[1];
        const tagName = decodeURIComponent(match[2]);
        let newTags = [...settings.tags];
        
        // Add tag if it doesn't exist
        if (!newTags.find(t => t.name === tagName)) {
            newTags.push({ name: tagName, folder: '' });
        }
        
        onUpdateSettings({ ...settings, userId, tags: newTags });
        setFeedUrl('');
        // Optional: Trigger a small visual feedback here if we had toast access, 
        // but clearing the URL is a good standard indicator of success.
    } else {
        alert('Could not parse User ID and Tag from the provided URL.\n\nExpected format: .../user/12345/tag/TagName');
    }
  };

  // Removed h-full and overflow-y-auto to let Obsidian handle scrolling
  return (
    <div className="inosync-settings-wrapper bg-obsidian-bg flex flex-col relative">
      
      {/* Header */}
      <div className="px-10 py-8 border-b border-obsidian-border mb-4">
        <h1 className="text-xl font-bold text-obsidian-text mb-2">InoSync</h1>
        <p className="text-sm text-obsidian-muted leading-relaxed max-w-2xl">
          Import articles from Inoreader public feeds directly into your Obsidian vault. 
        </p>
      </div>

      {/* Settings Form */}
      <div className="px-10 pb-12 space-y-10 max-w-4xl">
        
        {/* Connection Settings */}
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
                <div className="flex gap-2 items-center">
                     <input 
                        type="text"
                        placeholder="Paste Feed URL..."
                        value={feedUrl}
                        onChange={e => setFeedUrl(e.target.value)}
                        className="w-64 bg-obsidian-ribbon border border-obsidian-border rounded px-3 py-1.5 text-xs text-obsidian-text focus:outline-none focus:border-obsidian-accent focus:ring-1 focus:ring-obsidian-accent"
                    />
                    <button 
                        onClick={() => parseFeedUrl(feedUrl)}
                        disabled={!feedUrl}
                        className="flex items-center gap-2 bg-obsidian-ribbon hover:bg-obsidian-active border border-obsidian-border px-3 py-1.5 rounded text-xs font-medium transition-colors disabled:opacity-50"
                    >
                        <Download size={12} /> Auto-Fill
                    </button>
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

        {/* Sync Settings */}
        <section>
          <h3 className="text-sm font-bold text-obsidian-accent uppercase tracking-wider mb-6 flex items-center gap-2">
            <Folder size={14} /> Import Configuration
          </h3>

          <div className="space-y-6">
            <div className="flex justify-between items-start gap-12">
                <div className="flex-1">
                    <label className="block text-sm font-medium text-obsidian-text mb-1">Default Folder (Inbox)</label>
                    <div className="text-xs text-obsidian-muted">Destination for tags without a specific folder.</div>
                </div>
                <input 
                  type="text"
                  value={settings.targetFolder}
                  onChange={e => onUpdateSettings({...settings, targetFolder: e.target.value})}
                  className="w-64 bg-obsidian-ribbon border border-obsidian-border rounded px-3 py-1.5 text-sm text-obsidian-text focus:outline-none focus:border-obsidian-accent"
                  placeholder="e.g. Inbox"
                />
            </div>

            <div className="h-px bg-obsidian-border/30" />

             {/* Tags Table */}
             <div className="flex flex-col gap-4">
                <div>
                    <label className="block text-sm font-medium text-obsidian-text mb-1">Monitored Tags & Folders</label>
                    <div className="text-xs text-obsidian-muted mb-3">Define which tags to fetch and where to save them.</div>
                </div>

                <div className="border border-obsidian-border rounded-md overflow-hidden bg-obsidian-ui/20">
                    <div className="grid grid-cols-12 gap-4 px-4 py-2 bg-obsidian-ribbon text-xs font-bold text-obsidian-muted uppercase border-b border-obsidian-border">
                        <div className="col-span-4">Tag Name</div>
                        <div className="col-span-7">Target Folder</div>
                        <div className="col-span-1"></div>
                    </div>
                    
                    {settings.tags.length === 0 && (
                        <div className="px-4 py-8 text-center text-xs text-obsidian-muted italic border-b border-obsidian-border/50">
                            No tags configured. Add one below or use Auto-Fill.
                        </div>
                    )}

                    {settings.tags.map(tag => (
                        <div key={tag.name} className="grid grid-cols-12 gap-4 px-4 py-2 border-b border-obsidian-border/50 items-center last:border-0 hover:bg-obsidian-ui/40">
                             <div className="col-span-4 flex items-center gap-2 font-medium text-sm">
                                <span className="w-2 h-2 rounded-full bg-obsidian-accent"></span>
                                {tag.name}
                             </div>
                             <div className="col-span-7">
                                 <div className="flex items-center gap-2">
                                    <Folder size={14} className="text-obsidian-muted" />
                                    <input 
                                        type="text" 
                                        value={tag.folder} 
                                        placeholder={settings.targetFolder || "Default Folder"}
                                        onChange={(e) => handleUpdateTagFolder(tag.name, e.target.value)}
                                        className="w-full bg-transparent border-none outline-none text-sm placeholder-obsidian-muted/50 focus:text-white"
                                    />
                                 </div>
                             </div>
                             <div className="col-span-1 flex justify-end">
                                <button onClick={() => handleRemoveTag(tag.name)} className="text-obsidian-muted hover:text-red-400 p-1">
                                    <Trash2 size={14} />
                                </button>
                             </div>
                        </div>
                    ))}

                    <div className="grid grid-cols-12 gap-4 px-4 py-3 bg-obsidian-ui/50 items-center">
                         <div className="col-span-4">
                            <input 
                                type="text"
                                value={newTag}
                                onChange={e => setNewTag(e.target.value)}
                                placeholder="New Tag..."
                                className="w-full bg-obsidian-bg border border-obsidian-border rounded px-2 py-1 text-sm focus:outline-none focus:border-obsidian-accent"
                            />
                         </div>
                         <div className="col-span-7">
                             <input 
                                type="text"
                                value={newTagFolder}
                                onChange={e => setNewTagFolder(e.target.value)}
                                placeholder="Folder (Optional)..."
                                className="w-full bg-obsidian-bg border border-obsidian-border rounded px-2 py-1 text-sm focus:outline-none focus:border-obsidian-accent"
                            />
                         </div>
                         <div className="col-span-1 flex justify-end">
                             <button 
                                onClick={handleAddTag}
                                disabled={!newTag}
                                className="p-1.5 bg-obsidian-accent text-white rounded hover:bg-obsidian-accentHover disabled:opacity-50 disabled:bg-obsidian-border"
                             >
                                <Plus size={14} />
                             </button>
                         </div>
                    </div>
                </div>
            </div>
          </div>
        </section>

        {/* Actions */}
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

        {/* Activity Log Window - Always Visible */}
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

      </div>
    </div>
  );
};