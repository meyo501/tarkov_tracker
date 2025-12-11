# Tarkov Tracker

A desktop application built with Tauri and React for tracking items you need to find in Escape from Tarkov, ARC Raiders or any other loot based extraction shooter. Keep track of quest items, hideout materials, and trader requirements with an intuitive interface.

## Features

- **Item Tracking**: Add items with quantities you need to find
- **Priority System**: Mark items as high priority for quick identification
- **Tagging System**: Organize items with custom tags (e.g., quest, hideout, trader)
- **History View**: Track all items you've found with timestamps
- **Restore Items**: Easily restore items from history back to your tracking list
- **Autocomplete**: Smart autocomplete suggests previously used item names
- **Export/Import**: Backup and restore your data with JSON export/import functionality
- **Local Storage**: All data is stored locally on your device
- **Modern UI**: Dark theme interface built with Tailwind CSS

## Prerequisites

Before building the application, make sure you have the following installed:

- **Node.js** (v18 or higher) - [Download](https://nodejs.org/)
- **Rust** (latest stable version) - [Download](https://www.rust-lang.org/tools/install)
- **System Dependencies** for Tauri:
  - **Windows**: Microsoft Visual Studio C++ Build Tools or Visual Studio 2022
  - **macOS**: Xcode Command Line Tools (`xcode-select --install`)
  - **Linux**: 
    ```bash
    sudo apt update
    sudo apt install libwebkit2gtk-4.0-dev \
      build-essential \
      curl \
      wget \
      libssl-dev \
      libgtk-3-dev \
      libayatana-appindicator3-dev \
      librsvg2-dev
    ```

## Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/tarkov_tracker.git
   cd tarkov_tracker
   ```

2. Install Node.js dependencies:
   ```bash
   npm install
   ```

## Development

To run the application in development mode:

```bash
npm run tauri:dev
```

This will:
- Start the Vite dev server
- Launch the Tauri application window
- Enable hot-reload for React components

## Building the Application

### Development Build

To create a development build:

```bash
npm run tauri:build
```

### Production Build

For a production-ready build, the same command is used:

```bash
npm run tauri:build
```

The built application will be located in:
- **Windows**: `src-tauri/target/release/tarkov-tracker.exe`
- **macOS**: `src-tauri/target/release/bundle/macos/Tarkov Tracker.app`
- **Linux**: `src-tauri/target/release/tarkov-tracker`

### Installer Packages

After building, installer packages will be generated in `src-tauri/target/release/bundle/`:
- **Windows**: `.msi` and `.exe` installers
- **macOS**: `.dmg` and `.app` bundles
- **Linux**: `.deb` and `.AppImage` packages

## Environment Variables (Optional)

If you plan to use Supabase for cloud sync (currently configured but not required), create a `.env` file in the root directory:

```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

**Note**: The application currently works entirely with local storage, so these environment variables are optional.

## Project Structure

```
tarkov_tracker/
├── src/                    # React frontend source code
│   ├── components/         # React components
│   ├── lib/               # Utility functions and Supabase client
│   └── App.tsx            # Main application component
├── src-tauri/             # Tauri backend (Rust)
│   ├── src/               # Rust source code
│   └── tauri.conf.json    # Tauri configuration
├── dist/                  # Built frontend (generated)
└── package.json           # Node.js dependencies and scripts
```

## Available Scripts

- `npm run dev` - Start Vite dev server (frontend only)
- `npm run build` - Build frontend for production
- `npm run tauri:dev` - Run Tauri app in development mode
- `npm run tauri:build` - Build Tauri app for production
- `npm run lint` - Run ESLint
- `npm run typecheck` - Run TypeScript type checking

## Technologies Used

- **Frontend**: React 18, TypeScript, Tailwind CSS, Vite
- **Backend**: Tauri 2.x, Rust
- **Icons**: Lucide React
- **Storage**: LocalStorage (with optional Supabase integration)

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is open source and available under the MIT License.

## Acknowledgments

Built for the Escape from Tarkov community to help track quest items and hideout materials more efficiently.

