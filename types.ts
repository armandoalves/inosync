
export interface TagConfig {
  name: string;
  folder: string; // If empty, uses default targetFolder
}

export interface PluginSettings {
  userId: string;
  tags: TagConfig[];
  targetFolder: string;
  syncOnStartup: boolean;
  template: string;
}

export interface SyncLog {
  id: string;
  timestamp: number;
  status: 'success' | 'error' | 'info';
  message: string;
  details?: string;
}

export interface ToastMessage {
    id: string;
    message: string;
    type: 'info' | 'success' | 'error';
}

export const DEFAULT_SETTINGS: PluginSettings = {
  userId: '',
  tags: [],
  targetFolder: '',
  syncOnStartup: false,
  template: `---
id: "{{id}}"
title: "{{title}}"
author: "{{author}}"
date: {{date}}
source: "{{source}}"
tags: [inoreader, rss, {{tags}}]
url: {{url}}
---

# {{title}}

{{content}}

[View Original Source]({{url}})
`
};
