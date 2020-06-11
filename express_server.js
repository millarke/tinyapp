const express = require("express");
const cookieParser = require('cookie-parser');
const app = express();
const PORT = 8080; // default port 8080
let username;

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

// Consider creating an email lookup helper function to keep your code DRY
const checkIfEmailExists = function(emailToCheck) {
  for (let UID in users) {
    // console.log(UID);
    // console.log(users[UID].email);
    // console.log(users[UID]['email']);
    if (emailToCheck === users[UID]['email']) {
      return true;
    }
  }
  return false;
};

// generates an alphanumeric string 6 characters long
const generateRandomString = function() {
  const alphaNumericString = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let UID = '';
  for (let i = 0; i < 6; i++) {
    UID = UID + alphaNumericString[Math.floor(Math.random() * (61 - 0) + 0)];
  }
  return UID;
};

app.post("/login", (req, res) => {
  // username = req.body.username;
  // res.cookie('username', username);


  res.redirect("/login");
});

app.get("/login", (req, res) => {



  let templateVars = { urls: urlDatabase, userObject: users[req.cookies['user_id']] };
  res.render("login", templateVars);
});


app.post("/logout", (req, res) => {
  res.clearCookie('user_id');
  res.redirect("/urls");
});

app.get("/", (req, res) => {
  res.send("Hello!");
});

app.get("/urls", (req, res) => {
  // let myString = "hello world";
  let templateVars = { urls: urlDatabase, userObject: users[req.cookies['user_id']] };
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
  let templateVars = { userObject: users[req.cookies['user_id']] };

  res.render("urls_new", templateVars);
});

app.get("/urls/:shortURL", (req, res) => {
  let templateVars = { shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL], userObject: users[req.cookies['user_id']] };
  res.render("urls_show", templateVars);
});

app.post("/register", (req, res) => {
  if (req.body['email'] === "" || req.body['password'] === "") {
    res.statusCode = 400;
    res.end("400 Missing Email");
    // res.status(400).send("400 Missing Info");
    return;
  }
  const doesEmailExist = checkIfEmailExists(req.body['email']);

  if (doesEmailExist) {
    // res.status(400).send("400 User already exists!");
    res.statusCode = 400;
    res.end("400 User already exists");
    return;
  }

  let newUID = generateRandomString();
  users[newUID] = { id: newUID, email: req.body['email'], password: req.body['password'] };
  res.cookie('user_id', newUID);
  // res.cookie(newUID, users[newUID]);
  res.redirect('/urls');
});

app.get("/register", (req, res) => {
  let templateVars = { email: req.cookies['email'], password: req.cookies['password'], userObject: users[req.cookies['user_id']]  };
  res.render("register", templateVars);
});

// app.post("/login");

app.get("/u/:shortURL", (req, res) => {
  // let templateVars = { shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL] };
  // res.render("urls_show", templateVars);
  const UID = req.params.shortURL;
  res.redirect(urlDatabase[UID]);         // Respond with 'Ok' (we will replace this)

});



app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});