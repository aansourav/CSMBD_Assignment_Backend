/**
 * Custom CORS Middleware
 * 
 * A flexible CORS implementation that:
 * 1. Handles all CORS headers correctly
 * 2. Supports both regular and preflight requests
 * 3. Allows dynamic origin validation
 * 4. Can be applied globally or to specific routes
 */

// Allowed origins for CORS requests
const ALLOWED_ORIGINS = [
    'http://localhost:3000',
    'https://csmbd-assignment-frontend.vercel.app'
];

/**
 * Validates if the request origin is allowed
 * @param {string} origin - The origin from the request
 * @returns {boolean} - True if origin is allowed
 */
const isOriginAllowed = (origin) => {
    // Allow requests with no origin (like mobile apps, curl, etc)
    if (!origin) return true;
    
    return ALLOWED_ORIGINS.includes(origin);
};

/**
 * Main CORS middleware
 * @param {Object} options - Configuration options
 * @returns {Function} - Express middleware function
 */
export const corsMiddleware = (options = {}) => {
    const {
        // Override allowed methods
        methods = ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
        // Override allowed headers
        allowedHeaders = ['Content-Type', 'Authorization'],
        // Override exposed headers
        exposedHeaders = [],
        // Override credentials setting
        credentials = true,
        // Override max age for preflight requests cache
        maxAge = 86400, // 24 hours
        // Override origin validation function
        originValidator = isOriginAllowed
    } = options;

    return (req, res, next) => {
        const origin = req.headers.origin;
        
        // Set CORS headers only if origin is allowed
        if (originValidator(origin)) {
            // Set the allowed origin based on the request origin
            res.setHeader('Access-Control-Allow-Origin', origin || '*');
            
            // Set other CORS headers
            if (credentials) {
                res.setHeader('Access-Control-Allow-Credentials', 'true');
            }
            
            // For preflight requests
            if (req.method === 'OPTIONS') {
                res.setHeader('Access-Control-Allow-Methods', methods.join(', '));
                res.setHeader('Access-Control-Allow-Headers', allowedHeaders.join(', '));
                res.setHeader('Access-Control-Max-Age', maxAge.toString());
                
                // Preflight requests need an immediate response
                return res.status(204).end();
            }
            
            // For actual requests, set exposed headers
            if (exposedHeaders.length) {
                res.setHeader('Access-Control-Expose-Headers', exposedHeaders.join(', '));
            }
        }
        
        next();
    };
};

/**
 * Enhanced CORS middleware for image/media resources
 * Adds additional headers specifically needed for cross-origin media resources
 */
export const imageResourceCorsMiddleware = (req, res, next) => {
    const origin = req.headers.origin;
    
    // Basic CORS headers
    if (isOriginAllowed(origin)) {
        res.setHeader('Access-Control-Allow-Origin', origin || '*');
        res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
        res.setHeader('Access-Control-Allow-Credentials', 'true');
        
        // Special headers for resources/images
        res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
        res.setHeader('Timing-Allow-Origin', origin || '*');
        
        // Preflight response for OPTIONS
        if (req.method === 'OPTIONS') {
            return res.status(204).end();
        }
    }
    
    next();
};

export default corsMiddleware; 