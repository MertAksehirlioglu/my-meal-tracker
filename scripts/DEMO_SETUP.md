# Demo User Setup Guide

This guide explains how to set up a secure demo user for MealSnap that allows visitors to experience the app without compromising security.

## Overview

The demo user feature provides:

- One-click login for visitors
- Read-only access to pre-populated sample data
- All write operations blocked at API level
- Secure isolation from real user data

## Setup Steps

### 1. Create Demo User in Supabase Auth

1. Go to your Supabase Dashboard
2. Navigate to **Authentication > Users**
3. Click "Add User"
4. Create user with:
   - **Email**: `demo@mealsnap.app`
   - **Password**: `demo123456` (or set your own)
   - **Email Confirmed**: Yes

### 2. Get Demo User ID

1. After creating the user, note down the **User ID** (UUID)
2. Copy this ID for the next step

### 3. Run Database Setup Script

1. Go to **SQL Editor** in your Supabase Dashboard
2. Open the file `scripts/setup-demo-user.sql`
3. Replace all instances of `DEMO_USER_ID_HERE` with the actual User ID from step 2
4. Run the script

This will create:

- Demo user profile with realistic data
- Sample daily goals (2000 calories, 150g protein, etc.)
- 4 sample meals for today (breakfast, lunch, snack, dinner)
- Progress summary matching the meals
- Sample food database entries

### 4. Environment Configuration

Add to your `.env` file:

```bash
NUXT_PUBLIC_DEMO_PASSWORD=demo123456
```

Or use your custom password if you set a different one.

### 5. Test Demo Login

1. Visit your app's login page
2. You should see a "Try Demo Mode" section
3. Click "Login as Demo User"
4. Verify you can:
   - View the dashboard with sample data
   - Browse meals and progress
   - See "Demo Mode" indicator in the header
   - Cannot save new meals (shows notification)

## Security Features

### API Protection

- All write endpoints check for demo user
- Demo users receive 403 errors with helpful messages
- No data can be modified by demo user

### Frontend Protection

- Demo user detection in auth composable
- UI shows demo mode indicators
- Save actions show informative notifications
- Guided experience for demo users

### Data Isolation

- Demo user isolated via Row Level Security (RLS)
- Cannot access real user data
- Sample data resets can be automated

## Maintenance

### Resetting Demo Data (Optional)

You can set up a cron job or manual process to reset demo user data:

```sql
-- Reset demo user meals to today
UPDATE meals
SET consumed_at = CASE
  WHEN meal_type = 'breakfast' THEN (CURRENT_DATE + INTERVAL '8 hours')::timestamp
  WHEN meal_type = 'lunch' THEN (CURRENT_DATE + INTERVAL '12 hours')::timestamp
  WHEN meal_type = 'snack' THEN (CURRENT_DATE + INTERVAL '15 hours')::timestamp
  WHEN meal_type = 'dinner' THEN (CURRENT_DATE + INTERVAL '19 hours')::timestamp
END,
updated_at = NOW()
WHERE user_id = 'DEMO_USER_ID_HERE';

-- Update progress date
UPDATE user_progress
SET date = CURRENT_DATE,
    created_at = NOW()
WHERE user_id = 'DEMO_USER_ID_HERE';
```

### Monitoring Demo Usage

You can monitor demo user activity in Supabase logs or add analytics to track demo engagement.

## Troubleshooting

### Demo Login Not Working

- Verify demo user exists in Supabase Auth
- Check environment variable `NUXT_PUBLIC_DEMO_PASSWORD`
- Ensure user's email is confirmed

### No Sample Data Showing

- Verify database script ran successfully
- Check that user ID was correctly replaced in SQL
- Confirm RLS policies allow demo user to read their data

### Write Operations Not Blocked

- Check API endpoints have `blockDemoUserWrite(event)` calls
- Verify demo user email matches exactly: `demo@mealsnap.app`
- Test server-side demo user detection

## Development Notes

The demo system uses these key files:

- `server/utils/demo.ts` - Demo user utilities and restrictions
- `composables/useDemoNotification.ts` - Frontend demo notifications
- `components/DemoNotification.vue` - Demo user UI feedback
- `pages/login.vue` - Demo login button and flow
- `layouts/authenticated.vue` - Demo mode indicator

All write API routes should include `blockDemoUserWrite(event)` after authentication.
