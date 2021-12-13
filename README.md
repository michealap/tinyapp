# TinyApp Project

TinyApp is a full stack web application built with Node and Express that allows users to shorten long URLs (à la bit.ly).

The Tinyapp homepage shows the list of available short URLs currently in the database and the corresponding long URLs.

Users must log in before being able to create new short URLs.

Once a new short URL is created, it is shown both on the home page and the users own URL database.


## Dependencies

- Node.js
- Express
- EJS
- bcrypt
- body-parser
- cookie-session

## Getting Started

- Install all dependencies (using the `npm install` command).
- Run the development web server using the `node express_server.js` command.
- The app will be served at http://localhost:8080/. Go to http://localhost:8080/ in your browser.

## Final Product

### Home page available to all users
!["Screenshot of Home page"](https://github.com/michealap/tinyapp/blob/master/docs/home.PNG?raw=true)
### Create an account to use other features
!["Screenshot of Register page"](https://github.com/michealap/tinyapp/blob/master/docs/register.PNG?raw=true)
### Short Url Feature
!["Screenshot of Create New Url page"](https://github.com/michealap/tinyapp/blob/master/docs/create.PNG?raw=true)
### Post creation - User Dashboard
!["Screenshot of New User Dashboard"](https://github.com/michealap/tinyapp/blob/master/docs/userUrl.PNG?raw=true)
### Edit Feature
!["Screenshot of Edit page"](https://github.com/michealap/tinyapp/blob/master/docs/useredit.PNG?raw=true)
