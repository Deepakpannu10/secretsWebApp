//jshint esversion:6
const express = require("express");
const ejs = require("ejs");
const mongoose = require("mongoose");
// const encrypt = require("mongoose-encryption");
const md5 = require("md5");

require("dotenv").config();
const app = express();
app.set('view engine', 'ejs');
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));

mongoose
    .connect(process.env.DB, {
        useNewUrlParser: true,
        useUnifiedTopology: true
    }).then(function (conn) {
        console.log("DB connected");
    });

const userSchema = new mongoose.Schema({
    email: String,
    password: String
});

// userSchema.plugin(encrypt, { secret: process.env.SECRET, encryptedFields: ["password"] });
// add this encrypt package as plugin in userSchema before making model of this schema.


const User = mongoose.model("User", userSchema);

app.get("/", function (req, res) {
    res.render("home");
});

app.route("/login")
    .get(function (req, res) {
        res.render("login");
    })
    .post(function (req, res) {
        let reqEmail = req.body.username;
        let reqPassword = md5(req.body.password);

        User.findOne({ email: reqEmail }, function (err, userFound) {
            if (err) {
                res.redirect("/login");
            } else {
                if (userFound && userFound.password === reqPassword) {
                    res.render("secrets");
                } else {
                    res.redirect("/login");
                }
            }
        });

    });

app.route("/register")
    .get(function (req, res) {
        res.render("register");
    })
    .post(function (req, res) {
        // console.log(req.body.username + " " + req.body.password);
        let newUser = new User({
            email: req.body.username,
            password: md5(req.body.password)
        });

        newUser.save(function (err) {
            if (err)
                console.log(err);
            else
                res.render("secrets");
        });

    });


let port = process.env.PORT;
if (port == null || port == "") {
    port = 3000;
}

app.listen(port, function () {
    console.log("server is started sucessfully on port " + port);
});

