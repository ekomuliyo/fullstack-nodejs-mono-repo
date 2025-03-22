# Fullstack Node.js Monorepo

This is a fullstack application built with TypeScript, Express.js, Next.js, and Firebase, organized as a monorepo using Turborepo.

## Project Structure

```
fullstack-nodejs-mono-repo/
├── apps/
│   ├── backend-repo/     # Express.js backend API
│   └── frontend-repo/    # Next.js frontend application
└── packages/
    ├── eslint-config/    # Shared ESLint configurations
    ├── shared/           # Shared code/types between apps
    └── typescript-config/ # Shared TypeScript configurations
```

## Features

- **Backend**: Express.js API with Firebase integration
  - User data management in Firestore
  - Firebase Authentication validation
  - RESTful API endpoints

- **Frontend**: Next.js application with React MUI
  - Modern UI with responsive design
  - Redux state management
  - Firebase Authentication
  - User profile management

## Getting Started

### Prerequisites

- Node.js 18 or higher
- npm 9.6.7 or higher
- Firebase account for authentication and Firestore

### Installation

1. Clone the repository
2. Install dependencies:
   ```
   npm install
   ```

### Environment Variables

- For backend: Copy `apps/backend-repo/.env.example` to `apps/backend-repo/.env` and fill in your Firebase credentials
- For frontend: Copy `apps/frontend-repo/.env.example` to `apps/frontend-repo/.env.local` and fill in your Firebase credentials

### Development

- Run the entire project in development mode:
  ```
  npm run dev
  ```

- Run only the backend:
  ```
  npm run dev -- --filter=backend-repo
  ```

- Run only the frontend:
  ```
  npm run dev -- --filter=frontend-repo
  ```

### Building

- Build all packages and applications:
  ```
  npm run build
  ```

### Running Firebase Emulator

- Start the Firebase emulator for local development:
  ```
  npm run firebase:emulate -- --filter=backend-repo
  ```

## Firebase Queries and Data Structure

The Firestore database uses a `USERS` collection with the following structure:

```
USERS/
├── user-id-1/
│   ├── id: string
│   ├── name: string
│   ├── email: string
│   ├── totalAverageWeightRatings: number (optional)
│   ├── numberOfRents: number (optional)
│   ├── recentlyActive: number (epoch time, optional)
│   ├── potentialScore: number (calculated field)
│   ├── createdAt: number (epoch time)
│   └── updatedAt: number (epoch time)
├── user-id-2/
│   └── ...
└── ...
```

### High Potential Users Query

To efficiently retrieve high potential users based on multiple criteria (ratings, rents, activity), we use a pre-calculated composite score field called `potentialScore` that combines all three factors.

This approach solves the Firestore limitation with multi-criteria sorting and pagination.

```typescript
// Calculate potential score with weighted factors
const calculatePotentialScore = (user: User): number => {
  // Normalize each factor to a 0-1 scale
  const ratingScore = user.totalAverageWeightRatings ? user.totalAverageWeightRatings / 5 : 0;
  const rentsScore = user.numberOfRents ? Math.min(user.numberOfRents / 100, 1) : 0;
  
  // Calculate recency score (higher for more recent activity)
  const now = Date.now();
  const maxAge = 30 * 24 * 60 * 60 * 1000; // 30 days in milliseconds
  const recencyScore = user.recentlyActive ? 
    Math.max(0, 1 - ((now - user.recentlyActive) / maxAge)) : 0;
  
  // Apply weights to each factor
  return (ratingScore * 0.5) + (rentsScore * 0.3) + (recencyScore * 0.2);
};
```

### Keeping 'recently active' Updated

To keep the 'recentlyActive' field fresh, we update it whenever users perform significant actions:

1. In API requests that represent user activity
2. Using Firebase Cloud Functions for authentication events
3. Using batch jobs for periodic updates
