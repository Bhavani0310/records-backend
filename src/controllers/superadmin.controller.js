const Joi = require("joi");
const bcrypt = require("bcryptjs");

// Importing Models
const SuperAdmin = require("../models/superadmin.model");
const jwtToken = require("../models/jwt-token.model");
const PasswordResetToken = require("../models/password-reset-token.model");
const Institution = require("../models/institution.model");
const Department = require("../models/department.model");
const Staff = require("../models/staff.model");

// Importing Constants
const HttpStatusConstant = require("../constants/http-message.constant");
const HttpStatusCode = require("../constants/http-code.constant");
const ResponseMessageConstant = require("../constants/response-message.constant");
const CommonConstant = require("../constants/common.constant");
const ErrorLogConstant = require("../constants/error-log.constant");

// Importing Helpers
const generateUUID = require("../helpers/uuid.helper");
const { signToken, verifyToken } = require("../helpers/jwt.helper");
const getRecordSignature = require("../helpers/cookie.helper");

// Importing Controllers
const handleSendEmail = require("./email.controller");

// Importing Utils
const emailTemplates = require("../utils/emailTemplates");

exports.handleAddSuperAdmin = async (req, res) => {
    try {
        const { fullName, mobile, email } = req.body;

        const userValidation = Joi.object({
            fullName: Joi.string().required(),
            mobile: Joi.string().required(),
            email: Joi.string().email().required(),
        });

        const { error } = userValidation.validate(req.body);

        if (error) {
            return res.status(HttpStatusCode.BadRequest).json({
                status: HttpStatusConstant.BAD_REQUEST,
                code: HttpStatusCode.BadRequest,
                message: error.details[0].message.replace(/"/g, ""),
            });
        }

        const superAdminExists = await SuperAdmin.findOne({ email });

        if (superAdminExists) {
            res.status(HttpStatusCode.Conflict).json({
                status: HttpStatusConstant.CONFLICT,
                code: HttpStatusCode.Conflict,
                message: ResponseMessageConstant.SUPER_ADMIN_ALREADY_EXISTS,
            });
        } else {
            const password = "superadmin123";
            const encryptedPassword = await bcrypt.hash(password, 10);
            const generatedStaffId = generateUUID();

            await SuperAdmin.create({
                superAdminId: generatedStaffId,
                fullName,
                mobile,
                email,
                password: encryptedPassword,
            });

            res.status(HttpStatusCode.Created).json({
                status: HttpStatusConstant.CREATED,
                code: HttpStatusCode.Created,
            });
        }
    } catch (error) {
        console.log(
            ErrorLogConstant.superadminController.handleAddSuperAdminErrorLog,
            error.message,
        );
        res.status(HttpStatusCode.InternalServerError).json({
            status: HttpStatusConstant.ERROR,
            code: HttpStatusCode.InternalServerError,
        });
    }
};

exports.handleSuperAdminLogin = async (req, res) => {
    try {
        const { email, password } = req.body;

        const userValidation = Joi.object({
            email: Joi.string().email().required(),
            password: Joi.string().required(),
        });

        const { error } = userValidation.validate(req.body);

        if (error) {
            return res.status(HttpStatusCode.BadRequest).json({
                status: HttpStatusConstant.BAD_REQUEST,
                code: HttpStatusCode.BadRequest,
                message: error.details[0].message.replace(/"/g, ""),
            });
        }

        const superAdmin = await SuperAdmin.findOne({
            email,
        });

        if (!superAdmin) {
            return res.status(HttpStatusCode.NotFound).json({
                status: HttpStatusConstant.NOT_FOUND,
                code: HttpStatusCode.NotFound,
                message: ResponseMessageConstant.SUPER_ADMIN_NOT_FOUND,
            });
        } else {
            const isValidPassword = await bcrypt.compare(
                password,
                superAdmin.password,
            );

            if (isValidPassword) {
                const { email, role, superAdminId } = superAdmin;
                const generatedAccessToken = await signToken({
                    superAdminId,
                    email,
                    role,
                });
                res.cookie(
                    CommonConstant.signatureCookieName,
                    generatedAccessToken,
                    {
                        maxAge: 86400000,
                        httpOnly: false,
                        secure: true,
                        sameSite: "none",
                    },
                )
                    .status(HttpStatusCode.Ok)
                    .json({
                        status: HttpStatusConstant.OK,
                        code: HttpStatusCode.Ok,
                    });
            } else {
                res.status(HttpStatusCode.Unauthorized).json({
                    status: HttpStatusConstant.UNAUTHORIZED,
                    code: HttpStatusCode.Unauthorized,
                    message: ResponseMessageConstant.INVALID_CREDENTIALS,
                });
            }
        }
    } catch (error) {
        console.log(
            ErrorLogConstant.superadminController.handleSuperAdminLoginErrorLog,
            error.message,
        );
        res.status(HttpStatusCode.InternalServerError).json({
            status: HttpStatusConstant.ERROR,
            code: HttpStatusCode.InternalServerError,
        });
    }
};

exports.handleSuperAdminLogout = async (req, res) => {
    try {
        const accessToken = getRecordSignature(req.headers.cookie);

        await jwtToken.findOneAndDelete({
            jwtTokenId: accessToken,
        });

        res.clearCookie(CommonConstant.signatureCookieName, {
            secure: true,
            sameSite: "none",
        })
            .status(HttpStatusCode.Ok)
            .json({
                status: HttpStatusConstant.OK,
                code: HttpStatusCode.Ok,
            });
    } catch (error) {
        console.log(
            ErrorLogConstant.superadminController
                .handleSuperAdminLogoutErrorLog,
            error.message,
        );
        res.status(HttpStatusCode.InternalServerError).json({
            status: HttpStatusConstant.ERROR,
            code: HttpStatusCode.InternalServerError,
        });
    }
};

exports.handleSuperAdminForgotPassword = async (req, res) => {
    try {
        const { email } = req.body;

        const userValidation = Joi.object({
            email: Joi.string().email().required(),
        });

        const { error } = userValidation.validate(req.body);

        if (error) {
            return res.status(HttpStatusCode.BadRequest).json({
                status: HttpStatusConstant.BAD_REQUEST,
                code: HttpStatusCode.BadRequest,
                message: error.details[0].message.replace(/"/g, ""),
            });
        }

        const superAdmin = await SuperAdmin.findOne({
            email,
        });

        if (!superAdmin) {
            return res.status(HttpStatusCode.NotFound).json({
                status: HttpStatusConstant.NOT_FOUND,
                code: HttpStatusCode.NotFound,
                message: ResponseMessageConstant.SUPER_ADMIN_NOT_FOUND,
            });
        }

        const superAdminId = superAdmin.superAdminId;

        const checkIsPasswordResetTokenExists =
            await PasswordResetToken.findOne({
                userId: superAdminId,
            });

        let passwordResetAccessTokenId;

        if (checkIsPasswordResetTokenExists) {
            passwordResetAccessTokenId =
                checkIsPasswordResetTokenExists.passwordResetTokenId;
        } else {
            const passwordResetTokenResponse = await PasswordResetToken.create({
                passwordResetTokenId: generateUUID(),
                userId: superAdminId,
            });
            passwordResetAccessTokenId =
                passwordResetTokenResponse.passwordResetTokenId;
        }

        const isEmailSend = await handleSendEmail({
            toAddresses: [email],
            source: CommonConstant.email.source.tech_team,
            subject: CommonConstant.email.resetPasswordEmail.subject,
            htmlData: emailTemplates.forgotPasswordSuperAdmin(
                passwordResetAccessTokenId,
            ),
        });

        if (isEmailSend) {
            return res.status(HttpStatusCode.Ok).json({
                status: HttpStatusConstant.OK,
                code: HttpStatusCode.Ok,
                message:
                    ResponseMessageConstant.PASSWORD_RESET_EMAIL_SENT_SUCCESSFULLY,
            });
        } else {
            return res.status(HttpStatusCode.InternalServerError).json({
                status: HttpStatusConstant.ERROR,
                code: HttpStatusCode.InternalServerError,
                message:
                    ResponseMessageConstant.PASSWORD_RESET_EMAIL_SENT_FAILED,
            });
        }
    } catch (error) {
        console.log(
            ErrorLogConstant.superadminController
                .handleSuperAdminForgotPasswordErrorLog,
            error.message,
        );
        res.status(HttpStatusCode.InternalServerError).json({
            status: HttpStatusConstant.ERROR,
            code: HttpStatusCode.InternalServerError,
        });
    }
};

exports.handleSuperAdminResetPassword = async (req, res) => {
    try {
        const { password_reset_token } = req.params;

        const userValidation = Joi.object({
            password_reset_token: Joi.string().required(),
        });

        const { error } = userValidation.validate(req.params);

        if (error) {
            return res.status(HttpStatusCode.BadRequest).json({
                status: HttpStatusConstant.BAD_REQUEST,
                code: HttpStatusCode.BadRequest,
                message: error.details[0].message.replace(/"/g, ""),
            });
        }

        const checkIsPasswordResetTokenExists =
            await PasswordResetToken.findOne({
                passwordResetTokenId: password_reset_token,
            });

        if (!checkIsPasswordResetTokenExists) {
            return res.status(HttpStatusCode.NotFound).json({
                status: HttpStatusConstant.NOT_FOUND,
                code: HttpStatusCode.NotFound,
                message: ResponseMessageConstant.PASSWORD_RESET_TOKEN_NOT_FOUND,
            });
        } else {
            const { userId } = checkIsPasswordResetTokenExists;

            const superAdmin = await SuperAdmin.findOne({
                superAdminId: userId,
            });

            if (!superAdmin) {
                return res.status(HttpStatusCode.NotFound).json({
                    status: HttpStatusConstant.NOT_FOUND,
                    code: HttpStatusCode.NotFound,
                    message: ResponseMessageConstant.SUPER_ADMIN_NOT_FOUND,
                });
            } else {
                const { password } = req.body;

                const encryptedPassword = await bcrypt.hash(password, 10);
                superAdmin.password = encryptedPassword;

                await superAdmin.save();

                await PasswordResetToken.findOneAndDelete({
                    passwordResetTokenId: password_reset_token,
                });

                res.status(HttpStatusCode.Ok).json({
                    status: HttpStatusConstant.OK,
                    code: HttpStatusCode.Ok,
                    message:
                        ResponseMessageConstant.PASSWORD_CHANGED_SUCCESSFULLY,
                });
            }
        }
    } catch (error) {
        console.log(
            ErrorLogConstant.superadminController
                .handleSuperAdminResetPasswordErrorLog,
            error.message,
        );
        return res.status(HttpStatusCode.InternalServerError).json({
            status: HttpStatusConstant.ERROR,
            code: HttpStatusCode.InternalServerError,
        });
    }
};

exports.handleAddAdministrativeDepartment = async (req, res) => {
    try {
        const { institutionId } = req.body;

        const institution = await Institution.findOne({ institutionId });

        if (!institution) {
            return res.status(HttpStatusCode.NotFound).json({
                status: HttpStatusConstant.NOT_FOUND,
                code: HttpStatusCode.NotFound,
                message: ResponseMessageConstant.INSTITUTION_NOT_FOUND,
            });
        }

        const name = "Administrative";

        const checkDepartmentExists = await Department.findOne({
            institutionId,
            name,
        });

        if (checkDepartmentExists) {
            return res.status(HttpStatusCode.Conflict).json({
                status: HttpStatusConstant.CONFLICT,
                code: HttpStatusCode.Conflict,
                message: ResponseMessageConstant.DEPARTMENT_ALREADY_EXISTS,
            });
        }

        const departmentId = generateUUID();

        const department = await Department.create({
            institutionId,
            departmentId,
            name,
        });

        return res.status(HttpStatusCode.Created).json({
            status: HttpStatusConstant.CREATED,
            code: HttpStatusCode.Created,
            data: department,
        });
    } catch (error) {
        console.log(
            ErrorLogConstant.superadminController
                .handleAddAdministrativeDepartmentErrorLog,
            error.message,
        );
        res.status(HttpStatusCode.InternalServerError).json({
            status: HttpStatusConstant.ERROR,
            code: HttpStatusCode.InternalServerError,
        });
    }
};

exports.handleAddAdminForInstitution = async (req, res) => {
    try {
        const { institutionId, departmentId, fullName, email, mobile } =
            req.body;

        const userValidation = Joi.object({
            departmentId: Joi.string().required(),
            institutionId: Joi.string().required(),
            fullName: Joi.string().required(),
            email: Joi.string().email().required(),
            mobile: Joi.string().required(),
        });

        const { error } = userValidation.validate(req.body);

        if (error) {
            return res.status(HttpStatusCode.BadRequest).json({
                status: HttpStatusConstant.BAD_REQUEST,
                code: HttpStatusCode.BadRequest,
                message: error.details[0].message.replace(/"/g, ""),
            });
        }

        const institution = await Institution.findOne({ institutionId });
        if (!institution) {
            return res.status(HttpStatusCode.NotFound).json({
                status: HttpStatusConstant.NOT_FOUND,
                code: HttpStatusCode.NotFound,
                message: ResponseMessageConstant.INSTITUTION_NOT_FOUND,
            });
        }

        const department = await Department.findOne({
            institutionId,
            departmentId,
        });
        if (!department) {
            return res.status(HttpStatusCode.NotFound).json({
                status: HttpStatusConstant.NOT_FOUND,
                code: HttpStatusCode.NotFound,
                message: ResponseMessageConstant.DEPARTMENT_NOT_FOUND,
            });
        }

        if (department.name !== "Administrative") {
            return res.status(HttpStatusCode.Conflict).json({
                status: HttpStatusConstant.CONFLICT,
                code: HttpStatusCode.Conflict,
                message: ResponseMessageConstant.INVALID_ROLE_FOR_DEPARTMENT,
            });
        }

        const staffExists = await Staff.findOne({
            institutionId,
            departmentId,
            email,
        });

        if (staffExists) {
            return res.status(HttpStatusCode.Conflict).json({
                status: HttpStatusConstant.CONFLICT,
                code: HttpStatusCode.Conflict,
                message: ResponseMessageConstant.STAFF_ALREADY_EXISTS,
            });
        }

        const password = "admin123";
        const encryptedPassword = await bcrypt.hash(password, 10);
        const generatedStaffId = generateUUID();

        await Staff.create({
            staffId: generatedStaffId,
            institutionId,
            departmentId,
            role: "Administrator",
            fullName,
            designation: "Administrative",
            email,
            mobile,
            password: encryptedPassword,
        });

        res.status(HttpStatusCode.Created).json({
            status: HttpStatusConstant.CREATED,
            code: HttpStatusCode.Created,
            message: ResponseMessageConstant.STAFF_CREATED_SUCCESSFULLY,
        });
    } catch (error) {
        console.log(
            ErrorLogConstant.superadminController
                .handleAddAdminForInstitutionErrorLog,
            error.message,
        );
        res.status(HttpStatusCode.InternalServerError).json({
            status: HttpStatusConstant.ERROR,
            code: HttpStatusCode.InternalServerError,
        });
    }
};
