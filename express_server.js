const express = require("express");
const app = express();
const PORT = 8080; // default port 8080

app.set("view engine", "ejs");

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
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

app.get("/", (req, res) => {
  res.send("Hello!");
});

app.get("/urls", (req, res) => {
  let myString = "hello world";
  let templateVars = { urls: urlDatabase, myString};
  res.render("urls_index", templateVars);
});

app.post("/urls", (req, res) => {
  console.log(req.body);  // Log the POST request body to the console
  res.send("Ok");         // Respond with 'Ok' (we will replace this)
  

  let newKey = generateRandomString();
  
  // urlDatabase[generateRandomString()] = req.body;
  urlDatabase[newKey] = req.body.longURL;

  console.log(urlDatabase[newKey]);
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

app.get("/urls/new", (req, res) => {
  res.render("urls_new");
});

app.get("/urls/:shortURL", (req, res) => {
  let templateVars = { shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL] };
  res.render("urls_show", templateVars);
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});