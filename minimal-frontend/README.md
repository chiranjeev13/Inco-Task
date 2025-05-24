# Inco Frontend

This is the frontend application for the Inco project, built with Next.js, TypeScript, and Tailwind CSS. The application provides a modern and interactive interface for users to interact with the Inco protocol.

## 🚀 Quick Start

1. Install dependencies:
```bash
yarn install
```

2. Copy the `.npmrc.sample` file to `.npmrc` and configure your environment variables.

3. Start the development server:
```bash
yarn dev
```

4. Build for production:
```bash
yarn build
```

5. Start production server:
```bash
yarn start
```

## 🏗️ Component Structure

The frontend is composed of several key components, each serving a specific purpose:

### Core Components

1. **WealthSubmissionForm** (`src/components/WealthSubmissionForm.tsx`)
   - Main form component for users to submit their wealth information
   - Handles validation and submission of wealth data
   - Integrates with web3 wallet for transactions

2. **RichestUsersDisplay** (`src/components/RichestUsersDisplay.tsx`)
   - Displays a leaderboard of the richest users
   - Real-time updates of wealth rankings

3. **OwnWealthDisplay** (`src/components/OwnWealthDisplay.tsx`)
   - Shows the current user's wealth information
   - Displays transaction history and status
   - Real-time updates of wealth changes

4. **ParticipantsDisplay** (`src/components/ParticipantsDisplay.tsx`)
   - Shows all participants in the protocol
   - Displays participant statistics and information

5. **ResetButton** (`src/components/ResetButton.tsx`)
   - Provides functionality to reset user data
   - Includes confirmation dialog for safety
   - Handles reset transaction flow

### UI Components

6. **Background** (`src/components/Background.tsx`)
   - Provides the animated background effect
   - Responsive design elements
   - Customizable styling options

7. **Tooltip** (`src/components/Tooltip.tsx`)
   - Reusable tooltip component
   - Provides contextual information
   - Customizable appearance and positioning

## 🛠️ Technical Stack

- **Framework**: Next.js 14
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Data Fetching**: TanStack Query
- **Web3 Integration**: wagmi, viem
- **UI Components**: Radix UI
- **Animations**: Framer Motion

## 📦 Key Dependencies

- `@inco/js`: Inco protocol JavaScript SDK
- `@web3modal/wagmi`: Web3 wallet integration
- `@tanstack/react-query`: Data fetching and caching
- `@reduxjs/toolkit`: State management
- `framer-motion`: Animations
- `tailwindcss`: Utility-first CSS