# PharmaPlus Admin Dashboard - Requirements

## Overview
The PharmaPlus Admin Dashboard is a web application for pharmacy administrators to manage various aspects of the pharmacy business, including promotions, products, orders, and users. This document outlines the technical requirements, functional specifications, and implementation details for the project.

## Tech Stack
- **Framework**: Next.js 14 (React framework)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **State Management**: React Hooks
- **Form Handling**: React Hook Form
- **API Integration**: Axios
- **Date Handling**: date-fns

## Project Structure
```
pharma-nextjs/
├── public/             # Static assets
│   └── images/         # Image assets including logos and icons
├── src/
│   ├── components/     # React components
│   │   ├── layout/     # Layout components including MainLayout
│   │   └── ui/         # UI components
│   ├── pages/          # Next.js pages
│   │   ├── _app.tsx    # Custom App component with global metadata
│   │   ├── _document.tsx # Custom Document for HTML structure
│   │   ├── 404.tsx     # Custom 404 error page
│   │   ├── index.tsx   # Dashboard home page
│   │   └── promotions/ # Promotion management pages
│   ├── styles/         # Global styles
│   ├── types/          # TypeScript types
│   ├── utils/          # Utility functions
│   └── middleware.ts   # Next.js middleware for routing
├── .gitignore          # Git ignore file
├── next.config.js      # Next.js configuration
├── package.json        # Project dependencies
├── postcss.config.js   # PostCSS configuration
├── README.md           # Project documentation
├── REQUIREMENTS.md     # This file
├── tailwind.config.js  # Tailwind CSS configuration
└── tsconfig.json       # TypeScript configuration
```

## Functional Requirements

### Dashboard
- Display summary of key metrics (total promotions, active promotions, expiring soon)
- Quick access to all major sections
- Recent promotions listing with status indicators
- Create promotion shortcut

### Promotions Management
- Create, view, edit, and delete promotional offers
- Configure different types of promotions (product-specific or bundle)
- Advanced product selection with search functionality
- Set discount types (percentage or fixed amount)
- Define promotion validity period with date and time pickers
- Set usage limits (per user, minimum cart quantity, and total uses)
- Upload promotional materials (images/PDFs)
- Activate/deactivate promotions with toggle switch
- Filter and sort promotions by various criteria
- View detailed promotion statistics

### Products Management (Future Implementation)
- Product listing with search and filter
- Product creation and editing
- Inventory management
- Product categorization

### Orders Management (Future Implementation)
- Order listing with search and filter
- Order status updates
- Order details view
- Order processing workflow

### User Management (Future Implementation)
- User listing with search and filter
- User profile management
- Role and permission management

## Non-Functional Requirements

### Performance
- Fast page load times (<2s)
- Optimized API calls with caching where appropriate
- Responsive UI with no lag during interactions

### Security
- Input validation for all forms
- Data sanitization for API requests
- Secure authentication and authorization (to be implemented)

### Usability
- Responsive design that works on desktop and mobile devices
- Intuitive navigation with clear information hierarchy
- Consistent UI elements and patterns
- Helpful error messages and validation feedback
- Collapsible sidebar for more screen space

### Accessibility
- Semantic HTML elements
- ARIA attributes where necessary
- Keyboard navigation support
- Color contrast that meets WCAG guidelines

### SEO
- Custom document structure with proper metadata
- Page-specific titles and descriptions
- Open Graph tags for social sharing
- Favicon and app icons

## UI Design Guidelines

### Color Scheme
- Primary Brand Colors:
  - Green: `#16a34a` (with light `#22c55e` and dark `#15803d` variants)
  - Blue: `#0ea5e9`
- Neutral Colors:
  - Gray variations for backgrounds and text
- State Colors:
  - Success: `#16a34a`
  - Error: `#dc2626`
  - Warning: `#f59e0b`
  - Info: `#0ea5e9`

### Typography
- Font Family: Inter (with system fallbacks)
- Size Scale: Following Tailwind's default scale

### Components
- Consistent card-based UI for content sections
- Form elements with proper validation states
- Toggle switches for boolean options
- Modal dialogs for confirmations
- Dropdown menus for selections
- Date and time pickers for scheduling
- Search interfaces with dropdown results

## Implemented Features

### General
- Dashboard home page with statistics and recent promotions
- Main layout with collapsible sidebar navigation
- Responsive design for all screen sizes
- SEO optimization with custom document and app components
- Custom 404 error page with debugging information
- Middleware for request tracking and debugging

### Promotions Management
- Full CRUD operations for promotions
- Intuitive promotion creation form with sections:
  - Basic information (name, description, type)
  - Product selection with search functionality
  - Discount settings (type and value)
  - Promotion period with date/time pickers
  - Usage limits and restrictions
  - Status toggle (active/inactive)
- Promotion listing with filtering options
- Promotion details view with all information
- Edit capability for existing promotions

## API Integration
The application currently uses localStorage for data persistence (temporary solution). Future integration with a backend API will include:

- `/api/promotions` - CRUD operations for promotions
- `/api/products` - CRUD operations for products (future)
- `/api/orders` - CRUD operations for orders (future)
- `/api/users` - CRUD operations for users (future)

## Development Guidelines

### Code Style
- Use TypeScript for all components and functions
- Proper type definitions for all props and state
- Consistent naming conventions (camelCase for variables/functions, PascalCase for components)
- Component organization following the single responsibility principle

### Testing Strategy (Future Implementation)
- Unit tests for utility functions
- Component tests for UI elements
- Integration tests for pages
- E2E tests for critical user flows

### Performance Considerations
- Code splitting for large components
- Image optimization
- Lazy loading of off-screen content
- Memoization of expensive calculations

## Debugging Tools
- Custom middleware for request path logging
- Enhanced 404 page with detailed error information
- Console logging for key operations
- Configurable logging levels in Next.js config

## Deployment (Future Implementation)
- CI/CD pipeline using GitHub Actions
- Automated testing before deployment
- Staging environment for QA
- Production deployment with rollback capability

## Future Enhancements
- Authentication and user management
- Analytics dashboard
- Reporting features
- Integration with other systems (inventory, point of sale, etc.)
- Mobile app version 