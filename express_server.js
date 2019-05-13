var express = require("express");
var app = express();
var PORT = 8080; // default port 8080
const cookieSession = require("cookie-session");
//Body parser to make POST data readable
const bodyParser = require("body-parser");
const bcrypt = require("bcrypt");

//This tells the Express app to use EJS as its templating engine.
app.set("view engine", "ejs");
app.use(
  cookieSession({
    name: "session",
    keys: ["TinyApp"],
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  })
);

app.use(bodyParser.urlencoded({ extended: true }));

const urlDatabase = {};

const users = {};

//app.listen opens port from my terminal
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

// let urlDataBase = {
//   "11111": {
//     b2xVn2: "http://www.netflix.com",
//     L3eTWw: "http://www.facebook.com",
//     "9sm5xK": "http://www.armorgames.com"
//   },
//   "22222": {
//     Hc38Zt: "http://www.lighthouselabs.ca",
//     F0le3z: "http://www.wired.com",
//     BtCc4l: "http://www.google.com"
//   }
// };

//app.get are different response depending on wich root i am getting
app.get("/", (req, res) => {
  if (req.session.user_id) {
    res.redirect("/urls");
  } else {
    res.redirect("/login");
  }
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

app.get("/login", (req, res) => {
  if (!req.session.user_id) {
    let templateVars = {
      user: null || req.session.user
    };
    res.render("urls_login", templateVars);
  } else {
    res.redirect("/urls");
  }
});

//pass along the urlDatabase to the template // added cookie template
app.get("/urls", (req, res) => {
  if (req.session.user_id) {
    let templateVars = {
      user_id: req.session.user_id,
      urlDatabase: urlDatabase,
      urls: urlsForUser(req.session.user_id),
      user: null || req.session.user
    };
    res.render("urls_index", templateVars);
  } else {
    res.render("urls_login", { user: null });
  }
});

//Register page
app.get("/register", (req, res) => {
  if (!req.session.user_id) {
    let templateVars = {
      user: null || req.session.user
    };
    res.render("urls_register", templateVars);
  } else {
    res.redirect("/urls");
  }
});

//Route Parameter for input form / add cookie  template to main routs
app.get("/urls/new", (req, res) => {
  let templateVars = {
    user: users[req.session.user],
    urls: urlDatabase.longURL,
    user_id: req.session.user_id
  };
  if (!req.session.user_id) {
    res.redirect("/login");
  } else {
    res.render("urls_new", templateVars);
  }
});

//Route Parameter for short urls /  add cookie template to main routs
app.get("/urls/:shortURL", (req, res) => {
  //pass the short url "format"
  let templateVars = {
    user: req.session.user,
    shortURL: req.params.shortURL,
    longURL: urlDatabase
  };
  res.render("urls_show", templateVars);
});

app.get("/u/:shortURL", (req, res) => {
  let templateVars = {
    user_id: req.session.user_id,
    shortURL: req.params.shortURL,
    urlDatabase: urlDatabase,
    user: users
  };
  res.render("urls_show", templateVars);
});

app.post("/urls", (req, res) => {
  var shortURLVar = generateRandomString();
  urlDatabase[shortURLVar] = {
    longURL: req.body.longURL,
    userID: req.session.user_id,
    user: req.session.user
  };
  res.redirect("/urls/" + shortURLVar);
});

//edit button
//CHECK THAT THE USER IS LOGGED IN IF CONDITION
// =>>>>>>>>
app.post("/urls/:shortURL", (req, res) => {
  const editURL = req.params.shortURL;
  const updateLongURL = req.body.longURL;
  console.log("editURL", editURL);
  console.log("updateLongURL", updateLongURL);
  if (urlDatabase[editURL]["userID"] === req.session.user_id) {
    for (var key in urlDatabase) {
      if (key === editURL) {
        urlDatabase[key]["longURL"] = updateLongURL;
      }
    }
  }
  res.redirect("/urls");
});

//CHECK THAT THE USER IS LOGGED IN IF CONDITION
app.post("/urls/:shortURL/delete", (req, res) => {
  const deleteURL = req.params.shortURL;
  if (urlDatabase[deleteURL]["userID"] === req.session.user_id) {
    delete urlDatabase[deleteURL];
  }
  res.redirect("/urls");
});

app.post("/login", function(req, res) {
  const userEmail = req.body.email;
  const userPassword = req.body.password;
  const userCheked = userCheker(userEmail, userPassword);
  if (!userCheked) {
    res.redirect("/register");
  } else {
    req.session.user_id = userCheked;
    res.redirect("/urls");
  }
});

//pass along the username and password for register page
//
app.post("/register", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  const hashedPassword = bcrypt.hashSync(password, 10);
  if (email === "" || password === "") {
    res.status(400);
    res.send("<html><body>Email or password blank</body></html>\n");
  } else if (hasDuplicates(email, "email") === true) {
    res.status(403);
    res.send("<html><body>Email already exists</body></html>\n");
  } else {
    console.log("register user");
    const id = generateRandomString();
    let hashedPassword = bcrypt.hashSync(req.body.password, 10);
    users[id] = {
      id: id,
      email: email,
      password: hashedPassword
    };
    req.session.user_id = id;
    res.redirect("/urls");
  }
});

// logout and clear cookie
app.post("/logout", function(req, res) {
  req.session = null;
  res.redirect("/urls");
});

//loops through database to check duplicates
function hasDuplicates(propertyToSearch, property) {
  for (var differentUsers in users) {
    if (propertyToSearch === users[userids][property]) {
      return true;
    }
  }
  return false;
}

function generateRandomString() {
  var text = "";
  var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";

  for (var i = 0; i < 6; i++)
    text += possible.charAt(Math.floor(Math.random() * possible.length));

  return text;
}

function returnUserId(email) {
  for (var user in users) {
    if (users[user].email === email) {
      return users[user];
    }
  }
  return undefined;
}

function urlsForUser(id) {
  const userURLs = {};
  for (let shortURL in urlDatabase) {
    if (urlDatabase[shortURL].userID === id) {
      userURLs[shortURL] = urlDatabase[shortURL];
    }
  }
  return userURLs;
}

//verifies the email and password of the user
function userCheker(email, password) {
  for (let user in users) {
    let passwordInput = users[user]["password"];
    if (
      users[user]["email"] === email &&
      bcrypt.compareSync(password, passwordInput)
    ) {
      const generatedID = users[user]["id"];
      return generatedID;
    }
  }
  return false;
}
