# Runna 🏃‍♂️

A comprehensive activity tracking and fitness management mobile application built with React Native and Expo. Track your runs, workouts, and physical activities with real-time GPS mapping, detailed statistics, and personalized schedules.

## ✨ Key Highlights

- **Real-time GPS Tracking** with Kalman filtering for accuracy
- **Background Location Tracking** continues even when app is backgrounded
- **Live Activity Progress** notifications showing duration, distance, and pace
- **Persistent Data Storage** with SQLite and Drizzle ORM
- **Smart Location Processing** with preprocessing and validation
- **Foreground & Background Tracking** modes for optimal battery usage
- **Offline-first** architecture with automatic sync

## 📱 Features

### Activity Tracking

- **Real-time GPS Tracking**: Accurate GPS positioning with Kalman filtering
- **Dual-mode Tracking**: High-accuracy foreground + efficient background tracking
- **Live Progress Updates**: Real-time notifications showing duration, distance, and pace
- **Route Visualization**: Interactive MapLibre maps showing your exact route
- **Activity Controls**: Start, pause, resume, and stop tracking with one tap
- **Automatic Pause Detection**: Smart pause handling for natural activity flow

### Dashboard & Home Screen

- **Today's Summary**: Quick overview of activities and progress for today
- **Weekly Statistics**: Track your activity patterns across the entire week
- **Quick Stats**: See total distance, duration, and calories at a glance
- **Activity Queue**: View upcoming scheduled activities and reminders
- **Recent Activities**: Quick access to your latest 5-10 completed activities

### Activity Management

- **Complete History**: Browse all recorded activities with sorting and filtering
- **Activity Details**: Comprehensive analysis with elevation, pace curves, and splits
- **Route Replay**: Visualize your route playback on the map
- **Activity Editing**: Update activity details, notes, and metadata
- **Batch Delete**: Remove multiple activities at once
- **Export Data**: Export activity data for analysis

### Statistics & Analytics

- **Performance Metrics**: Distance, duration, average pace, and calories
- **Training Zones**: Time spent in different pace zones
- **Pace Analysis**: See your best and slowest segments
- **Trend Analysis**: Visual trends showing improvement over time
- **Weekly Targets**: Track progress toward weekly fitness goals
- **Personal Records**: Track your best performances

### User Management

- **Onboarding**: Intuitive step-by-step setup for first-time users
- **User Profile**: Create profile with personal information
- **Goal Setting**: Set fitness goals and targets
- **Preferences**: Customize units (metric/imperial), themes, and notifications
- **Data Privacy**: All data stored locally on device, no cloud sync

### Smart Features

- **Smart Notifications**: Push reminders for scheduled activities
- **Live Notifications**: Progress bar notifications during activities
- **Background Tracking**: Location tracking even when app is closed
- **Offline First**: Works without internet connection
- **Auto-save**: Automatically saves activity data periodically
- **Dark/Light Theme**: Automatic theme based on system settings or manual toggle
- **Persistent Storage**: All activities permanently saved locally

## 🛠️ Tech Stack

- **Framework**: React Native with [Expo](https://expo.dev)
- **Language**: TypeScript
- **Routing**: Expo Router (file-based routing)
- **Styling**: Tailwind CSS via NativeWind
- **Maps**: MapLibre React Native
- **Database**: SQLite with Drizzle ORM
- **State Management**: React Query (@tanstack/react-query)
- **Navigation**: React Navigation (Bottom Tabs)
- **Location Services**: Expo Location with Kalman Filtering
- **GPS Tracking**: Foreground & Background tracking
- **Notifications**: Expo Notifications with push support
- **Storage**: Async Storage + SQLite for persistence
- **Sensors**: Expo Sensors for motion tracking
- **Task Management**: Expo Task Manager for background jobs
- **Build Tools**: Babel, Metro bundler
- **Linting**: ESLint with TypeScript support
- **Format**: Prettier for code formatting

## 📁 Project Structure

```
src/
├── features/              # Feature screens and components
│   ├── ActivityTracking/  # Real-time activity tracking
│   ├── ActivityDetails/   # Activity details view
│   ├── history/          # Activity history screen
│   ├── home/             # Dashboard home screen
│   ├── onboarding/       # Onboarding flow
│   ├── profile/          # User profile screens
│   ├── schedule/         # Activity scheduling
│   ├── settings/         # App settings
│   └── statistic/        # Statistics and analytics
├── navigation/           # Navigation configuration
│   ├── MainNavigator
│   ├── OnboardingNavigator
│   ├── ProfileNavigator
│   └── RootNavigator
└── shared/              # Shared utilities and components
    ├── components/      # Reusable UI components
    ├── context/        # React context providers
    ├── db/            # Database schema and migrations
    ├── hooks/         # Custom React hooks
    ├── lib/           # Utility functions and data
    ├── providers/     # Context providers
    ├── services/      # Business logic services
    ├── stores/        # State management
    ├── types/         # TypeScript type definitions
    └── utils/         # Helper utilities
```

## 🚀 Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- Expo CLI: `npm install -g expo-cli`
- Git

### Installation

1. **Clone the repository**

    ```bash
    git clone <repository-url>
    cd runna
    ```

2. **Install dependencies**

    ```bash
    npm install
    # or
    yarn install
    ```

3. **Set up environment variables** (if needed)

    ```bash
    cp .env.example .env.local
    # Edit .env.local with your configuration
    ```

4. **Start the development server**
    ```bash
    npm start
    # or
    yarn start
    ```

### Running on Different Platforms

**Android Emulator:**

```bash
npm run android
# Requires Android SDK and emulator to be set up
```

**iOS Simulator (macOS only):**

```bash
npm run ios
# Requires Xcode command line tools
```

**Web Browser:**

```bash
npm run web
```

**Expo Go App (Recommended for quick testing):**

- Start dev server: `npm start`
- Scan the QR code from terminal with Expo Go app
- Download [Expo Go for iOS](https://apps.apple.com/app/expo-go/id982107779)
- Download [Expo Go for Android](https://play.google.com/store/apps/details?id=host.exp.exponent)

### Quick Start on Physical Device

1. Install Expo Go from your device's app store
2. From project directory, run: `npm start`
3. Scan QR code displayed in terminal with your device camera
4. Opens in Expo Go automatically

## 💻 Development

### Running Linter

```bash
npm run lint
```

### Database Migrations

The app uses Drizzle ORM for database management. Database schema is defined in `src/shared/db/schema/`.

### Running Tests

```bash
npm test
```

## 🏗️ Architecture & Services

### Core Services

#### Location Service (`src/shared/services/location/location.service.ts`)

- **Dual-mode tracking**: Preview mode (UI only) and Recording mode (full GPS tracking)
- **Foreground & Background modes**: High accuracy in foreground, deferred updates in background
- **Kalman Filtering**: Smooths GPS coordinates for more accurate path tracking
- **Location Preprocessing**: Validates and filters coordinates based on accuracy and distance
- **Reverse Geocoding**: Throttled address lookup (every 30 seconds in recording mode)
- **AppState Listener**: Automatically switches tracking modes based on app state

**Key Methods:**

- `start(enableBackground?)` - Start activity recording
- `stop()` - Stop all tracking
- `onLocationUpdate(callback)` - Register location update listeners
- `emitBackgroundLocation(location)` - Process background location updates

#### Record Activity Service (`src/shared/services/record-activity.service.ts`)

- **Activity State Management**: Tracks active, paused, and stopped states
- **Duration Calculation**: Accurately computes elapsed time accounting for pauses
- **Progress Updates**: Updates notifications every second with live metrics
- **Coordinate Tracking**: Stores GPS coordinates with activity reference
- **Activity Finalization**: Computes statistics (distance, pace, calories, speed)
- **Error Recovery**: Graceful error handling prevents app crashes

**Key Methods:**

- `start(type?)` - Begin new activity recording
- `pause()` - Pause current activity
- `resume()` - Resume paused activity
- `stop()` - Finish and save activity
- `discard()` - Discard activity without saving
- `restore()` - Restore activity from previous session
- `onDurationUpdate(callback)` - Subscribe to duration updates

#### Notification Service (`src/shared/services/notification/notification.service.ts`)

- **Scheduled Notifications**: Push notifications for activity reminders
- **Progress Notifications**: Live activity progress display during recording
- **Sticky Notifications**: Persistent foreground notifications for ongoing activities

**Key Methods:**

- `requestPermissions()` - Request notification permissions
- `scheduleActivityNotification(schedule)` - Schedule recurring activity reminders
- `updateActivityProgressNotification(...)` - Update live progress display
- `cancelActivityProgressNotification(activityId)` - Clear progress notification

## 🔧 Configuration

### GPS Configuration (`src/shared/constant/constant.ts`)

```typescript
GPS_CONFIG = {
    LOCATION_ACCURACY: Accuracy.BestForNavigation,
    LOCATION_TIME_INTERVAL_MS: 1000, // Update every 1 second
    DISTANCE_INTERVAL_METERS: 5, // Update every 5 meters
    LOCATION_GEOCODE_INTERVAL_MS: 30000, // Geocode every 30 seconds
};

GPS_BACKGROUND_TRACKING_CONFIG = {
    DEFERRED_UPDATES_INTERVAL: 500, // Batch updates every 500ms
    DEFERRED_UPDATES_DISTANCE: 30, // Batch every 30 meters
};
```

## 🐛 Troubleshooting

### App Crashes When Starting Activity

**Symptoms**: App exits when clicking "Start Activity"

**Solutions**:

1. Ensure location permissions are granted: Settings → App Permissions → Location
2. Check that location service is enabled on device
3. Verify no other location-tracking app is using exclusive GPS access
4. Clear app cache: Settings → Apps → Runna → Storage → Clear Cache

### GPS Not Tracking Accurately

**Symptoms**: Route appears incorrect or too many location jumps

**Solutions**:

1. Ensure "High Accuracy" location mode is enabled
2. Move to open area with better satellite reception
3. Wait 30-60 seconds for GPS to stabilize
4. Close other navigation apps that might interfere

### Progress Notification Not Showing

**Symptoms**: No notification bar during activity recording

**Solutions**:

1. Check notification permissions: Settings → Notifications → Runna
2. Ensure "Allow Notifications" is enabled
3. Verify "Allow Badges" is turned on
4. Check Do Not Disturb is not interfering

### Activity Won't Stop/Save

**Symptoms**: Stop button not working or activity not saving

**Solutions**:

1. Force close the app and reopen
2. Clear app storage: Settings → Apps → Runna → Storage → Manage Storage
3. Check device storage isn't full
4. Restart device and try again

## 📊 Database Schema

The app uses SQLite with Drizzle ORM. Key tables:

- **activities**: Completed activity records with stats
- **coordinates**: GPS coordinate waypoints for routes
- **schedules**: Scheduled activity reminders
- **user_profile**: User information and preferences

Migrations are auto-applied on app startup.

## 🔐 Permissions

The app requires the following permissions:

- **Location (Foreground & Background)**: GPS tracking during activities
- **Notifications**: Schedule reminders and show progress updates
- **Calendar (Optional)**: Sync with device calendar

## 📱 Device Compatibility

- **Minimum SDK**: Android 8.0+, iOS 13.0+
- **Tested Devices**: Android 11+ and iOS 14+
- **Recommended**: Modern devices with GPS and 4GB+ RAM

## 🚀 Performance Tips

1. **Close background apps** before recording to improve GPS accuracy
2. **Keep phone screen on** during recording for better tracking consistency
3. **Use High Accuracy mode** in location settings for best results
4. **Charge device** before long activities (GPS is power-intensive)

## 📚 Learn More

- [Expo Documentation](https://docs.expo.dev/)
- [React Native Documentation](https://reactnative.dev/)
- [MapLibre Documentation](https://maplibre.org/)
- [Drizzle ORM](https://orm.drizzle.team/)
- [NativeWind Documentation](https://www.nativewind.dev/)
- [React Query Documentation](https://tanstack.com/query/latest)
- [Expo Location API](https://docs.expo.dev/versions/latest/sdk/location/)

## 🐛 Debug & Development

### Enable Debug Logging

All services use the `logger` utility. To see verbose logs:

```typescript
// In logger configuration
logger.setLevel("DEBUG"); // Shows all logs including emitted locations
```

### Common Development Tasks

**Clear App Cache & Data:**

```bash
# Android
npm run android -- --reset-cache

# iOS (clear Simulator data)
xcrun simctl erase all
```

**Reset Database:**

```bash
# Delete local database to start fresh
# Android: Device Settings → Apps → Runna → Storage → Clear Data
# iOS: Settings → Runna → Delete App & Re-download
```

**Hot Reload Development:**

```bash
npm start
# Press 'r' in terminal to reload
# Press 'w' for web version
```

**Debug with React Native Debugger:**

```bash
npm start
# Select "Debugger" option from menu
```

## 📝 Common Development Workflows

### Adding a New Feature

1. Create feature folder in `src/features/YourFeature/`
2. Add screen component `src/features/YourFeature/YourFeatureScreen.tsx`
3. Create types in `src/shared/types/type.ts`
4. Create service in `src/shared/services/` if needed
5. Add route to `src/navigation/RootNavigator.tsx`
6. Test in Expo Go

### Adding a Service

1. Create file in `src/shared/services/YourService/your-service.ts`
2. Export singleton instance: `export const yourService = new YourService();`
3. Add error handling with logger
4. Add TypeScript types for all methods
5. Use in components via hooks or direct import

### Database Schema Changes

1. Update schema in `src/shared/db/schema/`
2. Create migration in `src/shared/db/migrations/`
3. Test migration with `npm run db:migrate`
4. App auto-runs migrations on startup

## 🤝 Contributing

1. Fork the repository
2. Create feature branch: `git checkout -b feature/amazing-feature`
3. Make changes and test thoroughly
4. Commit with clear messages: `git commit -m 'Add amazing feature'`
5. Push to branch: `git push origin feature/amazing-feature`
6. Open Pull Request with description

### Code Style

- Use TypeScript for type safety
- Follow ESLint rules (run `npm run lint`)
- Format with Prettier: `npm run format`
- Use descriptive variable and function names
- Add JSDoc comments for complex functions
- Keep components focused and single-responsibility

## 📋 Testing Checklist

Before submitting a PR, ensure:

- [ ] App starts without errors
- [ ] Feature works on Android
- [ ] Feature works on iOS
- [ ] Feature works in Expo Go
- [ ] No console errors or warnings
- [ ] Lint passes: `npm run lint`
- [ ] GPS tracking works (test on device if possible)
- [ ] Notifications display correctly
- [ ] Database operations work
- [ ] No memory leaks or crashes

## 🔄 Known Limitations

- Background location tracking may be throttled on some Android devices
- Reverse geocoding requires internet connection
- Map rendering can be intensive on older devices
- Background tracking drains battery significantly
- iOS may limit background activity after 3-10 minutes

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 📞 Support

For support, please:

1. Check the [Troubleshooting](#-troubleshooting) section
2. Search existing [Issues](../../issues)
3. Create a new issue with:
    - Device and OS version
    - Steps to reproduce
    - Expected vs actual behavior
    - Relevant logs or screenshots

## 🙏 Acknowledgments

- Expo team for excellent React Native framework
- MapLibre for open-source mapping
- Drizzle ORM for type-safe database access
- Community for bug reports and feedback

## 📈 Roadmap

Future planned features:

- [ ] Social sharing of activities
- [ ] Offline map support
- [ ] Apple Health & Google Fit integration
- [ ] Cloud backup and sync
- [ ] Advanced analytics dashboard
- [ ] Activity badges and achievements
- [ ] Group challenges
- [ ] Voice guidance during activities
- [ ] Wearable support (Apple Watch, Wear OS)
- [ ] Web dashboard for activity management
