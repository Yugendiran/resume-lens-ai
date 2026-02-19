import { ResumeService, AssetServices } from "../services/index.js";

export class ResumeController {
  static async createSignedUrl(req, res) {
    try {
      const body = req.body;

      const result = await AssetServices.createSignedUrl({ body });

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

  static async processResume(req, res) {
    try {
      const body = req.body;
      const userId = req.user.userId;

      const result = await ResumeService.processResume({ body, userId });

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

  static async getResumeAnalysis(req, res) {
    try {
      const slug = req.params.slug;
      const userId = req?.user?.userId || null;

      const result = await ResumeService.getResumeAnalysis({ slug, userId });

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

  static async updateReportVisibility(req, res) {
    try {
      const slug = req.params.slug;
      const userId = req.user.userId;
      const { visibility } = req.body;

      const result = await ResumeService.updateReportVisibility({
        slug,
        userId,
        visibility,
      });

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

  static async getUserReports(req, res) {
    try {
      const userId = req.user.userId;

      const result = await ResumeService.getUserReports({ userId });

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
