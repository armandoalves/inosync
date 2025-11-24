
import React, { useState, useEffect, useRef } from 'react';
import { X } from 'lucide-react';
import { PluginSettings, SyncLog, ToastMessage, DEFAULT_SETTINGS } from './types';
import { SettingsContent } from './components/SettingsContent';
import { CommandPalette } from './components/CommandPalette';
import { ToastContainer } from './components/ToastContainer';
import { fetchInoreaderFeed, generateObsidianNote, getInoreaderFeedUrl } from './services/rssService';

export const App = () => {
  const [settings, setSettings] = useState<PluginSettings>(() => {
    try {
        const saved = localStorage.getItem('inosync-settings');
        return saved ? JSON.parse(saved) : DEFAULT_SETTINGS;
    } catch {
        return DEFAULT_SETTINGS;
    }
  });

  const [isSyncing, setIsSyncing] = useState(false);
  const [logs, setLogs] = useState<SyncLog[]>([]);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [isPaletteOpen, setIsPaletteOpen] = useState(false);
  const hasStartedRef = useRef(false);

  useEffect(() => {
    localStorage.setItem('inosync-settings', JSON.stringify(settings));
  }, [settings]);

  useEffect(() => {
    if (!hasStartedRef.current) {
        hasStartedRef.current = true;
        if (settings.syncOnStartup) {
             setTimeout(() => handleSync(false), 500); 
        }
    }
  }, []); 

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
        if ((e.key === 'p' && (e.metaKey || e.ctrlKey))) {
            e.preventDefault();
            setIsPaletteOpen(open => !open);
        }
    }
    document.addEventListener('keydown', down);
    return () => document.removeEventListener('keydown', down);
  }, []);

  const addToast = (msg: string, type: 'info' | 'success' | 'error' = 'info') => {
      const id = Date.now().toString();
      setToasts(prev => [...prev, { id, message: msg, type }]);
      setTimeout(() => {
          setToasts(prev => prev.filter(t => t.id !== id));
      }, 4000);
  };

  const handleReset = () => {
      if(confirm('Are you sure you want to reset all settings to default?')) {
          setSettings(DEFAULT_SETTINGS);
          addToast('Settings reset to defaults', 'info');
      }
  };

  const handleClearLogs = () => {
      setLogs([]);
      addToast('Activity log cleared', 'info');
  };

  const handleSync = async (force: boolean) => {
    setIsSyncing(prev => {
        if (prev) return true;
        
        (async () => {
            addToast(force ? 'Starting Force Sync...' : 'Syncing Inoreader...', 'info');
            setLogs(prevLogs => [{
                id: Date.now().toString(),
                timestamp: Date.now(),
                status: 'success',
                message: force ? 'Manual Force Sync started' : 'Sync started'
            }, ...prevLogs]);

            try {
                let count = 0;
                for (const tag of settings.tags) {
                    const feedUrl = getInoreaderFeedUrl(settings.userId, tag.name);
                    setLogs(prevLogs => [{
                        id: Date.now().toString() + Math.random(),
                        timestamp: Date.now(),
                        status: 'info',
                        message: `Fetching ${tag.name}`,
                        details: feedUrl
                    }, ...prevLogs]);

                    const items = await fetchInoreaderFeed(tag.name, settings.userId, force);
                    const destFolder = tag.folder.trim() || settings.targetFolder;
                    
                    for (const item of items) {
                        await new Promise(r => setTimeout(r, 150)); 
                        const { generatedTitle } = generateObsidianNote(item);
                        setLogs(prevLogs => [{
                            id: Date.now().toString() + Math.random(),
                            timestamp: Date.now(),
                            status: 'success',
                            message: `Imported: "${generatedTitle}" into /${destFolder}`
                        }, ...prevLogs]);
                        count++;
                    }
                }
                addToast(`Sync Complete. ${count} notes updated.`, 'success');
            } catch (e) {
                console.error(e);
                addToast('Sync Failed. Check internet or User ID.', 'error');
                setLogs(prevLogs => [{
                    id: Date.now().toString(),
                    timestamp: Date.now(),
                    status: 'error',
                    message: 'Sync process failed'
                }, ...prevLogs]);
            } finally {
                setIsSyncing(false);
            }
        })();

        return true;
    });
  };

  return (
    <div className="flex items-center justify-center min-h-screen w-full bg-black/80 backdrop-blur-sm p-8 font-sans text-obsidian-text">
        
        {/* The "Settings Modal" - Sized for screenshots or normal use */}
        <div className="w-full max-w-[850px] h-[85vh] max-h-[900px] bg-obsidian-bg rounded-lg shadow-2xl border border-obsidian-border flex flex-col overflow-hidden ring-1 ring-white/10 relative">
            <div className="absolute top-4 right-4 z-10 text-obsidian-muted hover:text-white cursor-pointer">
                <X size={20} />
            </div>

            <div className="overflow-y-auto h-full scrollbar-thin scrollbar-thumb-obsidian-ui scrollbar-track-transparent">
                <SettingsContent 
                    settings={settings} 
                    onUpdateSettings={setSettings} 
                    onSync={handleSync}
                    onReset={handleReset}
                    onClearLogs={handleClearLogs}
                    isSyncing={isSyncing}
                    logs={logs}
                />
            </div>
        </div>

        {/* Overlays */}
        <CommandPalette 
            isOpen={isPaletteOpen} 
            onClose={() => setIsPaletteOpen(false)}
            onSync={handleSync}
        />
        <ToastContainer toasts={toasts} />
        
        <div className="fixed bottom-4 left-4 text-xs text-obsidian-muted bg-black/50 px-2 py-1 rounded">
            Press <span className="text-obsidian-text font-bold">Cmd+P</span> for Command Palette
        </div>

    </div>
  );
};