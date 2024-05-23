const express = require('express');
morgan = require('morgan');

const app = express();

let topMovies = [
    {
        title: '',
        author: '',
    },
    {
        title: '',
        author: '',
    },
    {
        title: '',
        author: '',
    },
    {
        title: '',
        author: '',
    },
    {
        title: '',
        author: '',
    },
    {
        title: '',
        author: '',
    },
    {
        title: '',
        author: '',
    },
    {
        title: '',
        author: '',
    },
    {
        title: '',
        author: '',
    },
    {
        title: '',
        author: '',
    },
]

//GET requests
app.get('/', (req, res) => {
    res.send('Welcome to Movie Nest!');
});

app.get('/documentation', (req, res) => {
    res.sendFile('public/documentation.html', {
        root: __dirname});
});

app.get('/movies', (req, res) => {
    res.json(topMovies);
});


//Listen for requests
app.listen(8080, () => {
    console.log('Your app is listening on port 8080.');
});