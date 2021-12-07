const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
app.set("view engine", "ejs");//set ejs as the view engine

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

// const generateRandomString = function() {
//   let randomString = "";
//for (let i = 0; i < 6; i++) {
//     const randomCharCode = Math.floor(Math.random() * 26 + 97);
//     const randomChar = String.fromCharCode(randomCharCode);     randomString += randomChar;
//   }   return randomString;
// };

app.get("/", (req, res) => {
  res.send("Hello!");
});

//adding routes
app.get("/urls.json", (req, res) => {
  //shows a JSON string representing the entire urlDatabase object
  res.json(urlDatabase);
});
app.get("/urls", (req, res) => {
  const templateVars = { urls: urlDatabase };
  res.render("urls_index", templateVars);
});

//sending html
app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});
app.get("/urls/:shortURL", (req, res) => {
  const templateVars = {
    shortURL: req.params.shortURL,
    longURL: urlDatabase[req.params.shortURL] };
  res.render("urls_show", templateVars);
});

// app.post("/urls", (req, res) => {
//   console.log(req.body);
//   // res.send("OK");
//   //check if its in the database already
//   const newShortUrl = generateRandomString();
//   urlDatabase[newShortUrl] = req.body.longURL;
//   //redirect to /urls
//   res.redirect(`/urls/${newShortUrl}`);
// });


app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});