var express = require("express");
var app = express();
var PORT = 8080; // default port 8080

//This tells the Express app to use EJS as its templating engine. 
app.set("view engine", "ejs");

var urlDatabase = {
    "b2xVn2": "http://www.lighthouselabs.ca",
    "9sm5xK": "http://www.google.com"
};

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

//app.listen opens port from my terminal
app.listen(PORT, () => {
    console.log(`Example app listening on port ${PORT}!`);
});
