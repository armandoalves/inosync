import { App, Plugin, PluginSettingTab, Notice, requestUrl, TFile } from 'obsidian';
import { createRoot, Root } from 'react-dom/client';
import React from 'react';
import { SettingsContent } from './components/SettingsContent';
import { DEFAULT_SETTINGS, PluginSettings, SyncLog } from './types';
import { fetchInoreaderFeed, generateObsidianNote, getInoreaderFeedUrl } from './services/rssService';

export default class InoSyncPlugin extends Plugin {
    settings: PluginSettings;
    settingsRoot: Root | null = null;
    logs: SyncLog[] = [];
    settingTab: InoSyncSettingTab;
    isSyncing: boolean = false;
    declare app: App;

    async onload() {
        await this.loadSettings();

        // Register Command: Sync Now
        (this as any).addCommand({
            id: 'sync-feeds',
            name: 'Sync Now',
            callback: () => this.sync(false)
        });

        // Register Command: Force Sync
        (this as any).addCommand({
            id: 'force-sync-feeds',
            name: 'Force Sync',
            callback: () => this.sync(true)
        });

        // Register Settings Tab
        this.settingTab = new InoSyncSettingTab(this.app, this);
        (this as any).addSettingTab(this.settingTab);

        // Sync on startup if enabled
        if (this.settings.syncOnStartup) {
            this.app.workspace.onLayoutReady(() => {
                this.sync(false);
            });
        }
    }

    async onunload() {
        // Cleanup handled by Obsidian
    }

    async loadSettings() {
        this.settings = Object.assign({}, DEFAULT_SETTINGS, await (this as any).loadData());
    }

    async saveSettings() {
        await (this as any).saveData(this.settings);
    }

    addLog(message: string, status: 'success' | 'error' | 'info' = 'info', details?: string) {
        const log: SyncLog = {
            id: Date.now().toString() + Math.random().toString(),
            timestamp: Date.now(),
            status,
            message,
            details
        };
        // Keep logs capped at 100
        this.logs = [log, ...this.logs.slice(0, 99)];
        
        // Update the Settings UI if it is open
        if (this.settingTab) {
            this.settingTab.renderReact();
        }
    }

    clearLogs() {
        this.logs = [];
        if (this.settingTab) {
            this.settingTab.renderReact();
        }
    }

    async sync(force: boolean) {
        if (this.isSyncing) {
            new Notice('InoSync: Sync already in progress.');
            return;
        }

        this.isSyncing = true;
        if (this.settingTab) {
            this.settingTab.renderReact();
        }

        const mode = force ? 'Force Sync' : 'Sync';
        new Notice(`InoSync: Starting ${mode}...`);
        this.addLog(`${mode} started`, 'info');
        
        try {
            let totalCount = 0;
            // Use Obsidian's requestUrl to bypass CORS and mimic a browser
            const obsidianFetcher = async (url: string) => {
                return requestUrl({ 
                    url,
                    method: 'GET',
                    headers: {
                        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                        'Accept': 'application/atom+xml,application/rss+xml,application/xml,text/xml,text/html,*/*'
                    }
                });
            };

            for (const tag of this.settings.tags) {
                const feedUrl = getInoreaderFeedUrl(this.settings.userId, tag.name);
                this.addLog(`Fetching feed for tag: ${tag.name}...`, 'info', feedUrl);
                
                try {
                    const items = await fetchInoreaderFeed(tag.name, this.settings.userId, force, obsidianFetcher);
                    const destFolder = tag.folder.trim() || this.settings.targetFolder;
                    
                    // Ensure folder exists
                    if (!(await this.app.vault.adapter.exists(destFolder))) {
                        await this.app.vault.createFolder(destFolder);
                    }

                    let tagCount = 0;
                    for (const item of items) {
                        const { generatedTitle, markdownContent } = await generateObsidianNote(this.app, item, this.settings.template);
                        const filepath = `${destFolder}/${generatedTitle}.md`;
                        const existingFile = this.app.vault.getAbstractFileByPath(filepath);

                        if (!existingFile) {
                            await this.app.vault.create(filepath, markdownContent);
                            tagCount++;
                            totalCount++;
                            this.addLog(`Created: ${generatedTitle}`, 'success', `in ${destFolder}`);
                        } else if (force && existingFile instanceof TFile) {
                            // Force update existing file
                            await this.app.vault.modify(existingFile, markdownContent);
                            tagCount++;
                            totalCount++;
                            this.addLog(`Updated: ${generatedTitle}`, 'success', `(Force update)`);
                        }
                    }
                    
                    if (tagCount === 0) {
                        this.addLog(`No new items for tag: ${tag.name}`, 'info');
                    }

                } catch (tagError) {
                    console.error(`Error processing tag ${tag.name}:`, tagError);
                    this.addLog(`Failed to process tag: ${tag.name}`, 'error', String(tagError));
                }
            }
            
            const completionMsg = `Sync complete. ${totalCount} notes processed.`;
            new Notice(`InoSync: ${completionMsg}`);
            this.addLog(completionMsg, 'success');
            
        } catch (e) {
            console.error('InoSync Sync Error:', e);
            new Notice('InoSync: Sync failed. Check settings/console.');
            this.addLog('Sync process failed globally', 'error', String(e));
        } finally {
            this.isSyncing = false;
            if (this.settingTab) {
                this.settingTab.renderReact();
            }
        }
    }
}

class InoSyncSettingTab extends PluginSettingTab {
    plugin: InoSyncPlugin;
    root: Root | null = null;
    declare containerEl: HTMLElement;

    constructor(app: App, plugin: InoSyncPlugin) {
        super(app, plugin);
        this.plugin = plugin;
    }

    display(): void {
        const { containerEl } = this;
        containerEl.innerHTML = '';
        
        // Create a root div for React with the correct scope class
        // Note: No fixed height here, let Obsidian handle scrolling of the parent
        const reactRoot = containerEl.appendChild(document.createElement('div'));
        reactRoot.className = 'inosync-settings-wrapper';
        
        // Mount React
        this.root = createRoot(reactRoot);
        this.renderReact();
    }

    hide(): void {
        if (this.root) {
            this.root.unmount();
            this.root = null;
        }
    }

    renderReact() {
        if (!this.root) return;

        this.root.render(
            React.createElement(SettingsContent, {
                settings: this.plugin.settings,
                onUpdateSettings: async (newSettings) => {
                    this.plugin.settings = newSettings;
                    await this.plugin.saveSettings();
                    this.renderReact();
                },
                onSync: (force) => this.plugin.sync(force),
                onReset: async () => {
                    this.plugin.settings = Object.assign({}, DEFAULT_SETTINGS);
                    await this.plugin.saveSettings();
                    this.renderReact();
                },
                onClearLogs: () => this.plugin.clearLogs(),
                isSyncing: this.plugin.isSyncing, 
                logs: this.plugin.logs // Pass persistent logs from plugin instance
            })
        );
    }
}