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
        title: 'Jeanne Dielman, 23 Quai du Commerce, 1080 Bruxelles',
        director: '1975',
        year: 'Chantal Akerman',
    },
    {
        title: 'Vertigo',
        director: 'Alfred Hitchcock',
        year: '1958',
    },
    {
        title: 'Citizen Kane',
        director: 'Orson Welles',
        year: '1941',
    },
    {
        title: 'Tokyo Story',
        director: 'Yasujirō Ozu',
        year: '1953',
    },
    {
        title: 'In the Mood for Love',
        director: 'Wong Kar Wai',
        year: '2000',
    },
    {
        title: '2001: A Space Odyssey',
        director: 'Stanley Kubrick',
        year: '1968',
    },
    {
        title: 'Beau travail',
        director: '1998',
        year: 'Claire Denis',
    },
    {
        title: 'Mulholland Dr.',
        director: 'David Lynch',
        year: '2001',
    },
    {
        title: 'Man with a Movie Camera',
        director: 'Dziga Vertov',
        year: '1929',
    },
    {
        title: 'Singin\' in the Rain',
        director: 'Gene Kelly',
        year: '1951',
    },
]

//Express function - automatically route requests for static files via "public" folder
app.use(express.static('public'));

//Morgan function - use Morgan middleware for logging requests
app.use(morgan('common'));

//GET requests
app.get('/', (req, res) => {
    res.send('Welcome to Movie Nest!');
});

app.get('/movies', (req, res) => {
    res.json(movies);
});

//Express function - error handling middleware function
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Something broke!');
});


//Listen for requests
app.listen(8080, () => {
    console.log('Your app is listening on port 8080.');
});