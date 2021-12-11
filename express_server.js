const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
const bodyParser = require("body-parser");
const cookieSession = require('cookie-session');
const bcrypt = require('bcryptjs');
const { generateRandomString, findUserByEmail, urlsForUser, fetchUrlDatabase} = require("./helpers");

app.set("view engine", "ejs");//set ejs as the view engine

app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieSession({
  name: 'session',
  keys: ['key1'],
  maxAge: 24 * 60 * 60 * 1000 // 24 hours
}));

//data stores
const users = {
  "userRandomID": {
    id: "userRandomID",
    email: "user@example.com",
    password: bcrypt.hashSync("purple", 10)
  },
  "user2RandomID": {
    id: "user2RandomID",
    email: "user2@example.com",
    password: bcrypt.hashSync("dishwasher-funk", 10)
  }
};

const urlDatabase = {
  b6UTxQ: {
    longURL: "https://www.tsn.ca",
    userID: "aJ48lW"
  },
  i3BoGr: {
    longURL: "https://www.google.ca",
    userID: "aJ48lW"
  }
};

//home page for all users
app.get("/", (req, res) => {
  let id = req.session.userId;
  const user = users[id];
  let urlsObj = fetchUrlDatabase(urlDatabase);
  let templateVars = {
    urls: urlsObj,
    user: user
  };
  res.render("home", templateVars);
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
  let email = req.body.email;
  let password = req.body.password;
  let hashedPassword = bcrypt.hashSync(password, 10);

  //handle registration errors
  if (!email || !password) {
    return res.status(400).send("Email or password cannot be blank");
  }
  const currentUser = findUserByEmail(email);
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
  let email = req.body.email;
  let password = req.body.password;

  let currentUser = findUserByEmail(email, users);

  if (currentUser === null) {
    return res.status(403).send("A user with that email does not exist");
  }

  if (bcrypt.compareSync(password, currentUser["password"])) {
    req.session.userId = currentUser.id;
    res.redirect("/urls");
  } else {
    res.status(403).send("Your email or password does not match");
  }
});

//logout route
app.post("/logout", (req, res) => {
  req.session = null;
  res.redirect("/");
});

//curent user's urls
app.get("/urls", (req, res) => {
  const id = req.session.userId;
  const user = users[id];
  if (!user) {
    res.status(403).send("<html><body><b>Please <a href=/register>create an account</a> or <a href=/login>login</a></b></body></html>");
  }
  let urlsObj = urlsForUser(urlDatabase, id);
  const templateVars = {urls: urlsObj, user: user};
  res.render("urls_index", templateVars);
});

app.post("/urls", (req, res) => {
  const id = req.session.userId;
  const newShortURL = generateRandomString();
  urlDatabase[newShortURL] = {
    longURL: req.body.longURL,
    userID: id
  };
  res.redirect("/urls");
});


app.get("/urls/new", (req, res) => {
  const id = req.session.userId;
  const user = users[id];
  if (!user) {
    res.redirect("/login");
  }
  const templateVars = {user: user};
  res.render("urls_new", templateVars);
});

app.get("/urls/:shortURL", (req, res) => {
  const id = req.session.userId;
  const user = users[id];
  let shortURL = req.params.shortURL;
  
  const templateVars = {
    shortURL: req.params.shortURL,
    longURL: urlDatabase[req.params.shortURL].longURL,
    user: user};
  if (urlDatabase[shortURL]["userID"] !== id) {
    res.redirect("/login");
  }
  res.render("urls_show", templateVars);
});

//add new short URL operation
app.post("/urls/:shortURL", (req, res) => {
  const newShortURL = generateRandomString();
  //shortURL- longURL key-value pair are saved to the urlDatabase when it receives a POST request to /urls
  urlDatabase[newShortURL] = req.body.longURL;
  //redirect to /urls - anyone can visit shortUrls
  res.redirect("/urls");
});

//delete operation
app.post("/urls/:shortURL/delete", (req, res) => {
  const id = req.session.userId;
  if (!id) {
    res.status(400).send('You are not authorized');
  }
  delete urlDatabase[req.params.shortURL];
  res.redirect("/urls");
});


//edit operation
app.post("/urls/:shortURL/edit", (req, res) => {
  const id = req.session.userId;
  if (!id) {
    res.status(400).send('You are not authorized');
  }
  let shortURL = req.params.shortURL;
  urlDatabase[shortURL].longURL = req.body.longURL;
  res.redirect("/urls");
});


//u route redirects to eg.tsn.ca
app.get("/u/:shortURL", (req, res) => {
  const id = req.session.userId;
  let urlsObj;
  if (id) {
    urlsObj = urlsForUser(urlDatabase, id);
  } else {
    urlsObj = fetchUrlDatabase(urlDatabase);
  }
  let longURL = urlsObj[req.params.shortURL];
  res.redirect(longURL);
});

//sending html
app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});