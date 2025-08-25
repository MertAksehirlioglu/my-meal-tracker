# Changelog

All notable changes to MealSnap will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- MIT License for open source distribution
- Comprehensive security policy (SECURITY.md)
- Input validation utilities for API endpoints
- Centralized authentication utilities
- Enhanced error handling and validation

### Changed
- Hardened API route authentication - removed development bypasses
- Improved input validation across all endpoints
- Enhanced security measures for user data protection

### Security
- Fixed critical security issue in meals POST endpoint that accepted user_id from request body
- Enforced proper authentication on all user data endpoints
- Removed development authentication bypasses from production code
- Added comprehensive input validation and sanitization

## [1.0.0] - Initial Release

### Added
- Full-stack Nuxt 3 meal tracking application
- AI-powered food classification using TensorFlow.js and Hugging Face
- User authentication and profile management via Supabase
- Meal logging with nutrition tracking
- Daily macro goal setting and progress monitoring
- Image upload and storage for meal photos
- Responsive UI with Vuetify components

### Features
- **Authentication**: Email/password login with Supabase Auth
- **Food Analysis**: Local TensorFlow.js classification with Hugging Face fallback
- **Nutrition Tracking**: Comprehensive macro and micronutrient logging
- **Goal Setting**: Customizable daily nutrition targets
- **Progress Monitoring**: Daily and historical progress tracking
- **Image Storage**: Secure meal photo storage via Supabase Storage
- **Responsive Design**: Mobile-first design with Vuetify

### Technical Implementation
- **Frontend**: Nuxt 3 + Vue 3 + Vuetify 3
- **Backend**: Nuxt Server API routes
- **Database**: Supabase PostgreSQL with Row Level Security
- **AI/ML**: TensorFlow.js (MobileNet, COCO-SSD) + Hugging Face Inference API
- **Storage**: Supabase Storage for meal images
- **Authentication**: Supabase Auth with JWT tokens

### Security
- Row Level Security (RLS) on all database tables
- User data isolation and access controls
- Secure API endpoints with authentication
- Environment variable management for sensitive data