/**
 * user.model.js
 *
 * WHAT IS A MODEL IN MVC?
 * -----------------------
 * The "Model" is the M in MVC. It defines:
 *   1. The blueprint (Schema) of what a User document looks like in MongoDB.
 *   2. Validation rules (e.g. required fields, valid email format, minimum password length).
 *   3. Pre-save hooks (middleware) to automatically hash passwords before storing them.
 *   4. Custom helper methods (like `matchPassword`) for comparing passwords.
 */

const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please provide a name'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Please provide an email address'],
      unique: true, // No two users can have the same email
      lowercase: true,
      trim: true,
      match: [
        /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
        'Please provide a valid email address',
      ],
    },
    password: {
      type: String,
      // Password is only required if the user did NOT register via Google OAuth
      required: function () {
        return !this.googleId;
      },
      minlength: [6, 'Password must be at least 6 characters long'],
      select: false, // Prevents password from being returned in standard DB queries for security
    },
    googleId: {
      type: String,
      unique: true,
      sparse: true, // Allows null/missing values for users who registered with email & password
    },
    role: {
      type: String,
      enum: ['customer', 'retailer'],
      default: 'customer',
    },
    retailerCategory: {
      type: String,
      // Only required if the user has the 'retailer' role
      required: function () {
        return this.role === 'retailer';
      },
    },
    apiKey: {
      type: String,
      select: false, // Hidden by default from queries
    },
    apiKeyCreatedAt: {
      type: Date,
    },
  },
  {
    timestamps: true, // Automatically adds createdAt and updatedAt fields
  }
);

/**
 * Pre-save Hook: Password Hashing
 * -------------------------------
 * Before saving a user into MongoDB, this function checks if the password
 * was changed or is newly set. If so, it hashes the password with bcrypt
 * so plain-text passwords are NEVER saved in the database.
 */
userSchema.pre('save', async function () {
  if (!this.isModified('password') || !this.password) {
    return;
  }

  // Generate a salt with cost factor 10 and hash the password
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

/**
 * Instance Method: matchPassword
 * ------------------------------
 * Compares an entered plain-text password with the stored bcrypt hash.
 *
 * @param {string} enteredPassword
 * @returns {Promise<boolean>}
 */
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

const User = mongoose.model('User', userSchema);

module.exports = User;
