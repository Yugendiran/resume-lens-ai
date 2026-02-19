import { queryAsync } from "../utils/queryAsync.js";
import sqlString from "sqlstring";
import OpenAI from "openai";
import { AssetServices } from "./index.js";
import { v4 as uuidv4 } from "uuid";

const openai = new OpenAI({
  baseURL: "https://openrouter.ai/api/v1",
  apiKey: process.env.OPENROUTER_API_KEY,
});

export class ResumeService {
  static async processResume({ body, userId }) {
    const { fileKey } = body;

    if (!fileKey) {
      return {
        json: {
          success: false,
          message: "File key is required",
        },
      };
    }

    // Check for resume counts of the userId and restrict till 5 analysis
    const countQuery = sqlString.format(
      "SELECT COUNT(*) AS count FROM Report WHERE userId = ?;",
      [userId],
    );
    const countResult = await queryAsync(countQuery);

    if (countResult.error) {
      return {
        statusCode: 500,
        json: {
          success: false,
          message: "Error checking resume count",
        },
      };
    }

    if (countResult[0].count >= 5) {
      return {
        statusCode: 429,
        json: {
          success: false,
          message: "You have reached the maximum limit of 5 resume analyses",
        },
      };
    }

    // Signed URL
    const { url: signedUrl } = await AssetServices.getSignedUrl(fileKey);

    // file name
    const fileName = fileKey.split("/").pop();

    try {
      const completion = await openai.chat.completions.create({
        model: "google/gemini-3-flash-preview",
        messages: [
          {
            role: "system",
            content: `You are a senior recruiter + resume coach with domain knowledge in all domains. 
            Analyze the candidate's resume below and the target job description (if provided).
            Produce a single JSON object matching the schema described below.
            Be concise but decisive; mark weaknesses bluntly and prioritize action items that increase interview callbacks and ATS match.
            Where you give edits, provide exact rewritten bullets.
            If a job description is not provided, infer a target role from the resume (state your inference).

            Scoring rules: Use 0-10 where 10 = perfect. Score each section relative to the inferred target role or provided job description.
            Tone: direct, no sugar-coating, actionable.
            When rewriting bullets: always include a metric or baseline (e.g., “reduced latency by 40%”, “grew MRR from $30k to $120k in 6 months”). If metrics are missing, propose realistic placeholder metrics using language like “[quantify: X% / $Y / N users]” so the candidate can replace them.
            If job description provided: explicitly list top 10 matching keywords and top 5 gaps vs JD.

            Additional analysis requirements:
            - salary_estimate: Infer a realistic salary range for the candidate's target role based on their experience level, skills, and likely geography. Use INR (Indian Rupees) by default.
            - experience_timeline: Extract a chronological career timeline from the resume with role, company, period, and a growth note for each entry.
            - skill_gap_analysis: Compare the candidate's demonstrated skills against what the inferred target role typically requires. Rate current_level and required_level as "none", "beginner", "intermediate", or "advanced". Set priority to "critical", "high", "medium", "low", or "met".
            - role_match_alternatives: Suggest 2-4 alternative roles (beyond the primary inferred role) the resume is a strong fit for, with a fit_score (0-10) and reason.
            - ats_compatibility: Give a dedicated ATS compatibility score (0-100), a verdict ("Likely to pass", "Borderline", "Likely to fail"), and list specific issues.
            - word_count_analysis: Count total words, compare against the ideal range for the experience level (e.g. 400-600 for <5 years), give a verdict and suggestion.
            - industry_benchmark: Estimate the candidate's percentile ranking compared to similar profiles, and note what makes them stand out.
            - action_verb_analysis: Identify strong and weak action verbs used in resume bullets. Score the overall verb quality 0-10.
            - cultural_fit_signals: Infer 3-6 cultural/work-style signals from the resume language (e.g. "High ownership", "Metrics-driven", "Startup-oriented").
            - tailoring_tips: Provide 2-3 sets of tips for tailoring the resume to different company types (e.g. "FAANG", "Startup", "Enterprise").

            Output rules: return valid JSON only. If you must make an inference, list it under confidence_and_notes.assumptions.`,
          },
          {
            role: "user",
            content: [
              {
                type: "text",
                text: "Analyze this resume",
              },
              {
                type: "file",
                file: {
                  filename: fileName,
                  file_data: signedUrl,
                },
              },
            ],
          },
        ],
        response_format: {
          type: "json_schema",
          json_schema: {
            name: "resumeAnalysis",
            strict: true,
            schema: {
              type: "object",
              properties: {
                success: {
                  type: "boolean",
                  description:
                    "True if the uploaded file is a valid resume and was successfully analyzed. False if the file is not a resume or could not be processed.",
                },
                analysis: {
                  type: "object",
                  description:
                    "The complete structured analysis of the candidate's resume.",
                  properties: {
                    executive_summary: {
                      type: "object",
                      description:
                        "High-level summary of the candidate in brief formats.",
                      properties: {
                        one_line: {
                          type: "string",
                          description:
                            "A single impactful sentence summarizing the candidate's profile and value proposition.",
                        },
                        "3_sentence": {
                          type: "string",
                          description:
                            "A three-sentence narrative covering the candidate's key strengths, quantified impact, and one area for improvement.",
                        },
                      },
                      required: ["one_line", "3_sentence"],
                      additionalProperties: false,
                    },
                    candidate_name: {
                      type: "string",
                      description:
                        "The candidate's full name as it appears on the resume.",
                    },
                    inferred_target_role: {
                      type: "string",
                      description:
                        "The most likely job title or role the candidate is targeting, inferred from their resume content and experience level.",
                    },
                    overall_fit: {
                      type: "object",
                      description:
                        "An overall assessment of the candidate's fit for their inferred target role.",
                      properties: {
                        rating: {
                          type: "number",
                          description:
                            "A numeric score from 0 to 10 (supports decimals like 8.5) rating the candidate's overall fit.",
                        },
                        category: {
                          type: "string",
                          description:
                            "A short label categorizing the fit level, e.g. 'Excellent fit', 'Good fit', 'Average fit', 'Poor fit'.",
                        },
                        reason: {
                          type: "string",
                          description:
                            "A concise explanation justifying the rating and category, referencing specific resume evidence.",
                        },
                      },
                      required: ["rating", "category", "reason"],
                      additionalProperties: false,
                    },
                    section_scores: {
                      type: "object",
                      description:
                        "Individual scores (0–10) for each major section of the resume, assessing quality and effectiveness.",
                      properties: {
                        summary: {
                          type: "number",
                          description:
                            "Score for the professional summary or objective section. Evaluates clarity, impact, and alignment with the target role.",
                        },
                        experience_relevance: {
                          type: "number",
                          description:
                            "Score for how relevant the work experience is to the inferred target role.",
                        },
                        accomplishments: {
                          type: "number",
                          description:
                            "Score for the quality and quantification of listed accomplishments and achievements.",
                        },
                        skills_and_tools: {
                          type: "number",
                          description:
                            "Score for the breadth, relevance, and specificity of listed skills and tools.",
                        },
                        education: {
                          type: "number",
                          description:
                            "Score for the education section, considering degree level, relevance, and any certifications.",
                        },
                        format_and_readability: {
                          type: "number",
                          description:
                            "Score for the visual layout, structure, and overall readability of the resume.",
                        },
                        language_and_grammar: {
                          type: "number",
                          description:
                            "Score for the quality of writing, grammar correctness, and professional tone.",
                        },
                      },
                      required: [
                        "summary",
                        "experience_relevance",
                        "accomplishments",
                        "skills_and_tools",
                        "education",
                        "format_and_readability",
                        "language_and_grammar",
                      ],
                      additionalProperties: false,
                    },
                    top_strengths: {
                      type: "array",
                      description:
                        "A list of the candidate's top strengths identified from the resume. Each item is a concise statement highlighting a specific strength.",
                      items: {
                        type: "string",
                      },
                    },
                    top_risks_or_red_flags: {
                      type: "array",
                      description:
                        "A list of potential risks, concerns, or red flags identified in the resume that a hiring team should be aware of.",
                      items: {
                        type: "string",
                      },
                    },
                    missing_ats_keywords: {
                      type: "array",
                      description:
                        "A list of important ATS (Applicant Tracking System) keywords that are missing from the resume but are commonly expected for the inferred target role.",
                      items: {
                        type: "string",
                      },
                    },
                    rewrite_recommendations: {
                      type: "array",
                      description:
                        "Specific bullet-point rewrite suggestions comparing the original text to an improved version with reasoning.",
                      items: {
                        type: "object",
                        properties: {
                          original: {
                            type: "string",
                            description:
                              "The original text from the resume that needs improvement.",
                          },
                          rewritten: {
                            type: "string",
                            description:
                              "The improved, rewritten version of the original text.",
                          },
                          why: {
                            type: "string",
                            description:
                              "A brief explanation of why the rewrite is better and what problem it fixes.",
                          },
                        },
                        required: ["original", "rewritten", "why"],
                        additionalProperties: false,
                      },
                    },
                    quantify_opportunities: {
                      type: "array",
                      description:
                        "Opportunities where the candidate could add quantifiable metrics to strengthen their resume bullets.",
                      items: {
                        type: "object",
                        properties: {
                          area: {
                            type: "string",
                            description:
                              "The resume section, project, or experience area where quantification is missing.",
                          },
                          how_to_quantify: {
                            type: "string",
                            description:
                              "A specific suggestion on what metric or data point the candidate could add.",
                          },
                        },
                        required: ["area", "how_to_quantify"],
                        additionalProperties: false,
                      },
                    },
                    recommended_interview_questions: {
                      type: "array",
                      description:
                        "A list of tailored interview questions a hiring team could ask the candidate based on their specific resume claims and experience.",
                      items: {
                        type: "string",
                      },
                    },
                    recommended_next_steps_for_candidate: {
                      type: "array",
                      description:
                        "Actionable next steps the candidate should take to improve their resume and job-search readiness.",
                      items: {
                        type: "string",
                      },
                    },
                    recommended_next_steps_for_hiring_team: {
                      type: "array",
                      description:
                        "Actionable next steps for a hiring team to further evaluate or vet this candidate.",
                      items: {
                        type: "string",
                      },
                    },
                    confidence_and_notes: {
                      type: "object",
                      description:
                        "Metadata about the analysis confidence level and any assumptions made during evaluation.",
                      properties: {
                        confidence_score: {
                          type: "number",
                          description:
                            "A confidence score from 0.0 to 1.0 indicating how confident the analyzer is in the accuracy of this assessment.",
                        },
                        assumptions: {
                          type: "string",
                          description:
                            "Any assumptions made during the analysis, such as inferred target company type, seniority level, or missing context.",
                        },
                      },
                      required: ["confidence_score", "assumptions"],
                      additionalProperties: false,
                    },
                    salary_estimate: {
                      type: "object",
                      description:
                        "Inferred salary range for the candidate based on their experience, skills, and target role.",
                      properties: {
                        range: {
                          type: "string",
                          description:
                            "The estimated salary range, e.g. '$120K - $160K'.",
                        },
                        currency: {
                          type: "string",
                          description:
                            "The currency code, e.g. 'USD', 'EUR', 'INR'.",
                        },
                        basis: {
                          type: "string",
                          description:
                            "A brief explanation of how this range was inferred.",
                        },
                      },
                      required: ["range", "currency", "basis"],
                      additionalProperties: false,
                    },
                    experience_timeline: {
                      type: "array",
                      description:
                        "A chronological timeline of the candidate's career extracted from the resume.",
                      items: {
                        type: "object",
                        properties: {
                          period: {
                            type: "string",
                            description:
                              "The time period of this role, e.g. '2021-2024'.",
                          },
                          role: {
                            type: "string",
                            description:
                              "The job title held during this period.",
                          },
                          company: {
                            type: "string",
                            description: "The company or organization name.",
                          },
                          growth_note: {
                            type: "string",
                            description:
                              "A brief note on career growth or progression during this role.",
                          },
                        },
                        required: ["period", "role", "company", "growth_note"],
                        additionalProperties: false,
                      },
                    },
                    skill_gap_analysis: {
                      type: "array",
                      description:
                        "Comparison of the candidate's current skills vs requirements for their target role.",
                      items: {
                        type: "object",
                        properties: {
                          skill: {
                            type: "string",
                            description: "The skill being evaluated.",
                          },
                          current_level: {
                            type: "string",
                            description:
                              "The candidate's current proficiency: 'none', 'beginner', 'intermediate', or 'advanced'.",
                          },
                          required_level: {
                            type: "string",
                            description:
                              "The level required for the target role: 'none', 'beginner', 'intermediate', or 'advanced'.",
                          },
                          priority: {
                            type: "string",
                            description:
                              "How urgent it is to close this gap: 'critical', 'high', 'medium', 'low', or 'met'.",
                          },
                        },
                        required: [
                          "skill",
                          "current_level",
                          "required_level",
                          "priority",
                        ],
                        additionalProperties: false,
                      },
                    },
                    role_match_alternatives: {
                      type: "array",
                      description:
                        "Alternative roles the resume is a strong fit for beyond the primary inferred target.",
                      items: {
                        type: "object",
                        properties: {
                          role: {
                            type: "string",
                            description: "The alternative role title.",
                          },
                          fit_score: {
                            type: "number",
                            description:
                              "A fit score from 0 to 10 for this alternative role.",
                          },
                          reason: {
                            type: "string",
                            description:
                              "Brief explanation of why the candidate fits or doesn't fully fit this role.",
                          },
                        },
                        required: ["role", "fit_score", "reason"],
                        additionalProperties: false,
                      },
                    },
                    ats_compatibility: {
                      type: "object",
                      description:
                        "A dedicated ATS (Applicant Tracking System) compatibility assessment.",
                      properties: {
                        score: {
                          type: "number",
                          description: "ATS compatibility score from 0 to 100.",
                        },
                        verdict: {
                          type: "string",
                          description:
                            "A short verdict: 'Likely to pass', 'Borderline', or 'Likely to fail'.",
                        },
                        issues: {
                          type: "array",
                          description:
                            "Specific ATS compatibility issues found in the resume.",
                          items: {
                            type: "string",
                          },
                        },
                      },
                      required: ["score", "verdict", "issues"],
                      additionalProperties: false,
                    },
                    word_count_analysis: {
                      type: "object",
                      description:
                        "Analysis of the resume's word count and length optimization.",
                      properties: {
                        total_words: {
                          type: "number",
                          description: "Total number of words in the resume.",
                        },
                        ideal_range: {
                          type: "string",
                          description:
                            "The ideal word count range for this experience level, e.g. '400-600'.",
                        },
                        verdict: {
                          type: "string",
                          description:
                            "Whether the resume is 'Too short', 'Within range', or 'Too long'.",
                        },
                        suggestion: {
                          type: "string",
                          description:
                            "A suggestion for improving the word count, or empty string if within range.",
                        },
                      },
                      required: [
                        "total_words",
                        "ideal_range",
                        "verdict",
                        "suggestion",
                      ],
                      additionalProperties: false,
                    },
                    industry_benchmark: {
                      type: "object",
                      description:
                        "How this resume compares to similar profiles in the industry.",
                      properties: {
                        percentile: {
                          type: "number",
                          description:
                            "Estimated percentile ranking (0-100) compared to similar profiles.",
                        },
                        compared_to: {
                          type: "string",
                          description:
                            "The comparison group, e.g. 'Full Stack Engineers with 3-5 years experience'.",
                        },
                        standout_factor: {
                          type: "string",
                          description:
                            "What makes this candidate stand out from the comparison group.",
                        },
                      },
                      required: [
                        "percentile",
                        "compared_to",
                        "standout_factor",
                      ],
                      additionalProperties: false,
                    },
                    action_verb_analysis: {
                      type: "object",
                      description:
                        "Analysis of the quality of action verbs used in resume bullet points.",
                      properties: {
                        strong_verbs: {
                          type: "array",
                          description:
                            "List of strong, impactful action verbs found in the resume.",
                          items: {
                            type: "string",
                          },
                        },
                        weak_verbs: {
                          type: "array",
                          description:
                            "List of weak or generic verbs that should be replaced.",
                          items: {
                            type: "string",
                          },
                        },
                        score: {
                          type: "number",
                          description:
                            "Overall action verb quality score from 0 to 10.",
                        },
                      },
                      required: ["strong_verbs", "weak_verbs", "score"],
                      additionalProperties: false,
                    },
                    cultural_fit_signals: {
                      type: "array",
                      description:
                        "Work-style and cultural signals inferred from the resume language and content.",
                      items: {
                        type: "string",
                      },
                    },
                    tailoring_tips: {
                      type: "array",
                      description:
                        "Tips for tailoring the resume to different company types or industries.",
                      items: {
                        type: "object",
                        properties: {
                          target: {
                            type: "string",
                            description:
                              "The target company type or industry, e.g. 'FAANG', 'Startup', 'Enterprise'.",
                          },
                          changes: {
                            type: "array",
                            description:
                              "Specific changes to make for this target.",
                            items: {
                              type: "string",
                            },
                          },
                        },
                        required: ["target", "changes"],
                        additionalProperties: false,
                      },
                    },
                  },
                  required: [
                    "executive_summary",
                    "candidate_name",
                    "inferred_target_role",
                    "overall_fit",
                    "section_scores",
                    "top_strengths",
                    "top_risks_or_red_flags",
                    "missing_ats_keywords",
                    "rewrite_recommendations",
                    "quantify_opportunities",
                    "recommended_interview_questions",
                    "recommended_next_steps_for_candidate",
                    "recommended_next_steps_for_hiring_team",
                    "confidence_and_notes",
                    "salary_estimate",
                    "experience_timeline",
                    "skill_gap_analysis",
                    "role_match_alternatives",
                    "ats_compatibility",
                    "word_count_analysis",
                    "industry_benchmark",
                    "action_verb_analysis",
                    "cultural_fit_signals",
                    "tailoring_tips",
                  ],
                  additionalProperties: false,
                },
              },
              required: ["success", "analysis"],
              additionalProperties: false,
            },
          },
        },
        temperature: 0.7,
        plugins: [
          {
            id: "file-parser",
            pdf: {
              engine: "native",
            },
          },
        ],
        stream: false,
        // reasoning: {
        //   effort: "high",
        // },
      });

      const result = JSON.parse(completion.choices[0].message.content);

      if (result.success) {
        // Save analysis to database
        const insertObj = {
          userId,
          slug: uuidv4(),
          analysis: JSON.stringify(result.analysis),
          cost: completion.usage.cost || 0,
          access: "private",
        };

        const insertQuery = sqlString.format("INSERT INTO Report SET ?;", [
          insertObj,
        ]);

        const insertResult = await queryAsync(insertQuery);

        if (insertResult.error) {
          return {
            statusCode: 500,
            json: {
              success: false,
              message: "Error saving analysis to database",
            },
          };
        }

        return {
          json: {
            success: true,
            slug: insertObj.slug,
          },
        };
      } else {
        return {
          json: {
            success: false,
            message: "Resume is invalid",
          },
          statusCode: 500,
        };
      }
    } catch (error) {
      console.log(error);

      return {
        json: {
          success: false,
          message: "Failed to process resume",
        },
      };
    }
  }

  static async getResumeAnalysis({ slug, userId }) {
    try {
      if (!slug) {
        return {
          json: {
            success: false,
            message: "Slug is required",
          },
          statusCode: 400,
        };
      }

      const selectQuery = sqlString.format(
        `SELECT * FROM Report WHERE slug = ?;`,
        [slug],
      );

      const selectResult = await queryAsync(selectQuery);

      if (selectResult.error) {
        return {
          statusCode: 500,
          json: {
            success: false,
            message: "Error fetching analysis from database",
          },
        };
      }

      if (!selectResult.length) {
        return {
          json: {
            success: false,
            message: "Analysis not found",
          },
          statusCode: 404,
        };
      }

      const report = selectResult[0];

      if (userId) {
        if (report.userId !== userId && report.access === "private") {
          return {
            json: {
              success: false,
              message: "This analysis is private. Please login to view it.",
            },
          };
        }
      } else {
        if (report.access === "private") {
          return {
            json: {
              success: false,
              message: "This analysis is private. Please login to view it.",
            },
          };
        }
      }

      const analysis = selectResult[0].analysis;

      return {
        json: {
          success: true,
          analysis: analysis,
          visibility: report.access,
          isOwner: userId ? report.userId === userId : false,
        },
      };
    } catch (error) {
      console.log(error);

      return {
        json: {
          success: false,
          message: "Failed to fetch analysis",
        },
      };
    }
  }

  static async updateReportVisibility({ slug, userId, visibility }) {
    try {
      if (!slug) {
        return {
          statusCode: 400,
          json: { success: false, message: "Slug is required" },
        };
      }

      if (!["public", "private"].includes(visibility)) {
        return {
          statusCode: 400,
          json: {
            success: false,
            message: "Visibility must be 'public' or 'private'",
          },
        };
      }

      const selectQuery = sqlString.format(
        `SELECT * FROM Report WHERE slug = ?;`,
        [slug],
      );
      const selectResult = await queryAsync(selectQuery);

      if (selectResult.error || !selectResult.length) {
        return {
          statusCode: 404,
          json: { success: false, message: "Report not found" },
        };
      }

      const report = selectResult[0];

      if (report.userId !== userId) {
        return {
          statusCode: 403,
          json: {
            success: false,
            message: "You are not authorized to update this report",
          },
        };
      }

      const updateQuery = sqlString.format(
        `UPDATE Report SET access = ? WHERE slug = ? AND userId = ?;`,
        [visibility, slug, userId],
      );
      const updateResult = await queryAsync(updateQuery);

      if (updateResult.error) {
        return {
          statusCode: 500,
          json: { success: false, message: "Failed to update visibility" },
        };
      }

      return {
        json: { success: true, visibility },
      };
    } catch (error) {
      console.log(error);
      return {
        json: { success: false, message: "Failed to update visibility" },
      };
    }
  }

  static async getUserReports({ userId }) {
    try {
      const selectQuery = sqlString.format(
        "SELECT slug, analysis, createdAt FROM Report WHERE userId = ? ORDER BY createdAt DESC;",
        [userId],
      );

      const selectResult = await queryAsync(selectQuery);

      if (selectResult.error) {
        return {
          statusCode: 500,
          json: {
            success: false,
            message: "Error fetching reports",
          },
        };
      }

      const reports = selectResult.map((row) => {
        const analysis = row.analysis;
        return {
          slug: row.slug,
          candidateName: analysis.candidate_name || "Unknown",
          targetRole: analysis.inferred_target_role || "Unknown",
          createdAt: row.createdAt,
        };
      });

      return {
        json: {
          success: true,
          reports,
        },
      };
    } catch (error) {
      console.log(error);
      return {
        json: {
          success: false,
          message: "Failed to fetch reports",
        },
      };
    }
  }
}
