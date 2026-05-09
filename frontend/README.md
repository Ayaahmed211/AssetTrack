# AssetTrack - Frontend

This folder contains the React frontend codebase for the AssetTrack application.

## Technology Stack
- React
- Vite
- Context API (State Management)
- npm Build Tool

## Setup Instructions

### 1. Prerequisites
Ensure you have Node.js (v16+) and npm installed on your machine.

### 2. Environment Variables
The application connects to the Spring Boot backend. Create a `.env` file in this `frontend/` directory if one does not exist, and add:
```env
VITE_API_BASE_URL=http://localhost:8080/api
```

### 3. Installation
Navigate into this `frontend/` folder using your terminal and install the Node modules:
```bash
npm install
```

### 4. Run the Application
Start the Vite development server by running:
```bash
npm run dev
```

The application will successfully compile and be accessible at `http://localhost:5173`.
