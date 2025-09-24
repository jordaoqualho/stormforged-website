# ⚡ Stormforged - Idle Horizon Guild War Tracker

A comprehensive web application for tracking and analyzing guild war performance for the **Stormforged** guild in Idle Horizon. Built with Next.js, TypeScript, and TailwindCSS, featuring real-time statistics, interactive charts, and local data storage.

## ✨ Features

### 📊 Core Functionality

- **Daily Attack Tracking**: Record each guild member's attacks (up to 5 per day) with wins/losses
- **Real-time Statistics**: Instant calculation of individual and guild win rates
- **Weekly Analysis**: Track performance across the entire guild war week
- **Historical Comparison**: Compare current week performance with previous weeks

### 📈 Analytics & Visualization

- **Interactive Charts**: Multiple chart types showing performance trends
- **Daily Breakdown**: Day-by-day performance visualization
- **Player Rankings**: Sort players by performance metrics
- **Win Rate Trends**: Track improvement over time

### 💾 Data Management

- **Local Storage**: All data stored in browser using IndexedDB
- **Data Export**: Download your data as JSON for backup
- **Data Import**: Import previously exported data
- **Data Persistence**: Automatic saving with Zustand state management

### 🎨 User Experience

- **Responsive Design**: Works perfectly on desktop and mobile
- **Intuitive UI**: Clean, modern interface with TailwindCSS
- **Tab Navigation**: Organized sections for different features
- **Real-time Updates**: Instant feedback and calculations

## 🛠️ Tech Stack

- **Framework**: Next.js 15 with App Router
- **Language**: TypeScript for type safety
- **Styling**: TailwindCSS for responsive design
- **Charts**: Recharts for data visualization
- **State Management**: Zustand with persistence
- **Storage**: IndexedDB via idb-keyval
- **Icons**: Emoji-based icons for simplicity

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- pnpm (recommended) or npm

> **Why pnpm?** pnpm offers faster installs, better disk efficiency, and stricter dependency management compared to npm. It's the recommended package manager for this project.

### Installation

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd stormforged-website
   ```

2. **Install dependencies**

   ```bash
   pnpm install
   ```

3. **Start the development server**

   ```bash
   pnpm dev
   ```

4. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 📱 How to Use

### Adding Attack Records

1. Go to the **Overview** tab
2. Fill in the "Add Attack Record" form:
   - Enter player name
   - Select date (defaults to today)
   - Enter total attacks (max 5)
   - Enter number of wins
3. Click "Add Attack Record"

### Viewing Statistics

- **Current Week Stats**: See overall guild performance
- **Daily Breakdown**: View day-by-day statistics
- **Player Performance**: Individual player rankings
- **Week-over-Week Comparison**: Compare with previous week

### Charts & Analytics

1. Go to the **Charts** tab
2. View different visualizations:
   - Daily Performance Trends
   - Player Performance Rankings
   - Weekly Comparisons
   - Win Rate Trends

### Data Management

1. Go to the **Data Management** tab
2. **Export**: Download your data as JSON
3. **Import**: Upload previously exported data
4. **Clear**: Remove all data (use with caution!)

## 📊 Key Metrics

### Individual Stats

- **Total Attacks**: Number of attacks per player per day
- **Wins**: Number of successful attacks
- **Losses**: Calculated as attacks - wins
- **Win Rate**: Percentage of successful attacks

### Guild Stats

- **Daily Win Rate**: Guild's performance for each day
- **Weekly Win Rate**: Overall guild performance for the week
- **Player Count**: Number of active players per day
- **Total Activity**: Sum of all attacks across the guild

## 🔧 Development

### Project Structure

```
src/
├── app/                 # Next.js app router
│   ├── layout.tsx      # Root layout
│   └── page.tsx        # Main page
├── components/         # React components
│   ├── AddAttackForm.tsx
│   ├── Charts.tsx
│   ├── CurrentWeekStats.tsx
│   └── DataManagement.tsx
├── lib/               # Utility functions
│   ├── calculations.ts
│   └── storage.ts
├── store/             # State management
│   └── guildWarStore.ts
└── types/             # TypeScript definitions
    └── index.ts
```

### Key Files

- `src/store/guildWarStore.ts`: Main state management with Zustand
- `src/lib/storage.ts`: IndexedDB storage utilities
- `src/lib/calculations.ts`: Statistics and calculation functions
- `src/components/Charts.tsx`: Recharts visualization components

### Available Scripts

- `pnpm dev`: Start development server
- `pnpm build`: Build for production
- `pnpm start`: Start production server
- `pnpm lint`: Run ESLint
- `pnpm release`: Create a new release (bumps version and generates changelog)

## 🚀 Release Management

This project uses `standard-version` for automated version management and changelog generation.

### Release Functions

Use the provided shell functions for easy releases:

```bash
# Source the release functions
source release.sh

# Available functions:
SimplePush   # Auto-detect version bump based on commits
PushPatch    # Create patch release (0.1.0 -> 0.1.1)
PushMinor    # Create minor release (0.1.0 -> 0.2.0)
PushMajor    # Create major release (0.1.0 -> 1.0.0)
```

### Commit Convention

Follow [Conventional Commits](https://www.conventionalcommits.org/) for automatic version bumping:

- `feat:` - New features (minor version bump)
- `fix:` - Bug fixes (patch version bump)
- `BREAKING CHANGE:` - Breaking changes (major version bump)
- `perf:` - Performance improvements
- `refactor:` - Code refactoring
- `docs:` - Documentation changes
- `style:` - Code style changes
- `test:` - Test additions/changes
- `build:` - Build system changes
- `ci:` - CI/CD changes
- `chore:` - Maintenance tasks

### Example Usage

```bash
# Make your changes and commit with conventional format
git add .
git commit -m "feat: add new battle analytics dashboard"

# Create a minor release
source release.sh
PushMinor
```

## 🎯 Future Enhancements

- **Guild Member Management**: Add/remove guild members
- **Historical Analysis**: Long-term trend analysis
- **Performance Predictions**: ML-based performance forecasting
- **Team Formation Suggestions**: Optimal team composition
- **Mobile App**: React Native version
- **Real-time Collaboration**: Multi-user support

## 📄 License

This project is licensed under the MIT License.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## ⚔️ About Idle of Horizons

This tracker is designed for the mobile strategy game "Idle of Horizons" where guilds compete in weekly wars. Each member can perform up to 5 attacks per day, and tracking this data helps optimize guild performance and strategy.

---

**Built with ❤️ for the Idle of Horizons community**
