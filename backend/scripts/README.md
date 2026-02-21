# Backend Utility Scripts

This folder contains utility scripts for managing the application.

## Available Scripts

### Super Admin Management

- **create-super-admin.js** - Creates or updates the super admin account
  ```bash
  node scripts/create-super-admin.js
  ```

- **verify-super-admin.js** - Verifies super admin account exists and is properly configured
  ```bash
  node scripts/verify-super-admin.js
  ```

- **change-super-admin-password.js** - Changes super admin password
  ```bash
  node scripts/change-super-admin-password.js
  ```

- **super-admin-reset-password.js** - Resets super admin password
  ```bash
  node scripts/super-admin-reset-password.js
  ```

### User Management

- **fix-any-user.js** - Utility to fix user account issues
  ```bash
  node scripts/fix-any-user.js
  ```

- **fix-user-roles.js** - Fixes user role assignments
  ```bash
  node scripts/fix-user-roles.js
  ```

## Current Super Admin Credentials

- Email: cloudsnepalweb33@gmail.com
- Password: cloudsnepalweb33@gmail.com

## Notes

- Always run these scripts from the backend root directory
- Make sure MongoDB is running before executing any script
- These scripts use the .env configuration from the backend folder
