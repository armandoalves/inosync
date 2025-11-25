import React, { useState, useEffect, useRef } from 'react';
import { PluginSettings, SyncLog } from '../types';
import { ConnectionSettings } from './ConnectionSettings';
import { SyncSettings } from './SyncSettings';
import { Actions } from './Actions';
import { ActivityLog } from './ActivityLog';

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
  const [parseUrlError, setParseUrlError] = useState<string | null>(null);

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
    setParseUrlError(null);
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
    } else {
        setParseUrlError('Could not parse User ID and Tag from the provided URL.');
    }
  };

  const handleFeedUrlChange = (url: string) => {
    setFeedUrl(url);
    if (parseUrlError) {
      setParseUrlError(null);
    }
  }

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
        <ConnectionSettings 
            settings={settings}
            onUpdateSettings={onUpdateSettings}
            feedUrl={feedUrl}
            setFeedUrl={handleFeedUrlChange}
            parseFeedUrl={parseFeedUrl}
            parseUrlError={parseUrlError}
        />
        <SyncSettings 
            settings={settings}
            onUpdateSettings={onUpdateSettings}
            newTag={newTag}
            setNewTag={setNewTag}
            newTagFolder={newTagFolder}
            setNewTagFolder={setNewTagFolder}
            handleAddTag={handleAddTag}
            handleRemoveTag={handleRemoveTag}
            handleUpdateTagFolder={handleUpdateTagFolder}
        />
        <Actions 
            settings={settings}
            onUpdateSettings={onUpdateSettings}
            onSync={onSync}
            onReset={onReset}
            isSyncing={isSyncing}
        />
        <ActivityLog 
            logs={logs}
            onClearLogs={onClearLogs}
        />
      </div>
    </div>
  );
};