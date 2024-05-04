const Joi = require("joi");

// Importing models
const User = require("../models/user.model");
const Education = require("../models/profile/education.model");
const Skill = require("../models/skill.model");
const SkillCategory = require("../models/skill-category.model");
const Profile_Verification = require("../models/profile_verification.model");

// Importing Constants
const HttpStatusConstant = require("../constants/http-message.constant");
const HttpStatusCode = require("../constants/http-code.constant");
const ResponseMessageConstant = require("../constants/response-message.constant");
const CommonConstant = require("../constants/common.constant");
const ErrorLogConstant = require("../constants/error-log.constant");

// Importing Controllers
const handleSendEmail = require("./email.controller");

// Importing Utils
const emailTemplates = require("../utils/emailTemplates");

exports.handleEducationRevision = async (req, res) => {
    try {
        const { verificationId } = req.params;

        const { comment } = req.body;

        const verification = await Profile_Verification.findOne({
            verificationId,
        });

        if (!verification) {
            return res.status(HttpStatusCode.NotFound).json({
                status: HttpStatusConstant.NOT_FOUND,
                code: HttpStatusCode.NotFound,
                message: ResponseMessageConstant.VERIFICATION_DETAILS_NOT_FOUND,
            });
        }

        const user = await User.findOne({ userId: verification.userId });

        if (!user) {
            return res.status(HttpStatusCode.NotFound).json({
                status: HttpStatusConstant.NOT_FOUND,
                code: HttpStatusCode.NotFound,
                message: ResponseMessageConstant.USER_NOT_FOUND,
            });
        }

        verification.revisions.push({
            revisionDate: new Date(),
            comments: comment,
        });
        await verification.save();

        const isEmailSend = await handleSendEmail({
            toAddresses: [user.email],
            source: CommonConstant.email.source.tech_team,
            subject: CommonConstant.email.educationRevisionRequest.subject,
            htmlData: emailTemplates.revisionRequest(
                "Education",
                user.username,
                comment,
                "localhost:3000",
            ),
        });

        if (!isEmailSend) {
            return res.status(HttpStatusCode.InternalServerError).json({
                status: HttpStatusConstant.ERROR,
                code: HttpStatusCode.InternalServerError,
                message: ResponseMessageConstant.VERIFICATION_EMAIL_SENT_FAILED,
            });
        }

        return res.status(HttpStatusCode.Ok).json({
            status: HttpStatusConstant.OK,
            code: HttpStatusCode.Ok,
            message: ResponseMessageConstant.REVISION_EMAIL_SENT_SUCCESSFULLY,
        });
    } catch (error) {
        console.log(
            ErrorLogConstant.revisionController.handleEducationRevisionErrorLog,
            error.message,
        );
        res.status(HttpStatusCode.InternalServerError).json({
            status: HttpStatusConstant.ERROR,
            code: HttpStatusCode.InternalServerError,
        });
    }
};
