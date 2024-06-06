//Require the necessary modules
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
/* JSON data input is expected in this format
{
  Username: String, (required)
  Password: String, (required)
  Email: String, (required)
  Birthday: Date
}*/
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

//(7)CREATE - Allow users to add a movie to their list of favourites ("/users/[USERNAME]/[MOVIE ID]")
app.post('/users/:Username/movies/:MovieID', async (req, res) => {
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

//(3)READ - Return data about a genre (description) by name/title (e.g., “Thriller”) ("/movies/genres/[GENRE NAME]")
app.get('/movies/genres/:GenreName', async (req, res) => {
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
app.get('/movies/directors/:DirectorName', async (req, res) => {
    await Movies.findOne({ "Director.Name": req.params.DirectorName })
    .then((movie) => {
        res.json(movie.Director);
    })
    .catch((err) => {
        console.error(err);
        res.status(500).send('Error: ' + err);
    });
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

//(6)UPDATE - Allow users to update their user info (username, password, email, date of birth) ("/users/[USERNAME]")
/* JSON data input is expected in this format
{
  Username: String, (required)
  Password: String, (required)
  Email: String, (required)
  Birthday: Date
}*/
app.put('/users/:Username', async (req, res) => {
    await Users.findOneAndUpdate({ Username: req.params.Username },
        { $set: 
            {
                Username: req.body.Username,
                Password: req.body.Password,
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
app.delete('/users/:Username/movies/:MovieID', async (req, res) => {
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
app.delete('/users/:Username', async (req, res) => {
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


//Error Handling Function
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Something broke!');
});


//Listen for requests
app.listen(8080, () => {
    console.log('Your app is listening on port 8080.');
});