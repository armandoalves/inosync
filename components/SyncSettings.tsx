import React, { useState } from 'react';
import { Folder, Plus, Trash2 } from 'lucide-react';
import { PluginSettings } from '../types';

export const SyncSettings = ({
    settings,
    onUpdateSettings,
    newTag,
    setNewTag,
    newTagFolder,
    setNewTagFolder,
    handleAddTag,
    handleRemoveTag,
    handleUpdateTagFolder
}: {
    settings: PluginSettings,
    onUpdateSettings: (s: PluginSettings) => void,
    newTag: string,
    setNewTag: (tag: string) => void,
    newTagFolder: string,
    setNewTagFolder: (folder: string) => void,
    handleAddTag: () => void,
    handleRemoveTag: (tagName: string) => void,
    handleUpdateTagFolder: (tagName: string, newFolder: string) => void
}) => {
    return (
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

                {/* Note Template */}
                <div>
                    <label className="block text-sm font-medium text-obsidian-text mb-1">Note Template</label>
                    <div className="text-xs text-obsidian-muted mb-2">
                        Define the template for new notes. Use placeholders like {"{{title}}"}, {"{{content}}"}, {"{{url}}"}, {"{{source}}"}, {"{{id}}"}, and {"{{date}}"}.
                    </div>
                    <textarea 
                        value={settings.template}
                        onChange={e => onUpdateSettings({...settings, template: e.target.value})}
                        className="w-full h-48 bg-obsidian-ribbon border border-obsidian-border rounded px-3 py-2 text-xs text-obsidian-text focus:outline-none focus:border-obsidian-accent font-mono"
                        placeholder="e.g. # {{title}}\n\n{{content}}"
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
    )
}
