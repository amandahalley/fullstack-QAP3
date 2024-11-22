const express = require("express");
const path = require("path");
const session = require("express-session");
const bcrypt = require('bcrypt');

const app = express();
const PORT = 3000;
const SALT_ROUNDS = 10;

app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));
app.use(
    session({
        secret: "replace_this_with_a_secure_key",
        resave: false,
        saveUninitialized: true,
    })
);

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

const USERS = [
    {
        id: 1,
        username: "AdminUser",
        email: "admin@example.com",
        password: bcrypt.hashSync("admin123", SALT_ROUNDS), //In a database, you'd just store the hashes, but for 
                                                            // our purposes we'll hash these existing users when the 
                                                            // app loads
        role: "admin",
    },
    {
        id: 2,
        username: "RegularUser",
        email: "user@example.com",
        password: bcrypt.hashSync("user123", SALT_ROUNDS),
        role: "user", // Regular user
    },
];

// GET /login - Render login form
app.get("/login", (request, response) => {
    response.render("login");
});

// POST /login - Allows a user to login
app.post("/login", (request, response) => {

});

// GET /signup - Render signup form
app.get("/signup", (request, response) => {
    //retrieves error message passed through query, null if no error occurs
    const errorMessage = request.query.error || null;
    return response.render("signup", { errorMessage});
});

// POST /signup - Allows a user to signup
app.post("/signup", (request, response) => {
    const {email, username, password} = request.body;
    //checking if email or username already exists, sending error message if so
    if (USERS.find((user) => user.email === email || user.username === username)) {
        return response.status(400).render('signup', {errorMessage: "username or email already exists."});
}
    //adds new user to USERS array, then redirecting to login page
    USERS.push({email, username, password: bcrypt.hashSync(password, SALT_ROUNDS), role: 'user'});
    return response.redirect('/login');
});
    

// GET / - Render index page or redirect to landing if logged in
app.get("/", (request, response) => {
    if (request.session.user) {
        return response.redirect("/landing");
    }
    response.render("index");
});

// GET /landing - Shows a welcome page for users, shows the names of all users if an admin
app.get("/landing", (request, response) => {
    
});

// Start server
app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});
