# PharmaPlus Admin Dashboard

A modern admin dashboard for PharmaPlus pharmacy management system, built with Next.js, React, TypeScript, and Tailwind CSS.

## Technology Stack

This project has been migrated from a Vue.js application to a modern React stack:

- **Framework**: Next.js 14
- **UI Library**: React 18
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **State Management**: React Hooks
- **Form Handling**: React Hook Form
- **API Integration**: Axios
- **Date Handling**: date-fns

## Features

- **Modern Tech Stack**: Next.js, React, TypeScript, Tailwind CSS
- **Responsive Design**: Works on all devices
- **Admin Features**: Manage promotions, products, orders, and users
- **Form Validation**: Comprehensive input validation
- **Component-based Architecture**: Reusable UI components
- **Type-safe Development**: Full TypeScript integration
- **SEO Optimized**: Custom head metadata and document setup
- **Custom 404 Page**: User-friendly error handling

### Promotions Management
- Create and edit promotions with an intuitive interface
- Support for different promotion types (product-specific and bundles)
- Advanced product selection with search functionality
- Flexible discount settings (percentage or fixed amount)
- Configurable promotion validity periods with start/end dates
- Set usage limits per user and total
- Upload and manage promotional materials
- Enable/disable promotions with a simple toggle

## Getting Started

### Prerequisites

- Node.js 14.0.0 or later
- npm or yarn

### Installation

1. Clone the repository
```bash
git clone <repository-url>
cd pharma-nextjs
```

2. Install dependencies
```bash
npm install
# or
yarn
```

3. Run the development server
```bash
npm run dev
# or
yarn dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser to see the application

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
├── REQUIREMENTS.md     # Detailed requirements
├── tailwind.config.js  # Tailwind CSS configuration
└── tsconfig.json       # TypeScript configuration
```

## Development

- **Adding new pages**: Create a new file in the `pages` directory
- **Adding new components**: Create a new file in the `components` directory
- **Adding new styles**: Add styles to the appropriate component or in `styles/globals.css`

## Stack Comparison (Vue vs Next.js/React)

| Feature | Original Vue.js Implementation | New Next.js/React Implementation |
|---------|--------------------------------|----------------------------------|
| Framework | Vue.js | Next.js (React framework) |
| Language | JavaScript | TypeScript |
| Styling | Tailwind CSS | Tailwind CSS |
| Routing | Vue Router | Next.js Pages Router |
| State Management | Vue Composition API | React Hooks |
| Form Handling | Vue Reactive Forms | React Hook Form |
| Component Structure | Single File Components (.vue) | Functional Components (.tsx) |
| Type Safety | Limited | Full TypeScript integration |

## SEO and Metadata

The application includes comprehensive SEO setup:
- Custom `_document.tsx` with proper HTML structure
- Global metadata in `_app.tsx` including title and Open Graph tags
- Page-specific titles and descriptions
- Favicon and app icons

## Build for Production

```bash
npm run build
# or
yarn build
```

## Debug and Troubleshooting

The application includes debugging tools:
- Custom middleware for request tracking
- Enhanced 404 error page with path information
- Logging configuration in the Next.js config

## License

This project is licensed under the MIT License. 