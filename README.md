# Pomodorider 🍅
Cozy Pomodoro timer built with modern web technologies

## Features

- ⏱️ **Classic Pomodoro Technique**: 25-minute work sessions with 5-minute short breaks and 15-minute long breaks
- 🎨 **Beautiful UI**: Dark theme with smooth animations and color-coded timer modes
- 🔊 **Sound Notifications**: Customizable audio alerts when sessions complete
- ⚙️ **Flexible Settings**: Adjust timer durations, auto-start behavior, and sound preferences
- 📊 **Session Tracking**: Keep track of completed sessions and total work time
- 📱 **Responsive Design**: Works seamlessly on desktop and mobile devices
- 🚀 **Modern Stack**: Built with Nuxt.js 4, Pinia, SCSS, VueUse, and Howler.js

## Tech Stack

- **[Nuxt.js 4](https://nuxt.com/)** - Latest version of the Vue.js framework
- **[Pinia](https://pinia.vuejs.org/)** - State management
- **[SCSS](https://sass-lang.com/)** - CSS preprocessing
- **[VueUse](https://vueuse.org/)** - Collection of Vue composition utilities
- **[Howler.js](https://howlerjs.com/)** - Audio library
- **[TypeScript](https://www.typescriptlang.org/)** - Type safety

## Getting Started

### Prerequisites

- Node.js 18 or later
- npm, yarn, or pnpm

### Installation

```bash
# Clone the repository
git clone https://github.com/Grandizas/Pomodorider.git
cd Pomodorider

# Install dependencies
npm install

# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Building for Production

```bash
# Build the application
npm run build

# Preview the production build
npm run preview
```

## Usage

1. **Start a Work Session**: Click the "Start" button to begin a 25-minute work session
2. **Take Breaks**: The timer automatically switches to break mode after each work session
3. **Customize Settings**: Click the settings icon to adjust timer durations, sound preferences, and auto-start behavior
4. **Track Progress**: View your completed sessions and total work time at the bottom of the timer

## Keyboard Shortcuts

- `Space`: Start/Pause timer
- `R`: Reset timer
- `S`: Skip to next session

## Project Structure

```
├── app.vue                 # Root component
├── pages/
│   └── index.vue          # Main page
├── components/
│   ├── TimerDisplay.vue   # Timer component
│   └── SettingsPanel.vue  # Settings modal
├── stores/
│   └── timer.ts           # Pinia store
├── assets/
│   └── styles/            # SCSS styles
└── nuxt.config.ts         # Nuxt configuration
```

## Author

Created with ❤️ using Nuxt.js, Pinia, SCSS, VueUse, and Howler.js
