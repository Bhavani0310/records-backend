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
const ErrorLogConstant = require("../constants/error-log.constant");

exports.handleVerifyEducation = async (req, res) => {
    try {
        const { verificationId } = req.params;

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

        if (verification.verified) {
            return res.status(HttpStatusCode.Conflict).json({
                status: HttpStatusConstant.CONFLICT,
                code: HttpStatusCode.Conflict,
                message: ResponseMessageConstant.VERIFICATION_ALREADY_DONE,
            });
        }

        const education = await Education.findOne({ verificationId });
        if (!education) {
            return res.status(HttpStatusCode.NotFound).json({
                status: HttpStatusConstant.NOT_FOUND,
                code: HttpStatusCode.NotFound,
                message: ResponseMessageConstant.EDUCATION_NOT_FOUND,
            });
        }

        education.verified = true;
        education.save();

        verification.verified = true;
        verification.save();

        res.status(HttpStatusCode.Ok).json({
            status: HttpStatusConstant.SUCCESS,
            code: HttpStatusCode.Ok,
            message: ResponseMessageConstant.VERIFICATION_DONE_SUCCESSFULLY,
        });
    } catch (error) {
        console.log(
            ErrorLogConstant.verificationController
                .handleVerifyEducationErrorLog,
            error.message,
        );
        res.status(HttpStatusCode.InternalServerError).json({
            status: HttpStatusConstant.ERROR,
            code: HttpStatusCode.InternalServerError,
        });
    }
};

exports.handleGetVerifyEducationDetails = async (req, res) => {
    try {
        const { verificationId } = req.params;

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

        const education = await Education.findOne({ verificationId });
        if (!education) {
            return res.status(HttpStatusCode.NotFound).json({
                status: HttpStatusConstant.NOT_FOUND,
                code: HttpStatusCode.NotFound,
                message: ResponseMessageConstant.EDUCATION_NOT_FOUND,
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

        const educationResponse = {
            userId: user.userId,
            userName: user.username,
            educationId: education.educationId,
            degree: education.degree,
            institution: education.institution,
            branch: education.branch,
            degree: education.degree,
            startMonthYear: education.startMonthYear,
            endMonthYear: education.endMonthYear,
            grade: education.grade,
            activitiesRoles: education.activitiesRoles,
        };
        return res.status(HttpStatusCode.Ok).json({
            status: HttpStatusConstant.OK,
            code: HttpStatusCode.Ok,
            data: educationResponse,
        });
    } catch (error) {
        console.log(
            ErrorLogConstant.verificationController
                .handleGetVerifyEducationDetailsErrorLog,
            error.message,
        );
        res.status(HttpStatusCode.InternalServerError).json({
            status: HttpStatusConstant.ERROR,
            code: HttpStatusCode.InternalServerError,
        });
    }
};
