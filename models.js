/**
 * @file models.js
 * @module models
 * @description Defines the Mongoose schemas and models for Movies and Users, along with password hashing and validation methods.
 */

const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

/**
 * Movie schema definition.
 * @typedef {Object} MovieSchema
 * @property {String} Title - The movie’s title (required)
 * @property {String} Description - A short description of the movie (required)
 * @property {Object} Genre - Genre info
 * @property {String} Genre.Name - The name of the genre (e.g., "Drama")
 * @property {String} Genre.Description - A short description of the genre
 * @property {Object} Director - Director info
 * @property {String} Director.Name - The director’s name
 * @property {String} Director.Bio - Director’s biography
 * @property {String[]} Actors - Array of actor names
 * @property {String} ImagePath - URL or path of the movie poster/image
 * @property {Boolean} Featured - Whether the movie is featured
 */
let movieSchema = mongoose.Schema({
    Title: {type: String, required: true},
    Description: {type: String, required: true},
    Genre: {
        Name: String,
        Description: String
    },
    Director: {
        Name: String,
        Bio: String
    },
    Actors: [String],
    ImagePath: String,
    Featured: Boolean
});

/**
 * User schema definition.
 * @typedef {Object} UserSchema
 * @property {String} Username - The user’s username (required)
 * @property {String} Password - The user’s password (hashed) (required)
 * @property {String} Email - The user’s email address (required)
 * @property {Date} BirthDate - The user’s birth date
 * @property {ObjectId[]} FavouriteMovies - Array of Movie IDs the user has favorited
 */
let userSchema = mongoose.Schema ({
    Username: {type: String, required: true},
    Password: {type: String, required: true},
    Email: {type: String, required: true},
    BirthDate: Date,
    FavouriteMovies: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Movie'}]
});

/**
 * Hashes a user’s password using bcrypt.
 * @function
 * @name hashPassword
 * @memberof module:models~UserSchema
 * @param {string} password - The plaintext password to hash
 * @returns {string} The hashed password
 */
userSchema.statics.hashPassword = (password) => {
    return bcrypt.hashSync(password, 10);
};

/**
 * Compares a given plaintext password with the stored hashed password.
 * @function
 * @name validatePassword
 * @memberof module:models~UserSchema
 * @param {string} password - The plaintext password to validate
 * @returns {boolean} True if passwords match, false otherwise
 */
userSchema.methods.validatePassword = function(password) {
    return bcrypt.compareSync(password, this.Password);
};

/**
 * Movie model, based on {@link MovieSchema}.
 * @typedef {Model<MovieSchema>} Movie
 */
let Movie = mongoose.model('Movie', movieSchema);

/**
 * User model, based on {@link UserSchema}.
 * @typedef {Model<UserSchema>} User
 */
let User = mongoose.model('User', userSchema);

module.exports.Movie = Movie;
module.exports.User = User;