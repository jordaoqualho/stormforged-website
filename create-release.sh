#!/bin/bash

# Generate release notes for GitHub release
# Usage: ./create-release.sh v1.0.0

TAG=$1
if [ -z "$TAG" ]; then
    echo "Usage: ./create-release.sh <tag>"
    echo "Example: ./create-release.sh v1.0.0"
    exit 1
fi

echo "Creating release notes for $TAG..."

# Extract version number
VERSION=${TAG#v}

# Create release notes
cat > release-notes.md << EOF
## 🚀 Release $TAG

**Stormforged Guild War Tracker - Production Release**

This is the first major production release of the Stormforged Guild War Tracker, now live for players!

### 🎯 What's New

- **Complete Guild War Tracking System** - Track daily attacks, wins, losses, and draws
- **Real-time Analytics** - Instant statistics and performance insights
- **Achievement System** - Unlock achievements for guild milestones
- **Data Management** - Export/import functionality for data backup
- **RPG-themed UI** - Immersive gaming experience with sound effects
- **Responsive Design** - Works perfectly on desktop and mobile
- **Automated Release System** - Professional release management

### 🔧 Technical Features

- Built with Next.js 15.5.3 and React 19.1.0
- Styled with TailwindCSS
- State management with Zustand
- Charts with Recharts
- Sound effects with Howler.js
- Data persistence with IndexedDB
- Microsoft Clarity analytics integration

### 📊 Performance

- **First Load JS**: 280 kB
- **Main Route**: 165 kB
- **Optimized Build**: Production-ready with Turbopack

### 🔗 Links

- **Live Demo**: https://stormforged-website.vercel.app
- **Repository**: https://github.com/jordaoqualho/stormforged-website
- **Changelog**: [View Full Changelog](https://github.com/jordaoqualho/stormforged-website/blob/main/CHANGELOG.md)

### 🎮 For Players

This tracker is designed for the **Stormforged Guild** in **Idle Horizon**. Track your guild's performance, monitor individual player stats, and optimize your war strategy!

---

**Created by Jordones for the Stormforged Guild** ⚔️

*Built with ❤️ for the Idle of Horizons community*
EOF

echo "Release notes created in release-notes.md"
echo ""
echo "To create the GitHub release:"
echo "1. Go to: https://github.com/jordaoqualho/stormforged-website/releases/new"
echo "2. Select tag: $TAG"
echo "3. Release title: Release $TAG"
echo "4. Copy contents from release-notes.md"
echo "5. Click 'Publish release'"
echo ""
echo "Or use GitHub CLI (if authenticated):"
echo "gh release create $TAG --title \"Release $TAG\" --notes-file release-notes.md"
