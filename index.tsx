import React from 'react';
import { createRoot } from 'react-dom/client';
import { App } from './App';

// Ensure we only mount the simulator app if:
// 1. The 'root' element exists (HTML container)
// 2. We are NOT running inside Obsidian (where window.app is defined)
// This prevents the simulator from hijacking the Obsidian UI when the plugin loads.
const rootElement = document.getElementById('root');
if (rootElement && !(window as any).app) {
    const root = createRoot(rootElement);
    root.render(<App />);
}