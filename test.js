
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
}



function hasDuplicates(email) {
    for (var differentUsers in users) {
        if (email === users[differentUsers]["email"]) {
            return true;
        };
    } return false;
};

console.log(hasDuplicates("user2@example.com"));