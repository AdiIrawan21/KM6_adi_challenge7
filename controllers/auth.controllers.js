require("dotenv").config();
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const bcrypt = require("bcrypt")
const jwt = require('jsonwebtoken');
const nodemailer = require('../libs/nodemailer');
const JWT_SECRET_KEY = process.env.JWT_SECRET_KEY;
const URL_ENDPOINT = process.env.URL_ENDPOINT;

module.exports = {
    // function register
    register: async (req, res, next) => {
        try {
            let { name, email, password } = req.body;

            if (!name || !email || !password) {
                req.flash("error", "Missing field");
                res.status(400);
                return res.redirect("/register");
            };

            let exist = await prisma.user.findFirst({
                where: {
                    email
                }
            });

            if (exist) {
                req.flash("error", "email has been already!")
                res.status(400)
                return res.redirect("/register")
            };

            // enkripsi password
            let encryptedPassword = await bcrypt.hash(password, 10);
            let user = await prisma.user.create({
                data: {
                    name,
                    email,
                    password: encryptedPassword
                }
            });

            delete user.password

            req.flash("success", "Registered are successfull")
            res.status(400)
            return res.redirect("/login");
            // return res.status(201).json({
            //     status: true,
            //     message: 'Registered are successfull',
            //     data: { user }
            // })

        } catch (error) {
            next(error);
        }
    },

    // function login
    login: async (req, res, next) => {
        try {
            let { email, password } = req.body;

            if (!email || !password) {
                req.flash("error", "Missing field");
                res.status(400);
                return res.redirect("/login");
            };

            let user = await prisma.user.findFirst({ where: { email } })

            if (!user) {
                req.flash("error", "Invalid email or password");
                res.status(400);
                return res.redirect("/login");
            };

            let isPasswordCorrect = await bcrypt.compare(password, user.password);

            if (!isPasswordCorrect) {
                req.flash("error", "Invalid email or password");
                return res.redirect("/login");
            };
            delete user.password

            let token = jwt.sign(user, JWT_SECRET_KEY)
            console.log('token: ', token);
            return res.redirect("/dashboard");
        } catch (error) {
            next(error);
        }
    },

    // function authentication
    authenticate: async (req, res, next) => {
        try {
            return res.status(200).json({
                status: true,
                message: 'OK',
                data: {
                    user: req.user
                }
            })
        } catch (err) {
            next(err);
        }
    },

    // Endpoint untuk mengirim email lupa password
    forgotPassword: async (req, res, next) => {
        try {
            const { email } = req.body;

            const user = await prisma.user.findFirst({ where: { email } });

            if (!user) {
                return res.status(404).json({
                    status: false,
                    message: 'Email not found',
                    data: null
                });
            }
            const token = jwt.sign({ email: user.email }, JWT_SECRET_KEY);
            console.log('Token:', token);
            const resetPasswordUrl = `${URL_ENDPOINT}/api/v1/auth/resetpassword/${token}`;
            const subject = 'Password Reset Request';
            const html = `<p><b>Please Verify with link bellow!</b> </p>
            <p><a href='${resetPasswordUrl}'>Click Here For Reset Password!</a></p>`

            // Send email
            await nodemailer.sendMail(user.email, subject, html);
            // Setelah pengiriman email berhasil
            return res.status(200).json({
                status: true,
                message: 'success kirim email'
            })
        } catch (error) {
            next(error);
        }
    },

    // function reset password
    resetPassword: async (req, res, next) => {
        try {
            const { token } = req.params;
            const { password } = req.body;

            let hashPassword = await bcrypt.hash(password, 10);

            // Verify the token
            jwt.verify(token, JWT_SECRET_KEY, async (err, decoded) => {
                if (err) {
                    return res.status(403).json({
                        status: false,
                        message: 'invalid token'
                    });
                }

                // Update password for the user
                const updateUser = await prisma.user.update({
                    where: { email: decoded.email },
                    data: { password: hashPassword },
                });

                return res.status(200).json({
                    status: true,
                    message: 'password has been reset',
                    data: updateUser
                });
            });
        } catch (error) {
            next(error);
        }
    }

};