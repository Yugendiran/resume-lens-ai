import { PutObjectCommand, GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import R2 from "../configs/r2.js";
import axios from "axios";
import { v4 as uuidv4 } from "uuid";

const BUCKET_NAME = process.env.R2_BUCKET_NAME;
const DEFAULT_SIGNED_URL_EXPIRY = 3600; // 1 hour in seconds

export class AssetServices {
  /**
   * Generate a signed URL for accessing a file in R2
   * @param {string} key - The file key in R2 (e.g., 'resume/uuid.pdf')
   * @param {number} expiresIn - Expiry time in seconds (default: 1 hour)
   * @returns {Promise<{success: boolean, url?: string, message?: string}>}
   */
  static async getSignedUrl(key, expiresIn = DEFAULT_SIGNED_URL_EXPIRY) {
    try {
      const command = new GetObjectCommand({
        Bucket: BUCKET_NAME,
        Key: key,
      });

      const signedUrl = await getSignedUrl(R2, command, { expiresIn });

      return {
        success: true,
        url: signedUrl,
      };
    } catch (error) {
      console.error("Error generating signed URL:", error.message);
      return {
        success: false,
        message: "Failed to generate signed URL.",
      };
    }
  }

  /**
   * Upload a buffer directly to R2 CDN
   * @param {Buffer} buffer - The buffer to upload
   * @param {string} folder - The folder path in R2
   * @param {string} contentType - The content type of the file
   * @returns {Promise<{success: boolean, url?: string, message?: string}>}
   */
  static async uploadBuffer(
    buffer,
    folder = "resume",
    contentType = "application/octet-stream",
  ) {
    try {
      // Determine file extension from content type
      let extension = "bin";
      if (contentType.includes("pdf")) {
        extension = "pdf";
      } else {
        return {
          success: false,
          message: "File type not supported",
        };
      }

      const fileName = `${uuidv4()}.${extension}`;
      const key = `${folder}/${fileName}`;

      const uploadCommand = new PutObjectCommand({
        Bucket: BUCKET_NAME,
        Key: key,
        Body: buffer,
        ContentType: contentType,
        CacheControl: "public, max-age=31536000",
      });

      await R2.send(uploadCommand);

      // Return the key for generating signed URLs later
      return {
        success: true,
        key: key,
      };
    } catch (error) {
      console.error("Error uploading buffer:", error.message);
      return {
        success: false,
        message: "Failed to upload file.",
      };
    }
  }

  /**
   * Create a signed PUT URL for direct client-side upload to R2
   * @param {Object} body - Request body with fileName and contentType
   * @returns {Promise<{statusCode?: number, json: Object}>}
   */
  static async createSignedUrl({ body }) {
    const { fileName, contentType } = body;

    if (!fileName || !contentType) {
      return {
        statusCode: 400,
        json: {
          success: false,
          message: "fileName and contentType are required.",
        },
      };
    }

    if (contentType !== "application/pdf") {
      return {
        statusCode: 400,
        json: {
          success: false,
          message: "Only PDF files are allowed.",
        },
      };
    }

    try {
      const key = `resume/${uuidv4()}.pdf`;

      const command = new PutObjectCommand({
        Bucket: BUCKET_NAME,
        Key: key,
        ContentType: contentType,
      });

      const signedUrl = await getSignedUrl(R2, command, {
        expiresIn: 600, // 10 minutes
      });

      return {
        json: {
          success: true,
          signedUrl,
          key,
        },
      };
    } catch (error) {
      console.error("Error creating signed URL:", error.message);
      return {
        statusCode: 500,
        json: {
          success: false,
          message: "Failed to create signed URL.",
        },
      };
    }
  }
}
