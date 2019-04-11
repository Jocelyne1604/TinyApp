var express = require("express");
var app = express();
var PORT = 8080; // default port 8080

//This tells the Express app to use EJS as its templating engine. 
app.set("view engine", "ejs");

var urlDatabase = {
    "b2xVn2": "http://www.lighthouselabs.ca",
    "9sm5xK": "http://www.google.com"
};
//app.listen opens port from my terminal
app.listen(PORT, () => {
    console.log(`Example app listening on port ${PORT}!`);
});

//Body parser to make POST data readable
const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({ extended: true }));

function generateRandomString() {
    var text = "";
    var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";

    for (var i = 0; i < 6; i++)
        text += possible.charAt(Math.floor(Math.random() * possible.length));

    return text;
}

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

//pass along the urlDatabase to the template
app.get("/urls", (req, res) => {
    let templateVars = { urls: urlDatabase };
    res.render("urls_index", templateVars);
});

app.post("/urls", (req, res) => {
    var shortURLVar = generateRandomString();
    console.log(req.body);
    urlDatabase[shortURLVar] = req.body.longURL;
    console.log(urlDatabase);  // Log the POST request body to the console
    res.redirect("/urls/" + shortURLVar);         // Respond with 'Ok' (we will replace this)
});
app.post("/login", function (req, res) {
    const username = req.body.username;
    console.log(username);
    res.cookie("username", username);
    res.redirect("/urls");
});

//Route Parameter for input form
app.get("/urls/new", (req, res) => {
    res.render("urls_new");
});

//Route Parameter for short urls
app.get("/urls/:shortURL", (req, res) => {
    //pass the short url "format"
    let templateVars = { shortURL: req.params.shortURL, longURL: urlDatabase/* What goes here? */ };
    res.render("urls_show", templateVars);
});

app.post("/urls/:shortURL/delete", (req, res) => {
    const deleteURL = req.params.shortURL;
    delete urlDatabase[deleteURL];
    res.redirect("/urls");
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

app.get("/u/:shortURL", (req, res) => {
    const longURL = urlDatabase[req.params.shortURL];
    res.redirect(longURL);
    console.log(longURL);
});


