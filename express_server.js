const express = require("express");
// const cookieParser = require('cookie-parser');
const cookieSession = require('cookie-session');
const bcrypt = require('bcrypt');
const app = express();
const PORT = 8080; // default port 8080

// needs to come before all the routes
const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));
app.set("view engine", "ejs");
// app.use(cookieParser());
app.use(cookieSession({
  name: 'user_id',
  keys: ['thisCanBeAnything']
}));
// TODO: finish this


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
  }
};

//---------- Helper Functions -----------
// should I move this to a new file?

// checks to see if email exists
const checkIfEmailExists = function(emailToCheck) {
  for (let UID in users) {
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

// finds object key by value
// TODO: accidentally hardcoded email into this
const findKeyByEmailValue = function(object, valueLookingFor) {
  for (const key in object) {
    if (object[key].email === valueLookingFor) {
      return key;
    }
  }
};

//---------- Debug JSON Pages -------------
// users page intended for debug purposes
app.get('/users', (req, res) => {
  res.json(users);
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

//-------------- Register ------------------

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
  users[newUID] = { id: newUID, email: req.body['email'], password: bcrypt.hashSync(req.body['password'], 10) };
  req.session.user_id = newUID;
  console.log("req.session.user_id: ", req.session.user_id);

  res.redirect('/urls');
});

app.get("/register", (req, res) => {
  let templateVars = { userObject: users[req.session.user_id]  };
  // let templateVars = { email: req.session['email'], password: req.session['password'], userObject: users[req.session.user_id]  };
  res.render("register", templateVars);
});

//------------- Login -----------------

app.post("/login", (req, res) => {
  if (checkIfEmailExists(req.body.email)) {
    // if (users[findKeyByEmailValue(users, req.body.email)].password === bcrypt.compareSync(req.body.password, 10)) {
    if (bcrypt.compareSync(req.body.password, users[findKeyByEmailValue(users, req.body.email)].password)) {
      req.session.user_id = findKeyByEmailValue(users, req.body.email);
    } else {
      res.statusCode = 403;
      res.end("403 Password does not match what we have in our system! Try again or reset!");
      return;
    }
  }

  if (!checkIfEmailExists(req.body.email)) {
    // res.status(400).send("400 User already exists!");
    res.statusCode = 403;
    res.end("403 No account associated with this email, try again or register a new account!");
    return;
  }

  res.redirect("/urls");
});

app.get("/login", (req, res) => {
  // let templateVars = { urls: urlDatabase, userObject: users[req.session.user_id] };
  let templateVars = { userObject: users[req.session.user_id] };
  res.render("login", templateVars);
});

//------------ Logout ----------
// TODO: switch clear cookie to instead set it to null maybe req.session.user_id = null
app.post("/logout", (req, res) => {
  res.clearCookie('user_id');
  res.redirect("/urls");
});

//------------ URLS --------------

app.get("/urls", (req, res) => {
  console.log("req.session.user_id: ", req.session.user_id);
  if (req.session.user_id) {
    const filteredURLdatabaseByUser = {};
    for (let eachShortURL in urlDatabase) {
      // if (users[req.session.user_id === urlDatabase[eachShortURL][users[req.session.user_id) {
      console.log(users[req.session.user_id], urlDatabase[eachShortURL].userID);
      if (req.session.user_id === urlDatabase[eachShortURL].userID) {
        filteredURLdatabaseByUser[eachShortURL] = urlDatabase[eachShortURL];
      }
    }

    // check currently logged in users id and use it to filter out the urlDatabase
    let templateVars = { urls: filteredURLdatabaseByUser, userObject: users[req.session.user_id] };
    res.render("urls_index", templateVars);
  } else {
    // TODO: make this a real page
    res.send("Log in or Register!");
    // res.render("login", templateVars);
  }
});

app.post("/urls", (req, res) => {
  // console.log(req.body);
  let newKey = generateRandomString();
  // urlDatabase[newKey] = req.body.longURL;
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
    console.log("req.params.shortURL: ", req.params.shortURL);
    console.log("urlDatabase[req.params.shortURL]: ", urlDatabase[req.params.shortURL]);

    if (req.session.user_id === urlDatabase[req.params.shortURL].userID) {
      let templateVars = { shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL].longURL, userObject: users[req.session.user_id] };
      res.render("urls_show", templateVars);
    } else {
      res.send("You do not have permission to view this page >:(");
    }
  
  } else {
    // TODO: make this a real page
    res.send("Log in or Register!");
    // res.render("login", templateVars);
  }
});

// app.get("/urls/:shortURL", (req, res) => {
//   let templateVars = { shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL], username: username };
//   res.render("urls_show", templateVars);
// });

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
  // let templateVars = { shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL] };
  // res.render("urls_show", templateVars);
  const UID = req.params.shortURL;
  res.redirect(urlDatabase[UID].longURL);         // Respond with 'Ok' (we will replace this)
});

// maybe redirect to /urls
// app.get("/", (req, res) => {
//   res.send("Hello!");
// });

// Listening on PORT (variable set at top)
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});