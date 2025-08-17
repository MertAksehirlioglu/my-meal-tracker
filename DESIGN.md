# MealSnap Design Reference

## 🎨 Design System

### Color Palette

**Primary Colors:**
- **Primary Green:** #43A047 - Main branding, headers, primary buttons
- **Accent Orange:** #FFB300 - Highlights, call-to-action buttons
- **Success Green:** #4CAF50 - Success states, positive feedback
- **Warning Orange:** #FF9800 - Warning states, cache indicators
- **Error Red:** #E53935 - Error states, destructive actions
- **Info Blue:** #2196F3 - Information, metrics, progress indicators

**Neutral Colors:**
- **Background Light:** #F9FBE7 - Page backgrounds
- **Surface White:** #FFFFFF - Card backgrounds
- **Text Primary:** #212121 - Primary text
- **Text Secondary:** #757575 - Secondary text
- **Border Light:** #E0E0E0 - Borders, dividers

### Typography

- **Font Family:** Roboto (via Vuetify)
- **Headers:** Roboto Medium/Bold
- **Body Text:** Roboto Regular
- **Code/Monospace:** 'Roboto Mono' fallback to monospace

### Component Design Patterns

#### Cards & Containers
- **Elevation:** 2 for main cards, 4 for dialogs
- **Border Radius:** 8px (rounded="lg")
- **Padding:** 16px for card content
- **Margin:** 16px between major sections

#### Loading States
- **Progress Bars:** Indeterminate for unknown duration
- **Skeleton Loaders:** For content placeholders
- **Overlay Loading:** Semi-transparent background with spinner

#### Error Handling
- **Error Cards:** Red background with white text
- **Warning Cards:** Orange background with dark text
- **Success Cards:** Green background with white text
- **Info Cards:** Blue background with white text

#### Performance Metrics
- **Metric Cards:** Grid layout with centered values
- **Large Numbers:** text-h5 font-weight-bold
- **Labels:** text-caption text-grey
- **Color Coding:** Success (green), Warning (orange), Info (blue)

### Layout Principles

#### Mobile-First
- **Breakpoints:** Follow Vuetify's responsive grid
- **Touch Targets:** Minimum 44px for interactive elements
- **Spacing:** Consistent 16px margins on mobile

#### Desktop Enhancement
- **Max Width:** 1200px for main content
- **Side Navigation:** Drawer for authenticated pages
- **Grid Layouts:** 2-4 columns for metric displays

### Animation Guidelines

- **Transitions:** 300ms ease-in-out for state changes
- **Loading Animations:** Indeterminate progress bars
- **Page Transitions:** Fade transitions between routes
- **Hover Effects:** Subtle elevation changes for cards

### Accessibility

- **Color Contrast:** WCAG AA compliance
- **Focus States:** Visible focus indicators
- **ARIA Labels:** Proper labeling for screen readers
- **Keyboard Navigation:** Full keyboard accessibility

## 🖌️ Component Usage Guidelines

### Navigation
- **App Bar:** Primary green background with white text
- **Navigation Drawer:** White background with primary green accents
- **Breadcrumbs:** Secondary text color

### Forms
- **Input Fields:** Outlined style with validation
- **Buttons:** Filled primary for main actions, outlined for secondary
- **Error States:** Red color with descriptive messages

### Data Display
- **Tables:** Alternating row colors for readability
- **Charts:** Consistent color palette for data visualization
- **Metrics:** Large numbers with descriptive labels

### Feedback
- **Notifications:** Snackbar or alert components
- **Progress:** Linear progress bars for operations
- **Empty States:** Helpful messaging with action buttons

## 📱 Platform-Specific Considerations

### Mobile (iOS/Android)
- **Touch Gestures:** Swipe for navigation where appropriate
- **Native Feel:** Platform-appropriate animations
- **Performance:** Optimized images and lazy loading

### Desktop/Web
- **Mouse Interactions:** Hover states and tooltips
- **Keyboard Shortcuts:** Common shortcuts (Ctrl+S, etc.)
- **Multi-column Layouts:** Efficient use of screen space

## 🎯 Brand Identity

### Logo Usage
- **Primary Logo:** Green with white background
- **Minimum Size:** 24px height for readability
- **Clear Space:** 8px minimum around logo

### Voice & Tone
- **Friendly:** Encouraging and supportive
- **Clear:** Direct and easy to understand
- **Helpful:** Provide guidance and tips
- **Professional:** Reliable and trustworthy

## 🔄 Design System Updates

This design system should evolve with the application:
- Document new patterns as they emerge
- Update colors and typography as needed
- Maintain consistency across all components
- Regular design reviews and updates
