# PlanBoard

A high-performance visual whiteboard and diagramming studio designed for strategists, engineers, product managers, and thinkers. PlanBoard combines freeform whiteboard sketching with structured flowchart automation, live chart data visualization, and an open portable `.pln` specification.

<p align="left">
  <a href="https://react.dev/"><img src="https://img.shields.io/badge/React-19.2-61DAFB?style=for-the-badge&logo=react&logoColor=black" alt="React 19" /></a>
  <a href="https://www.typescriptlang.org/"><img src="https://img.shields.io/badge/TypeScript-5.x-3178C6?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript" /></a>
  <a href="https://vite.dev/"><img src="https://img.shields.io/badge/Vite-6.x-646CFF?style=for-the-badge&logo=vite&logoColor=white" alt="Vite" /></a>
  <a href="https://tailwindcss.com/"><img src="https://img.shields.io/badge/Tailwind_CSS-3.4-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white" alt="Tailwind CSS" /></a>
  <a href="https://www.radix-ui.com/"><img src="https://img.shields.io/badge/Radix_UI-Primitives-161618?style=for-the-badge&logo=radix-ui&logoColor=white" alt="Radix UI" /></a>
  <a href="https://recharts.org/"><img src="https://img.shields.io/badge/Recharts-Data_Viz-22B5BF?style=for-the-badge" alt="Recharts" /></a>
  <a href="https://lucide.dev/"><img src="https://img.shields.io/badge/Lucide_Icons-Vector-F56565?style=for-the-badge&logo=feather&logoColor=white" alt="Lucide Icons" /></a>
  <a href="LICENSE"><img src="https://img.shields.io/badge/License-MIT-10B981?style=for-the-badge" alt="License MIT" /></a>
</p>

---

## Table of Contents

- [Overview](#overview)
- [Key Features](#key-features)
  - [Dual Workspace Modes](#dual-workspace-modes)
  - [Interactive Data & Metric Visualizations](#interactive-data--metric-visualizations)
  - [Smart Flowchart Engine & Connector Snapping](#smart-flowchart-engine--connector-snapping)
  - [Open `.pln` Specification](#open-pln-specification)
  - [Multi-Format Vector & Raster Export](#multi-format-vector--raster-export)
  - [Pre-Engineered Strategy Templates](#pre-engineered-strategy-templates)
- [Technology Stack](#technology-stack)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Cloning the Repository](#cloning-the-repository)
  - [Installation](#installation)
  - [Running the Development Server](#running-the-development-server)
  - [Production Build & Preview](#production-build--preview)
- [Available Scripts](#available-scripts)
- [Keyboard Shortcuts](#keyboard-shortcuts)
- [The `.pln` File Format Specification](#the-pln-file-format-specification)
- [Project Architecture](#project-architecture)
- [License](#license)

---

## Overview

PlanBoard bridges the gap between chaotic freehand whiteboarding and structured architectural diagrams. Unlike traditional canvas tools that restrict users to static shapes, PlanBoard enables teams to render dynamic analytical graphs, calculate metrics, connect flowchart logic blocks with directional ports, and export artifacts at up to 4x raster resolution or lossless vector PDF/SVG formats.

The application runs entirely client-side with persistent storage, zero third-party telemetry, and instant project loading.

---

## Key Features

### Dual Workspace Modes

- **Planning Whiteboard**: Infinite freeform canvas engineered for brainstorming, product ideation, sticky notes organization, freehand pen/highlighter sketching, and live metric tracking.
- **Flowchart & Logic Studio**: Dedicated diagramming workspace featuring industry-standard flowchart nodes (Process, Decision, Terminator, Data/IO, Database, Document, Subprocess, Preparation, Delay, Cloud) paired with intelligent anchor ports.

### Interactive Data & Metric Visualizations

Embed customizable analytics directly alongside architecture plans without external screenshots:
- **Bar Charts**: Categorical comparisons and resource allocation.
- **Line Charts**: Trend analysis and time-series performance.
- **Area Charts**: Cumulative distribution and volume projections.
- **Pie Charts**: Composition breakdown and market share distribution.
- **KPI Metric Cards**: Real-time figures with customizable prefixes, suffixes, trend indicators, and description labels.
- **Color Themes**: Vibrant, Monochrome, Emerald, Sunset, Ocean, and Purple palettes.

### Smart Flowchart Engine & Connector Snapping

- Four-quadrant connection ports (Top, Right, Bottom, Left) on all diagram elements.
- Connector types including Straight, Elbow (orthogonal routing), Curved, Bidirectional, and Dashed.
- Real-time drag-and-snap logic that binds connector terminals to active node anchor ports.

### Open `.pln` Specification

All plans are saved as transparent, human-readable JSON files adhering to the `PLAN_BOARD_SPEC` v1.0 standard. Users can store diagrams locally, commit them directly to Git version control, or share them across environments with full cross-platform compatibility.

### Multi-Format Vector & Raster Export

Export canvas regions or full compositions:
- **PNG**: Crisp bitmap exports available in 1x, 2x, and ultra-high-definition 4x resolution scales.
- **SVG**: Scalable vector output maintaining exact line paths, typography, and mathematical node boundaries.
- **PDF**: Multi-page or single-sheet document rendering powered by jsPDF.
- **PLN**: Native project archive containing element definitions, layout coordinates, metadata tags, and viewport states.

### Pre-Engineered Strategy Templates

PlanBoard includes a suite of production-ready templates ready for instant deployment:
- **Business Model Canvas**: Comprehensive 9-box strategic grid featuring integrated ARR forecast and cost distribution graphs.
- **SWOT Strategic Matrix**: Structured quadrant analysis for Strengths, Weaknesses, Opportunities, and Threats with factor weighting charts.
- **Product Sprint & Roadmap Kanban**: Backlog, In-Progress, Review, and Done workflows with burnup velocity tracking.
- **Standard Business Process Flowchart**: Operational workflow diagram utilizing standard decision and terminator elements.
- **ETL Data Engineering Pipeline**: End-to-end data processing flowchart illustrating ingestion, transformation, staging, and lakehouse storage.
- **Student Study & Revision Matrix**: Academic schedule planner with GPA target benchmarks and countdown metrics.

---

## Technology Stack

| Layer | Technology | Details |
| :--- | :--- | :--- |
| **Frontend Framework** | React 19 | Modern component architecture, functional hooks, concurrent features |
| **Language** | TypeScript 5 | Strict type verification and interface contracts |
| **Build System** | Vite 6 | Lightning-fast Hot Module Replacement (HMR) and optimized rollup bundling |
| **Styling & Design** | Tailwind CSS 3.4 | Utility-first responsive dark and light design system |
| **Component Primitives** | Radix UI | Accessible unstyled primitives for dropdowns, popovers, and dialogs |
| **Data Visualization** | Recharts 3.1 | Responsive SVG charting engine for canvas analytics |
| **Document Export** | jsPDF & html2canvas | Client-side vector and raster document compilation |
| **Iconography** | Lucide React | Clean, scalable vector system icons |
| **Linter** | Oxlint | High-speed Rust-based code quality verification |

---

## Getting Started

Follow these instructions to clone the repository, install dependencies, and run the project locally.

### Prerequisites

Ensure the following runtimes are installed on your machine:
- **Node.js**: Version 18.0.0 or higher (Node 20+ LTS recommended)
- **Package Manager**: `npm` (version 9+), `pnpm`, or `yarn`
- **Git**: Version 2.30+ installed and configured

Check runtime versions:
```bash
node -v
npm -v
git --version
```

### Cloning the Repository

Clone the project from GitHub and navigate into the project directory:

```bash
git clone https://github.com/faizancodecom/planning-board.git
cd planning-board
```

### Installation

Install all required production and development dependencies:

```bash
npm install
```

> If you are using `pnpm` or `yarn`:
> ```bash
> pnpm install
> # or
> yarn install
> ```

### Running the Development Server

Start the local Vite development server with Hot Module Replacement:

```bash
npm run dev
```

Once the server initializes, open your browser and navigate to:
```
http://localhost:5173
```

### Production Build & Preview

To generate an optimized production bundle:

```bash
npm run build
```

The compiled output will be written to the `dist/` directory. To test the production build locally before deployment:

```bash
npm run preview
```

---

## Available Scripts

The project includes standard scripts defined in `package.json`:

| Command | Action |
| :--- | :--- |
| `npm run dev` | Starts the Vite local development server on default port `5173`. |
| `npm run build` | Runs TypeScript compilation (`tsc -b`) followed by the Vite production build. |
| `npm run preview` | Spins up a local static server to preview production assets in `dist/`. |
| `npm run lint` | Analyzes code quality and syntax with the Oxlint engine. |

---

## Keyboard Shortcuts

PlanBoard provides keyboard shortcuts designed for rapid canvas manipulation:

| Shortcut | Context | Action |
| :--- | :--- | :--- |
| `Ctrl + K` / `Cmd + K` | Global | Open Quick Search and Project Switcher modal |
| `V` | Canvas | Activate Selection / Transform tool |
| `H` | Canvas | Activate Pan / Hand tool |
| `P` | Canvas | Select Freehand Pen tool |
| `M` | Canvas | Select Marker tool |
| `S` | Canvas | Place Sticky Note |
| `T` | Canvas | Place Text Element |
| `R` | Canvas | Draw Rectangle |
| `C` | Canvas | Draw Circle |
| `D` | Canvas | Draw Diamond |
| `E` | Canvas | Activate Eraser tool |
| `F` | Canvas | Toggle Flowchart node palette |
| `Ctrl + Z` / `Cmd + Z` | Canvas | Undo last element mutation |
| `Ctrl + Y` / `Cmd + Y` | Canvas | Redo previous mutation |
| `Ctrl + D` / `Cmd + D` | Canvas | Duplicate currently selected element |
| `Delete` / `Backspace` | Canvas | Remove currently selected element |
| `Escape` | Canvas | Deselect element or close active tool modal |

---

## The `.pln` File Format Specification

PlanBoard stores canvases using an open JSON structure. Every valid plan conforms to the following schema:

```json
{
  "format": "PLAN_BOARD_SPEC",
  "version": "1.0.0",
  "metadata": {
    "id": "pln_m8a1b2c3_9x4z",
    "title": "Cloud Infrastructure Migration",
    "description": "Architecture diagrams and milestones for AWS migration.",
    "author": "Engineering Team",
    "tags": ["Cloud", "DevOps", "Infrastructure"],
    "createdAt": "2026-10-22T08:00:00.000Z",
    "updatedAt": "2026-10-22T14:30:00.000Z",
    "category": "flowchart",
    "boardType": "flowchart",
    "isFavorite": true
  },
  "viewport": {
    "zoom": 1.0,
    "panX": 0,
    "panY": 0,
    "gridType": "dots",
    "theme": "dark"
  },
  "elements": [
    {
      "id": "node_01",
      "type": "shape",
      "shapeType": "flowchart-database",
      "x": 240,
      "y": 180,
      "width": 160,
      "height": 100,
      "fill": "#18181b",
      "stroke": "#3b82f6",
      "strokeWidth": 2,
      "text": "PostgreSQL Primary",
      "zIndex": 1
    }
  ]
}
```

---

## Project Architecture

```
planning-board/
├── public/                     # Static assets and favicons
│   ├── favicon.svg
│   ├── icons.svg
│   └── Scrum board-rafiki.svg
├── src/
│   ├── assets/                 # App illustrations and graphic assets
│   ├── components/
│   │   ├── dashboard/          # Dashboard view, header, hero, search, modals
│   │   │   ├── DashboardHeader.tsx
│   │   │   ├── DashboardHero.tsx
│   │   │   ├── ProjectGrid.tsx
│   │   │   ├── ProjectList.tsx
│   │   │   ├── SearchModal.tsx
│   │   │   └── TemplateSelector.tsx
│   │   ├── editor/             # Canvas workspace, toolbar, panels, headers
│   │   │   ├── elements/       # Element renderers (Shape, Sticky, Graph, etc.)
│   │   │   ├── Canvas.tsx      # Core interactive board canvas engine
│   │   │   ├── ChartConfigModal.tsx
│   │   │   ├── FlowchartPanel.tsx
│   │   │   ├── PropertiesPanel.tsx
│   │   │   └── Toolbar.tsx
│   │   └── ui/                 # Accessible Radix UI design primitives
│   ├── hooks/
│   │   ├── useCanvasEngine.ts  # History stack, viewport, element lifecycle
│   │   └── useProjects.ts      # Project CRUD, filtering, tags, local storage
│   ├── lib/
│   │   ├── export-canvas.ts    # PNG, PDF, and SVG rendering engines
│   │   ├── pln-file.ts         # .pln format validation and serialization
│   │   ├── storage.ts          # Storage persistence layer
│   │   └── templates.ts        # Production business and logic templates
│   ├── types/
│   │   └── board.ts            # TypeScript definitions for canvas elements
│   ├── App.tsx                 # Root application controller and routing
│   ├── main.tsx                # React DOM entrypoint
│   └── index.css               # Tailwind CSS declarations and base styles
├── .gitignore                  # Git exclusion rules
├── components.json             # Shadcn / Radix configuration
├── package.json                # Project dependencies and operational scripts
├── tailwind.config.js          # Tailwind theme and layout configuration
├── tsconfig.json               # TypeScript compiler configuration
└── vite.config.ts              # Vite bundling pipeline configuration
```

---

## License

This project is licensed under the [MIT License](LICENSE).
