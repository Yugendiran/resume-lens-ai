import { AuthService } from "../services/index.js";

export class AuthController {
  static async loginRequest(req, res) {
    try {
      const body = req.body;

      const result = await AuthService.loginRequest({ body });

      if (result) {
        if (result.statusCode) {
          return res.status(result.statusCode).json(result.json);
        } else {
          return res.json(result.json);
        }
      } else {
        return res.status(500).json({
          success: false,
          message: "Something went wrong.",
        });
      }
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: error.message || "Something went wrong.",
      });
    }
  }

  static async verifyOtp(req, res) {
    try {
      const body = req.body;

      const result = await AuthService.verifyOtp({ body });

      if (result) {
        if (result.statusCode) {
          return res.status(result.statusCode).json(result.json);
        } else {
          return res.json(result.json);
        }
      } else {
        return res.status(500).json({
          success: false,
          message: "Something went wrong.",
        });
      }
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: error.message || "Something went wrong.",
      });
    }
  }

  static async refreshToken(req, res) {
    try {
      const body = req.body;

      const result = await AuthService.refreshToken({ body });

      if (result) {
        if (result.statusCode) {
          return res.status(result.statusCode).json(result.json);
        } else {
          return res.json(result.json);
        }
      } else {
        return res.status(500).json({
          success: false,
          message: "Something went wrong.",
        });
      }
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: error.message || "Something went wrong.",
      });
    }
  }
}
