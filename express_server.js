/****************************************
 * Variables
 ***************************************/
//Body parser to make POST data readable
const bodyParser = require("body-parser");
const express = require("express");
const bcrypt = require("bcrypt");
const cookieSession = require("cookie-session");

const app = express();
const PORT = 8080; // default port 8080

/****************************************
 * Data
 ***************************************/
const urlDatabase = {};
const users = {};

/****************************************
 * Initialization
 ***************************************/
//This tells the Express app to use EJS as its templating engine.
app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({ extended: true }));
app.use(
  cookieSession({
    name: "session",
    keys: ["TinyApp"],
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  })
);

/****************************************
 * Functions
 ***************************************/

//loops through database to check duplicates
function searchUserInfo(thingToSearch, type) {
  for (const currentUser in users) {
    if (thingToSearch == users[currentUser][type]) {
      return true;
    }
  }
}

function generateRandomString() {
  var text = "";
  var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";
  for (var i = 0; i < 6; i++)
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  return text;
}

//Seach any user info on User Database
function searchUserInfo(thingToSearch, type) {
  for (const currentUser in users) {
    if (thingToSearch == users[currentUser][type]) {
      return true;
    }
  }
}

//Check if PW and email match DB
function UserPWVerifier(email, pw) {
  for (var user in users) {
    let comparingPW = users[user]["password"];
    if (users[user]["email"] === email && bcrypt.compareSync(pw, comparingPW)) {
      const CheckID = users[user]["id"];
      return CheckID;
    }
  }
  return false;
}

function checkURLFix(url) {
  if (url.match(/^http:/)) {
    return url;
  } else {
    return "http://" + url;
  }
}

/****************************************
 * Routes - GET
 ***************************************/
app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

//app.get are different response depending on wich root i am getting
app.get("/", (req, res) => {
  if (req.session.user_id) {
    res.redirect("/urls");
  } else {
    res.redirect("/login");
  }
});

//pass along the urlDatabase to the template // added cookie template
app.get("/urls", (req, res) => {
  if (req.session.user_id) {
    let templateVars = {
      currentUser: req.session.user_id,
      users: users,
      userID: req.session.user_id,
      urls: urlDatabase
    };
    res.render("urls_index", templateVars);
  } else {
    res
      .status(400)
      .send(
        "To have access to your TinyApp URLs please log in at: localhost:8080/login"
      );
  }
});

//Route Parameter for input form / add cookie  template to main routs
app.get("/urls/new", (req, res) => {
  if (req.session.user_id) {
    let templateVars = { users: users, userID: req.session.user_id };
    res.render("urls_new", templateVars);
  } else {
    res.redirect("/login");
  }
});

app.get("/u/:shortURL", (req, res) => {
  res.redirect(`${urlDatabase[req.params.shortURL]["longURL"]}`);
});

//Route Parameter for short urls /  add cookie template to main routs
app.get("/urls/:shortURL", (req, res) => {
  //pass the short url "format"
  let templateVars = {
    users: users,
    urlDatabase: urlDatabase,
    userID: req.session.user_id,
    URLkey: req.params.shortURL
  };
  res.render("urls_show", templateVars);
});

app.get("/login", (req, res) => {
  if (req.session.user_id) {
    res.redirect("/urls");
  } else {
    res.render("urls_login");
  }
});

//Register page
app.get("/register", (req, res) => {
  if (req.session.user_id) {
    res.redirect("/urls");
  } else {
    res.render("urls_register");
  }
});

/****************************************
 * Routes - POST
 ***************************************/

app.post("/urls", (req, res) => {
  const uniqueID = generateRandomString();
  tempObj = {};
  tempObj.longURL = checkURLFix(req.body.longURL);
  tempObj.userID = req.session.user_id;
  urlDatabase[uniqueID] = tempObj;
  res.redirect("/urls/" + uniqueID);
});

//edit button
//CHECK THAT THE USER IS LOGGED IN IF CONDITION
// =>>>>>>>>
app.post("/urls/:shortURL", (req, res) => {
  const updateShortURL = req.params.shortURL;
  const newLongURL = checkURLFix(req.body.longURL);
  const newUserID = req.session.user_id;
  for (var keys in urlDatabase) {
    if (keys === updateShortURL) {
      urlDatabase[keys]["longURL"] = newLongURL;
    }
  }
  res.redirect("/urls");
});

//CHECK THAT THE USER IS LOGGED IN IF CONDITION
app.post("/urls/:shortURL/delete", (req, res) => {
  const DeleteShortURL = req.params.shortURL;
  delete urlDatabase[DeleteShortURL];
  res.redirect("/urls");
});

app.post("/login", (req, res) => {
  const userEmail = req.body.email;
  const userPW = req.body.password;
  const checkedID = UserPWVerifier(userEmail, userPW);
  if (checkedID) {
    req.session.user_id = checkedID;
    res.redirect("/urls");
  } else {
    res.status(403).send("Are you sure you have the right info?! Try again");
  }
});

//pass along the username and password for register page
//
app.post("/register", (req, res) => {
  if (!req.body.email || !req.body.password) {
    res.status(400).send("Please enter both email and password");
  } else if (searchUserInfo(req.body.email, "email")) {
    res.status(400).send("Email already in use");
  } else {
    let uniqueID = generateRandomString();
    let hashedPW = bcrypt.hashSync(req.body.password, 10);
    users[uniqueID] = {
      id: uniqueID,
      email: req.body.email,
      password: hashedPW
    };
    req.session.user_id = uniqueID;
    res.redirect("/urls");
  }
});

// logout and clear cookie
app.post("/logout", (req, res) => {
  req.session = null;
  res.redirect("/urls");
});

/****************************************
 * Listener
 ***************************************/
//app.listen opens port from my terminal
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
