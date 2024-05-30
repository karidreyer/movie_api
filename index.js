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
        description: 'A lonely widowed housewife does her daily chores, takes care of her apartment where she lives with her teenage son, and turns the occasional trick to make ends meet. However, something happens that changes her safe routine.',
        genre: 'Drama',
        director: 'Chantal Akerman',
        year: '1975',
        imageUrl: 'https://example.com/jeanne_dielman.jpg'
    },
    {
        title: 'Vertigo',
        description: 'A former police detective juggles wrestling with his personal demons and becoming obsessed with a hauntingly beautiful woman.',
        genre: 'Mystery/Thriller',
        director: 'Alfred Hitchcock',
        year: '1958',
        imageUrl: 'https://example.com/vertigo.jpg'
    },
    {
        title: 'Citizen Kane',
        description: 'Following the death of publishing tycoon Charles Foster Kane, reporters scramble to uncover the meaning of his final utterance: "Rosebud."',
        genre: 'Drama',
        director: 'Orson Welles',
        year: '1941',
        imageUrl: 'https://example.com/citizen_kane.jpg'
    },
    {
        title: 'Tokyo Story',
        description: 'An old couple visit their children and grandchildren in the city; but the children have little time for them.',
        genre: 'Drama',
        director: 'Yasujirō Ozu',
        year: '1953',
        imageUrl: 'https://example.com/tokyo_story.jpg'
    },
    {
        title: 'In the Mood for Love',
        description: 'Two neighbors form a strong bond after both suspect extramarital activities of their spouses. However, they agree to keep their bond platonic so as not to commit similar wrongs.',
        genre: 'Romance/Drama',
        director: 'Wong Kar Wai',
        year: '2000',
        imageUrl: 'https://example.com/in_the_mood_for_love.jpg'
    },
    {
        title: '2001: A Space Odyssey',
        description: 'After discovering a mysterious artifact buried beneath the lunar surface, mankind sets off on a quest to find its origins with help from intelligent supercomputer HAL 9000.',
        genre: 'Science Fiction',
        director: 'Stanley Kubrick',
        year: '1968',
        imageUrl: 'https://example.com/2001_space_odyssey.jpg'
    },
    {
        title: 'Beau travail',
        description: 'This film focuses on a retired French Foreign Legion officer as he recalls his once glorious life leading troops in Djibouti, East Africa.',
        genre: 'Drama',
        director: 'Claire Denis',
        year: '1999',
        imageUrl: 'https://example.com/beau_travail.jpg'
    },
    {
        title: 'Mulholland Dr.',
        description: 'After a car wreck on the winding Mulholland Drive renders a woman amnesiac, she and a perky Hollywood-hopeful search for clues and answers across Los Angeles in a twisting venture beyond dreams and reality.',
        genre: 'Mystery/Thriller',
        director: 'David Lynch',
        year: '2001',
        imageUrl: 'https://example.com/mulholland_drive.jpg'
    },
    {
        title: 'Man with a Movie Camera',
        description: 'A man travels around a city with a camera slung over his shoulder, documenting urban life with dazzling invention.',
        genre: 'Documentary',
        director: 'Dziga Vertov',
        year: '1929',
        imageUrl: 'https://example.com/man_with_a_movie_camera.jpg'
    },
    {
        title: 'Singin\' in the Rain',
        description: 'A silent film production company and cast make a difficult transition to sound.',
        genre: 'Musical/Comedy',
        director: 'Gene Kelly and Stanley Donen',
        year: '1952',
        imageUrl: 'https://example.com/singin_in_the_rain.jpg'
    }
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