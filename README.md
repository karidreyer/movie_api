### Introduction
The MovieNest API is designed to provide users with comprehensive access to information on movies and related functionalities. Built for the MovieNest App, this API offers data retrieval options and user management features, enabling a rich and interactive movie browsing experience.

### Project Features
* Users can signup and login to their accounts
* Public (non-authenticated) users cannot access information
* Authenticated users can access all movie information as well as add or remove movies to their list of favourites, edit their user information and also delete their account.

### API Endpoints
| HTTP Verbs | Endpoints | Action |
| --- | --- | --- |
| POST | /users | A user can register for a new user account |
| POST | /login | A user can login to an existing user account |
| POST | /users/:username/:movieID | An authenticated user can add a movie to their list of favourite movies |
| GET | /users/:username | An authenticated user can access their profile data |
| GET | /movies | An authenticated user can access a list of all movies in the database |
| GET | /movies/:movieTitle | An authenticated user can access data about a single movie |
| GET | /movies/genres/:genreName | An authenticated user can access data about a movie genre |
| GET | /movies/directors/:directorID | An authenticated user can access data about a director |
| PUT | /users/:username | An authenticated user can update their profile data |
| DELETE | /users/:username/:movieID | An authenticated user can remove a movie to their list of favourite movies |
| DELETE | /users/:username | An authenticated user can delete their user account |

### Technologies Used
* [NodeJS](https://nodejs.org/) This is a cross-platform runtime environment built on Chrome's V8 JavaScript engine used in running JavaScript codes on the server. It allows for installation and managing of dependencies and communication with databases.
* [ExpressJS](https://www.expresjs.org/) This is a NodeJS web application framework.
* [MongoDB](https://www.mongodb.com/) This is a free open source NOSQL document database with scalability and flexibility. Data are stored in flexible documents with JSON data.
* [Mongoose](https://mongoosejs.com/) This makes it easy to write MongoDB validation by providing a straight-forward, schema-based solution to model to application data.
* [Heroku](https://www.heroku.com/) The API was deployed via Heroku, enabling cloud hosting and continuous deployment.

### Authors
* [Kari Dreyer](https://github.com/karidreyer)
