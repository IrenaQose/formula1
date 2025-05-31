# Formula 1 Frontend

A modern web application for exploring Formula 1 racing data, built with React, TypeScript, and Vite. This frontend application provides an intuitive interface to view Formula 1 race results, driver standings, and championship history.

## Features

- 🏎️ View race results for any Formula 1 season
- 🏆 Explore championship standings and winners
- 🏁 Track driver and constructor performance
- 📊 Interactive data visualization
- 📱 Responsive design for all devices
- 🌙 Dark/Light mode support

## Prerequisites

Before you begin, ensure you have the following installed:
- Node.js (v18 or higher)
- npm (v9 or higher) or yarn (v1.22 or higher)
- The Formula 1 backend service running locally or accessible via API

## Getting Started

1. Clone the repository:
```bash
git clone <repository-url>
cd formula1_frontend
```

2. Install dependencies:
```bash
npm install
# or
yarn install
```

3. Create a `.env` file in the root directory with the following variables:
```env
  VITE_API_BASE_URL=http://localhost:3000  # URL of your backend service
```

4. Start the development server:
```bash
  npm run dev
  # or
  yarn dev
```

The application will be available at `http://localhost:5173` by default.

## Available Scripts

- `npm run dev` - Start the development server
- `npm run build` - Build the application for production
- `npm run preview` - Preview the production build locally
- `npm run lint` - Run ESLint to check code quality
- `npm run test` - Run unit tests
- `npm run test:coverage` - Run tests with coverage report

## Project Structure

```
formula1_frontend/
├── src/
│   ├── components/     # Reusable UI components
│   ├── hooks/         # Custom React hooks
│   ├── pages/         # Page components
│   ├── services/      # API service functions
│   ├── types/         # TypeScript type definitions
│   ├── utils/         # Utility functions
│   ├── App.tsx        # Root component
│   └── main.tsx       # Application entry point
├── public/            # Static assets
├── index.html         # HTML template
├── vite.config.ts     # Vite configuration
├── tsconfig.json      # TypeScript configuration
└── package.json       # Project dependencies and scripts
```

## API Integration

The frontend communicates with the Formula 1 backend service through RESTful APIs. The main endpoints used are:

- `/races/:year` - Get race results for a specific year
- `/seasons` - Get list of available seasons
- `/drivers` - Get driver information
- `/constructors` - Get constructor team information

For detailed API documentation, refer to the backend service documentation.

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## Development Guidelines

- Follow the TypeScript best practices
- Use functional components with hooks
- Implement proper error handling
- Write unit tests for new features
- Maintain consistent code style using ESLint
- Use meaningful commit messages

## Testing

The project uses Vitest for unit testing. To run tests:

```bash
npm run test
```

For test coverage:

```bash
npm run test:coverage
```

## Building for Production

To create a production build:

```bash
npm run build
```

The build artifacts will be stored in the `dist/` directory.

## Deployment

The application can be deployed to any static hosting service like Vercel, Netlify, or GitHub Pages. Make sure to:

1. Set the correct `VITE_API_BASE_URL` environment variable
2. Configure CORS settings on the backend service
3. Update the API endpoints if necessary

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- Formula 1 for the inspiration
- Ergast Developer API for historical F1 data
- All contributors who have helped shape this project
