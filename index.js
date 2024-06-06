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

let users = [
    {
        id: 1,
        name: 'Kim',
        favouriteMovies: []
    },
    {
        id: 2,
        name: 'Joe',
        favouriteMovies: ['Citizen Kane']
    },
]

let movies = [
    {
        Title: 'Vertigo',
        Description: 'A former police detective juggles wrestling with his personal demons and becoming obsessed with a hauntingly beautiful woman.',
        Genre: {
            Name: 'Thriller',
            Description: "...",
        },
        Director: {
            Name: 'Alfred Hitchcock',
            Bio: "...",
            Birth: "...",
            Death: "..."
        },
        Year: '1958',
        ImageUrl: 'https://example.com/vertigo.jpg'
    },
    {
        Title: 'Citizen Kane',
        Description: 'Following the death of publishing tycoon Charles Foster Kane, reporters scramble to uncover the meaning of his final utterance: "Rosebud."',
        Genre: {
            Name: 'Drama',
            Description: "...",
        },
        Director: {
            Name: 'Orson Welles',
            Bio: "...",
            Birth: "...",
            Death: "..."
        },
        Year: '1941',
        ImageUrl: 'https://example.com/citizen_kane.jpg'
    },
    {
        Title: 'Tokyo Story',
        Description: 'An old couple visit their children and grandchildren in the city; but the children have little time for them.',
        Genre: {
            Name: 'Drama',
            Description: "...",
        },
        Director: {
            Name: 'Yasujirō Ozu',
            Bio: "...",
            Birth: "...",
            Death: "..."
        },
        Year: '1953',
        ImageUrl: 'https://example.com/tokyo_story.jpg'
    },
];

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
                Birthday: req.body.Birthday
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
app.get('/movies', (req, res) => {
    res.status(200).json(movies);
});

//(2)READ - Return data about a single movie by title to the user (description, genre, director, image URL, whether it’s featured or not) ("/movies/[MOVIE TITLE]")
app.get('/movies/:title', (req, res) => {
    const { title } = req.params; //"Object Destructuring"
    const movie = movies.find( movie => movie.Title === title );

    if (movie) {
        res.status(200).json(movie);
    } else {
        res.status(400).send('No such movie!')
    }
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

//(11)READ - Return information about a single user by Username

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