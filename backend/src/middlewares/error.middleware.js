/**
 * error.middleware.js
 *
 * WHAT IS THIS FILE?
 * ------------------
 * In Express, "Middleware" functions sit between incoming HTTP requests
 * and outgoing HTTP responses.
 *
 * This file contains two essential error-handling middlewares:
 *   1. notFound      → Catches any request to an endpoint URL that doesn't exist (HTTP 404).
 *   2. errorHandler  → Catches all errors thrown anywhere in our controllers or routes
 *                      and sends a clean, friendly JSON response to the user instead of
 *                      crashing the server.
 *
 * Express recognizes a function as an error handler when it has EXACTLY 4 parameters:
 *   (err, req, res, next)
 */

/**
 * 404 Not Found Handler
 * Runs when no route matches the incoming URL.
 */
const notFound = (req, res, next) => {
  const error = new Error(`Route Not Found - ${req.originalUrl}`);
  res.status(404);
  // Pass the error to the next middleware (which will be errorHandler below)
  next(error);
};

/**
 * Global Error Handler
 * Receives any error passed via next(err) or thrown in an async handler.
 */
const errorHandler = (err, req, res, next) => {
  // If the status code is still 200 (OK), default to 500 (Internal Server Error)
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;

  // Log error details to the server console for easy developer debugging
  console.error(`[Error Handler] ${req.method} ${req.originalUrl} - ${err.message}`);

  res.status(statusCode).json({
    success: false,
    message: err.message || 'Internal Server Error',
    // In development mode, include the stack trace so developers can see which line failed.
    // In production mode, hide the stack trace for security.
    stack: process.env.NODE_ENV === 'production' ? undefined : err.stack,
  });
};

module.exports = {
  notFound,
  errorHandler,
};
