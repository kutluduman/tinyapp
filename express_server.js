const express = require('express');
const app = express();
const PORT = 8080;
const bodyParser = require('body-parser');

const randomString = () => {
  let random = Math.random().toString(36).substring(2,8);
  return random;
};

app.use(bodyParser.urlencoded({extended: true}));

app.set('view engine', 'ejs');

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

app.get('/urls/new', (req,res) => {
  res.render("urls_new");
});

app.get('/', (req,res) => {
  res.send('Hello!');
});

app.get('/urls/:shortURL', (req,res) => {
  let templateVars = { shortURL: req.params.shortURL, longURL: urlDatabase};
  res.render("urls_show", templateVars);
});

app.get('/urls', (req,res) => {
  let templateVars = { urls : urlDatabase};
  res.render('urls_index.ejs',templateVars);
});

app.get('/urls.json', (req,res) => {
  res.json(urlDatabase);
});

app.get('/hello', (req,res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

app.post('/urls', (req,res) => {
  console.log(req.body);
  res.send("OK");
});
 

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});