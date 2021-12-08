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
  const templateVars = { urls: urlDatabase, username: req.cookies["username"] };
  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  const templateVars = { username: req.cookies["username"] };
  res.render("urls_new", templateVars);
});

app.get("/register", (req, res) => {
  const templateVars = { username: req.cookies["username"] };
  res.render("register", templateVars);
});

app.get("/urls/:shortURL", (req, res) => {
  const templateVars = {
    shortURL: req.params.shortURL,
    longURL: urlDatabase[req.params.shortURL],
    username: req.cookies["username"]};
  res.render("urls_show", templateVars);
});

app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL];
  res.redirect(longURL);
});


//login route
app.post("/login", (req, res) => {
  const username = req.body.username;
  res.cookie("username", username);
  res.redirect("/urls");
});

//logout route
app.post("/logout", (req, res) => {
  const username = req.body.username;
  res.clearCookie("username", username);
  res.redirect("/urls");
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
  console.log(req.body);  // Log the POST request body to the console
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