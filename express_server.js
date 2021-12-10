const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
const bodyParser = require("body-parser");
const cookieParser = require('cookie-parser');
const bcrypt = require('bcryptjs');

app.set("view engine", "ejs");//set ejs as the view engine

app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieParser());

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


//simulate generating a 'unique' shortURL
const generateRandomString = function() {
  let randomString = "";
  for (let i = 0; i < 6; i++) {
    const randomCharCode = Math.floor(Math.random() * 26 + 97);
    const randomChar = String.fromCharCode(randomCharCode);
    randomString += randomChar;
  }   return randomString;
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

//urlsForUser(id) = fetchUrlsObj
const fetchUrlsObj = function(urlDatabase, id) {
  let urlsObj = {};
  for (let shortUrl in urlDatabase) {
    if (urlDatabase[shortUrl].userID === id) {
      urlsObj[shortUrl] = urlDatabase[shortUrl].longURL;
    }
  }
  return urlsObj;
};

const fetchUrlDatabase = function(urlDatabase) {
  let urlsObj = {};
  for (let urls in urlDatabase) {
    urlsObj[urls] = urlDatabase[urls].longURL;
  }
  return urlsObj;
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
  const user = users[`${id}`];
  // if (!id) {
  //   return res.redirect("/login");
  // }
  let urlsObj;
  if (id) {
    urlsObj = fetchUrlsObj(urlDatabase, id);
  } else {
    urlsObj = fetchUrlDatabase(urlDatabase);
  }
  const templateVars = {urls: urlsObj, user: user};
  res.render("urls_index", templateVars);
});

app.post("/urls", (req, res) => {
  const id = req.cookies.user_id;
  //const user = users[id];
  // if (!id) {
  //   return res.status(400).send('Please create an account or login');
  // }
  const longURL = req.body.longURL;
  const newShortURL = generateRandomString();
  urlDatabase[newShortURL] = {
    longURL,
    userID: id
  };
  res.redirect("/urls");
  //return res.status(400).send('id is there');
});

//add new short URL operation
app.post("/urls", (req, res) => {
  const newShortURL = generateRandomString();
  //shortURL- longURL key-value pair are saved to the urlDatabase when it receives a POST request to /urls
  urlDatabase[newShortURL] = req.body.longURL;
  //redirect to /urls - anyone can visit shortUrls
  res.redirect(`/urls/${newShortURL}`);
});

app.get("/urls/new", (req, res) => {
  const id = req.cookies.user_id;
  const user = users[id];
  if (!id) {
    res.redirect("/login");
  }
  const templateVars = {user: user};
  res.render("urls_new", templateVars);
});



app.get("/urls/:shortURL", (req, res) => {
  const id = req.cookies.user_id;
  const user = users[id];
  //let shortURL = req.params.shortURL;
  const templateVars = {
    shortURL: req.params.shortURL,
    longURL: urlDatabase[req.params.shortURL].longURL,
    user: user};
    // if (urlDatabase[shortURL]["user_id"] !== id) {
    //   res.redirect("/login");
    // }
  res.render("urls_show", templateVars);
});

//u route
app.get("/u/:shortURL", (req, res) => {
  const id = req.cookies.user_id;
  let urlsObj;
  if (id) {
    urlsObj = fetchUrlsObj(urlDatabase, id);
  } else {
    urlsObj = fetchUrlDatabase(urlDatabase);
  }
  const longURL = urlsObj[req.params.shortURL].longURL;
  //console.log(urlsObj, longURL);
  res.redirect(longURL);
});


//route to show these page
app.get("/login", (req, res) => {
  const id = req.cookies.user_id;
  const user = users[id];
  const templateVars = {user: user};
  res.render("login", templateVars);
});


app.get("/register", (req, res) => {
  const id = req.cookies.user_id;
  const user = users[id];
  const templateVars = {user: user};
  res.render("register", templateVars);
});



//register route OK
app.post("/register", (req, res) => {
  const email = req.body.email;
  let password = req.body.password;
  let hashedPassword = bcrypt.hashSync(password, 10);
  console.log(hashedPassword);

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
    password: hashedPassword
  };
  
  console.log('users', users);
  res.cookie("user_id", id);
  res.redirect("/urls");
});


//login route
//check to see if that user exists in our users
//check passwords

app.post("/login", (req, res) => {
  const email = req.body.email;
  let password = req.body.password;


  const currentUser = findUserByEmail(email);
  console.log('current User is',currentUser);

  if (currentUser === null) {
    return res.status(403).send("a user with that email does not exist");
  }
  if (bcrypt.compareSync(password,currentUser["password"])) {
    res.cookie("user_id", currentUser.id);
  } else {
    return res.status(403).send("your password does not match");
  }
  //after all checks
  res.redirect("/urls");
});



//logout route
app.post("/logout", (req, res) => {
  res.clearCookie("user_id");
  res.redirect("/login");
});

//sending html
app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});


//delete operation
app.post("/urls/:shortURL/delete", (req, res) => {
  const id = req.cookies.user_id;
  if (!id) {
    res.status(400).send('You are not authorized');
  }
  delete urlDatabase[req.params.shortURL];
  res.redirect("/urls");
});


//edit operation
app.post("/urls/:shortURL", (req, res) => {
  const id = req.cookies.user_id;
  if (!id) {
    res.status(400).send('You are not authorized');
  }
  let shortURL = req.params.shortURL;
  console.log(shortURL);
  //console.log("editing", req.body);
  urlDatabase[shortURL].longURL = req.body.longURL;
  res.redirect("/urls");
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});