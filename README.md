# CarAtlas Agency Frontend

Agency portal for managing car listings, analytics, and settings.

## Port
Runs on port **3276**

## Setup

1. Install dependencies:
```bash
npm install
```

2. Create `.env` file:
```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:3377
```

3. Run development server:
```bash
npm run dev
```

## Features

- Mobile-based authentication (Phone + Password/OTP)
- Agency onboarding
- Dashboard with analytics
- Listing management
- Settings

## API Endpoints

- `/auth/signup` - Agency signup
- `/auth/login` - Agency login (password or OTP)
- `/auth/verify-phone` - Phone verification
- `/onboarding` - Onboarding management
- `/agency/profile` - Agency profile
