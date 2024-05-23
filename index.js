const express = require('express');
morgan = require('morgan');

const app = express();

let topMovies = [
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

//Automatically route requests for static files via "public" folder - using Express
app.use(express.static('public'));

//GET requests
app.get('/', (req, res) => {
    res.send('Welcome to Movie Nest!');
});

app.get('/movies', (req, res) => {
    res.json(topMovies);
});


//Listen for requests
app.listen(8080, () => {
    console.log('Your app is listening on port 8080.');
});