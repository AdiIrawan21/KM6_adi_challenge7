const express = require("express");
const router = express.Router();
const axios = require("axios");

// Render EJS pages
router.get("/", (req, res) => { res.render("index"); });
router.get("/login", (req, res) => { res.render("login"); });
router.get("/register", (req, res) => { res.render("register"); });
router.get("/dashboard", (req, res) => { res.render("dashboard"); });
router.get("/logout", async (req, res) => { res.render("index"); });
router.get("/forgotpassword", (req, res) => { res.render("forgotpassword"); });
router.get("/resetpassword/:token", (req, res) => {
    const token = req.params;
    res.render("resetpassword", { token });
});


// Process EJS forms
router.post("/login", async (req, res) => {
    const { email, password } = req.body;
    try {
        const response = await axios.post(
            `${process.env.URL_ENDPOINT}/api/v1/auth/login`,
            { email, password }
        );

        if (response.data.status === true) {
            res.redirect("/dashboard");
        } else {
            res.render('login', { error: `${response.data.status}` });
        }
    } catch (error) {
        console.log(error);
        res.render("login", {
            error: "An error occurred during login. Please try again later.",
        });
    }
});

router.post('/register', async (req, res) => {
    const { name, email, password } = req.body;

    try {
        const response = await axios.post(
            `${process.env.URL_ENDPOINT}/api/v1/auth/register`,
            { name, email, password }
        );

        if (response.data.status === true) {
            res.redirect('/login');
        } else {
            res.render('register', { error: `${response.data.status}` });
        }

    } catch (error) {
        console.error("Error during login:", error);
        res.render("register", {
            error: "An error occurred. Please try again later.",
        });
    }
});

router.post('/forgotpassword', async (req, res) => {
    const { email } = req.body;

    try {
        const response = await axios.post(
            `${process.env.URL_ENDPOINT}/api/v1/auth/forgotpassword`,
            { email }
        );

        if (response.data.status === true) {
            res.render('forgotpassword', { success: 'Password reset email sent' });
        } else {
            res.render('forgotpassword', { error: response.data.message });
        }
    } catch (error) {
        console.error("Error during forgot password:", error);
        res.render("forgotpassword", {
            error: "An error occurred. Please try again later.",
        });
    }
});


router.post('/resetpassword/', async (req, res) => {
    const { password } = req.body;
    const token = req.params.token;

    try {
        const response = await axios.post(
            `${process.env.URL_ENDPOINT}/api/v1/auth/resetpassword/${token}`,
            { password }
        );


        if (response.data.status === true) {
            res.render('resetpassword', { success: 'Password has been reset' });
        } else {
            res.render('resetpassword', { error: `${response.data.message}`, token });
        }
    } catch (error) {
        console.error("Error during reset password:", error);
        res.render("resetpassword", {
            error: "An error occurred. Please try again later.",
            token
        });
    }
});

module.exports = router;
