# CSMBD Social Platform API

A robust backend API for a social platform that enables user registration, authentication, profile management, and content sharing through YouTube embed links.

[![Node.js](https://img.shields.io/badge/Node.js-16.x-green.svg)](https://nodejs.org/)
[![Express](https://img.shields.io/badge/Express-4.x-blue.svg)](https://expressjs.com/)
[![Sequelize](https://img.shields.io/badge/Sequelize-6.x-orange.svg)](https://sequelize.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-14.x-blue.svg)](https://www.postgresql.org/)

## Table of Contents

-   [Features](#features)
-   [API Documentation](#api-documentation)
-   [Environment Variables](#environment-variables)
-   [Project Setup](#project-setup)
-   [Project Structure](#project-structure)
-   [Authentication](#authentication)
-   [Data Validation](#data-validation)
-   [Error Handling](#error-handling)
-   [File Uploads](#file-uploads)
-   [Security Implementation](#security-implementation)
-   [Performance Optimizations](#performance-optimizations)
-   [Contributing](#contributing)
-   [License](#license)

## Features

### User Authentication

-   **Registration**: New users can create accounts with name, email, and password
-   **Login**: Secure authentication with JWT tokens
-   **Logout**: Invalidate current session

### User Profile Management

-   **View Profile**: Authenticated users can view their own profile
-   **Edit Profile**: Update personal details including name, email, bio, and location
-   **Profile Picture**: Upload, update, and retrieve profile pictures with default fallback
-   **Content Management**: Add and remove YouTube embed links with titles

### Content Sharing

-   **YouTube Links**: Share favorite YouTube videos on personal profiles
-   **Content Aggregation**: Browse all shared content across the platform

### Visitor Access

-   **User Discovery**: Browse all registered users with pagination
-   **Profile Viewing**: View any user's profile and their shared content
-   **Content Discovery**: View all shared content with sorting options

## API Documentation

### Authentication Endpoints

#### `POST /api/v1/auth/signup` - Register a new user

**Request Body:**

```json
{
    "name": "John Doe",
    "email": "john@example.com",
    "password": "password123"
}
```

**Success Response:** `201 Created`

```json
{
    "success": true,
    "message": "User created successfully",
    "data": {
        "token": "eyJhbGc...",
        "user": {
            "id": "123e4567-e89b-12d3-a456-426614174000",
            "name": "John Doe",
            "email": "john@example.com",
            "createdAt": "2023-01-01T00:00:00.000Z",
            "updatedAt": "2023-01-01T00:00:00.000Z"
        }
    }
}
```

#### `POST /api/v1/auth/signin` - Login an existing user

**Request Body:**

```json
{
    "email": "john@example.com",
    "password": "password123"
}
```

**Success Response:** `200 OK`

```json
{
    "success": true,
    "message": "User signed in successfully",
    "data": {
        "token": "eyJhbGc...",
        "user": {
            "id": "123e4567-e89b-12d3-a456-426614174000",
            "name": "John Doe",
            "email": "john@example.com"
        }
    }
}
```

#### `POST /api/v1/auth/signout` - Logout the current user

**Success Response:** `200 OK`

```json
{
    "success": true,
    "message": "User logged out successfully"
}
```

### User Endpoints

#### `GET /api/v1/users` - Get a list of all users

**Query Parameters:**

-   `page` (optional): Page number (default: 1)
-   `limit` (optional): Number of users per page (default: 10)

**Success Response:** `200 OK`

```json
{
  "success": true,
  "message": "Users fetched successfully",
  "data": [
    {
      "id": "123e4567-e89b-12d3-a456-426614174000",
      "name": "John Doe",
      "email": "john@example.com",
      "bio": "Software developer",
      "location": "New York, USA",
      "youtubeLinks": [...],
      "profilePictureUrl": "/api/v1/users/123e4567-e89b-12d3-a456-426614174000/profile-picture"
    }
  ],
  "pagination": {
    "total": 25,
    "limit": 10,
    "totalPages": 3,
    "currentPage": 1,
    "hasNextPage": true,
    "hasPreviousPage": false,
    "nextPage": 2,
    "previousPage": null
  }
}
```

#### `GET /api/v1/users/content` - Get all content (YouTube links) across all users

**Query Parameters:**

-   `page` (optional): Page number (default: 1)
-   `limit` (optional): Items per page (default: 10, max: 50)
-   `sortBy` (optional): Sort order - "newest", "oldest", or "popular" (default: "newest")

**Success Response:** `200 OK`

```json
{
    "success": true,
    "message": "Content fetched successfully",
    "data": [
        {
            "id": "1625012345678",
            "title": "Amazing Tutorial",
            "url": "https://www.youtube.com/watch?v=abc123",
            "addedAt": "2023-01-01T00:00:00.000Z",
            "user": {
                "id": "123e4567-e89b-12d3-a456-426614174000",
                "name": "John Doe",
                "profilePictureUrl": "/api/v1/users/123e4567-e89b-12d3-a456-426614174000/profile-picture"
            }
        }
    ],
    "pagination": {
        "total": 42,
        "limit": 10,
        "totalPages": 5,
        "currentPage": 1,
        "hasNextPage": true,
        "hasPreviousPage": false,
        "nextPage": 2,
        "previousPage": null
    }
}
```

#### `GET /api/v1/users/:id` - Get a specific user by ID

**Success Response:** `200 OK`

```json
{
  "success": true,
  "message": "User fetched successfully",
  "data": {
    "id": "123e4567-e89b-12d3-a456-426614174000",
    "name": "John Doe",
    "email": "john@example.com",
    "bio": "Software developer",
    "location": "New York, USA",
    "youtubeLinks": [...],
    "profilePictureUrl": "/api/v1/users/123e4567-e89b-12d3-a456-426614174000/profile-picture"
  }
}
```

#### `GET /api/v1/users/:id/profile-picture` - Get a user's profile picture

**Success Response:** Returns the profile image file or default image if none exists

### Profile Management Endpoints (Requires Authentication)

#### `GET /api/v1/users/profile/me` - Get current user's profile

**Success Response:** `200 OK`

```json
{
  "success": true,
  "message": "Profile fetched successfully",
  "data": {
    "id": "123e4567-e89b-12d3-a456-426614174000",
    "name": "John Doe",
    "email": "john@example.com",
    "bio": "Software developer",
    "location": "New York, USA",
    "youtubeLinks": [...],
    "profilePictureUrl": "/api/v1/users/123e4567-e89b-12d3-a456-426614174000/profile-picture"
  }
}
```

#### `PUT /api/v1/users/profile/me` - Update current user's profile

**Request Body:** (Multipart form data)

-   `name` (optional): Updated name
-   `email` (optional): Updated email
-   `bio` (optional): Updated bio
-   `location` (optional): Updated location
-   `profilePicture` (optional): Image file for profile picture

**Success Response:** `200 OK`

```json
{
  "success": true,
  "message": "Profile updated successfully",
  "data": {
    "id": "123e4567-e89b-12d3-a456-426614174000",
    "name": "John Smith",
    "email": "john@example.com",
    "bio": "Full-stack developer with 5 years experience",
    "location": "New York, USA",
    "youtubeLinks": [...],
    "profilePictureUrl": "/api/v1/users/123e4567-e89b-12d3-a456-426614174000/profile-picture"
  }
}
```

#### `POST /api/v1/users/profile/youtube` - Add a YouTube link to profile

**Request Body:**

```json
{
    "youtubeUrl": "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    "title": "My Favorite Video"
}
```

**Success Response:** `201 Created`

```json
{
  "success": true,
  "message": "YouTube link added successfully",
  "data": {
    "newLink": {
      "id": "1625012345678",
      "url": "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
      "title": "My Favorite Video",
      "addedAt": "2023-01-01T00:00:00.000Z"
    },
    "user": {
      "id": "123e4567-e89b-12d3-a456-426614174000",
      "name": "John Smith",
      "email": "john@example.com",
      "youtubeLinks": [...]
    }
  }
}
```

#### `DELETE /api/v1/users/profile/youtube/:linkId` - Remove a YouTube link from profile

**Success Response:** `200 OK`

```json
{
  "success": true,
  "message": "YouTube link removed successfully",
  "data": {
    "id": "123e4567-e89b-12d3-a456-426614174000",
    "name": "John Smith",
    "email": "john@example.com",
    "youtubeLinks": [...]
  }
}
```

## Environment Variables

Create a `.env.development.local` file for development and a `.env.production.local` file for production with the following variables:

```
# Server Configuration
PORT=5000
NODE_ENV=development

# Authentication
JWT_SECRET=your_secure_jwt_secret_key
JWT_EXPIRES_IN=7d

# Database Configuration
DB_URI=postgresql://username:password@localhost:5432/database_name

# CORS Configuration
CORS_ORIGIN=http://localhost:3000
```

## Project Setup

1. **Clone the repository**

    ```bash
    git clone https://github.com/yourusername/csmbd-social-platform-api.git
    cd csmbd-social-platform-api
    ```

2. **Install dependencies**

    ```bash
    npm install
    ```

3. **Set up environment variables**
   Create the `.env.development.local` file as described above

4. **Create uploads directory** (if not present)

    ```bash
    mkdir -p uploads/profile-pictures
    ```

5. **Run database migrations**

    ```bash
    npm run dev
    ```

    The first run will automatically create database tables

6. **Start the development server**

    ```bash
    npm run dev
    ```

7. **Start the production server**
    ```bash
    npm start
    ```

## Project Structure

```
csmbd-social-platform-api/
├── config/              # Configuration files
│   └── env.js           # Environment variables setup
├── controllers/         # Route controllers
│   ├── auth.controller.js
│   └── user.controller.js
├── database/            # Database setup and migrations
│   ├── migrations.js
│   └── postgresql.js
├── middlewares/         # Express middlewares
│   ├── auth.middleware.js
│   ├── error.middleware.js
│   └── upload.middleware.js
├── model/               # Sequelize models
│   └── user.model.js
├── routes/              # Express routes
│   ├── auth.route.js
│   └── user.route.js
├── uploads/             # File uploads storage
│   └── profile-pictures/
│       └── default.png
├── index.js             # Application entry point
├── package.json
└── README.md
```

## Authentication

This API uses JSON Web Tokens (JWT) for authentication:

1. When a user registers or logs in, a JWT token is generated and returned
2. For protected routes, include the token in the Authorization header:
    ```
    Authorization: Bearer <your_token>
    ```
3. The `authorize` middleware validates the token before allowing access to protected resources
4. Tokens have a configurable expiration time (default: 7 days)

## Data Validation

-   **Joi**: All incoming requests are validated using Joi schemas to ensure data integrity
-   **Sequelize Validators**: Database models include validation rules to prevent invalid data storage
-   **Custom Validation**: Additional business logic validations are implemented in controllers

### Validation Examples

#### User Registration Validation

-   Name: 3-50 characters
-   Email: Valid email format, must be unique
-   Password: Minimum 8 characters

#### YouTube URL Validation

-   Must be a valid YouTube URL format
-   Title: Required, maximum 100 characters

## Error Handling

All API endpoints use a consistent error response format:

```json
{
    "success": false,
    "message": "Detailed error message"
}
```

Common HTTP status codes:

-   `400 Bad Request`: Invalid input data
-   `401 Unauthorized`: Authentication required or invalid credentials
-   `403 Forbidden`: Insufficient permissions
-   `404 Not Found`: Resource not found
-   `409 Conflict`: Resource conflict (e.g., duplicate email)
-   `500 Internal Server Error`: Server-side error

## File Uploads

Profile pictures are managed with the following features:

-   **Storage**: Profile images are stored in the `uploads/profile-pictures` directory
-   **Default Image**: A default profile picture is provided for users without uploaded images
-   **Validation**: Only images (JPEG, PNG, GIF, WebP) up to 2MB are accepted
-   **Clean-up**: Old profile pictures are automatically deleted when replaced
-   **Secure Naming**: Files are renamed using timestamps and cryptographic randomization

## Security Implementation

-   **Password Hashing**: Passwords are hashed using bcrypt before storage
-   **JWT Authentication**: Secure, stateless authentication mechanism
-   **Input Validation**: All inputs are validated to prevent injection attacks
-   **Helmet**: HTTP headers are secured to reduce common web vulnerabilities
-   **CORS**: Cross-Origin Resource Sharing is configured to restrict access
-   **Rate Limiting**: Limits requests to prevent brute force attacks
-   **File Upload Security**: Strict file type validation and size limits

## Performance Optimizations

-   **Database Connection Pooling**: Optimized for efficient database connections
-   **Pagination**: All list endpoints support pagination to limit response size
-   **Efficient Queries**: Database queries are optimized to retrieve only necessary data
-   **File Size Limits**: Upload file sizes are restricted to prevent abuse
-   **Cache Control**: Static assets use proper cache control headers
-   **Query Parameter Validation**: All query parameters are validated and sanitized
-   **Error Logging**: Comprehensive error logging for debugging and monitoring

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.
