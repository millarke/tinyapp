const express = require("express");
const cookieSession = require('cookie-session');
const bcrypt = require('bcrypt');
const bodyParser = require("body-parser");
const app = express();
const PORT = 8080;
const { checkIfEmailExists, generateRandomString, getUserByEmail } = require('./helpers');

app.use(bodyParser.urlencoded({extended: true}));
app.set("view engine", "ejs");
app.use(cookieSession({
  name: 'user_id',
  keys: ['thisCanBeAnything']
}));

//----------- URL "Database" ----------
// object contains the shortURL as the key for the longURL
const urlDatabase = {
  "b2xVn2": { longURL: "http://www.lighthouselabs.ca", userID: "userRandomID" },
  "9sm5xK": { longURL: "http://www.google.com", userID: "user2RandomID" }
};

//-------- Users "Database" -----------

const users = {
  "userRandomID": {
    id: "userRandomID",
    email: "user@example.com",
    password: bcrypt.hashSync("purple-monkey-dinosaur", 10)
  },
  "user2RandomID": {
    id: "user2RandomID",
    email: "user2@example.com",
    password: bcrypt.hashSync("dishwasher-funk", 10)
  },
};

//-------------- Register ------------------

app.post("/register", (req, res) => {
  if (req.body['email'] === "" || req.body['password'] === "") {
    res.statusCode = 400;
    res.end("400 Missing Email");
    return;
  }
  const doesEmailExist = checkIfEmailExists(req.body['email'], users);

  if (doesEmailExist) {
    res.statusCode = 400;
    res.end("400 User already exists");
    return;
  }

  let newUID = generateRandomString();
  users[newUID] = { id: newUID, email: req.body['email'], password: bcrypt.hashSync(req.body['password'], 10) };
  req.session.user_id = newUID;

  res.redirect('/urls');
});

app.get("/register", (req, res) => {
  let templateVars = { userObject: users[req.session.user_id]  };
  res.render("register", templateVars);
});

//------------- Login -----------------

app.post("/login", (req, res) => {
  if (checkIfEmailExists(req.body.email, users)) {
    if (bcrypt.compareSync(req.body.password, getUserByEmail(users, req.body.email).password)) {
      req.session.user_id = getUserByEmail(users, req.body.email).id;
    } else {
      res.statusCode = 403;
      res.end("403 Password does not match what we have in our system! Try again or reset!");
      return;
    }
  }

  if (!checkIfEmailExists(req.body.email, users)) {
    res.statusCode = 403;
    res.end("403 No account associated with this email, try again or register a new account!");
    return;
  }

  res.redirect("/urls");
});

app.get("/login", (req, res) => {
  let templateVars = { userObject: users[req.session.user_id] };
  res.render("login", templateVars);
});

//------------ Logout ----------

app.post("/logout", (req, res) => {
  req.session['user_id'] = null;
  res.redirect("/urls");
});

//------------ URLS --------------

app.get("/urls", (req, res) => {
  if (req.session.user_id) {
    const filteredURLdatabaseByUser = {};
    for (let eachShortURL in urlDatabase) {
      if (req.session.user_id === urlDatabase[eachShortURL].userID) {
        filteredURLdatabaseByUser[eachShortURL] = urlDatabase[eachShortURL];
      }
    }

    // check currently logged in users id and use it to filter out the urlDatabase
    let templateVars = { urls: filteredURLdatabaseByUser, userObject: users[req.session.user_id] };
    res.render("urls_index", templateVars);
  } else {
    let templateVars = { userObject: users[req.session.user_id] };
    res.render("login_prompt", templateVars);
  }
});

app.post("/urls", (req, res) => {
  let newKey = generateRandomString();
  urlDatabase[newKey] = { longURL: req.body.longURL, userID: req.session.user_id };
  res.redirect("/urls/" + newKey);
});

//-------- Create New ShortURL ---------

app.get("/urls/new", (req, res) => {
  let templateVars = { userObject: users[req.session.user_id] };

  if (req.session.user_id) {
    res.render("urls_new", templateVars);
  } else {
    res.render("login", templateVars);
  }
});

//--------- ShortURL Edit Page -------------

app.post("/urls/:shortURL", (req, res) => {
  urlDatabase[req.params.shortURL].longURL = req.body.longURL;
  res.redirect("/urls");
});

app.get("/urls/:shortURL", (req, res) => {
  
  if (req.session.user_id) {
    if (req.session.user_id === urlDatabase[req.params.shortURL].userID) {
      let templateVars = { shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL].longURL, userObject: users[req.session.user_id] };
      res.render("urls_show", templateVars);
    } else {
      res.send("You do not have permission to view this page >:(");
    }
  
  } else {
    let templateVars = { userObject: users[req.session.user_id] };
    res.render("login_prompt", templateVars);
  }
});

app.post("/urls/:shortURL/delete", (req, res) => {
  // TODO: could check to see if url even exists (truthy)
  if (req.session.user_id === urlDatabase[req.params.shortURL].userID) {
    delete urlDatabase[req.params.shortURL];
    res.redirect("/urls");
  } else {
    res.send("Only the user that created this shortURL may delete it!");
  }
});

//------- Redirect Link ----------

app.get("/u/:shortURL", (req, res) => {
  const UID = req.params.shortURL;
  if (req.session.user_id === urlDatabase[req.params.shortURL].userID) {
    res.redirect(urlDatabase[UID].longURL);
  } else {
    res.send("You do not have permission to view this page >:(");
  }
});

//---------- Root -------------
app.get("/", (req, res) => {
  res.redirect("/urls");
});

// Listening on PORT (variable set at top)
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});