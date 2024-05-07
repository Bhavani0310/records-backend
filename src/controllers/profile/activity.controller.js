const Joi = require("joi");

// Importing models
const Activity = require("../../models/profile/activity.model");
const User = require("../../models/user.model");
const Profile_Verification = require("../../models/profile_verification.model");
const Staff = require("../../models/staff.model");

// Importing Constants
const HttpStatusConstant = require("../../constants/http-message.constant");
const HttpStatusCode = require("../../constants/http-code.constant");
const ResponseMessageConstant = require("../../constants/response-message.constant");
const CommonConstant = require("../../constants/common.constant");
const ErrorLogConstant = require("../../constants/error-log.constant");

// Importing Helpers
const generateUUID = require("../../helpers/uuid.helper");

// Importing Controllers
const handleSendEmail = require("../email.controller");

// Importing Utils
const emailTemplates = require("../../utils/emailTemplates");

exports.handleAddActivity = async (req, res) => {
    try {
        const {
            activityName,
            organisation,
            activityType,
            startDate,
            endDate,
            description,
            verifierEmail,
        } = req.body;

        // Do Joi Validation

        let skipVerification = false;
        if (!verifierEmail) {
            skipVerification = true;
        }

        const { userId } = req.userSession;

        const userProfile = await User.findOne({ userId });

        if (!userProfile) {
            return res.status(HttpStatusCode.NotFound).json({
                status: HttpStatusConstant.NOT_FOUND,
                code: HttpStatusCode.NotFound,
                message: ResponseMessageConstant.USER_NOT_FOUND,
            });
        }
        const generatedVerificationId = generateUUID();

        await Activity.create({
            userId,
            activityId: generateUUID(),
            activityName,
            organisation,
            activityType,
            startDate,
            endDate,
            description,
            verifierEmail,
            verificationId: skipVerification ? null : generatedVerificationId,
        });

        if (!skipVerification) {
            const staff = await Staff.findOne({ email: verifierEmail });
            if (!staff) {
                return res.status(HttpStatusCode.NotFound).json({
                    status: HttpStatusConstant.NOT_FOUND,
                    code: HttpStatusCode.NotFound,
                    message: ResponseMessageConstant.STAFF_NOT_FOUND,
                });
            }
            await Profile_Verification.create({
                userId,
                verificationId: generatedVerificationId,
                verifierEmail: verifierEmail,
                verificationType: "activity",
            });

            const isEmailSend = await handleSendEmail({
                toAddresses: [verifierEmail],
                source: CommonConstant.email.source.tech_team,
                subject: CommonConstant.email.verificationOfActivity.subject(
                    userProfile.fullName,
                    activityName,
                    organisation,
                ),
                htmlData: emailTemplates.activityVerificationRequest(
                    "Activity",
                    userProfile.fullName,
                    activityName,
                    organisation,
                    "localhost:3000",
                ),
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
                message: ResponseMessageConstant.ACTIVITY_ADDED_SUCCESSFULLY,
                data: userProfile,
            });
        }
    } catch (error) {
        console.log(
            ErrorLogConstant.profileController.handleAddActivityErrorLog,
            error.message,
        );
        res.status(HttpStatusCode.InternalServerError).json({
            status: HttpStatusConstant.ERROR,
            code: HttpStatusCode.InternalServerError,
        });
    }
};

exports.handleUpdateActivity = async (req, res) => {
    try {
        const { userId } = req.userSession;
        const { activityId } = req.params;

        const userProfile = await User.findOne({ userId });

        if (!userProfile) {
            return res.status(HttpStatusCode.NotFound).json({
                status: HttpStatusConstant.NOT_FOUND,
                code: HttpStatusCode.NotFound,
                message: ResponseMessageConstant.USER_NOT_FOUND,
            });
        }

        const activityToUpdate = await Activity.findOne({ activityId });

        if (!activityToUpdate) {
            return res.status(HttpStatusCode.NotFound).json({
                status: HttpStatusConstant.NOT_FOUND,
                code: HttpStatusCode.NotFound,
                message: ResponseMessageConstant.ACTIVITY_NOT_FOUND,
            });
        }

        const verificationId = activityToUpdate.verificationId;

        const {
            activityName,
            organisation,
            activityType,
            startDate,
            endDate,
            description,
            verifierEmail,
        } = req.body;

        let skipVerification = false;
        if (!verifierEmail && !verificationId) {
            skipVerification = true;
        }

        const generatedVerificationId = generateUUID();

        activityToUpdate.activityName = activityName;
        activityToUpdate.organisation = organisation;
        activityToUpdate.activityType = activityType;
        activityToUpdate.startDate = startDate;
        activityToUpdate.endDate = endDate;
        activityToUpdate.description = description;

        if (!skipVerification && !verificationId) {
            activityToUpdate.verificationId = generatedVerificationId;
        }

        await activityToUpdate.save();

        if (!skipVerification) {
            let toAddressEmail;

            if (!verificationId) {
                toAddressEmail = verifierEmail;
                const staff = await Staff.findOne({ email: toAddressEmail });
                if (!staff) {
                    return res.status(HttpStatusCode.NotFound).json({
                        status: HttpStatusConstant.NOT_FOUND,
                        code: HttpStatusCode.NotFound,
                        message: ResponseMessageConstant.STAFF_NOT_FOUND,
                    });
                }
                await Profile_Verification.create({
                    userId,
                    verificationId: generatedVerificationId,
                    verifierEmail: verifierEmail,
                    verificationType: "activity",
                });
            } else {
                const profileVerificationResponse =
                    await Profile_Verification.findOne({ verificationId });
                // handle if profile verification response not found
                toAddressEmail = profileVerificationResponse.verifierEmail;
                const staff = await Staff.findOne({ email: toAddressEmail });
                if (!staff) {
                    return res.status(HttpStatusCode.NotFound).json({
                        status: HttpStatusConstant.NOT_FOUND,
                        code: HttpStatusCode.NotFound,
                        message: ResponseMessageConstant.STAFF_NOT_FOUND,
                    });
                }
            }

            const isEmailSend = await handleSendEmail({
                toAddresses: [toAddressEmail],
                source: CommonConstant.email.source.tech_team,
                subject: CommonConstant.email.verificationOfActivity.subject(
                    userProfile.fullName,
                    activityName,
                    organisation,
                ),
                htmlData: emailTemplates.activityVerificationRequest(
                    "Activity",
                    userProfile.fullName,
                    activityName,
                    organisation,
                    "localhost:3000",
                ),
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
                message: ResponseMessageConstant.ACTIVITY_UPDATED_SUCCESSFULLY,
                profile: userProfile,
            });
        }
    } catch (error) {
        console.log(
            ErrorLogConstant.profileController.handleUpdateActivityErrorLog,
            error.message,
        );
        res.status(HttpStatusCode.InternalServerError).json({
            status: HttpStatusConstant.ERROR,
            code: HttpStatusCode.InternalServerError,
        });
    }
};
