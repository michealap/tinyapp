//Helper Functions

//simulate generating a 'unique' shortURL
const generateRandomString = function() {
  let randomString = "";
  for (let i = 0; i < 6; i++) {
    const randomCharCode = Math.floor(Math.random() * 26 + 97);
    const randomChar = String.fromCharCode(randomCharCode);
    randomString += randomChar;
  }   return randomString;
};

const findUserByEmail = (email, users) => {
  for (const id in users) {
    const currentUser = users[id];
    if (currentUser.email === email) {
      return currentUser;
    }
  }
  return null;
};

const urlsForUser = function(urlDatabase, id) {
  let urlsObj = {};
  for (let shortUrl in urlDatabase) {
    if (urlDatabase[shortUrl].userID === id) {
      urlsObj[shortUrl] = urlDatabase[shortUrl].longURL;
    }
  }
  return urlsObj;
};

module.exports = { generateRandomString, findUserByEmail, urlsForUser};