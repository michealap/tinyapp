const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
const bodyParser = require("body-parser");
const cookieParser = require('cookie-parser');
app.set("view engine", "ejs");//set ejs as the view engine

app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieParser());

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};


//simulate generating a 'unique' shortURL
const generateRandomString = function() {
  let randomString = "";
  for (let i = 0; i < 6; i++) {
    const randomCharCode = Math.floor(Math.random() * 26 + 97);
    const randomChar = String.fromCharCode(randomCharCode);
    randomString += randomChar;
  }   return randomString;
};

app.get("/", (req, res) => {
  res.send("Hello!");
});

//adding routes
app.get("/urls.json", (req, res) => {
  //shows a JSON string representing the entire urlDatabase object
  res.json(urlDatabase);
});

app.get("/urls", (req, res) => {
  const id = req.cookies.user_id;
  if (!id) {
    return res.status(400).send("you are not authorized to be here");
  }
  const user = users[id];
  if (!user) {
    return res.status(400).send('You have a stale cookie. Please create an account or login');
  }
  //console.log("the logged in user is", user.email);
  const templateVars = {urls: urlDatabase, email: user.email};
  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  const id = req.cookies.user_id;
  const user = users[id];
  const templateVars = {email: user.email};
  res.render("urls_new", templateVars);
});

app.get("/urls/:shortURL", (req, res) => {
  const id = req.cookies.user_id;
  const user = users[id];
  const templateVars = {
    shortURL: req.params.shortURL,
    longURL: urlDatabase[req.params.shortURL],
    email: user.email};
  res.render("urls_show", templateVars);
});

app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL];
  res.redirect(longURL);
});

const users = {
  "userRandomID": {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur"
  },
  "user2RandomID": {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk"
  }
};
//helper function
const findUserByEmail = (email) => {
  console.log(email, users);
  for (const id in users) {
    const currentUser = users[id];
    if (currentUser.email === email) {
      //console.log(" this is from email check function", currentUser);
      return currentUser;
    }
    return null;
  }
};

//route to show these page

app.get("/login", (req, res) => {
  const id = req.cookies.user_id;
  const user = users[id];
  const templateVars = {email: user ? user.email : false};
  res.render("login", templateVars);
});


app.get("/register", (req, res) => {
  const id = req.cookies.user_id;
  const user = users[id];
  const templateVars = {email: user ? user.email : false};
  res.render("register", templateVars);
});



//register route OK
app.post("/register", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  //handle registration errors
  if (!email || !password) {
    return res.status(400).send("email and password cannot be blank");
  }

  const currentUser = findUserByEmail(email);
  //if current registration matches the email found, return error
  if (currentUser) {
    return res.status(400).send("a user with that email already exists");
  }

  const id = generateRandomString();

  users[id] = {
    id: id,
    email: email,
    password: password
  };
  console.log('users', users);

  //Object.assign(users, {userId: { id: `${userId}`, email: req.body["email"], password: req.body["password"] }}); //how to update object name
  //console.log(users);
  res.cookie("user_id", id);
  res.redirect("/urls");
});


//login route
//check to see if that user exists in our users
//check passwords
//set a cookie that says they are logged in

app.post("/login", (req, res) => {

  const email = req.body.email;
  const password = req.body.password;

  
  const currentUser = findUserByEmail(email);
  console.log('current User is',currentUser);

  if (currentUser === null) {
    return res.status(400).send("a user with that email does not exist");
  }

  if (currentUser.password !== password) {
    return res.status(400).send("your password does not match");
  }
  //after all checks
  res.redirect("/urls");
});



//logout route
app.post("/logout", (req, res) => {
  //const username = req.body.username;
  //res.clearCookie("username", username);
  res.clearCookie("user_id");
  //res.redirect("/urls");
  res.redirect("/login");
});

//sending html
app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});


//delete operation
app.post("/urls/:shortURL/delete", (req, res) => {
  delete urlDatabase[req.params.shortURL];
  res.redirect("/urls");
});


//edit operation
app.post("/urls/:id", (req, res) => {
  let shortURL = req.params.id;
  let fullURL = req.body.longURL;
  console.log("editing", req.body);
  urlDatabase[shortURL] = fullURL;
  res.redirect("/urls");
});

//add new short URL operation
app.post("/urls", (req, res) => {
  //console.log(req.body);  // Log the POST request body to the console
  // res.send("Ok");         // Respond with 'Ok' (we will replace this)
  //check if its in the database already
  const newShortURL = generateRandomString();
  //shortURL- longURL key-value pair are saved to the urlDatabase when it receives a POST request to /urls
  urlDatabase[newShortURL] = req.body.longURL;
  //redirect to /urls
  res.redirect(`/urls/${newShortURL}`);
});


app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});