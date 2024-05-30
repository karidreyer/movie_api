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
        Director: 'Alfred Hitchcock',
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
        Director: 'Orson Welles',
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
        Director: 'Yasujirō Ozu',
        Year: '1953',
        ImageUrl: 'https://example.com/tokyo_story.jpg'
    },
];


//GENERAL

//Route requests for static files via "public" folder
app.use(express.static('public'));

//Log requests (using Morgan middleware)
app.use(morgan('common'));

//Stand-in homepage response
app.get('/', (req, res) => {
    res.send('Welcome to Movie Nest!');
});


//ENDPOINTS

//Endpoint 1: Return a list of all movies to the user
app.get('/movies', (req, res) => {
    res.status(200).json(movies);
});

//Endpoint 2: Return data about a single movie by title to the user (description, genre, director, image URL, whether it’s featured or not)
app.get('/movies/:title', (req, res) => {
    const { title } = req.params; //Object Destructuring
    const movie = movies.find( movie => movie.Title === title );

    if (movie) {
        res.status(200).json(movie);
    } else {
        res.status(400).send('No such movie!')
    }
});

//Endpoint 3: Return data about a genre (description) by name/title (e.g., “Thriller”) 
app.get('/movies/genre/:genreName', (req, res) => {
    const { genreName } = req.params; //Object Destructuring
    const genre = movies.find( movie => movie.Genre.Name === genreName ).Genre;

    if (genre) {
        res.status(200).json(genre);
    } else {
        res.status(400).send('No such genre!')
    }
});

//Endpoint 4: Return data about a director (bio, birth year, death year) by name

//Endpoint 5: Allow new users to register 

//Endpoint 6: Allow users to update their user info (username, password, email, date of birth) 

//Endpoint 7: Allow users to add a movie to their list of favourites

//Endpoint 8: Allow users to remove a movie from their list of favourites 

//Endpoint 9: Allow existing users to deregister 



//Error Handling Function
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Something broke!');
});


//Listen for requests
app.listen(8080, () => {
    console.log('Your app is listening on port 8080.');
});