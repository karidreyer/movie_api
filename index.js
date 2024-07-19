//** Importing required modules and models **//

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



//** Connect to MongoDB database **//

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
let allowedOrigins = ['http://localhost:8080', 'http://testsite.com', 'http://localhost:1234'];

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

// Route to homepage ("/")
app.get('/', (req, res) => {
    res.send('Welcome to Movie Nest!');
});

// Route to documentation page about the API ("/documentation")
app.get('/documentation', (req, res) => {
    res.sendFile(__dirname + '/public/documentation.html');
});

//(5)CREATE - Allow new users to register ("/users")
/* JSON data input is expected in this format
{
  Username: String, (required)
  Password: String, (required)
  Email: String, (required)
  Birthday: Date
}*/
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

//(7)CREATE - Allow users to add a movie to their list of favourites ("/users/[USERNAME]/[MOVIE ID]")
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

//(1)READ - Return a list of all movies to the user ("/movies")
app.get('/movies', async (req, res) => {
    await Movies.find()
    .then((movies) => {
        res.status(200).json(movies);
    })
    .catch((err) => {
        console.error(err);
        res.status(500).send('Error: ' + err);
    });
});

//(2)READ - Return data about a single movie by title to the user (description, genre, director, image URL, whether it’s featured or not) ("/movies/[MOVIE TITLE]")
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

//(3)READ - Return data about a genre (description) by name/title (e.g., “Thriller”) ("/movies/genres/[GENRE NAME]")
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

//(4)READ - Return data about a director (bio, birth year, death year) by name ("/movies/directors/[DIRECTOR NAME]")
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

//(10)READ - Return a list of all Users (ADMIN ONLY - Requires additional security)
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

//(11)READ - Return information about a single user by Username
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

//(6)UPDATE - Allow users to update their user info (username, password, email, date of birth) ("/users/[USERNAME]")
/* JSON data input is expected in this format
{
  Username: String, (required)
  Password: String, (required)
  Email: String, (required)
  Birthday: Date
}*/
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

//(8)DELETE - Allow users to remove a movie from their list of favourites ("/users/[USERNAME]/[MOVIE ID]")
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

//(9)DELETE - Allow existing users to deregister 
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



//** Handling Errors **//
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Something broke!');
});



//** Setting the application to listen on a specific port **//
const port = process.env.PORT || 8080;
app.listen(port, '0.0.0.0', () => {
    console.log('Listening on Port ' + port + '.');
});