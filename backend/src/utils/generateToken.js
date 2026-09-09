/**
 * generateToken.js
 *
 * WHAT IS THIS FILE?
 * ------------------
 * This utility function creates a JSON Web Token (JWT) for a given user ID.
 *
 * WHAT IS A JWT?
 * A JSON Web Token is a digitally signed string that securely transmits information
 * between the client and server. It has 3 parts separated by dots (header.payload.signature):
 *   1. Header: Specifies the algorithm used (e.g. HS256)
 *   2. Payload: Data we want to store (in our case, `{ id: user._id }`)
 *   3. Signature: Cryptographic hash created using JWT_SECRET to ensure token hasn't been tampered with
 *
 * @param {string} id - The MongoDB ObjectId of the user
 * @returns {string} The signed JWT string
 */

const jwt = require('jsonwebtoken');

const generateToken = (id) => {
  // Signs the user's ID with our secret key and sets it to expire in 30 days
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '30d',
  });
};

module.exports = generateToken;
