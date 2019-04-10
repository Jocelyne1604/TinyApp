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

//Route Parameter for input form
app.get("/urls/new", (req, res) => {
    res.render("urls_new");
});
app.post("/urls", (req, res) => {
    console.log(req.body);  // Log the POST request body to the console
    res.send("Ok");         // Respond with 'Ok' (we will replace this)
});
// app.get("/urls/:id", (req, res) => {
//     let templateVars = { urls: urlDatabase };
//     res.render("urls_index", templateVars);
// });

//pass along the urlDatabase to the template
app.get("/urls", (req, res) => {
    let templateVars = { urls: urlDatabase };
    res.render("urls_index", templateVars);
});



//Route Parameter for short urls
app.get("/urls/:shortURL", (req, res) => {
    //pass the short url "format"
    let templateVars = { shortURL: req.params.shortURL, longURL: urlDatabase/* What goes here? */ };
    res.render("urls_show", templateVars);
});




