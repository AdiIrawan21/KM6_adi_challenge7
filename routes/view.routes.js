const express = require("express");
const router = express.Router();
const axios = require("axios");
const restricted = require('../middleware/restricted');

// handle routes untuk merender ejs
router.get("/", (req, res) => { res.render("index"); });
router.get("/login", (req, res) => { res.render("login"); });
router.get("/register", (req, res) => { res.render("register"); });
router.get("/dashboard", (req, res) => { res.render("dashboard"); });
router.get("/logout", async (req, res) => { res.render("index"); });

// handle routes proccess ejs
router.post("/login", async (req, res) => {
    const { email, password } = req.body;
    try {
        const response = await axios.post(
            `http://${process.env.URL_ENDPOINT}/api/v1/auth/login`,
            {
                email,
                password
            },
        );

        if (response.data.message === "success") {
            res.redirect("/dashboard");
        } else {
            res.render('login', {
                error: `${response.data.message}`
            });
        }
    } catch (error) {
        res.render("login", {
            error: "An error occurred during login. Please try again later.",
        });
    }
})

router.post('/register', async (req, res) => {
    const { name, email, password } = req.body;

    try {
        const response = await axios.post(
            `http://${process.env.URL_ENDPOINT}/api/v1/auth/register`,
            {
                name, email, password
            }
        );

        if (response.data.message === "success") {
            res.redirect('/login');
        } else {
            res.render('register', { error: `${response.data.message}` })
        }

    } catch (error) {
        console.error("Error during login:", error);
        res.render("register", {
            error: "An error occurred. Please try again later.",
        });
    }
})
module.exports = router;