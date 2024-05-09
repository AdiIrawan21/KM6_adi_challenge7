const jwt = require('jsonwebtoken');
const JWT_SECRET_KEY = process.env.JWT_SECRET_KEY;

module.exports = async (req, res, next) => {
    const { authorization } = req.headers;

    if (!authorization || !authorization.split(" ")[1]) {
        return res.status(401).json({
            status: false,
            message: "You're not authorized!",
            data: null
        });
    }

    jwt.verify(authorization.split(" ")[1], JWT_SECRET_KEY, (err, user) => {
        if (err) {
            return res.status(401).json({
                status: false,
                message: "You're not authorized!",
                err: err.message,
                data: null
            });
        }
        delete user.iat

        req.user = user;
        next();
    });
};
