# CSMBD Assignment Backend API

This is the backend API for the CSMBD Assignment, providing user authentication, profile management, and visitor access features.

## Features

-   **User Authentication**

    -   User registration
    -   User login
    -   User logout

-   **User Profile Management**

    -   View own profile
    -   Edit personal profile details (name, email, bio, location)
    -   Add and remove personal content (YouTube embed links)

-   **Visitor Access**
    -   Browse a list of registered users
    -   View individual user profiles

## API Endpoints

### Authentication

-   `POST /api/v1/auth/signup` - Register a new user
-   `POST /api/v1/auth/signin` - Login an existing user
-   `POST /api/v1/auth/signout` - Logout the current user

### Public Access

-   `GET /api/v1/users` - Get a list of all users (with pagination)
-   `GET /api/v1/users/:id` - Get a specific user's profile by ID

### Profile Management (Requires Authentication)

-   `GET /api/v1/users/profile/me` - Get own profile
-   `PUT /api/v1/users/profile/me` - Update own profile
-   `POST /api/v1/users/profile/youtube` - Add a YouTube link to profile
-   `DELETE /api/v1/users/profile/youtube/:linkId` - Remove a YouTube link from profile

## Authentication

All protected endpoints require a valid JWT token in the Authorization header:

```
Authorization: Bearer <your_token>
```

You'll receive this token after successfully signing in.

## Request & Response Examples

### User Registration

**Request:**

```json
POST /api/v1/auth/signup
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123"
}
```

**Response:**

```json
{
    "success": true,
    "message": "User created successfully",
    "data": {
        "token": "jwt_token_here",
        "user": {
            "id": "user_id",
            "name": "John Doe",
            "email": "john@example.com",
            "createdAt": "2023-01-01T00:00:00.000Z",
            "updatedAt": "2023-01-01T00:00:00.000Z"
        }
    }
}
```

### Update Profile

**Request:**

```json
PUT /api/v1/users/profile/me
{
  "name": "John Smith",
  "bio": "Software developer with 5 years of experience",
  "location": "New York, USA"
}
```

**Response:**

```json
{
    "success": true,
    "message": "Profile updated successfully",
    "data": {
        "id": "user_id",
        "name": "John Smith",
        "email": "john@example.com",
        "bio": "Software developer with 5 years of experience",
        "location": "New York, USA",
        "youtubeLinks": [],
        "createdAt": "2023-01-01T00:00:00.000Z",
        "updatedAt": "2023-01-01T00:00:00.000Z"
    }
}
```

### Add YouTube Link

**Request:**

```json
POST /api/v1/users/profile/youtube
{
  "youtubeUrl": "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
  "title": "My Favorite Video"
}
```

**Response:**

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
            "id": "user_id",
            "name": "John Smith",
            "email": "john@example.com",
            "bio": "Software developer with 5 years of experience",
            "location": "New York, USA",
            "youtubeLinks": [
                {
                    "id": "1625012345678",
                    "url": "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
                    "title": "My Favorite Video",
                    "addedAt": "2023-01-01T00:00:00.000Z"
                }
            ],
            "createdAt": "2023-01-01T00:00:00.000Z",
            "updatedAt": "2023-01-01T00:00:00.000Z"
        }
    }
}
```

## Setup and Installation

1. Clone the repository
2. Install dependencies with `npm install`
3. Create a `.env.development.local` file with the following variables:
    ```
    PORT=5000
    NODE_ENV=development
    JWT_SECRET=your_jwt_secret
    JWT_EXPIRES_IN=7d
    DB_URI=your_postgres_connection_string
    ```
4. Run the server in development mode with `npm run dev`

## Error Handling

All API endpoints follow a consistent error response format:

```json
{
    "success": false,
    "message": "Error message here"
}
```

## Validation

-   All inputs are validated using Joi
-   Data stored in the database is validated using Sequelize validators
