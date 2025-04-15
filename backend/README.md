# SmartBarber Backend API

## Overview
This is the backend API for the SmartBarber application. It provides endpoints for user authentication, booking management, barber/stylist information, services, and saved hairstyles.

## Getting Started

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn

### Installation
1. Navigate to the backend directory:
   ```
   cd backend
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Create a `.env` file in the root directory with the following variables:
   ```
   PORT=5000
   JWT_SECRET=your_jwt_secret_change_this_in_production
   NODE_ENV=development
   ```

### Running the Server

#### Development Mode
```
npm run dev
```

Or use the provided script:
```
./start-backend.sh
```

#### Production Mode
```
npm run build
npm start
```

## API Endpoints

### Authentication
- `POST /auth/register` - Register a new user
- `POST /auth/login` - Login a user
- `GET /auth/profile` - Get user profile (requires authentication)
- `PUT /auth/profile` - Update user profile (requires authentication)

### Bookings
- `GET /bookings/slots/:date` - Get available time slots for a specific date
- `POST /bookings` - Create a new booking (requires authentication)
- `GET /bookings/user` - Get user's bookings (requires authentication)
- `PUT /bookings/:id` - Update a booking (requires authentication)
- `DELETE /bookings/:id` - Cancel a booking (requires authentication)

### Barbers/Stylists
- `GET /barbers` - Get all barbers
- `GET /barbers/:id` - Get barber by ID
- `GET /barbers/:id/reviews` - Get barber reviews
- `POST /barbers/:id/reviews` - Add a review for a barber (requires authentication)

### Services
- `GET /services` - Get all services
- `GET /services/:id` - Get service by ID

### Saved Styles
- `GET /styles/user` - Get user's saved styles (requires authentication)
- `POST /styles` - Save a new style (requires authentication)
- `DELETE /styles/:id` - Delete a saved style (requires authentication)

## Authentication
The API uses JWT (JSON Web Tokens) for authentication. To access protected endpoints, include the JWT token in the Authorization header:

```
Authorization: Bearer YOUR_JWT_TOKEN
```

## Current Implementation Notes
This is a temporary implementation using in-memory storage. In a production environment, this would be replaced with a proper database like PostgreSQL, MongoDB, or similar.
