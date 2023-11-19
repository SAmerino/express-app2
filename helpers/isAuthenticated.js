import jwt from "jsonwebtoken";

const isAuthenticated = (req) => {
    const isAuth = req.headers.authorization;

    if (!isAuth) {
        return false;
    }

    try {
        jwt.verify(isAuth, process.env.JWT_PASS);
        return true;
    } catch (error) {
        return false;
    }
}
export default isAuthenticated;