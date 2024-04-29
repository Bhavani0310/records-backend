const Joi = require("joi");

// Importing models
const Profile = require("../models/profile.model");
const User = require("../models/user.model");
const Profile_Verification = require("../models/profile_verification.model");

// Importing Constants
const HttpStatusConstant = require("../constants/http-message.constant");
const HttpStatusCode = require("../constants/http-code.constant");
const ResponseMessageConstant = require("../constants/response-message.constant");
const CommonConstant = require("../constants/common.constant");
const ErrorLogConstant = require("../constants/error-log.constant");

// Importing Helpers
const generateUUID = require("../helpers/uuid.helper");

// Importing Controllers
const handleSendEmail = require("./email.controller");

exports.handleAddEducation = async (req, res) => {
    try {
        const {
            degree,
            institution,
            branch,
            rollNumber,
            startMonthYear,
            endMonthYear,
            grade,
            activitiesRoles,
            verifierEmail,
        } = req.body;

        // Do Joi Validation

        let skipVerification = false;
        if (!verifierEmail) {
            skipVerification = true;
        }

        const { userId } = req.userSession;

        const userProfile = await Profile.findOne({ userId });

        if (!userProfile) {
            return res.status(HttpStatusCode.NotFound).json({
                status: HttpStatusConstant.NOT_FOUND,
                code: HttpStatusCode.NotFound,
                message: ResponseMessageConstant.USER_NOT_FOUND,
            });
        }
        const generatedVerificationId = generateUUID();
        const education = {
            degree,
            institution,
            branch,
            rollNumber,
            startMonthYear,
            endMonthYear,
            grade,
            activitiesRoles,
            verificationId: skipVerification ? null : generatedVerificationId,
        };

        userProfile.educations.push(education);
        await userProfile.save();

        if (!skipVerification) {
            await Profile_Verification.create({
                userId,
                verificationId: generatedVerificationId,
                verifierEmail: verifierEmail,
                verificationType: "education",
            });

            const isEmailSend = await handleSendEmail({
                toAddresses: [verifierEmail],
                source: CommonConstant.email.source.tech_team,
                subject: CommonConstant.email.verificationOfEducation.subject(
                    userProfile.username,
                    degree,
                ),
                htmlData: `<p>Hello Dear Verifier, <br/>Welcome to Record<br/> Click the link to verify the education details <a href="${process.env.EMAIL_BASE_URL}/verify-education/${generatedVerificationId}">Verfiy Education</a></p>`,
            });

            if (isEmailSend) {
                return res.status(HttpStatusCode.Ok).json({
                    status: HttpStatusConstant.OK,
                    code: HttpStatusCode.Ok,
                    message:
                        ResponseMessageConstant.VERIFICATION_EMAIL_SENT_SUCCESSFULLY,
                    data: userProfile,
                });
            } else {
                return res.status(HttpStatusCode.InternalServerError).json({
                    status: HttpStatusConstant.ERROR,
                    code: HttpStatusCode.InternalServerError,
                    message:
                        ResponseMessageConstant.VERIFICATION_EMAIL_SENT_FAILED,
                });
            }
        } else {
            return res.status(HttpStatusCode.Ok).json({
                status: HttpStatusConstant.OK,
                code: HttpStatusCode.Ok,
                message: ResponseMessageConstant.EDUCATION_ADDED_SUCCESSFULLY,
                data: userProfile,
            });
        }
    } catch (error) {
        console.log(
            ErrorLogConstant.profileController.handleAddEducationErrorLog,
            error.message,
        );
        res.status(HttpStatusCode.InternalServerError).json({
            status: HttpStatusConstant.ERROR,
            code: HttpStatusCode.InternalServerError,
        });
    }
};

exports.handleUpdateEducation = async (req, res) => {
    try {
        const { userId } = req.userSession;
        const { educationId } = req.params;

        const userProfile = await Profile.findOne({ userId });

        if (!userProfile) {
            return res.status(HttpStatusCode.NotFound).json({
                status: HttpStatusConstant.NOT_FOUND,
                code: HttpStatusCode.NotFound,
                message: ResponseMessageConstant.USER_NOT_FOUND,
            });
        }

        const educationToUpdate = userProfile.educations.find(
            (edu) => edu._id.toString() === educationId,
        );

        if (!educationToUpdate) {
            return res.status(HttpStatusCode.NotFound).json({
                status: HttpStatusConstant.NOT_FOUND,
                code: HttpStatusCode.NotFound,
                message: ResponseMessageConstant.EDUCATION_NOT_FOUND,
            });
        }

        const verificationId = educationToUpdate.verificationId;

        const {
            degree,
            institution,
            branch,
            rollNumber,
            startMonthYear,
            endMonthYear,
            grade,
            activitiesRoles,
            verifierEmail,
        } = req.body;

        let skipVerification = false;
        if (!verifierEmail && !verificationId) {
            skipVerification = true;
        }

        const generatedVerificationId = generateUUID();

        educationToUpdate.degree = degree;
        educationToUpdate.institution = institution;
        educationToUpdate.branch = branch;
        educationToUpdate.rollNumber = rollNumber;
        educationToUpdate.startMonthYear = startMonthYear;
        educationToUpdate.endMonthYear = endMonthYear;
        educationToUpdate.grade = grade;
        educationToUpdate.activitiesRoles = activitiesRoles;
        if (!skipVerification && !verificationId) {
            educationToUpdate.verificationId = generatedVerificationId;
        }

        await userProfile.save();

        if (!skipVerification) {
            let toAddressEmail;

            if (!verificationId) {
                toAddressEmail = verifierEmail;
                await Profile_Verification.create({
                    userId,
                    verificationId: generatedVerificationId,
                    verifierEmail: verifierEmail,
                    verificationType: "education",
                });
            } else {
                const profileVerificationResponse =
                    await Profile_Verification.findOne({ verificationId });
                // handle if profile verification response not found
                toAddressEmail = profileVerificationResponse.verifierEmail;
            }
            console.log(toAddressEmail);
            const isEmailSend = await handleSendEmail({
                toAddresses: [toAddressEmail],
                source: CommonConstant.email.source.tech_team,
                subject: CommonConstant.email.verificationOfEducation.subject(
                    userProfile.username,
                    degree,
                ),
                htmlData: `<p>Hello Dear Verifier, <br/>Welcome to Record<br/> Click the link to verify the education details <a href="${process.env.EMAIL_BASE_URL}/verify-education/${generatedVerificationId}">Verfiy Education</a></p>`,
            });

            if (isEmailSend) {
                return res.status(HttpStatusCode.Ok).json({
                    status: HttpStatusConstant.OK,
                    code: HttpStatusCode.Ok,
                    message:
                        ResponseMessageConstant.VERIFICATION_EMAIL_SENT_SUCCESSFULLY,
                    data: userProfile,
                });
            } else {
                return res.status(HttpStatusCode.InternalServerError).json({
                    status: HttpStatusConstant.ERROR,
                    code: HttpStatusCode.InternalServerError,
                    message:
                        ResponseMessageConstant.VERIFICATION_EMAIL_SENT_FAILED,
                });
            }
        } else {
            res.status(HttpStatusCode.Ok).json({
                status: HttpStatusConstant.SUCCESS,
                code: HttpStatusCode.Ok,
                message: ResponseMessageConstant.PROFILE_UPDATED_SUCCESSFULLY,
                profile: userProfile,
            });
        }
    } catch (error) {
        console.log(
            ErrorLogConstant.profileController.handleUpdateEducationErrorLog,
            error.message,
        );
        res.status(HttpStatusCode.InternalServerError).json({
            status: HttpStatusConstant.ERROR,
            code: HttpStatusCode.InternalServerError,
        });
    }
};
