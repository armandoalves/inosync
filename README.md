# InoSync

**InoSync** is an plugin that allows you to sync **Inoreader** public feeds directly into your vault as notes.

Turn your RSS reading into a knowledge base by automatically importing articles from specific tags into your vault folders.

![InoSync Screenshot](https://raw.githubusercontent.com/armandoalves/inosync/main/inosync.png)

## Features

- **Sync Public Feeds**: Import articles from any public Inoreader tag (Broadcast).
- **Auto-Organization**: Map different Inoreader tags to specific folders in your vault.
- **Smart Parsing**: Paste an RSS feed URL to automatically configure User ID and Tags.
- **Deduplication**: Automatically checks for existing notes to prevent duplicates.
- **Image Support**: Automatically imports external images into the Markdown content.
- **Force Sync**: Option to update existing notes if content has changed.
- **Startup Sync**: Optionally run the sync process automatically.
- **Activity Log**: Built-in log viewer to track sync status and errors.

## Installation

### From Community Plugins
1. Open Settings > **Community Plugins**.
2. Turn off "Safe Mode".
3. Click "Browse" and search for **InoSync**.
4. Click **Install** and then **Enable**.


## Usage

1. **Get your Inoreader Feed URL**:
   - Go to your Inoreader "Broadcast" or Public Tag page.
   - Copy the URL (e.g., `https://www.inoreader.com/stream/user/1005.../tag/Tech`).

2. **Configure Settings**:
   - Open InoSync Settings.
   - Paste the URL into the **Parse from RSS Link** field and click **Auto-Fill**.
   - Alternatively, manually enter your **User ID** and add **Tags**.

3. **Sync**:
   - Click the **Sync** button in settings.
   - Or use the Command Palette (`Ctrl/Cmd + P`) and search for `InoSync: Sync Now`.

## Development

1. Clone the repository.
   ```bash
   git clone https://github.com/armandoalves/inosync.git
   ```
2. Install dependencies.
   ```bash
   npm install
   ```
3. Build the plugin.
   ```bash
   npm run build
   ```

## License

MIT
