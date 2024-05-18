const express = require("express");
const router = express.Router();
const { notifPages } = require('../controllers/auth.controllers');
// Render EJS pages
router.get("/", (req, res) => { res.render("index"); });
router.get("/login", (req, res) => { res.render("login"); });
router.get("/register", (req, res) => { res.render("register"); });
router.get("/dashboard", (req, res) => { res.render("dashboard"); });
router.get("/logout", async (req, res) => { res.render("index"); });
router.get("/forgotpassword", (req, res) => { res.render("forgotpassword"); });
router.get("/resetpassword/:token", (req, res) => {
    const { token } = req.params;
    res.render("resetpassword", { token });
});

router.get("/notification/users/:id", notifPages);
module.exports = router;