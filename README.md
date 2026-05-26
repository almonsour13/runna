# Runna 🏃‍♂️

A comprehensive activity tracking and fitness management mobile application built with React Native and Expo. Track your runs, workouts, and physical activities with real-time GPS mapping, detailed statistics, and personalized schedules.

## 📱 Features

### Activity Tracking

- **Real-time GPS Tracking**: Track your runs and activities with accurate GPS positioning
- **Interactive Route Maps**: Visualize your route on MapLibre maps during and after activities
- **Activity Recording**: Start, pause, and stop activity tracking with real-time metrics
- **Detailed Activity Summary**: View distance, duration, pace, and calories burned

### Dashboard & Home Screen

- **Quick Overview**: See today's activities and overall progress at a glance
- **Weekly Activity Summary**: Track your activity patterns across the week
- **Today's Schedule**: View planned activities and upcoming workouts
- **Recent Activities**: Access your latest completed activities

### Activity Management

- **Activity History**: Complete historical view of all recorded activities
- **Activity Details**: In-depth analysis of past activities with route replay
- **Activity Editing**: Edit activity details and notes
- **Activity Deletion**: Remove activities from your record

### Statistics & Analytics

- **Performance Metrics**: Track key metrics like distance, duration, average pace
- **Statistical Analysis**: View trends and patterns in your training data
- **Visual Reports**: Graphical representation of your fitness progress

### User Management

- **Onboarding Flow**: Step-by-step setup wizard for new users
- **User Profile**: Create and manage your user profile
- **Profile Editing**: Update personal information and preferences
- **Settings Management**: Customize app preferences and behavior

### Smart Features

- **Push Notifications**: Get reminders and alerts for scheduled activities
- **Schedule Management**: Plan and organize your workouts
- **Persistent Data Storage**: All activities saved locally with SQLite
- **Dark/Light Theme**: Automatic theme detection based on system settings

## 🛠️ Tech Stack

- **Framework**: React Native with [Expo](https://expo.dev)
- **Language**: TypeScript
- **Routing**: Expo Router (file-based routing)
- **Styling**: Tailwind CSS via NativeWind
- **Maps**: MapLibre React Native
- **Database**: SQLite with Drizzle ORM
- **State Management**: React Query (@tanstack/react-query)
- **Navigation**: React Navigation (Bottom Tabs)
- **Sensors**: Expo Sensors for activity detection
- **Location**: Expo Location for GPS tracking
- **Notifications**: Expo Notifications
- **Storage**: Async Storage for local data persistence

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

### Installation

1. **Clone the repository**

    ```bash
    git clone <repository-url>
    cd runna
    ```

2. **Install dependencies**

    ```bash
    npm install
    ```

3. **Start the development server**
    ```bash
    npm start
    ```

### Running on Different Platforms

**Android Emulator:**

```bash
npm run android
```

**iOS Simulator (macOS only):**

```bash
npm run ios
```

**Web Browser:**

```bash
npm run web
```

**Expo Go (Quickest for testing):**

- Scan the QR code from the CLI output with the Expo Go app
- Available on [iOS](https://apps.apple.com/app/expo-go/id982107779) and [Android](https://play.google.com/store/apps/details?id=host.exp.exponent)

## 💻 Development

### Running Linter

```bash
npm run lint
```

### Database Migrations

The app uses Drizzle ORM for database management. Database schema is defined in `src/shared/db/schema/`.

## 📚 Learn More

- [Expo Documentation](https://docs.expo.dev/)
- [React Native Documentation](https://reactnative.dev/)
- [MapLibre Documentation](https://maplibre.org/)
- [Drizzle ORM](https://orm.drizzle.team/)
- [NativeWind Documentation](https://www.nativewind.dev/)

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📞 Support

For support, please open an issue in the repository or contact the development team.
