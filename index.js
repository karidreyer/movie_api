const mongoose = require('mongoose');
const Models = require('./models.js');

const Movies = Models.Movie;
const Users = Models.User;

mongoose.connect('mongodb://localhost:27017/cfDB');

const express = require('express');
    morgan = require('morgan');
    bodyParser = require('body-parser');
    uuid = require('uuid');

const app = express();

app.use(bodyParser.json());
app.use(express.static('public')); //This serves static files from the public folder
app.use(morgan('common'));

//ENDPOINTS//

// Route to homepage ("/")
app.get('/', (req, res) => {
    res.send('Welcome to Movie Nest!');
});

// Route to documentation page about the API ("/documentation")
app.get('/documentation', (req, res) => {
    res.sendFile(__dirname + '/public/documentation.html');
});

//(5)CREATE - Allow new users to register ("/users")
app.post('/users', async (req, res) => {
    await Users.findOne({ Username: req.body.Username })
    .then((user) => {
        if (user) {
            return res.status(400).send(req.body.Username + ' already exists.');
        } else {
            Users.create({
                Username: req.body.Username,
                Password: req.body.Password,
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

//(7)CREATE - Allow users to add a movie to their list of favourites ("/users/[USER ID]/[MOVIE TITLE]")
app.post('/users/:id/:movieTitle', (req, res) => {
    const { id, movieTitle } = req.params; //"Object Destructuring"

    let user = users.find( user => user.id == id);

    if (user) {
        user.favouriteMovies.push(movieTitle);
        res.status(200).json(`${movieTitle} has been added to user ${id}'s array`);
    } else {
        res.status(400).send('User does not exist.')
    }
});

//(1)READ - Return a list of all movies to the user ("/movies")
app.get('/movies', async (req, res) => {
    await Movies.find()
    .then((movies) => {
        res.status(201).json(movies);
    })
    .catch((err) => {
        console.error(err);
        res.status(500).send('Error: ' + err);
    });
});

//(2)READ - Return data about a single movie by title to the user (description, genre, director, image URL, whether it’s featured or not) ("/movies/[MOVIE TITLE]")
app.get('/movies/:Title', async (req, res) => {
    await Movies.findOne({ Title: req.params.Title })
    .then((movie) => {
        res.json(movie);
    })
    .catch((err) => {
        console.error(err);
        res.status(500).send('Error: ' + err);
    });
});

//(3)READ - Return data about a genre (description) by name/title (e.g., “Thriller”) ("/movies/genre/[GENRE NAME]")
app.get('/movies/genre/:genreName', (req, res) => {
    const { genreName } = req.params; //"Object Destructuring"
    const genre = movies.find( movie => movie.Genre.Name === genreName ).Genre;

    if (genre) {
        res.status(200).json(genre);
    } else {
        res.status(400).send('No such genre!')
    }
});

//(4)READ - Return data about a director (bio, birth year, death year) by name ("/movies/directors/[DIRECTOR NAME]")
app.get('/movies/directors/:directorName', (req, res) => {
    const { directorName } = req.params; //"Object Destructuring"
    const director = movies.find( movie => movie.Director.Name === directorName ).Director;

    if (director) {
        res.status(200).json(director);
    } else {
        res.status(400).send('No such Director!')
    }
});

//(10)READ - Return a list of all Users
app.get('/users', async (req, res) => {
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
app.get('/users/:Username', async (req, res) => {
    await Users.findOne({ Username: req.params.Username })
    .then((user) => {
        res.json(user);
    })
    .catch((err) => {
        console.error(err);
        res.status(500).send('Error: ' + err);
    });
});

//(6)UPDATE - Allow users to update their user info (username, password, email, date of birth) ("/users/[USER ID]")
app.put('/users/:id', (req, res) => {
    const { id } = req.params; //"Object Destructuring"
    const updatedUser = req.body;

    let user = users.find( user => user.id == id);

    if (user) {
        user.name = updatedUser.name;
        res.status(200).json(user);
    } else {
        res.status(400).send('User does not exist.')
    }
});

//(8)DELETE - Allow users to remove a movie from their list of favourites ("/users/[USER ID]/[MOVIE TITLE]")
app.delete('/users/:id/:movieTitle', (req, res) => {
    const { id, movieTitle } = req.params; //"Object Destructuring"

    let user = users.find( user => user.id == id);

    if (user) {
        user.favouriteMovies = user.favouriteMovies.filter( title => title !== movieTitle);
        res.status(200).json(`${movieTitle} has been removed from user ${id}'s array.`);
    } else {
        res.status(400).send('User does not exist.')
    }
});

//(9)DELETE - Allow existing users to deregister 
app.delete('/users/:id', (req, res) => {
    const { id } = req.params; //"Object Destructuring"

    let user = users.find( user => user.id == id);

    if (user) {
        users = users.filter( user => user.id != id);
        res.status(200).json(`User ${id} has been deleted.`);
    } else {
        res.status(400).send('User does not exist.')
    }
});




//Error Handling Function
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Something broke!');
});


//Listen for requests
app.listen(8080, () => {
    console.log('Your app is listening on port 8080.');
});