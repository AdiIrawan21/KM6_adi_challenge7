const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const bcrypt = require("bcrypt")
const jwt = require('jsonwebtoken');
const JWT_SECRET_KEY = process.env.JWT_SECRET_KEY;


module.exports = {
    register: async (req, res, next) => {
        try {
            let { name, email, password } = req.body;

            if (!name || !email || !password) {
                return res.status(400).json({
                    status: false,
                    message: 'name, email, password are required',
                    data: null
                });
            };

            let exist = await prisma.user.findFirst({
                where: {
                    email
                }
            });

            if (exist) {
                return res.status(400).json({
                    status: false,
                    message: 'email has already been used!',
                    data: null
                });
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

            return res.status(201).json({
                status: true,
                message: 'Registered are successfull',
                data: { user }
            })

        } catch (error) {
            next(error);
        }
    },

    login: async (req, res, next) => {
        try {
            let { email, password } = req.body;

            if (!email || !password) {
                return res.status(400).json({
                    status: false,
                    message: 'email or password are required',
                    data: null
                });
            };

            let user = await prisma.user.findFirst({ where: { email } })

            if (!user) {
                return res.status(401).json({
                    status: false,
                    message: 'users not found',
                    data: null
                });
            };

            let isPasswordCorrect = await bcrypt.compare(password, user.password);

            if (!isPasswordCorrect) {
                return res.status(400).json({
                    status: false,
                    message: 'invalid email or password',
                    data: null
                });
            };
            delete user.password

            let token = jwt.sign(user, JWT_SECRET_KEY)
            return res.status(200).json({
                status: true,
                message: 'User logged in success',
                data: { ...user, token }
            })
        } catch (error) {
            next(error);
        }
    },

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
    }
};