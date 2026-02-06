# Comparative Scripture Research Platform

A high-precision academic platform for parallel analysis, thematic cross-referencing, and linguistic study across the Torah, Bible, and Noble Qur'an.

## Key Features

- **Trilingual Parallel Reader**: Compare Torah (HEB/ENG), Bible (GRK/ENG), and Quran (ARB/ENG) side-by-side.
- **AI Research Assistant**: Advanced thematic analysis with multiple perspectives (Academic, Timeline, Critical, etc.).
- **Linguistic Analysis**: Interactive word-level root mapping for Hebrew, Greek, and Arabic terms.
- **Unified Historical Timeline**: Scriptural events mapped alongside archaeological anchors.
- **Research Library**: Ingest scholarly PDFs and commentaries with AI-driven evidence linking.
- **Researcher Notebook**: Markdown-based synthesis system with auto-citations and AI note processing.

## Getting Started

### Prerequisites

- Node.js (Latest LTS recommended)
- npm

### Installation

1. Navigate to the project directory:
   ```bash
   cd scripture-research-app
   ```
2. Install dependencies (if not already done):
   ```bash
   npm install
   ```

### Running the App

Start the development server:
```bash
npm run dev
```

The app will be available at `http://localhost:5173`.

### Data Setup

The application uses pre-processed JSON datasets located in `public/data/`. If you wish to refresh the datasets, you can use the scripts in the `scripts/` directory.

## Technical Stack

- **Frontend**: React 19, TypeScript, Vite
- **Styling**: Vanilla CSS (Premium Research Aesthetic)
- **State Management**: React Context API
- **Data**: Static JSON manuscript databases
