/**
 * @file passport.js
 * @module passportConfig
 * @description Configures Passport authentication strategies for the MovieNest API.
 */

const passport = require('passport'),
    LocalStrategy = require('passport-local').Strategy,
    Models = require('./models.js'),
    passportJWT = require('passport-jwt');

let Users = Models.User,
    JWTStrategy = passportJWT.Strategy,
    ExtractJWT = passportJWT.ExtractJwt;

/**
 * Configures the LocalStrategy for Passport.
 * 
 * This strategy uses a username and password for local (basic) HTTP authentication
 * when a user attempts to log in. 
 * @function
 * @name LocalStrategy
 * @memberof module:passportConfig
 * 
 * @param {string} username - The username field (defaults to "Username")
 * @param {string} password - The password field (defaults to "Password")
 * @param {function} callback - A callback function that Passport invokes to handle success/failure
 * 
 * @returns {object} user - The user object if authentication is successful
 * @returns {boolean} false - If authentication fails (incorrect user or password)
 * @example
 * // Example usage in auth.js:
 * // router.post('/login', passport.authenticate('local', ...), (req, res) => {...});
 */
passport.use(
    new LocalStrategy(
        {
            usernameField: 'Username',
            passwordField: 'Password',
        },
        async (username, password, callback) => {
            console.log(`${username} ${password}`);
            await Users.findOne({ Username: username })
            .then((user) => {
                if (!user) {
                    console.log('incorrect username');
                    return callback(null, false, {
                        message: 'Incorrect username or password.',
                    });
                }
                console.log('finished');
                return callback(null, user);
            })
            .catch((error) => {
                if (error) {
                    console.log(error);
                    return callback(error);
                }
            })
        }
    )
);

/**
 * Configures the JWTStrategy for Passport.
 * 
 * This strategy extracts a JWT (via bearer token in the request header),
 * verifies its signature, and looks up the user by the ID encoded in the token.
 * @function
 * @name JWTStrategy
 * @memberof module:passportConfig
 * 
 * @param {object} jwtPayload - Decoded JWT payload containing user info (e.g., _id)
 * @param {function} callback - A callback function that Passport invokes to handle success/failure
 * 
 * @returns {object} user - The user object if authentication is successful
 * @returns {object} error - If an error occurs or user is not found
 * 
 * @example
 * // Example usage in index.js:
 * // app.get('/movies', passport.authenticate('jwt', { session: false }), (req, res) => {...});
 */
passport.use(new JWTStrategy({
    jwtFromRequest: ExtractJWT.fromAuthHeaderAsBearerToken(),
    secretOrKey: 'your_jwt_secret'
}, async (jwtPayload, callback) => {
    return await Users.findById(jwtPayload._id)
    .then((user) => {
        return callback(null, user);
    })
    .catch((error) => {
        return callback(error)
    });
}));