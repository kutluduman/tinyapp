const express = require('express');
const app = express();
const PORT = 8080;
const bodyParser = require('body-parser');
const cookieSession = require('cookie-session');
const bcrypt = require('bcrypt');
const {urlDatabase,users,randomString, urlsForUser,getUserByEmail} = require('./helpers/helpers');


app.use(bodyParser.urlencoded({extended: true}));
app.set('view engine', 'ejs');
app.use(cookieSession({
  name: 'session',
  keys: ['key1', 'key2'],

  // Cookie Options
  maxAge: 24 * 60 * 60 * 1000 // 24 hours
}));


// Retrives the urlDatabase object as JSON.
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


// If logged in, route redirects to /urls, if not redirects to /login.
app.get('/', (req,res) => {
  if (!req.session['user_id']) {
    res.redirect('/login');
  } else {
    res.redirect('/urls');
  }
});


// If logged in, displays the urls that user created.
app.get('/urls', (req,res) => {
  const templateVars = {
    user: users[req.session['user_id']],
    urls: urlsForUser(req.session['user_id'],urlDatabase),
    err: req.session['user_id']? '' : 'Login with your credentials'
  };
  res.render('urls_index',templateVars);
});


// Checks whether the user is logged in before displaying the page.
app.get('/urls/new', (req,res) => {
  if (!req.session['user_id']) {
    res.redirect('/login');
  } else {
    const templateVars = {
      user: users[req.session['user_id']],
      err: ''
    };
    res.render('urls_new', templateVars);
  }
});


// Redirects to longURL.
app.get('/u/:shortURL', (req, res) => {
  if (urlDatabase[req.params.shortURL]) {
    res.redirect(urlDatabase[req.params.shortURL].longURL);
  } else {
    res.status(404);
    res.send('<h2> Invalid URL </h2>');
  }
});


/*
When the page is rendered, the route passes the
templateVars object values to the page.
*/
app.get('/urls/:shortURL', (req,res) => {
  const templateVars = {
    user: users[req.session['user_id']],
    shortURL: req.params.shortURL,
    url: urlDatabase[req.param.shortURL],
    err: urlDatabase[req.params.shortURL] ? '' : 'Invalid Link'
  };
  if (!urlDatabase[req.params.shortURL]) {
    templateVars.err = 'Invalid Link.';
  } else if (!req.session['user_id']) {
    templateVars.err = 'User is not logged in';
  } else if (urlDatabase[req.params.shortURL].userID !== req.session['user_id']) {
    templateVars.err = 'User doesnt have the URL';
  }
  res.render('urls_show', templateVars);
});

/*
If logged in, redirects to /urls page, if not,
redirects to /login page.
*/
app.get('/login', (req,res) => {
  if (req.session['user_id']) {
    res.redirect('/urls');
  } else {
    const templateVars = { user : users[req.session['user_id']],err : '' };
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
    res.send('<h2>User should login</h2>');
  }
});


// If the URL belongs to the user, URL is deleted.
app.delete('/urls/:shortURL/delete', (req,res) => {
  if (!req.session['user_id']) {
    res.send('<h2>User should login</h2>');
  } else if (urlDatabase[req.params.shortURL].userID === req.session['user_id']) {
    delete urlDatabase[req.params.shortURL];
    res.redirect('/urls');
  } else {
    res.send('<h2>URL does not exist</h2>');
  }
});


// Redirects to urls/shorturl parameter.
app.post('/urls/:shortURL/edit', (req, res) => {
  res.redirect(`/urls/${req.params.shortURL}`);
});


// Updates the database longURL to request body's url.
app.post('/urls/:shortURL/update', (req, res) => {
  if (!req.session['user_id']) {
    res.send('<h2>User should login</h2>');
  } else if (urlDatabase[req.params.shortURL].userID === req.session['user_id']) {
    urlDatabase[req.params.shortURL].longURL = req.body.longURL;
    res.redirect('/urls');
  } else {
    res.send('<h2>URL does not exist</h2>');
  }
});

/*
If valid credentials is entered, then the user is redirected
to /urls page, if not to /login page.
*/
app.post('/login', (req,res) => {
  let user = getUserByEmail(req.body.email,users);
  if (!bcrypt.compareSync(req.body.password, user.password) || !user) {
    const templateVars = {
      user: users[req.session['user_id']],
      err: 'Incorrect password or Username does not exist'
    };
    res.render('login', templateVars);
  } else {
    req.session['user_id'] = user.id;
    res.redirect('/urls');
  }
});


// Clears cookies and redirects to /urls page.
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
    const templateVars = {
      user: users[req.session['user_id']],
      err:''
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
  if (getUserByEmail(req.body.email,users)) {
    const templateVars = {
      user: users[req.session['user_id']],
      err: 'Email exists'
    };
    res.render('register',templateVars);
  } else if (req.body.email === '' || req.body.password === '') {
    const templateVars = {
      user: users[req.session['user_id']],
      err: 'Please fill in the boxes with valid credentials'
    };
  } else {
    const userId = randomString();
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