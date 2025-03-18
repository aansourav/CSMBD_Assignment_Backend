# 🌐 CSMBD Social Platform API

<div align="center">

A robust backend API for a social platform enabling user registration, authentication, profile management, and content sharing.

[![Node.js](https://img.shields.io/badge/Node.js-16.x-339933?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org/)
[![Express](https://img.shields.io/badge/Express-4.x-000000?style=for-the-badge&logo=express&logoColor=white)](https://expressjs.com/)
[![Sequelize](https://img.shields.io/badge/Sequelize-6.x-52B0E7?style=for-the-badge&logo=sequelize&logoColor=white)](https://sequelize.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-14.x-4169E1?style=for-the-badge&logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![JWT](https://img.shields.io/badge/JWT-Authentication-000000?style=for-the-badge&logo=json-web-tokens&logoColor=white)](https://jwt.io/)

</div>

---

## 📑 Table of Contents

-   [🌟 Features](#-features)
-   [📚 API Documentation](#-api-documentation)
-   [⚙️ Environment Variables](#️-environment-variables)
-   [🚀 Project Setup](#-project-setup)
-   [🏗️ Project Structure](#️-project-structure)
-   [🔐 Authentication](#-authentication)
-   [✅ Data Validation](#-data-validation)
-   [⚠️ Error Handling](#️-error-handling)
-   [📁 File Uploads](#-file-uploads)
-   [🛡️ Security Implementation](#️-security-implementation)
-   [🌐 CORS Implementation](#-cors-implementation)
-   [⚡ Performance Optimizations](#-performance-optimizations)
-   [🤝 Contributing](#-contributing)

---

## 🌟 Features

### 👤 User Authentication

-   **Registration**: New users can create accounts with name, email, and password
-   **Login**: Secure authentication with JWT tokens
-   **Logout**: Invalidate current session

### 👤 User Profile Management

-   **View Profile**: Authenticated users can view their own profile
-   **Edit Profile**: Update personal details including name, email, bio, and location
-   **Profile Picture**: Upload, update, and retrieve profile pictures with default fallback
-   **Content Management**: Add and remove YouTube embed links with titles

### 📺 Content Sharing

-   **YouTube Links**: Share favorite YouTube videos on personal profiles
-   **Content Aggregation**: Browse all shared content across the platform

### 🔎 Visitor Access

-   **User Discovery**: Browse all registered users with pagination
-   **Profile Viewing**: View any user's profile and their shared content
-   **Content Discovery**: View all shared content with sorting options

<div align="right">[ <a href="#-table-of-contents">Back to Top ⬆️</a> ]</div>

---

## 📚 API Documentation

### 🔑 Authentication Endpoints

<details>
<summary><b>POST /api/v1/auth/signup</b> - Register a new user</summary>

#### Request Body:

```json
{
    "name": "John Doe",
    "email": "john@example.com",
    "password": "password123"
}
```

#### Success Response: `201 Created`

```json
{
    "success": true,
    "message": "User created successfully",
    "data": {
        "accessToken": "eyJhbGc...",
        "refreshToken": "eyJhbGc...",
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

</details>

<details>
<summary><b>POST /api/v1/auth/signin</b> - Login an existing user</summary>

#### Request Body:

```json
{
    "email": "john@example.com",
    "password": "password123"
}
```

#### Success Response: `200 OK`

```json
{
    "success": true,
    "message": "User signed in successfully",
    "data": {
        "accessToken": "eyJhbGc...",
        "refreshToken": "eyJhbGc...",
        "user": {
            "id": "123e4567-e89b-12d3-a456-426614174000",
            "name": "John Doe",
            "email": "john@example.com"
        }
    }
}
```

</details>

<details>
<summary><b>POST /api/v1/auth/refresh-token</b> - Get a new access token</summary>

#### Request Body:

```json
{
    "refreshToken": "eyJhbGc..."
}
```

#### Success Response: `200 OK`

```json
{
    "success": true,
    "message": "Token refreshed successfully",
    "data": {
        "accessToken": "eyJhbGc..."
    }
}
```

#### Error Responses:

-   `400 Bad Request`: Refresh token not provided
-   `401 Unauthorized`: Invalid, expired, or revoked refresh token

</details>

<details>
<summary><b>POST /api/v1/auth/signout</b> - Logout the current user</summary>

#### Authentication Required

This endpoint requires a valid access token in the Authorization header:

```
Authorization: Bearer <your_access_token>
```

#### Success Response: `200 OK`

```json
{
    "success": true,
    "message": "User signed out successfully"
}
```

#### Error Responses:

-   `401 Unauthorized`: Authentication required or invalid token
-   `500 Internal Server Error`: Server error during sign out process

#### What Happens on Logout:

1. Your access token is blacklisted (cannot be used again)
2. Your refresh token is invalidated in the database
3. Your token version is incremented to invalidate any potentially stolen refresh tokens

</details>

### 👥 User Endpoints

<details>
<summary><b>GET /api/v1/users</b> - Get a list of all users</summary>

#### Query Parameters:

-   `page` (optional): Page number (default: 1)
-   `limit` (optional): Number of users per page (default: 10)

#### Success Response: `200 OK`

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

#### Security Note:

All user responses exclude sensitive information like passwords, refresh tokens, and token versions.

</details>

<details>
<summary><b>GET /api/v1/users/content</b> - Get all content across all users</summary>

#### Query Parameters:

-   `page` (optional): Page number (default: 1)
-   `limit` (optional): Items per page (default: 10, max: 50)
-   `sortBy` (optional): Sort order - "newest", "oldest", or "popular" (default: "newest")

#### Success Response: `200 OK`

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

</details>

<details>
<summary><b>GET /api/v1/users/:id</b> - Get a specific user by ID</summary>

#### Success Response: `200 OK`

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

#### Security Note:

All user responses exclude sensitive information like passwords, refresh tokens, and token versions.

</details>

<details>
<summary><b>GET /api/v1/users/:id/profile-picture</b> - Get a user's profile picture</summary>

#### Success Response:

Returns the profile image file or default image if none exists.

#### CORS Support:

This endpoint includes special CORS headers to ensure profile pictures can be loaded in cross-origin contexts (e.g., from different domains).

</details>

### 👤 Profile Management Endpoints (Requires Authentication)

<details>
<summary><b>GET /api/v1/users/profile/me</b> - Get current user's profile</summary>

#### Success Response: `200 OK`

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

#### Security Note:

All user responses exclude sensitive information like passwords, refresh tokens, and token versions.

</details>

<details>
<summary><b>PUT /api/v1/users/profile/me</b> - Update current user's profile</summary>

#### Request Body: (Multipart form data)

-   `name` (optional): Updated name
-   `email` (optional): Updated email
-   `bio` (optional): Updated bio
-   `location` (optional): Updated location
-   `profilePicture` (optional): Image file for profile picture

#### Success Response: `200 OK`

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

#### Security Note:

All user responses exclude sensitive information like passwords, refresh tokens, and token versions.

</details>

<details>
<summary><b>POST /api/v1/users/profile/youtube</b> - Add a YouTube link to profile</summary>

#### Request Body:

```json
{
    "youtubeUrl": "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    "title": "My Favorite Video"
}
```

#### Success Response: `201 Created`

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

#### Security Note:

All user responses exclude sensitive information like passwords, refresh tokens, and token versions.

</details>

<details>
<summary><b>DELETE /api/v1/users/profile/youtube/:linkId</b> - Remove a YouTube link</summary>

#### Success Response: `200 OK`

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

#### Security Note:

All user responses exclude sensitive information like passwords, refresh tokens, and token versions.

</details>

<div align="right">[ <a href="#-table-of-contents">Back to Top ⬆️</a> ]</div>

---

## ⚙️ Environment Variables

Create a `.env.development.local` file for development and a `.env.production.local` file for production with the following variables:

```bash
# Server Configuration
PORT=5000
NODE_ENV=development

# Authentication
JWT_SECRET=your_secure_jwt_secret_key
JWT_EXPIRES_IN=15m  # Short-lived access tokens (15 minutes)
JWT_REFRESH_SECRET=your_secure_refresh_token_secret  # Can be different from JWT_SECRET
JWT_REFRESH_EXPIRES_IN=7d  # Long-lived refresh tokens (7 days)

# Database Configuration
DB_URI=postgresql://username:password@localhost:5432/database_name

# CORS Configuration
CORS_ORIGIN=http://localhost:3000
```

<div align="right">[ <a href="#-table-of-contents">Back to Top ⬆️</a> ]</div>

---

## 🚀 Project Setup

<details>
<summary><b>Step-by-Step Setup Instructions</b></summary>

1.  **Clone the repository**

    ```bash
    git clone https://github.com/yourusername/csmbd-social-platform-api.git
    cd csmbd-social-platform-api
    ```

2.  **Install dependencies**

    ```bash
    npm install
    ```

3.  **Set up environment variables**

    Create the `.env.development.local` file as described above

4.  **Create uploads directory** (if not present)

    ```bash
    mkdir -p uploads/profile-pictures
    ```

5.  **Run database migrations**

    ```bash
    npm run dev
    ```

    The first run will automatically create database tables

6.  **Start the development server**

    ```bash
    npm run dev
    ```

7.  **Start the production server**

        ```bash
        npm start
        ```

    </details>

<div align="right">[ <a href="#-table-of-contents">Back to Top ⬆️</a> ]</div>

---

## 🏗️ Project Structure

```
csmbd-social-platform-api/
├── config/              # Configuration files
│   └── env.js           # Environment variables setup
├── controllers/         # Route controllers
│   ├── auth.controller.js  # Authentication logic
│   └── user.controller.js  # User and content management
├── database/            # Database setup and migrations
│   ├── migrations.js    # Schema migration handling
│   └── postgresql.js    # Database connection configuration
├── middlewares/         # Express middlewares
│   ├── auth.middleware.js  # JWT authentication
│   ├── cors.middleware.js  # Custom CORS implementation
│   ├── error.middleware.js # Global error handling
│   └── upload.middleware.js # File upload handling
├── model/               # Sequelize models
│   └── user.model.js    # User data model and validation
├── routes/              # Express routes
│   ├── auth.route.js    # Authentication endpoints
│   └── user.route.js    # User and content endpoints
├── uploads/             # File uploads storage
│   └── profile-pictures/    # User profile images
│       └── default.png      # Default profile picture
├── utils/               # Utility functions and helpers
├── index.js             # Application entry point
├── app.js               # Entry wrapper for index.js
└── package.json         # Project dependencies and scripts
```

<div align="right">[ <a href="#-table-of-contents">Back to Top ⬆️</a> ]</div>

---

## 🔐 Authentication

This API uses JSON Web Tokens (JWT) for authentication with a refresh token system:

<details>
<summary><b>Authentication Flow</b></summary>

1. When a user registers or logs in, two tokens are generated and returned:

    - **Access Token**: Short-lived token (15 minutes by default) used to authenticate API requests
    - **Refresh Token**: Longer-lived token (7 days by default) used to get new access tokens

2. For protected routes, include the access token in the Authorization header:

    ```
    Authorization: Bearer <your_access_token>
    ```

3. When the access token expires, use the refresh token to get a new one:

    - Send a POST request to `/api/v1/auth/refresh-token` with the refresh token
    - Store the new access token and use it for subsequent requests

4. The `authorize` middleware validates the access token before allowing access to protected resources
 </details>

<details>
<summary><b>Token Security Features</b></summary>

1. **Token Version Tracking**: Each user has a token version that increments on password change or forced logout

    - If a refresh token is used with an outdated version, it is rejected
    - This protects against stolen refresh tokens

2. **Refresh Token Rotation**: Refresh tokens are stored in the database

    - Each user can have only one valid refresh token at a time
    - On logout, the refresh token is invalidated

3. **Access Token Blacklisting**: When a user logs out, their current access token is blacklisted - Blacklisted tokens are rejected by the authentication middleware - Tokens are automatically removed from the blacklist when they expire
 </details>

<details>
<summary><b>Token Invalidation (Logout)</b></summary>

The current implementation uses an in-memory token blacklist:

1. When a user logs out, their access token is added to the blacklist
2. Their refresh token is invalidated in the database
3. Their token version is incremented to invalidate any other refresh tokens
4. Blacklisted tokens are rejected by the authentication middleware
5. Tokens are automatically removed from the blacklist when they expire

**⚠️ Development Notice:** The current token blacklisting uses in-memory storage which:

-   Does not persist across server restarts
-   Does not work in distributed environments with multiple server instances
-   Is suitable for development but not production deployments

For production deployments, consider implementing:

-   Redis-based token blacklisting
-   Database-backed blacklist storage
</details>

<div align="right">[ <a href="#-table-of-contents">Back to Top ⬆️</a> ]</div>

---

## ✅ Data Validation

<details>
<summary><b>Validation Layers</b></summary>

-   **Joi**: All incoming requests are validated using Joi schemas to ensure data integrity
-   **Sequelize Validators**: Database models include validation rules to prevent invalid data storage
-   **Custom Validation**: Additional business logic validations are implemented in controllers
</details>

<details>
<summary><b>Validation Examples</b></summary>

#### User Registration Validation

-   Name: 3-50 characters
-   Email: Valid email format, must be unique
-   Password: Minimum 8 characters

#### YouTube URL Validation

-   Must be a valid YouTube URL format
-   Title: Required, maximum 100 characters
</details>

<div align="right">[ <a href="#-table-of-contents">Back to Top ⬆️</a> ]</div>

---

## ⚠️ Error Handling

<details>
<summary><b>Error Response Format</b></summary>

All API endpoints use a consistent error response format:

```json
{
    "success": false,
    "message": "Detailed error message"
}
```

</details>

<details>
<summary><b>HTTP Status Codes</b></summary>

-   `400 Bad Request`: Invalid input data
-   `401 Unauthorized`: Authentication required or invalid credentials
-   `403 Forbidden`: Insufficient permissions
-   `404 Not Found`: Resource not found
-   `409 Conflict`: Resource conflict (e.g., duplicate email)
-   `500 Internal Server Error`: Server-side error
</details>

<div align="right">[ <a href="#-table-of-contents">Back to Top ⬆️</a> ]</div>

---

## 📁 File Uploads

Profile pictures are managed with the following features:

<details>
<summary><b>File Upload Features</b></summary>

-   **Storage**: Profile images are stored in the `uploads/profile-pictures` directory
-   **Default Image**: A default profile picture is provided for users without uploaded images
-   **Validation**: Only images (JPEG, PNG, GIF, WebP) up to 2MB are accepted
-   **Clean-up**: Old profile pictures are automatically deleted when replaced
-   **Secure Naming**: Files are renamed using timestamps and cryptographic randomization
</details>

<div align="right">[ <a href="#-table-of-contents">Back to Top ⬆️</a> ]</div>

---

## 🛡️ Security Implementation

<details>
<summary><b>Security Features</b></summary>

-   **Password Hashing**: Passwords are hashed using bcrypt before storage
-   **JWT Authentication**: Secure, stateless authentication mechanism
-   **Input Validation**: All inputs are validated to prevent injection attacks
-   **Helmet**: HTTP headers are secured to reduce common web vulnerabilities
-   **CORS**: Advanced Cross-Origin Resource Sharing configuration with resource-specific handling
-   **Information Hiding**: Sensitive data like passwords, refresh tokens, and token versions are never exposed in API responses
-   **Token Version Tracking**: Protection against stolen refresh tokens
-   **File Upload Security**: Strict file type validation and size limits
-   **Cross-Origin Resource Policy**: Properly configured for media resources
</details>

<details>
<summary><b>Data Protection Measures</b></summary>

-   **No Sensitive Information in Responses**: All API responses exclude sensitive authentication data
-   **Secure Token Management**: Refresh tokens are stored securely and never exposed after initial generation
-   **Token Versioning**: Each user has a token version that increments on password change or forced logout
-   **Database Security**: User passwords are hashed using bcrypt with salt rounds
-   **Input Sanitization**: All user inputs are validated and sanitized before processing
</details>

<div align="right">[ <a href="#-table-of-contents">Back to Top ⬆️</a> ]</div>

---

## 🌐 CORS Implementation

<details>
<summary><b>Custom CORS Middleware</b></summary>

The API uses a custom CORS implementation that provides:

- **Origin Validation**: Only approved frontends can access the API
- **Resource-Specific Handling**: Different CORS settings for API responses vs. media resources
- **Preflight Support**: Proper handling of OPTIONS requests for cross-origin requests
- **Flexible Configuration**: Adaptable to different environments and needs

The implementation is more flexible than the standard cors npm package, allowing for:
- Resource-specific CORS headers
- Dynamic origin handling
- Specialized handling for media resources like profile pictures
</details>

<details>
<summary><b>Media Resource Handling</b></summary>

Profile pictures and other media resources use enhanced CORS settings:

- **Content Type Detection**: Automatic detection and setting of correct MIME types
- **Special Headers**: Cross-Origin-Resource-Policy and Timing-Allow-Origin headers
- **Caching Support**: Cache-Control headers for better performance
- **Streaming Delivery**: Efficient file streaming with proper error handling
</details>

<details>
<summary><b>Supported Frontend Origins</b></summary>

The API supports cross-origin requests from:

- **Development**: http://localhost:3000
- **Production**: https://csmbd-assignment-frontend.vercel.app
</details>

<div align="right">[ <a href="#-table-of-contents">Back to Top ⬆️</a> ]</div>

---

## ⚡ Performance Optimizations

<details>
<summary><b>Performance Features</b></summary>

-   **Database Connection Pooling**: Optimized for efficient database connections
-   **Pagination**: All list endpoints support pagination to limit response size
-   **Efficient Queries**: Database queries are optimized to retrieve only necessary data
-   **File Size Limits**: Upload file sizes are restricted to prevent abuse
-   **Cache Control**: Static assets use proper cache control headers
-   **Query Parameter Validation**: All query parameters are validated and sanitized
-   **Error Logging**: Comprehensive error logging for debugging and monitoring
</details>

<div align="right">[ <a href="#-table-of-contents">Back to Top ⬆️</a> ]</div>

---

## 🤝 Contributing

<details>
<summary><b>Contribution Guidelines</b></summary>

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request
 </details>

<div align="right">[ <a href="#-table-of-contents">Back to Top ⬆️</a> ]</div>

---

<div align="center">

**🌟 Built with ❤️ by [Abdullah An-Noor](https://aansourav.vercel.app) 🌟**

</div>
