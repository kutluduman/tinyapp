const urlDatabase = {
  b6UTxQ: { longURL: "https://www.tsn.ca", userID: "aJ48lW" },
  i3BoGr: { longURL: "https://www.google.ca", userID: "aJ48lW" }
};


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


const randomString = () => {
  let random = Math.random().toString(36).substring(2,8);
  return random;
};


/*
This function checks if there is an email that is same as users object email
*/
const isEmailRegistered = (email) => {
  for (const user in users) {
    if (users[user].email === email) {
      return users[user];
    }
  }
  return false;
};

module.exports = {urlDatabase,users,randomString,isEmailRegistered};