const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
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


const isRegistered = (email) => {
  for (const user in users) {
    if (users[user].email === email) {
      return users[user];
    }
  }
  return false;
};

const express = require('express');
const app = express();
const PORT = 8080;
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');


app.use(bodyParser.urlencoded({extended: true}));
app.set('view engine', 'ejs');
app.use(cookieParser());



app.get('/urls/new', (req,res) => {
  let varTemplate = {
    user: users[req.cookies['user_id']]
  };
  res.render("urls_new", varTemplate);
});

app.get('/', (req,res) => {
  res.send('Hello!');
});

app.get('/urls', (req,res) => {
  console.log(req.cookies);
  let varTemplate = {
    user: users[req.cookies['user_id']],
    urls : urlDatabase
  };
  res.render('urls_index.ejs',varTemplate);
});

app.get('/urls.json', (req,res) => {
  res.json(urlDatabase);
});

app.get('/hello', (req,res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL];
  res.redirect(longURL);
});

app.get('/urls/:shortURL', (req,res) => {
  console.log(req.cookies);
  let varTemplate = {
    user: users[req.cookies['user_id']],
    shortURL: req.params.shortURL,
    longURL: urlDatabase[req.param.shortURL]
  };
  res.render("urls_show", varTemplate);
});

app.post('/urls', (req,res) => {
  const shortURL = randomString();
  urlDatabase[shortURL] = req.body.longURL;
  res.redirect(`/urls/${shortURL}`);
});

app.post('/urls/:shortURL/delete', (req,res) => {
  delete urlDatabase[req.params.shortURL];
  res.redirect('/urls');
});

app.post("/urls/:shortURL/edit", (req, res) => {
  res.redirect(`/urls/${req.params.shortURL}`);
});

app.post("/urls/:shortURL/update", (req, res) => {
  urlDatabase[req.params.shortURL] = req.body.longURL;
  res.redirect('/urls');
});

app.post('/login', (req,res) => {
  let varTemplate = {
    user: users[req.cookies['user_id']]
  };
  res.render("login", varTemplate);
});

app.post('/logout', (req,res) => {
  res.clearCookie('user_id');
  res.redirect('/urls');
});

app.get('/register', (req,res) => {
  let varTemplate = {user: users[req.cookies['user_id']]};
  res.render('register', varTemplate);
});

app.post('/register', (req,res) => {
  
});


app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});