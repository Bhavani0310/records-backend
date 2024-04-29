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

exports.handleAddLicenseCertification = async (req, res) => {
    try {
        const {
            certificationName,
            organization,
            doneVia,
            issuedDate,
            expirationDate,
            credentialId,
            credentialURL,
            skills,
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
        const licenseCertification = {
            certificationName,
            organization,
            doneVia,
            issuedDate,
            expirationDate,
            credentialId,
            credentialURL,
            skills,
            verificationId: skipVerification ? null : generatedVerificationId,
        };

        userProfile.licenses_certifications.push(licenseCertification);
        await userProfile.save();

        if (!skipVerification) {
            await Profile_Verification.create({
                userId,
                verificationId: generatedVerificationId,
                verifierEmail: verifierEmail,
                verificationType: "license certification",
            });

            const isEmailSend = await handleSendEmail({
                toAddresses: [verifierEmail],
                source: CommonConstant.email.source.tech_team,
                subject:
                    CommonConstant.email.verificationOfLicenseCertification.subject(
                        userProfile.username,
                        certificationName,
                        credentialId,
                    ),
                htmlData: `<p>Hello Dear Verifier, <br/>Welcome to Record<br/> Click the link to verify the License & Credential details <a href="${process.env.EMAIL_BASE_URL}/verify-work-experience/${generatedVerificationId}">Verfiy Licenses & Credentials</a></p>`,
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
                message:
                    ResponseMessageConstant.LICENSE_CERTIFICATION_ADDED_SUCCESSFULLY,
                data: userProfile,
            });
        }
    } catch (error) {
        console.log(
            ErrorLogConstant.profileController
                .handleAddLicenseCertificationErrorLog,
            error.message,
        );
        res.status(HttpStatusCode.InternalServerError).json({
            status: HttpStatusConstant.ERROR,
            code: HttpStatusCode.InternalServerError,
        });
    }
};

exports.handleUpdateLicenseCertification = async (req, res) => {
    try {
        const { userId } = req.userSession;
        const { licenseCertificationId } = req.params;

        const userProfile = await Profile.findOne({ userId });

        if (!userProfile) {
            return res.status(HttpStatusCode.NotFound).json({
                status: HttpStatusConstant.NOT_FOUND,
                code: HttpStatusCode.NotFound,
                message: ResponseMessageConstant.USER_NOT_FOUND,
            });
        }

        const licenseCertificationToUpdate =
            userProfile.licenses_certifications.find(
                (licert) => licert._id.toString() === licenseCertificationId,
            );

        if (!licenseCertificationToUpdate) {
            return res.status(HttpStatusCode.NotFound).json({
                status: HttpStatusConstant.NOT_FOUND,
                code: HttpStatusCode.NotFound,
                message:
                    ResponseMessageConstant.LICENSE_CERTIFICATION_NOT_FOUND,
            });
        }

        const verificationId = licenseCertificationToUpdate.verificationId;

        const {
            certificationName,
            organization,
            doneVia,
            issuedDate,
            expirationDate,
            credentialId,
            credentialURL,
            skills,
            verifierEmail,
        } = req.body;

        let skipVerification = false;
        if (!verifierEmail && !verificationId) {
            skipVerification = true;
        }

        const generatedVerificationId = generateUUID();

        licenseCertificationToUpdate.certificationName = certificationName;
        licenseCertificationToUpdate.organization = organization;
        licenseCertificationToUpdate.doneVia = doneVia;
        licenseCertificationToUpdate.issuedDate = issuedDate;
        licenseCertificationToUpdate.expirationDate = expirationDate;
        licenseCertificationToUpdate.credentialId = credentialId;
        licenseCertificationToUpdate.credentialURL = credentialURL;
        licenseCertificationToUpdate.skills = skills;
        if (!skipVerification && !verificationId) {
            licenseCertificationToUpdate.verificationId =
                generatedVerificationId;
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
                    verificationType: "license certification",
                });
            } else {
                const profileVerificationResponse =
                    await Profile_Verification.findOne({ verificationId });
                // handle if profile verification response not found
                toAddressEmail = profileVerificationResponse.verifierEmail;
            }

            const isEmailSend = await handleSendEmail({
                toAddresses: [toAddressEmail],
                source: CommonConstant.email.source.tech_team,
                subject:
                    CommonConstant.email.verificationOfLicenseCertification.subject(
                        userProfile.username,
                        certificationName,
                        credentialId,
                    ),
                htmlData: `<p>Hello Dear Verifier, <br/>Welcome to Record<br/> Click the link to verify the License & Credential details <a href="${process.env.EMAIL_BASE_URL}/verify-work-experience/${generatedVerificationId}">Verfiy Licenses & Credentials</a></p>`,
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
                message:
                    ResponseMessageConstant.LICENSE_CERTIFICATION_UPDATED_SUCCESSFULLY,
                profile: userProfile,
            });
        }
    } catch (error) {
        console.log(
            ErrorLogConstant.profileController
                .handleUpdateLicenseCertificationErrorLog,
            error.message,
        );
        res.status(HttpStatusCode.InternalServerError).json({
            status: HttpStatusConstant.ERROR,
            code: HttpStatusCode.InternalServerError,
        });
    }
};
