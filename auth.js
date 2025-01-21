/**
 * Authentication module for MovieNest API.
 * Uses Passport strategies to handle user login and generate JWTs.
 * @module auth
 */

const jwtSecret = 'your_jwt_secret';

const jwt = require('jsonwebtoken'),
    passport = require('passport');

require('./passport'); //Local passport file

/**
 * Generates a JWT (JSON Web Token) for a given user.
 * @function generateJWTToken
 * @param {object} user - The user object, typically containing Username and other user data
 * @returns {string} The signed JWT token, valid for 7 days
 */
let generateJWTToken = (user) => {
    return jwt.sign(user, jwtSecret, {
        subject: user.Username, //Username that will be encoded in the JWT
        expiresIn: '7d', //Token will expire in 7 days
        algorithm: 'HS256' //The algorithm used to "sign" or encode the values of the JWT
    });
}

/**
 * Adds a POST /login endpoint to the given router.
 * Authenticates a user with the 'local' Passport strategy and issues a JWT.
 * @function
 * @name POST /login
 * @param {object} router - An Express router
 * @memberof module:auth
 * @example
 * // Usage in main server:
 * const auth = require('./auth');
 * auth(app); // app is an Express instance
 */
module.exports = (router) => {
    /**
     * POST login route.
     * Uses Passport's local strategy to authenticate. On success, returns JSON with the user and a JWT.
     * @name POST /login
     * @function
     * @memberof module:auth
     * @param {string} req.body.Username - The user's username
     * @param {string} req.body.Password - The user's password
     * @returns {object} 200 - JSON with user data and token
     * @returns {object} 400 - If user not found or credentials invalid
     */
    router.post('/login', (req, res) => {
        passport.authenticate('local', { session: false }, (error, user, info) => {
            if (error || !user) {
                return res.status(400).json({
                    message: 'Something is not right.',
                    user: user
                });
            }
            req.login(user, { session: false }, (error) => {
                if (error) {
                    res.send(error);
                }
                let token = generateJWTToken(user.toJSON());
                return res.json({ user, token });
            });
        }) (req, res);
    });
}