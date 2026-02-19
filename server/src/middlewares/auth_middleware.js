import jwt from "jsonwebtoken";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc.js";
dayjs.extend(utc);

function authenticateToken(req, res, next) {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  // check if token exists
  if (token == null || !token || token == "undefined") {
    return res.status(401).json({
      success: false,
      message: "Token not found. Please login again",
      login: false,
    });
  }

  let decodedToken = jwt.decode(token);

  if (!decodedToken) {
    return res.status(401).json({
      success: false,
      message: "Invalid token. Please login again",
      login: false,
    });
  }

  let currentTime = dayjs().utc();
  let expiresAt = dayjs.unix(decodedToken.exp).utc();

  // check if the token is expired
  if (dayjs(currentTime).isAfter(expiresAt)) {
    return res.status(401).json({
      success: false,
      message: "Token expired. Please login again",
      login: false,
    });
  }

  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, result) => {
    if (err) {
      return res.status(403).json({
        success: false,
        message: "Invalid token",
        login: false,
      });
    }

    req.user = result;

    next();
  });
}

export default authenticateToken;
