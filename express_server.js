var express = require("express");
var app = express();
var PORT = 8080; // default port 8080
var cookieParser = require('cookie-parser')

//This tells the Express app to use EJS as its templating engine. 
app.set("view engine", "ejs");

app.use(cookieParser())

var urlDatabase = {
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

//app.listen opens port from my terminal
app.listen(PORT, () => {
    console.log(`Example app listening on port ${PORT}!`);
});

app.get("/login", (req, res) => {
    let templateVars = { user: users[req.cookies["user_id"]] };
    res.render("urls_login", templateVars);
});

//Body parser to make POST data readable
const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({ extended: true }));

//app.get are different response depending on wich root i am getting
app.get("/", (req, res) => {
    res.send("Hello!");
});

app.get("/urls.json", (req, res) => {
    res.json(urlDatabase);
});

app.get("/hello", (req, res) => {
    res.send("<html><body>Hello <b>World</b></body></html>\n");
});

//pass along the urlDatabase to the template // added cookie template
app.get("/urls", (req, res) => {
    let templateVars = { user: users[req.cookies["user_id"]], urls: urlDatabase };
    console.log(users[req.cookies["user_id"]]);
    res.render("urls_index", templateVars);
});

//Register page
app.get("/register", (req, res) => {
    let templateVars = { user: users[req.cookies["user_id"]], urls: urlDatabase };
    res.render("urls_register", templateVars);
});

//Route Parameter for input form / add cookie  template to main routs
app.get("/urls/new", (req, res) => {
    let templateVars = { user: users[req.cookies["user_id"]] };
    res.render("urls_new", templateVars);
});

//Route Parameter for short urls /  add cookie template to main routs
app.get("/urls/:shortURL", (req, res) => {
    //pass the short url "format"
    let templateVars = { user: users[req.cookies["user_id"]], shortURL: req.params.shortURL, longURL: urlDatabase };
    res.render("urls_show", templateVars);
});


app.get("/u/:shortURL", (req, res) => {
    const longURL = urlDatabase[req.params.shortURL];
    res.redirect(longURL);
    console.log(longURL);
});


app.post("/urls", (req, res) => {
    var shortURLVar = generateRandomString();
    console.log(req.body);
    urlDatabase[shortURLVar] = req.body.longURL;
    console.log(urlDatabase);  // Log the POST request body to the console
    res.redirect("/urls/" + shortURLVar);         // Respond with 'Ok' (we will replace this)
});

//edit button
app.post("/urls/:shortURL", (req, res) => {
    const editURL = req.params.shortURL;
    const updateLongURL = req.body.adress;
    console.log(editURL);

    for (var key in urlDatabase) {
        if (key === editURL) {
            urlDatabase[key] = updateLongURL;
        }
    };
    res.redirect("/urls");
});

app.post("/urls/:shortURL/delete", (req, res) => {
    const deleteURL = req.params.shortURL;
    delete urlDatabase[deleteURL];
    res.redirect("/urls");
});

app.post("/login", function (req, res) {
    let user = returnUserId(req.body["email"]);
    console.log(user);
    res.cookie("user_id", user.id);
    res.redirect("/urls");
});

//pass along the username and password for register page
//  
app.post("/register", (req, res) => {
    const { email, password } = req.body;
    if (email === '' || password === '') {
        res.status(400);
        res.send("<html><body>Email or password blank</body></html>\n");
    } else if (hasDuplicates(email) === true) {
        res.status(403);
        res.send("<html><body>Email already exists</body></html>\n");
    } else {
        const id = generateRandomString();
        users[id] = {
            id,
            email,
            password
        };
        res.cookie("user_id", id);
        res.redirect("/urls");
    }
});


// logout and clear cookie
app.post("/logout", function (req, res) {
    res.clearCookie('user_id');
    res.redirect("/urls");
});

//loops through email database to check duplicates
function hasDuplicates(email) {
    for (var differentUsers in users) {
        if (email === users[differentUsers]["email"]) {
            return true;
        };
    } return false;
};

function generateRandomString() {
    var text = "";
    var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";

    for (var i = 0; i < 6; i++)
        text += possible.charAt(Math.floor(Math.random() * possible.length));

    return text;
}

function returnUserId(username) {
    for (var user in users) {

        if (users[user].email === username) {

            return users[user];

        }
    }
    return undefined;
}


