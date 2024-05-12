const Joi = require("joi");
const bcrypt = require("bcryptjs");

// Importing Models
const User = require("../models/user.model");
const Staff = require("../models/staff.model");
const jwtToken = require("../models/jwt-token.model");
const PasswordResetToken = require("../models/password-reset-token.model");
const Institution = require("../models/institution.model");
const Department = require("../models/department.model");

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

exports.handleAddStaff = async (req, res) => {
    try {
        const { departmentId, fullName, email, role } = req.body;

        const userValidation = Joi.object({
            departmentId: Joi.string().required(),
            fullName: Joi.string().required(),
            email: Joi.string().email().required(),
            role: Joi.string().required(),
        });

        const { error } = userValidation.validate(req.body);

        if (error) {
            return res.status(HttpStatusCode.BadRequest).json({
                status: HttpStatusConstant.BAD_REQUEST,
                code: HttpStatusCode.BadRequest,
                message: error.details[0].message.replace(/"/g, ""),
            });
        }

        const { staffId } = req.staffSession;

        const admin = await Staff.findOne({ staffId });

        const institutionId = admin.institutionId;

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

        const staffExists = await Staff.findOne({
            institutionId,
            departmentId,
            email,
        });

        if (staffExists) {
            res.status(HttpStatusCode.Conflict).json({
                status: HttpStatusConstant.CONFLICT,
                code: HttpStatusCode.Conflict,
                message: ResponseMessageConstant.STAFF_ALREADY_EXISTS,
            });
        } else {
            const password = "staff123";
            const encryptedPassword = await bcrypt.hash(password, 10);
            const generatedStaffId = generateUUID();

            const departmentName = department.name;

            if (departmentName === "Administrative") {
                if (role === "Administrator") {
                    await Staff.create({
                        staffId: generatedStaffId,
                        institutionId,
                        departmentId,
                        role,
                        fullName,
                        email,
                        password: encryptedPassword,
                    });
                } else {
                    return res.status(HttpStatusCode.BadRequest).json({
                        status: HttpStatusConstant.BAD_REQUEST,
                        code: HttpStatusCode.BadRequest,
                        message:
                            ResponseMessageConstant.INVALID_ROLE_FOR_DEPARTMENT,
                    });
                }
            } else {
                if (role === "Administrator") {
                    return res.status(HttpStatusCode.BadRequest).json({
                        status: HttpStatusConstant.BAD_REQUEST,
                        code: HttpStatusCode.BadRequest,
                        message:
                            ResponseMessageConstant.INVALID_ROLE_FOR_DEPARTMENT,
                    });
                } else {
                    await Staff.create({
                        staffId: generatedStaffId,
                        institutionId,
                        departmentId,
                        role,
                        fullName,
                        email,
                        password: encryptedPassword,
                    });
                }
            }

            res.status(HttpStatusCode.Created).json({
                status: HttpStatusConstant.CREATED,
                code: HttpStatusCode.Created,
                message: ResponseMessageConstant.STAFF_CREATED_SUCCESSFULLY,
            });
        }
    } catch (error) {
        console.log(
            ErrorLogConstant.authStaffController.handleAddStaffErrorLog,
            error.message,
        );
        res.status(HttpStatusCode.InternalServerError).json({
            status: HttpStatusConstant.ERROR,
            code: HttpStatusCode.InternalServerError,
        });
    }
};

exports.handleUpdateStaff = async (req, res) => {
    try {
        const { staffId: sessionStaffId } = req.staffSession;

        const admin = await Staff.findOne({ staffId: sessionStaffId });

        const institutionId = admin.institutionId;

        const institution = await Institution.findOne({ institutionId });

        if (!institution) {
            return res.status(HttpStatusCode.NotFound).json({
                status: HttpStatusConstant.NOT_FOUND,
                code: HttpStatusCode.NotFound,
                message: ResponseMessageConstant.INSTITUTION_NOT_FOUND,
            });
        }

        const { departmentId, fullName, email, role } = req.body;

        const userValidation = Joi.object({
            departmentId: Joi.string().required(),
            fullName: Joi.string().required(),
            email: Joi.string().email().required(),
            role: Joi.string().required(),
        });

        const { error } = userValidation.validate(req.body);

        if (error) {
            return res.status(HttpStatusCode.BadRequest).json({
                status: HttpStatusConstant.BAD_REQUEST,
                code: HttpStatusCode.BadRequest,
                message: error.details[0].message.replace(/"/g, ""),
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

        const { staffId } = req.params;
        const staff = await Staff.findOne({
            staffId,
            institutionId,
        });

        if (!staff) {
            res.status(HttpStatusCode.NotFound).json({
                status: HttpStatusConstant.NOT_FOUND,
                code: HttpStatusCode.NotFound,
                message: ResponseMessageConstant.STAFF_NOT_FOUND,
            });
        } else {
            const departmentName = department.name;

            if (departmentName === "Administrative") {
                if (role === "Administrator") {
                    staff.departmentId = departmentId;
                    staff.fullName = fullName;
                    staff.email = email;
                    staff.role = role;
                    await staff.save();
                } else {
                    return res.status(HttpStatusCode.BadRequest).json({
                        status: HttpStatusConstant.BAD_REQUEST,
                        code: HttpStatusCode.BadRequest,
                        message:
                            ResponseMessageConstant.INVALID_ROLE_FOR_DEPARTMENT,
                    });
                }
            } else {
                if (role === "Administrator") {
                    return res.status(HttpStatusCode.BadRequest).json({
                        status: HttpStatusConstant.BAD_REQUEST,
                        code: HttpStatusCode.BadRequest,
                        message:
                            ResponseMessageConstant.INVALID_ROLE_FOR_DEPARTMENT,
                    });
                } else {
                    if (staff.role === "Administrator" && role === "Staff") {
                        return res.status(HttpStatusCode.Forbidden).json({
                            status: HttpStatusConstant.FORBIDDEN,
                            code: HttpStatusCode.Forbidden,
                            message:
                                ResponseMessageConstant.ROLE_DOWNGRADE_NOT_ALLOWED,
                        });
                    } else {
                        staff.departmentId = departmentId;
                        staff.fullName = fullName;
                        staff.email = email;
                        staff.role = role;
                        await staff.save();
                    }
                }
            }

            res.status(HttpStatusCode.Created).json({
                status: HttpStatusConstant.CREATED,
                code: HttpStatusCode.Created,
                message: ResponseMessageConstant.STAFF_UPDATED_SUCCESSFULLY,
            });
        }
    } catch (error) {
        console.log(
            ErrorLogConstant.authStaffController.handleUpdateStaffErrorLog,
            error.message,
        );
        res.status(HttpStatusCode.InternalServerError).json({
            status: HttpStatusConstant.ERROR,
            code: HttpStatusCode.InternalServerError,
        });
    }
};

exports.handleAddStudent = async (req, res) => {
    try {
        const { email, fullName, rollNumber, courseStartYear, courseEndYear } =
            req.body;

        const userValidation = Joi.object({
            email: Joi.string().email().required(),
            fullName: Joi.string().required(),
            rollNumber: Joi.string().required(),
            courseStartYear: Joi.string().required(),
            courseEndYear: Joi.string().required(),
        });

        const { error } = userValidation.validate(req.body);

        if (error) {
            return res.status(HttpStatusCode.BadRequest).json({
                status: HttpStatusConstant.BAD_REQUEST,
                code: HttpStatusCode.BadRequest,
                message: error.details[0].message.replace(/"/g, ""),
            });
        }

        const { staffId } = req.staffSession;

        const staff = await Staff.findOne({ staffId });

        if (!staff) {
            res.status(HttpStatusCode.NotFound).json({
                status: HttpStatusConstant.NOT_FOUND,
                code: HttpStatusCode.NotFound,
                message: ResponseMessageConstant.STAFF_NOT_FOUND,
            });
        }

        const institutionId = staff.institutionId;

        const institution = await Institution.findOne({ institutionId });

        if (!institution) {
            return res.status(HttpStatusCode.NotFound).json({
                status: HttpStatusConstant.NOT_FOUND,
                code: HttpStatusCode.NotFound,
                message: ResponseMessageConstant.INSTITUTION_NOT_FOUND,
            });
        }

        const departmentId = staff.departmentId;

        const department = await Department.findOne({ departmentId });

        if (!department) {
            return res.status(HttpStatusCode.NotFound).json({
                status: HttpStatusConstant.NOT_FOUND,
                code: HttpStatusCode.NotFound,
                message: ResponseMessageConstant.DEPARTMENT_NOT_FOUND,
            });
        }

        const userExists = await User.findOne({ email }).select("email -_id");

        if (userExists) {
            res.status(HttpStatusCode.Conflict).json({
                status: HttpStatusConstant.CONFLICT,
                code: HttpStatusCode.Conflict,
                message: ResponseMessageConstant.USER_ALREADY_EXISTS,
            });
        } else {
            const password = "student123";
            const encryptedPassword = await bcrypt.hash(password, 10);
            const generatedUserId = generateUUID();
            await User.create({
                userId: generatedUserId,
                institutionId,
                departmentId,
                email,
                password: encryptedPassword,
                fullName,
                rollNumber,
                courseStartYear,
                courseEndYear,
            });
            res.status(HttpStatusCode.Created).json({
                status: HttpStatusConstant.CREATED,
                code: HttpStatusCode.Created,
            });
        }
    } catch (error) {
        console.log(
            ErrorLogConstant.authStaffController.handleAddStudentErrorLog,
            error.message,
        );
        res.status(HttpStatusCode.InternalServerError).json({
            status: HttpStatusConstant.ERROR,
            code: HttpStatusCode.InternalServerError,
        });
    }
};

exports.handleLogin = async (req, res) => {
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

        const staff = await Staff.findOne({
            email,
        });
        if (!staff) {
            return res.status(HttpStatusCode.NotFound).json({
                status: HttpStatusConstant.NOT_FOUND,
                code: HttpStatusCode.NotFound,
                message: ResponseMessageConstant.STAFF_NOT_FOUND,
            });
        } else {
            const isValidPassword = await bcrypt.compare(
                password,
                staff.password,
            );

            if (isValidPassword) {
                const { email, role, staffId } = staff;
                const generatedAccessToken = await signToken({
                    staffId,
                    email,
                    role,
                });
                res.cookie(
                    CommonConstant.signatureCookieName,
                    generatedAccessToken,
                    {
                        maxAge: 86400000,
                        httpOnly: true,
                        secure: true,
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
            ErrorLogConstant.authStaffController.handleLoginErrorLog,
            error.message,
        );
        res.status(HttpStatusCode.InternalServerError).json({
            status: HttpStatusConstant.ERROR,
            code: HttpStatusCode.InternalServerError,
        });
    }
};

exports.handleLogout = async (req, res) => {
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
            ErrorLogConstant.authStaffController.handleLogoutErrorLog,
            error.message,
        );
        res.status(HttpStatusCode.InternalServerError).json({
            status: HttpStatusConstant.ERROR,
            code: HttpStatusCode.InternalServerError,
        });
    }
};

exports.handleVerifySession = async (req, res) => {
    try {
        if (!req.headers.cookie) {
            return res.status(HttpStatusCode.Unauthorized).json({
                status: HttpStatusConstant.UNAUTHORIZED,
                code: HttpStatusCode.Unauthorized,
            });
        }

        const accessToken = getRecordSignature(req.headers.cookie);

        if (!accessToken) {
            return res.status(HttpStatusCode.Unauthorized).json({
                status: HttpStatusConstant.UNAUTHORIZED,
                code: HttpStatusCode.Unauthorized,
            });
        } else {
            const decodedToken = await verifyToken(accessToken);
            if (!decodedToken) {
                return res.status(HttpStatusCode.Unauthorized).json({
                    status: HttpStatusConstant.UNAUTHORIZED,
                    code: HttpStatusCode.Unauthorized,
                });
            }

            const staff = await Staff.findOne({
                staffId: decodedToken.staffId,
            });

            if (!staff) {
                return res.status(HttpStatusCode.Unauthorized).json({
                    status: HttpStatusConstant.UNAUTHORIZED,
                    code: HttpStatusCode.Unauthorized,
                });
            }

            res.status(HttpStatusCode.Ok).json({
                status: HttpStatusConstant.OK,
                code: HttpStatusCode.Ok,
                data: staff,
            });
        }
    } catch (error) {
        console.log(
            ErrorLogConstant.authStaffController.handleVerifySessionErrorLog,
            error.message,
        );
        res.status(HttpStatusCode.InternalServerError).json({
            status: HttpStatusConstant.ERROR,
            code: HttpStatusCode.InternalServerError,
        });
    }
};

exports.handleSendResetPassMail = async (req, res) => {
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

        const staff = await Staff.findOne({
            email,
        });

        if (!staff) {
            return res.status(HttpStatusCode.NotFound).json({
                status: HttpStatusConstant.NOT_FOUND,
                code: HttpStatusCode.NotFound,
                message: ResponseMessageConstant.STAFF_NOT_FOUND,
            });
        }

        const staffId = staff.staffId;

        const checkIsPasswordResetTokenExists =
            await PasswordResetToken.findOne({
                userId: staffId,
            });

        let passwordResetAccessTokenId;

        if (checkIsPasswordResetTokenExists) {
            passwordResetAccessTokenId =
                checkIsPasswordResetTokenExists.passwordResetTokenId;
        } else {
            const passwordResetTokenResponse = await PasswordResetToken.create({
                passwordResetTokenId: generateUUID(),
                userId: staffId,
            });
            passwordResetAccessTokenId =
                passwordResetTokenResponse.passwordResetTokenId;
        }

        const link = `${process.env.STAFF_WEBSITE}/reset-password/${passwordResetAccessTokenId}`;

        const isEmailSend = await handleSendEmail({
            toAddresses: [email],
            source: CommonConstant.email.source.tech_team,
            subject: CommonConstant.email.resetPasswordEmail.subject,
            htmlData: emailTemplates.forgotPassword(link),
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
            ErrorLogConstant.authStaffController
                .handleSendResetPassMailErrorLog,
            error.message,
        );
        return res.status(HttpStatusCode.InternalServerError).json({
            status: HttpStatusConstant.ERROR,
            code: HttpStatusCode.InternalServerError,
        });
    }
};

exports.handleResetPass = async (req, res) => {
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

            const staff = await Staff.findOne({
                staffId: userId,
            });

            if (!staff) {
                return res.status(HttpStatusCode.NotFound).json({
                    status: HttpStatusConstant.NOT_FOUND,
                    code: HttpStatusCode.NotFound,
                    message: ResponseMessageConstant.STAFF_NOT_FOUND,
                });
            } else {
                const { password } = req.body;

                const encryptedPassword = await bcrypt.hash(password, 10);
                staff.password = encryptedPassword;

                await staff.save();

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
            ErrorLogConstant.authStaffController.handleResetPassErrorLog,
            error.message,
        );
        return res.status(HttpStatusCode.InternalServerError).json({
            status: HttpStatusConstant.ERROR,
            code: HttpStatusCode.InternalServerError,
        });
    }
};
