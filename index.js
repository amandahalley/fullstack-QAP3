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
const {email, password} = request.body;
//find isuer by email
const user = USERS.find((u) => u.email === email);

//check user exists and password is correct
if (!user || !bcrypt.compareSync(password, user.password)) {
    return response.render("login", {errorMessage: "Invalid email or password."});
}
//store user in session & redirect to landing page
request.session.user = user;
response.redirect('/landing');
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
    if (USERS.find((user) => user.email === email)) {
        return response.status(400).render('signup', {errorMessage: "Email already exists."});
    }
    if (USERS.find((user) => user.username === username)) {
        return response.status(400).render('signup', {errorMessage: "Username already exists"})
    }
    //adds new user to USERS array, then redirecting to login page
    USERS.push({id: USERS.length +1, email, username, password: bcrypt.hashSync(password, SALT_ROUNDS), role: 'user'});
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
    //redirects to login page if user does not exist
    if (!request.session.user) {
        return response.redirect("/login");
    }

    //checks if role of user that logged in is "admin" or "user" ajd redire ccts to landing page according to role.
    const {username, role} = request.session.user;
    if (role === "admin") {
        response.render("landing", {username, USERS, isAdmin: true});
    } else {
        response.render("landing", {username, USERS, isAdmin: false});
    }
});

//added logout button to exit the session and redirect back to the home page
app.post("/logout", (request, response) => {
    request.session.destroy(() => {
        response.redirect("/");
    })
})

// Start server
app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});
