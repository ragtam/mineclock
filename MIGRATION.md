# MineClock - Svelte Migration

## Overview

This project has been successfully migrated from vanilla JavaScript to **Svelte** with **Bun** as the runtime and package manager.

## Framework Stack

- **Svelte 5** - Lightweight reactive framework
- **Bun** - Fast JavaScript runtime & package manager
- **Vite** - Lightning-fast build tool
- **Storybook** - Component development environment
- **Tailwind CSS** - Utility-first CSS framework

## Project Structure

```
mineclock/
├── src/
│   ├── components/          # Svelte components
│   │   ├── TimeDisplay.svelte
│   │   ├── WeatherDisplay.svelte
│   │   ├── BatteryDisplay.svelte
│   │   ├── SettingsModal.svelte
│   │   ├── WakeWordOverlay.svelte
│   │   ├── VersionInfo.svelte
│   │   └── *.stories.js     # Storybook stories
│   ├── modules/             # Original utility modules
│   ├── wake-word/           # Wake word detection
│   ├── App.svelte          # Main app component
│   ├── main.js             # Entry point
│   ├── style.css           # Global styles
│   └── index.html          # HTML template
├── .storybook/             # Storybook configuration
└── package.json
```

## Components

### TimeDisplay
Real-time clock display with auto-updating time.

### WeatherDisplay
Shows current temperature and weather emoji fetched from wttr.in API.

### BatteryDisplay
Displays battery level, charging status, and time remaining.

### SettingsModal
Modal for configuring Picovoice API key.

### WakeWordOverlay
Visual feedback overlay when wake word is detected.

### VersionInfo
Displays app version from package.json.

## Scripts

```bash
# Development server
bun run dev

# Build for production
bun run build

# Preview production build
bun run preview

# Run Storybook
bun run storybook

# Build Storybook
bun run build-storybook
```

## Development

### Start Development Server
```bash
bun run dev
```
Access at: http://localhost:5173/mineclock/

### Component Development with Storybook
```bash
bun run storybook
```
Access at: http://localhost:6006

## Adding New Components

1. Create component in `src/components/`:
```svelte
<!-- MyComponent.svelte -->
<script>
  export let prop = 'default';
</script>

<div>{prop}</div>
```

2. Create story file:
```javascript
// MyComponent.stories.js
import MyComponent from './MyComponent.svelte';

export default {
  title: 'Components/MyComponent',
  component: MyComponent,
  tags: ['autodocs'],
};

export const Default = {
  args: {
    prop: 'example',
  },
};
```

## Benefits of Svelte

1. **Tiny bundle size** (~2KB runtime)
2. **Reactive by default** - No manual state management
3. **Scoped styles** - Built-in component styling
4. **Great DX** - Clean, minimal syntax
5. **Fast performance** - Compiles to vanilla JS

## Migration Notes

All previous functionality has been preserved:
- ✅ Real-time clock updates
- ✅ Weather fetching
- ✅ Battery monitoring
- ✅ Settings management
- ✅ Wake word detection
- ✅ Wake lock functionality

The original module files (`modules/`) are still used for utilities like wake lock and wake word detection.

## Next Steps

1. Add unit tests with Vitest
2. Add E2E tests with Playwright
3. Enhance component props and customization
4. Add more interactive Storybook examples
5. Implement component composition patterns

## Resources

- [Svelte Documentation](https://svelte.dev/)
- [Storybook for Svelte](https://storybook.js.org/docs/svelte/get-started/introduction)
- [Bun Documentation](https://bun.sh/docs)
