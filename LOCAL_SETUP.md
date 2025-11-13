# Local Setup Guide - UIS Schedule System Frontend

This guide will help you run the UIS Schedule System Frontend project on your local machine.

## Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v18 or higher recommended, v20 preferred)
- **npm** (comes with Node.js)
- **Angular CLI** (optional, will be installed via npm)

### Verify Prerequisites

```bash
node --version  # Should be v18.x or higher
npm --version   # Should be v9.x or higher
```

## Installation Steps

### 1. Clone the Repository

```bash
git clone https://github.com/CUSOLUIS/uis-schedule-system-frontend.git
cd uis-schedule-system-frontend
```

### 2. Install Dependencies

```bash
npm install
```

This will install all required dependencies including Angular and other packages.

### 3. Start the Development Server

```bash
npm start
```

Or alternatively:

```bash
ng serve
```

The application will be available at: **http://localhost:4200/**

## Development Server Features

- **Hot Reload**: The application automatically reloads when you modify source files
- **Default Port**: 4200
- **Mock Data**: The application uses mock data in development mode (no backend required)

## Available Commands

| Command | Description |
|---------|-------------|
| `npm start` | Start the development server |
| `npm run build` | Build the project for production |
| `npm run watch` | Build in watch mode for development |
| `npm test` | Run unit tests |
| `ng serve` | Start development server (alternative) |

## Project Structure

```
src/
├── app/
│   ├── components/      # Angular components
│   ├── services/        # Services and business logic
│   ├── interfaces/      # TypeScript interfaces
│   ├── mocks/          # Mock data for development
│   └── ...
├── assets/             # Static assets
└── environments/       # Environment configurations
```

## Running with Docker (Alternative)

If you prefer to use Docker:

### Development Mode
```bash
./start-dev.sh
```
or
```bash
docker compose up -d dev
```

Access at: http://localhost:4200/

### Production Mode
```bash
./start.sh
```
or
```bash
docker compose up -d frontend
```

Access at: http://localhost:80/

## Backend Configuration

The frontend is configured to work with mock data by default in development mode. If you need to connect to a real backend:

1. Ensure the backend is running on `http://localhost:8080`
2. The proxy configuration in `proxy.conf.json` will automatically route API calls

### Proxy Configuration

The application uses a proxy to forward API requests:
- `/api` → forwards to `http://localhost:8080`
- `/auth` → forwards to `http://localhost:8080`

## Troubleshooting

### Port Already in Use

If port 4200 is already in use:

```bash
npm start -- --port 4300
```

This will start the server on port 4300 instead.

### Build Errors

If you encounter TypeScript or build errors:

1. Delete `node_modules` and `package-lock.json`:
   ```bash
   rm -rf node_modules package-lock.json
   ```

2. Reinstall dependencies:
   ```bash
   npm install
   ```

3. Clear Angular cache:
   ```bash
   npm run build -- --clean
   ```

### Module Not Found

Ensure all dependencies are installed:
```bash
npm install
```

## Login Credentials (Mock Data)

When using mock data in development mode, you can use these credentials:

- **Student**: username: `juan.perez`, password: (any)
- **Teacher**: username: `maria.gomez`, password: (any)
- **Admin**: username: `admin`, password: (any)

## Environment Variables

The application uses environment configurations in:
- `src/environments/environment.ts` (development)
- `src/environments/environment.prod.ts` (production)

## Additional Resources

- [Angular Documentation](https://angular.dev)
- [Angular CLI Documentation](https://angular.dev/tools/cli)
- [Project README](./README.md)

## Support

For issues or questions, please open an issue on the GitHub repository.

---

**Note**: This project uses Angular 20.0.0 and requires Node.js v18 or higher.
