const express = require("express");
const cookieParser = require('cookie-parser');
const app = express();
const PORT = 8080; // default port 8080

app.set("view engine", "ejs");
app.use(cookieParser());

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

// needs to come before all the routes
const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));

// generates an alphanumeric string 6 characters long
const generateRandomString = function() {
  const alphaNumericString = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let UID = '';
  for (let i = 0; i < 6; i++) {
    UID = UID + alphaNumericString[Math.floor(Math.random() * (61 - 0) + 0)];
  }
  return UID;
};

let username;

app.post("/login", (req, res) => {
  username = req.body.username;
  res.cookie('username', username);
  res.redirect("/urls");
});

app.post("/logout", (req, res) => {
  res.clearCookie('username');
  res.redirect("/urls");
});

app.get("/", (req, res) => {
  res.send("Hello!");
});

app.get("/urls", (req, res) => {
  // let myString = "hello world";
  let templateVars = { urls: urlDatabase, username: req.cookies['username'] };
  res.render("urls_index", templateVars);
});

app.post("/urls", (req, res) => {
  console.log(req.body);  // Log the POST request body to the console
  let newKey = generateRandomString();
  // urlDatabase[generateRandomString()] = req.body;
  urlDatabase[newKey] = req.body.longURL;
  // console.log(urlDatabase[newKey]);
  res.redirect("/urls/" + newKey);         // Respond with 'Ok' (we will replace this)
});

app.post("/urls/:shortURL", (req, res) => {
  urlDatabase[req.params.shortURL] = req.body.longURL;
  // req.params.shortURL =;
  res.redirect("/urls");
  // res.redirect("/urls/:shortURL");
});

app.post("/urls/:shortURL/delete", (req, res) => {
  delete urlDatabase[req.params.shortURL];
  res.redirect("/urls");
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

app.get("/urls/new", (req, res) => {
  let templateVars = { username: req.cookies['username'] };

  res.render("urls_new", templateVars);
});

app.get("/urls/:shortURL", (req, res) => {
  let templateVars = { shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL], username: req.cookies['username'] };
  res.render("urls_show", templateVars);
});

app.post("/register", (req, res) => {
  let newUID = generateRandomString();
  users[newUID] = { id: newUID, email: req.body['email'], password: req.body['password'] };
  res.cookie('user_id', newUID);
  // res.cookie(newUID, users[newUID]);
  console.log(users);
  console.log("hello");
  res.redirect('/urls');
});

app.get("/register", (req, res) => {
  let templateVars = { email: req.cookies['email'], password: req.cookies['password'], username: req.cookies['username']  };
  res.render("register", templateVars);
});

app.get("/u/:shortURL", (req, res) => {
  // let templateVars = { shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL] };
  // res.render("urls_show", templateVars);
  const UID = req.params.shortURL;
  res.redirect(urlDatabase[UID]);         // Respond with 'Ok' (we will replace this)

});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});