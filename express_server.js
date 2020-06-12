const express = require("express");
const cookieParser = require('cookie-parser');
const app = express();
const PORT = 8080; // default port 8080

// needs to come before all the routes
const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));
app.set("view engine", "ejs");
app.use(cookieParser());

//----------- URL "Database" ----------
// object contains the shortURL as the key for the longURL
const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

//-------- Users "Database" -----------
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
const findKeyByValue = function(object, valueLookingFor) {
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
  users[newUID] = { id: newUID, email: req.body['email'], password: req.body['password'] };
  res.cookie('user_id', newUID);
  res.redirect('/urls');
});


app.get("/register", (req, res) => {
  let templateVars = { email: req.cookies['email'], password: req.cookies['password'], userObject: users[req.cookies['user_id']]  };
  res.render("register", templateVars);
});



//------------- Login -----------------

app.post("/login", (req, res) => {
  if (checkIfEmailExists(req.body.email)) {
    // console.log(req.body.email);
    // console.log("email does exist!");
    // console.log("key of email...?: ", findKeyByValue(users, req.body.email));
    // console.log(users[findKeyByValue(users, req.body.email)].password)
    // console.log("password entered by user: ", req.body.password)
    if (users[findKeyByValue(users, req.body.email)].password === req.body.password) {
      res.cookie('user_id', findKeyByValue(users, req.body.email));
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
  let templateVars = { urls: urlDatabase, userObject: users[req.cookies['user_id']] };
  res.render("login", templateVars);
});

//------------ Logout ----------

app.post("/logout", (req, res) => {
  res.clearCookie('user_id');
  res.redirect("/urls");
});

//------------ URLS --------------

app.get("/urls", (req, res) => {
  let templateVars = { urls: urlDatabase, userObject: users[req.cookies['user_id']] };
  res.render("urls_index", templateVars);
});

app.post("/urls", (req, res) => {
  // console.log(req.body);
  let newKey = generateRandomString();
  urlDatabase[newKey] = req.body.longURL;
  res.redirect("/urls/" + newKey);
});

//-------- Create New ShortURL ---------

app.get("/urls/new", (req, res) => {
  let templateVars = { userObject: users[req.cookies['user_id']] };

  res.render("urls_new", templateVars);
});


//--------- ShortURL Edit Page -------------

app.post("/urls/:shortURL", (req, res) => {
  urlDatabase[req.params.shortURL] = req.body.longURL;
  res.redirect("/urls");
});

app.get("/urls/:shortURL", (req, res) => {
  let templateVars = { shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL], userObject: users[req.cookies['user_id']] };
  res.render("urls_show", templateVars);
});

app.post("/urls/:shortURL/delete", (req, res) => {
  delete urlDatabase[req.params.shortURL];
  res.redirect("/urls");
});

//------- Redirect Link ----------

app.get("/u/:shortURL", (req, res) => {
  // let templateVars = { shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL] };
  // res.render("urls_show", templateVars);
  const UID = req.params.shortURL;
  res.redirect(urlDatabase[UID]);         // Respond with 'Ok' (we will replace this)
});


// deprecated - delete?
// app.get("/", (req, res) => {
//   res.send("Hello!");
// });


// removed due to it not being used
// app.get("/hello", (req, res) => {
//   res.send("<html><body>Hello <b>World</b></body></html>\n");
// });


// Listening on PORT (variable set at top)
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});