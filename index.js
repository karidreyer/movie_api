/**
 * Main Express application for the MovieNest API.
 * 
 * @file index.js
 * @module index
 * @description This file configures the Express app, connects to MongoDB, 
 * defines all API endpoints for movies and users, sets up authentication, and listens on a specified port.
 */

//Import Mongoose for MongoDB interactions
const mongoose = require('mongoose');

//Import models
const Models = require('./models.js');
const Movies = Models.Movie;
const Users = Models.User;

//Import Express framework and other necessary middleware
const express = require('express');
const morgan = require('morgan');
const bodyParser = require('body-parser');
const uuid = require('uuid');
const { check, validationResult } = require('express-validator');



//** Initializing Express application **//
const app = express();



/**
 * Connects to MongoDB.
 * - If using a local DB, uncomment the local connect string.
 * - Otherwise uses the online DB from `process.env.CONNECTION_URI`.
 * @type {Mongoose.Connection}
 */

//Local database
// mongoose.connect('mongodb://localhost:27017/cfDB');

//Online database
mongoose.connect(process.env.CONNECTION_URI, { useNewUrlParser: true, useUnifiedTopology: true });



//** Middleware Setup **//

//Parse incoming request bodies in a middleware before your handlers, available under the req.body property
app.use(bodyParser.json());

// Serve static files from the 'public' directory
app.use(express.static('public'));

// Log HTTP requests and errors, and simplify debugging
app.use(morgan('common'));



//** Authorization and Privacy **//

//Require CORS and restrict access to allowed origins
const cors = require('cors');

/**
 * Allowed origins array for CORS.
 * @type {Array<string>}
 */
let allowedOrigins = [
    'http://localhost:8080', 
    'http://localhost:1234', 
    'https://movienest-app.netlify.app', 
    'http://localhost:4200', 
    'https://karidreyer.github.io'
];

app.use(cors({
    origin: (origin, callback) => {
        if(!origin) return callback(null, true);
        if(allowedOrigins.indexOf(origin) === -1) { //If a specific origin isn't found on the list of origins
            let message = 'The CORS policy for this application doesn\'t allow access from origin ' + origin;
            return callback(new Error(message ), false);
        }
        return callback(null, true);
    }
}));

//Import "auth.js"
let auth = require('./auth')(app); 

//Require Passport module and import the "passport.js" file
const passport = require('passport');
require('./passport');



//** Routes and handlers **//

/**
 * GET root path ("/").
 * Serves a simple welcome message.
 * @name GET /
 * @function
 * @memberof module:index
 * @returns {string} Welcome message
 */
app.get('/', (req, res) => {
    res.send('Welcome to Movie Nest!');
});

/**
 * GET documentation ("/documentation").
 * Serves a static HTML file describing the API endpoints.
 * @name GET /documentation
 * @function
 * @memberof module:index
 * @returns {file} documentation.html
 */
app.get('/documentation', (req, res) => {
    res.sendFile(__dirname + '/public/documentation.html');
});

/**
 * POST new user registration ("/users").
 * Allows new users to register. Validates user inputs.
 * @name POST /users
 * @function
 * @memberof module:index
 * @param {string} req.body.Username - Username (required, min length 5)
 * @param {string} req.body.Password - Password (required)
 * @param {string} req.body.Email - Email (required, valid email format)
 * @param {string} req.body.BirthDate - User's birthdate in YYYY-MM-DD
 * @returns {object} 201 - JSON object of newly created user
 * @returns {object} 400 - If username already exists
 * @returns {object} 422 - If validation fails
 */
app.post('/users', [
    //Input validation via Express Validation
    check('Username', 'Username must be at least 5 characters long.').isLength({min: 5}), //Check that username is not empty or too short
    check('Username', 'Username can not contain non-alphanumeric characters.').isAlphanumeric(), //Check that username does not contain non-alphanumeric characters
    check('Password', 'Password is required.').not().isEmpty(), //Check that password is not empty
    check('Email', 'Email does not appear to be valid.').isEmail() //Check that email address is valid
], async (req, res) => {
    //Check the validation object for errors and if errors exist, return a JSON object as an HTTP response
    let errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(422).json({ errors: errors.array() });
    }

    //Take the password input and hash it
    let hashedPassword = Users.hashPassword(req.body.Password);

    //Search for the requested username to check if it already exists
    await Users.findOne({ Username: req.body.Username })
    .then((user) => {
        if (user) {
            return res.status(400).send(req.body.Username + ' already exists.'); //If requested username already exists, notify the user
        } else {
            Users.create({
                Username: req.body.Username,
                Password: hashedPassword, //Store only hashed password for privacy
                Email: req.body.Email,
                BirthDate: req.body.BirthDate
            })
            .then((user) => { res.status(201).json(user) })
            .catch((error) => {
                console.error(error);
                res.status(500).send('Error: ' + error);
            })
        }
    })
    .catch((error) => {
        console.error(error);
        res.status(500).send('Error: ' + error);
    });
});

/**
 * POST add a movie to user’s favorites ("/users/:Username/movies/:MovieID").
 * @name POST /users/:Username/movies/:MovieID
 * @function
 * @memberof module:index
 * @param {string} req.params.Username - The user's username
 * @param {string} req.params.MovieID - The ID of the movie to add
 * @description Requires JWT auth. Only the user who owns the account can update it.
 * @returns {object} 200 - The updated user object with new favorite movie
 * @returns {object} 400 - If permission is denied
 */
app.post('/users/:Username/movies/:MovieID', passport.authenticate('jwt', { session: false }), async (req, res) => {
    if(req.user.Username !== req.params.Username) { //Ensure the authorized user is the owner of the account to be updated
        return res.status(400).send('Permission denied.');
    }
    await Users.findOneAndUpdate({ Username: req.params.Username }, 
        { $addToSet: 
            { FavouriteMovies: req.params.MovieID },
        },
        { new: true }) // This line makes sure that the /updated/ document is returned
        .then((updatedUser) => {
            res.json(updatedUser);
        })
        .catch((err) => {
            console.error(err);
            res.status(500).send('Error: ' + err);
        });
});

/**
 * GET all movies ("/movies").
 * @name GET /movies
 * @function
 * @memberof module:index
 * @description Returns an array of all movies in the database. Requires JWT auth.
 * @returns {object[]} 200 - JSON array of movie objects
 */
app.get('/movies', passport.authenticate('jwt', { session: false }), async (req, res) => {
    await Movies.find()
    .then((movies) => {
        res.status(200).json(movies);
    })
    .catch((err) => {
        console.error(err);
        res.status(500).send('Error: ' + err);
    });
});

/**
 * GET a single movie by title ("/movies/:Title").
 * @name GET /movies/:Title
 * @function
 * @memberof module:index
 * @param {string} req.params.Title - Movie title
 * @description Returns data about a single movie (e.g., description, genre, director).
 * @returns {object} 200 - Movie object
 */
app.get('/movies/:Title', passport.authenticate('jwt', { session: false }), async (req, res) => {
    await Movies.findOne({ Title: req.params.Title })
    .then((movie) => {
        res.json(movie);
    })
    .catch((err) => {
        console.error(err);
        res.status(500).send('Error: ' + err);
    });
});

/**
 * GET genre by name ("/movies/genres/:GenreName").
 * @name GET /movies/genres/:GenreName
 * @function
 * @memberof module:index
 * @param {string} req.params.GenreName - The name of the genre
 * @description Returns genre data (name and description) for a given genre name.
 * @returns {object} 200 - Genre object
 */
app.get('/movies/genres/:GenreName', passport.authenticate('jwt', { session: false }), async (req, res) => {
    await Movies.findOne({ "Genre.Name": req.params.GenreName })
    .then((movie) => {
        res.json(movie.Genre);
    })
    .catch((err) => {
        console.error(err);
        res.status(500).send('Error: ' + err);
    });
});

/**
 * GET director by name ("/movies/directors/:DirectorName").
 * @name GET /movies/directors/:DirectorName
 * @function
 * @memberof module:index
 * @param {string} req.params.DirectorName - The director's name
 * @description Returns director data (bio, birth, death) for the given director name.
 * @returns {object} 200 - Director object
 */
app.get('/movies/directors/:DirectorName', passport.authenticate('jwt', { session: false }), async (req, res) => {
    await Movies.findOne({ "Director.Name": req.params.DirectorName })
    .then((movie) => {
        res.json(movie.Director);
    })
    .catch((err) => {
        console.error(err);
        res.status(500).send('Error: ' + err);
    });
});

/**
 * GET all users ("/users").
 * @name GET /users
 * @function
 * @memberof module:index
 * @description Returns an array of all users. Requires JWT auth.
 * @returns {object[]} 201 - JSON array of user objects
 */
app.get('/users', passport.authenticate('jwt', { session: false }), async (req, res) => {
    await Users.find()
    .then((users) => {
        res.status(201).json(users);
    })
    .catch((err) => {
        console.error(err);
        res.status(500).send('Error: ' + err);
    });
});

/**
 * GET a single user by username ("/users/:Username").
 * @name GET /users/:Username
 * @function
 * @memberof module:index
 * @param {string} req.params.Username - The user's username
 * @description Returns data for a single user. Must match JWT user. 
 * @returns {object} 200 - The user object
 * @returns {object} 400 - If permission denied
 */
app.get('/users/:Username', passport.authenticate('jwt', { session: false }), async (req, res) => {
    if(req.user.Username !== req.params.Username) { //Ensure the authorized user is the owner of the account to be viewed
        return res.status(400).send('Permission denied.');
    }
    await Users.findOne({ Username: req.params.Username })
    .then((user) => {
        res.json(user);
    })
    .catch((err) => {
        console.error(err);
        res.status(500).send('Error: ' + err);
    });
});

/**
 * PUT update user info ("/users/:Username").
 * @name PUT /users/:Username
 * @function
 * @memberof module:index
 * @param {string} req.params.Username - The user's existing username
 * @param {string} req.body.Username - New username (required, min length 5)
 * @param {string} req.body.Password - New password (required)
 * @param {string} req.body.Email - New email (required)
 * @param {Date} req.body.Birth - New birth date
 * @description Updates user info. Must match JWT user. Validates user inputs.
 * @returns {object} 200 - Updated user object
 * @returns {object} 400 - Permission denied
 * @returns {object} 422 - Validation fails
 */
app.put('/users/:Username', passport.authenticate('jwt', { session: false }), [
    //Input validation via Express Validation
    check('Username', 'Username must be at least 5 characters long.').isLength({min: 5}), //Check that username is not empty or too short
    check('Username', 'Username can not contain non-alphanumeric characters.').isAlphanumeric(), //Check that username does not contain non-alphanumeric characters
    check('Password', 'Password is required.').not().isEmpty(), //Check that password is not empty
    check('Email', 'Email does not appear to be valid.').isEmail() //Check that email address is valid
], async (req, res) => {
    //Check the validation object for errors and if errors exist, return a JSON object as an HTTP response
    let errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(422).json({ errors: errors.array() });
    }
    //Take the password input and hash it
    let hashedPassword = Users.hashPassword(req.body.Password);

    //Ensure the authorized user is the owner of the account to be updated
    if(req.user.Username !== req.params.Username) {
        return res.status(400).send('Permission denied.');
    }
    await Users.findOneAndUpdate({ Username: req.params.Username },
        { $set: 
            {
                Username: req.body.Username,
                Password: hashedPassword, //Store only hashed password for privacy
                Email: req.body.Email,
                BirthDate: req.body.Birth
            },
        },
        { new: true }) // This line makes sure thast the /updated/ document is returned
        .then((updatedUser) => {
            res.json(updatedUser);
        })
        .catch((err) => {
            console.error(err);
            res.status(500).send('Error: ' + err);
        })
});

/**
 * DELETE remove a movie from user’s favorites ("/users/:Username/movies/:MovieID").
 * @name DELETE /users/:Username/movies/:MovieID
 * @function
 * @memberof module:index
 * @param {string} req.params.Username - The user's username
 * @param {string} req.params.MovieID - The movie ID to remove
 * @description Removes a specified MovieID from the user's favorites array. Must match JWT user.
 * @returns {object} 200 - Updated user object
 * @returns {object} 400 - Permission denied
 */
app.delete('/users/:Username/movies/:MovieID', passport.authenticate('jwt', { session: false }), async (req, res) => {
    if(req.user.Username !== req.params.Username) { //Ensure the authorized user is the owner of the account to be updated
        return res.status(400).send('Permission denied.');
    }
    await Users.findOneAndUpdate({ Username: req.params.Username }, 
        { $pull: 
            { FavouriteMovies: req.params.MovieID },
        },
        { new: true }) // This line makes sure that the /updated/ document is returned
        .then((updatedUser) => {
            res.json(updatedUser);
        })
        .catch((err) => {
            console.error(err);
            res.status(500).send('Error: ' + err);
        });
});

/**
 * DELETE deregister a user ("/users/:Username").
 * @name DELETE /users/:Username
 * @function
 * @memberof module:index
 * @param {string} req.params.Username - The user's username to delete
 * @description Permanently removes a user’s account. Must match JWT user.
 * @returns {string} 200 - Confirmation message
 * @returns {string} 400 - If user not found or permission denied
 */
app.delete('/users/:Username', passport.authenticate('jwt', { session: false }), async (req, res) => {
    if(req.user.Username !== req.params.Username) { //Ensure the authorized user is the owner of the account to be updated
        return res.status(400).send('Permission denied.');
    }
    await Users.findOneAndDelete({ Username: req.params.Username })
    .then((user) => {
        if (!user) {
            res.status(400).send(req.params.Username + ' was not found.');
        } else {
            res.status(200).send(req.params.Username + ' was deleted.');
        }
    })
    .catch((err) => {
        console.error(err);
        res.status(500).send('Error: ' + err);
    });
});



/**
 * Express error handling middleware.
 * Logs the error stack and sends a 500 status.
 * @name ErrorHandler
 * @function
 * @memberof module:index
 * @param {object} err - The error object
 */
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Something broke!');
});



/**
 * Starts the server on the specified port.
 * @name listen
 * @function
 * @memberof module:index
 * @param {number} port - The port the server will listen on
 */
const port = process.env.PORT || 8080;
app.listen(port, '0.0.0.0', () => {
    console.log('Listening on Port ' + port + '.');
});