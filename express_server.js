const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
const bodyParser = require("body-parser");
const cookieSession = require('cookie-session');
const bcrypt = require('bcryptjs');
//functions
const { generateRandomString, findUserByEmail, urlsForUser} = require("./helpers");
//data stores
const { urlDatabase, users} = require('./constants');


app.set("view engine", "ejs");//set ejs as the view engine

app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieSession({
  name: 'session',
  keys: ['key1'],
  maxAge: 24 * 60 * 60 * 1000 // 24 hours
}));

//home - login page
app.get("/", (req, res) => {
  res.redirect("login");
});

//adding routes
app.get("/urls.json", (req, res) => {
  //shows a JSON string representing the entire urlDatabase object
  res.json(urlDatabase);
});

app.get("/register", (req, res) => {
  const id = req.session.userId;
  const user = users[id];
  const templateVars = {user: user};
  res.render("register", templateVars);
});

//register route OK
app.post("/register", (req, res) => {
  const id = generateRandomString();
  const email = req.body.email;
  const password = req.body.password;
  const hashedPassword = bcrypt.hashSync(password, 10);

  //handle registration errors
  if (!email || !password) {
    return res.status(400).send("Email or password cannot be blank");
  }
  const currentUser = findUserByEmail(email, users);
  //if current registration matches the email found, return error
  if (currentUser) {
    return res.status(400).send("A user with that email already exists");
  }

  users[id] = {
    id: id,
    email: email,
    password: hashedPassword
  };

  req.session.userId = id;
  res.redirect("/urls");
});

//login routes
app.get("/login", (req, res) => {
  const id = req.session.userId;
  const user = users[id];
  const templateVars = {user: user};
  res.render("login", templateVars);
});

app.post("/login", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;

  const currentUser = findUserByEmail(email, users);

  if (!currentUser) {
    return res.status(403).send("A user with that email does not exist");
  }

  if (bcrypt.compareSync(password, currentUser["password"])) {
    req.session.userId = currentUser.id;
    return res.redirect("/urls");
  } else {
    return res.status(403).send("Your email or password does not match");
  }
});

//logout route
app.post("/logout", (req, res) => {
  req.session = null;
  res.redirect("/urls");
});

//curent user's urls
app.get("/urls", (req, res) => {
  const id = req.session.userId;
  const user = users[id];
  if (!user) {
    return res.status(403).send("<html><body><b>Please <a href=/register>create an account</a> or <a href=/login>login</a></b></body></html>");
  }
  const urlsObj = urlsForUser(urlDatabase, id);
  const templateVars = {urls: urlsObj, user: user};
  res.render("urls_index", templateVars);
});
//add new short url
app.post("/urls", (req, res) => {
  const id = req.session.userId;
  const newShortURL = generateRandomString();
  urlDatabase[newShortURL] = {
    longURL: req.body.longURL,
    userID: id
  };
  res.redirect(`/urls/${newShortURL}`);
});

app.get("/urls/new", (req, res) => {
  const id = req.session.userId;
  const user = users[id];
  if (!user) {
    return res.redirect("/login");
  }
  const templateVars = {user: user};
  res.render("urls_new", templateVars);
});

app.get("/urls/:shortURL", (req, res) => {
  const id = req.session.userId;
  const user = users[id];
  const shortURL = req.params.shortURL;
  const templateVars = {
    shortURL: req.params.shortURL,
    longURL: urlDatabase[shortURL].longURL,
    user: user};
  if (urlDatabase[shortURL]["userID"] !== id) {
    return res.status(401).send('<html><body>This url does not exist or access not granted. Please <a href="/login">login.</a></body></html>');
  }
  res.render("urls_show", templateVars);
});


//delete operation
app.post("/urls/:shortURL/delete", (req, res) => {
  const id = req.session.userId;
  if (!id) {
    return res.status(400).send('You are not authorized');
  }
  delete urlDatabase[req.params.shortURL];
  res.redirect("/urls");
});

//edit operation
app.post("/urls/:shortURL", (req, res) => {
  const id = req.session.userId;
  if (!id) {
    return res.status(400).send('You are not authorized');
  }
  const shortURL = req.params.shortURL;
  urlDatabase[shortURL].longURL = req.body.longURL;
  res.redirect("/urls");
});

//u route redirects to eg.tsn.ca
app.get("/u/:shortURL", (req, res) => {
  const id = req.session.userId;
  if (!id) {
    return res.status(401).send('<html><body>This url does not exist or access not granted. Please <a href="/login">login.</a></body></html>');
  }
  const longURL = urlDatabase[req.params.shortURL]['longURL'];
  res.redirect(longURL);
});

//sending html
app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

app.listen(PORT, () => {
});