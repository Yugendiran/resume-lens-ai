import { queryAsync } from "../utils/queryAsync.js";
import sqlString from "sqlstring";
import mailer from "../configs/email.js";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc.js";
dayjs.extend(utc);
import jwt from "jsonwebtoken";

const generateToken = async (type, user) => {
  try {
    let generateAccessToken = async (user) => {
      let accessToken = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, {
        expiresIn: "15m",
      });

      let accessTokenExp = dayjs()
        .utc()
        .add(15, "minute")
        .format("YYYY-MM-DD HH:mm:ss");

      return { accessToken, accessTokenExp };
    };

    let generateRefreshToken = async (user) => {
      let refreshToken = jwt.sign(user, process.env.REFRESH_TOKEN_SECRET, {
        expiresIn: "30d",
      });

      let refreshTokenExp = dayjs()
        .utc()
        .add(30, "day")
        .format("YYYY-MM-DD HH:mm:ss");

      return { refreshToken, refreshTokenExp };
    };

    return new Promise(async (resolve, reject) => {
      if (type == "ACCESS") {
        let { accessToken, accessTokenExp } = await generateAccessToken(user);

        resolve({ accessToken, accessTokenExp });
      } else if (type == "REFRESH") {
        let { refreshToken, refreshTokenExp } =
          await generateRefreshToken(user);

        resolve({ refreshToken, refreshTokenExp });
      } else {
        let { accessToken, accessTokenExp } = await generateAccessToken(user);
        let { refreshToken, refreshTokenExp } =
          await generateRefreshToken(user);

        resolve({
          accessToken,
          accessTokenExp,
          refreshToken,
          refreshTokenExp,
        });
      }
    });
  } catch (error) {
    console.error("Error generating token:", error);
    return { success: false, message: "Internal server error" };
  }
};

export class AuthService {
  /**
   * Validates email format and ensures no '+' character before @domain
   * @param {string} email - Email address to validate
   * @returns {Object} - { isValid: boolean, message: string }
   */
  static validateEmail(email) {
    // Check if email is a string
    if (typeof email !== "string") {
      return {
        isValid: false,
        message: "Email must be a string",
      };
    }

    // Trim whitespace
    email = email.trim();

    // Check if email is empty
    if (!email) {
      return {
        isValid: false,
        message: "Email cannot be empty",
      };
    }

    // Check for '+' character before @ symbol
    const atIndex = email.indexOf("@");
    if (atIndex === -1) {
      return {
        isValid: false,
        message: "Invalid email format",
      };
    }

    const localPart = email.substring(0, atIndex);
    if (localPart.includes("+")) {
      return {
        isValid: false,
        message: "Email addresses with '+' are not supported",
      };
    }

    // Basic email regex validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return {
        isValid: false,
        message: "Invalid email format",
      };
    }

    return {
      isValid: true,
      message: "Email is valid",
    };
  }

  static async loginRequest({ body }) {
    if (!body) {
      return {
        json: {
          success: false,
          message: "Body not found",
        },
        statusCode: 500,
      };
    }

    if (!body.email) {
      return {
        json: {
          success: false,
          message: "Email not found",
        },
        statusCode: 400,
      };
    }

    // Validate email
    const emailValidation = this.validateEmail(body.email);
    if (!emailValidation.isValid) {
      return {
        json: {
          success: false,
          message: emailValidation.message,
        },
        statusCode: 400,
      };
    }

    // Check if there is any users with this email
    const usersQuery = sqlString.format("SELECT * FROM User WHERE email = ?", [
      body.email,
    ]);

    const usersResult = await queryAsync(usersQuery);

    if (usersResult.error) {
      return {
        statusCode: 500,
        json: {
          success: false,
          message: "Error fetch users",
        },
      };
    }

    // user don't exist create a account
    if (usersResult.length == 0) {
      if (!body.name) {
        return {
          json: {
            success: false,
            message: "Name not found",
          },
          statusCode: 400,
        };
      }

      const createAccountQuery = sqlString.format("INSERT INTO User SET ?;", [
        {
          email: body.email,
          name: body.name,
        },
      ]);

      const createAccountResult = await queryAsync(createAccountQuery);

      if (createAccountResult.error) {
        return {
          statusCode: 500,
          json: {
            success: false,
            message: "Error creating account",
          },
        };
      }
    }

    // Generate OTP
    const otp = Math.floor(100000 + Math.random() * 900000);

    // Insert into OTP table
    const otpObj = {
      code: otp,
      email: body.email,
      expiresAt: dayjs().utc().add(10, "minute").format("YYYY-MM-DD HH:mm:ss"),
    };

    const createOtpQuery = sqlString.format("INSERT INTO Otp SET ?;", [otpObj]);

    const createOtpResult = await queryAsync(createOtpQuery);
    if (createOtpResult.error) {
      return {
        statusCode: 500,
        json: {
          success: false,
          message: "Error sending otp",
        },
      };
    }

    // Send OTP
    const { data, error } = await mailer.resend.emails.send({
      from: mailer.from,
      to: [body.email],
      subject: "OTP Verification",
      html: `
      <html>
      <head>
          <style>
        

        .email-container {
            max-width: 600px;
            margin: 30px auto;
            background-color: #ffffff;
            border-radius: 8px;
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
            padding: 20px;
        }

        .header {
            text-align: center;
            padding-bottom: 20px;
            border-bottom: 1px solid #ddd;
        }

        .brand-logo {
            width: 48px;
        }

        .brand-name {
            font-size: 24px;
            font-weight: bold;
            color: #333;
        }

        .email-title {
            font-size: 22px;
            color: #444;
            margin-top: 20px;
        }

        .email-description {
            font-size: 16px;
            color: #666;
            margin-top: 10px;
            line-height: 1.6;
        }

        .otp-code {
            font-size: 28px;
            font-weight: bold;
            color: #333;
            background-color: #eeeeee;
            text-align: center;
            margin: 20px 0;
            padding: 10px 20px;
            border-radius: 5px;
            display: inline-block;
        }

        .expiry-message {
            font-size: 14px;
            color: #999;
            margin-top: 10px;
        }

        .thank-you {
            font-size: 16px;
            color: #333;
            margin-top: 20px;
        }

        .do-not-reply {
            font-size: 12px;
            color: #aaa;
            margin-top: 30px;
            text-align: center;
        }
    </style>
</head>
<body>
    <div class="email-container">
        <!-- Header with Logo and Brand Name -->
        

        <!-- Email Title -->
        <div class="email-title">Verify Your Account</div>

        <!-- Email Description -->
        <div class="email-description">
            Please use the One-Time Password (OTP) below to verify your account.
        </div>

        <!-- OTP Code -->
        <div class="otp-code">
            ${otp}
        </div>

        <!-- Expiry Message -->
        <div class="expiry-message">This code will expire in 10 minutes.</div>

        <!-- Thank You Message -->
        <div class="thank-you">Thank you for choosing our service!</div>

        <!-- Do Not Reply Notice -->
        <div class="do-not-reply">
            Please do not reply to this email. If you need assistance, contact our support team.
        </div>
    </div>
</body>
</html>

              `,
    });

    if (error) {
      console.error({ error });

      return {
        json: {
          success: false,
          message: "Error sending OTP",
        },
        statusCode: 500,
      };
    }

    return {
      json: {
        success: true,
        message: "Login OTP sent successfully.",
      },
    };
  }

  static async verifyOtp({ body }) {
    if (!body) {
      return {
        json: {
          success: false,
          message: "Body not found",
        },
        statusCode: 500,
      };
    }

    if (!body.email) {
      return {
        json: {
          success: false,
          message: "Email not found",
        },
        statusCode: 400,
      };
    }

    if (!body.code) {
      return {
        json: {
          success: false,
          message: "Code not found",
        },
        statusCode: 400,
      };
    }

    let checkOtpQuery = sqlString.format(
      `SELECT * FROM Otp WHERE email = ? AND code = ? ORDER BY otpId DESC LIMIT 1;`,
      [body.email, body.code],
    );

    const checkOtpResult = await queryAsync(checkOtpQuery);

    if (checkOtpResult.error) {
      return {
        statusCode: 500,
        json: {
          success: false,
          message: "Error checking OTP",
        },
      };
    }

    if (checkOtpResult.length == 0) {
      return {
        statusCode: 400,
        json: {
          success: false,
          message: "Invalid OTP",
        },
      };
    } else {
      const otp = checkOtpResult[0];

      if (otp.status == "used") {
        return {
          statusCode: 400,
          json: {
            success: false,
            message: "Email OTP already used.",
          },
        };
      } else if (otp.status == "expired") {
        return {
          statusCode: 400,
          json: {
            success: false,
            message: "Email OTP expired.",
          },
        };
      } else if (otp.status == "pending") {
        let currentTime = dayjs().utc().format("YYYY-MM-DD HH:mm:ss");
        let expiresAt = dayjs(otp.expiresAt).format("YYYY-MM-DD HH:mm:ss");

        if (dayjs(currentTime).isAfter(expiresAt)) {
          // update the otp to expired
          let updateOtpQuery = sqlString.format(
            `UPDATE Otp SET ? WHERE otpId = ?;`,
            [
              {
                status: "expired",
              },
              otp.otpId,
            ],
          );

          await queryAsync(updateOtpQuery);

          return {
            statusCode: 400,
            json: {
              success: false,
              message: "Email OTP expired.",
            },
          };
        } else {
          // update the otp to used
          let updateOtpQuery = sqlString.format(
            `UPDATE Otp SET ? WHERE otpId = ?; `,
            [
              {
                status: "used",
              },
              otp.otpId,
            ],
          );

          await queryAsync(updateOtpQuery);

          // Get user details
          const getUserQuery = sqlString.format(
            `SELECT * FROM User WHERE email = ?;`,
            [body.email],
          );

          const getUserResult = await queryAsync(getUserQuery);

          if (getUserResult.error) {
            return {
              statusCode: 500,
              json: {
                success: false,
                message: "Error getting user details",
              },
            };
          }

          if (getUserResult.length == 0) {
            return {
              statusCode: 404,
              json: {
                success: false,
                message: "User not found",
              },
            };
          }

          const user = getUserResult[0];

          // Generate tokens
          const { accessToken, accessTokenExp, refreshToken, refreshTokenExp } =
            await generateToken("BOTH", {
              userId: user.userId,
              email: user.email,
              name: user.name,
            });

          return {
            statusCode: 200,
            json: {
              success: true,
              message: "Email OTP verified successfully.",
              accessToken,
              accessTokenExp,
              refreshToken,
              refreshTokenExp,
            },
          };
        }
      } else {
        return {
          statusCode: 400,
          json: {
            success: false,
            message: "Invalid OTP",
          },
        };
      }
    }
  }

  static async refreshToken({ body }) {
    try {
      const { refreshToken } = body;

      if (!refreshToken) {
        return {
          statusCode: 400,
          json: {
            success: false,
            message: "Refresh token is required",
          },
        };
      }

      // Decode without verification first to check structure
      const decodedToken = jwt.decode(refreshToken);

      if (!decodedToken || !decodedToken.userId) {
        return {
          statusCode: 400,
          json: {
            success: false,
            message: "Invalid refresh token",
          },
        };
      }

      // Check if the refresh token is expired
      const currentTime = dayjs().utc();
      const tokenExpirationTime = dayjs.unix(decodedToken.exp).utc();

      if (currentTime.isAfter(tokenExpirationTime)) {
        return {
          statusCode: 401,
          json: {
            success: false,
            message: "Refresh token expired",
          },
        };
      }

      // Verify the token signature and generate new tokens
      const tokens = await new Promise((resolve, reject) => {
        jwt.verify(
          refreshToken,
          process.env.REFRESH_TOKEN_SECRET,
          async (err, user) => {
            if (err) {
              console.error("Refresh token verification failed:", err);
              return reject({
                statusCode: 401,
                json: {
                  success: false,
                  message: "Invalid refresh token",
                },
              });
            }

            const newTokens = await generateToken("BOTH", {
              userId: user.userId,
              email: user.email,
              name: user.name,
            });

            if (newTokens.success === false) {
              return reject({
                statusCode: 500,
                json: {
                  success: false,
                  message: "Internal server error",
                },
              });
            }

            resolve({
              statusCode: 200,
              json: {
                success: true,
                message: "Token refreshed successfully",
                accessToken: newTokens.accessToken,
                accessTokenExp: newTokens.accessTokenExp,
                refreshToken: newTokens.refreshToken,
                refreshTokenExp: newTokens.refreshTokenExp,
              },
            });
          },
        );
      });

      return tokens;
    } catch (error) {
      console.error("Error in refreshToken:", error);

      // If the rejection came from our jwt.verify callback, it has statusCode
      if (error.statusCode) {
        return error;
      }

      return {
        statusCode: 500,
        json: {
          success: false,
          message: "Internal server error",
        },
      };
    }
  }
}
