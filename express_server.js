const express = require('express');
const app = express();
const PORT = 8080;
const bodyParser = require('body-parser');
const cookieSession = require('cookie-session');
const bcrypt = require('bcrypt');
const {urlDatabase,users,randomString, urlsForUser,getUserByEmail} = require('./helpers');


app.use(bodyParser.urlencoded({extended: true}));
app.set('view engine', 'ejs');
app.use(cookieSession({
  name: 'session',
  keys: ['key1', 'key2'],

  // Cookie Options
  maxAge: 24 * 60 * 60 * 1000 // 24 hours
}));

/*
Retrives the urlDatabase object as JSON.
*/
app.get('/urls.json', (req,res) => {
  res.json(urlDatabase);
});

/*
Helps to retrieve information from users object as JSON. The main purpose is to see
whether the passwords were hashed or not.
*/
app.get('/users.json', (req,res) => {
  res.json(users);
});

/*
If logged in, route redirects to /urls, if not redirects to /login.
*/
app.get('/', (req,res) => {
  if (!req.session['user_id']) {
    res.redirect('/login');
  } else {
    res.redirect('/urls');
  }
});

/*
If logged in, displays the urls that user created.
*/
app.get('/urls', (req,res) => {
  if (!req.session['user_id']) {
    res.redirect('/login');
  } else {
    let templateVars = {
      user : users[req.session['user_id']],
      urls :urlsForUser(req.session['user_id'])
    };
    res.render("urls_index", templateVars);
  }
});

/*
Checks whether the user is logged in before displaying the page.
*/
app.get('/urls/new', (req,res) => {
  if (!req.session['user_id']) {
    res.redirect('/login');
  } else {
    let templateVars = {
      user: users[req.session['user_id']]
    };
    res.render("urls_new", templateVars);
  }
});

/*
Redirects to longURL.
*/
app.get("/u/:shortURL", (req, res) => {
  if (urlDatabase[req.params.shortURL]) {
    res.redirect(urlDatabase[req.params.shortURL].longURL);
  } else {
    res.status(404);
  }
});

/*
Updates the longURL with the shortURL passed.
*/
app.get('/urls/:shortURL', (req,res) => {
  let templateVars = {
    user: users[req.session['user_id']],
    shortURL: req.params.shortURL,
    longURL: urlDatabase[req.param.shortURL]
  };
  res.render("urls_show", templateVars);
});

/*
If logged in, redirects to /urls page, if not,
redirects to /login page.
*/
app.get('/login', (req,res) => {
  if (req.session['user_id']) {
    res.redirect('/urls');
  } else {
    let templateVars = { user : users[req.session['user_id']] };
    res.render('login', templateVars);
  }
});

/*
New URL is added to the database and then the route
redirects to short URL.
*/
app.post('/urls', (req,res) => {
  if (req.session['user_id']) {
    const shortURL = randomString();
    urlDatabase[shortURL] = {
      userID : req.session['user_id'],
      longURL: req.body.longURL
    };
    res.redirect(`/urls/${shortURL}`);
  } else {
    res.write("User should login");
  }
});

/*
If the URL belongs to the user, URL is deleted.
*/
app.post('/urls/:shortURL/delete', (req,res) => {
  if (!req.session['user_id']) {
    res.write('User should login');
  } else if (urlDatabase[req.params.shortURL].userID === req.session['user_id']) {
    delete urlDatabase[req.params.shortURL];
    res.redirect('/urls');
  } else {
    res.write('URL does not exist');
  }
});

/*
Redirects to urls/shorturl parameter.
*/
app.post("/urls/:shortURL/edit", (req, res) => {
  res.redirect(`/urls/${req.params.shortURL}`);
});

/*
Updates the database longURL to request body's url.
*/
app.post("/urls/:shortURL/update", (req, res) => {
  if (!req.session['user_id']) {
    res.write('User should login');
  } else if (urlDatabase[req.params.shortURL].userID === req.session['user_id']) {
    urlDatabase[req.params.shortURL].longURL = req.body.longURL;
    res.redirect('/urls');
  } else {
    res.write("URL does not exist");
  }
});

/*
If valid credentials is entered, then the user is redirected
to /urls page, if not to /login page.
*/
app.post('/login', (req,res) => {
  let user = getUserByEmail(req.body.email,users);
  if (!bcrypt.compareSync(req.body.password, user.password) || !user) {
    let templateVars = {
      user: users[req.session['user_id']],
    };
    res.render("login", templateVars);
  } else {
    req.session['user_id'] = user.id;
    res.redirect('/urls');
  }
});

/*
Clears cookies and redirects to /urls page.
*/
app.post('/logout', (req,res) => {
  req.session = null;
  res.redirect('/urls');
});

/*
If logged in, redirects to /urls page, if not,
then redirected to register page.
*/
app.get('/register', (req,res) => {
  if (req.session['user_id']) {
    res.redirect('/urls');
  } else {
    let templateVars = {
      user: users[req.session['user_id']]
    };
    res.render('register', templateVars);
  }
});

/*
If the account is created with true credentials, then
route redirects to /urls page. If not, gives 400 status
code and redirects to /register page.
*/
app.post('/register', (req,res) => {
  if (req.body.email === '' || req.body.password === '' || getUserByEmail(req.body.email,users)) {
    res.status(400);
    res.redirect('/register');
  } else {
    let userId = randomString();
    users[userId] = {
      id: userId,
      email: req.body.email,
      password: bcrypt.hashSync(req.body.password,10)
    };
    req.session['user_id'] = userId;
    res.redirect('/urls');
  }
});


app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});