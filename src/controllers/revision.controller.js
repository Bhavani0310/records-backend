const Joi = require("joi");

// Importing models
const User = require("../models/user.model");
const Skill = require("../models/skill.model");
const Profile_Verification = require("../models/profile_verification.model");
const Staff = require("../models/staff.model");
const WorkExperience = require("../models/profile/work-experience.model");
const LicenseCertification = require("../models/profile/license-certification.model");
const Project = require("../models/profile/project.model");

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

        if (verification.verified) {
            return res.status(HttpStatusCode.Conflict).json({
                status: HttpStatusConstant.CONFLICT,
                code: HttpStatusCode.Conflict,
                message: ResponseMessageConstant.VERIFICATION_ALREADY_DONE,
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
            htmlData: emailTemplates.educationRevisionRequest(
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

exports.handleWorkExperienceRevision = async (req, res) => {
    try {
        const { staffId } = req.staffSession;

        const staff = await Staff.findOne({ staffId });

        if (!staff) {
            return res.status(HttpStatusCode.NotFound).json({
                status: HttpStatusConstant.NOT_FOUND,
                code: HttpStatusCode.NotFound,
                message: ResponseMessageConstant.STAFF_NOT_FOUND,
            });
        }

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

        const user = await User.findOne({ userId: verification.userId });

        if (!user) {
            return res.status(HttpStatusCode.NotFound).json({
                status: HttpStatusConstant.NOT_FOUND,
                code: HttpStatusCode.NotFound,
                message: ResponseMessageConstant.USER_NOT_FOUND,
            });
        }

        const workExperience = await WorkExperience.findOne({ verificationId });
        if (!workExperience) {
            return res.status(HttpStatusCode.NotFound).json({
                status: HttpStatusConstant.NOT_FOUND,
                code: HttpStatusCode.NotFound,
                message: ResponseMessageConstant.WORK_EXPERIENCE_NOT_FOUND,
            });
        }

        const { comment, endorsedSkills } = req.body;

        const endorsedSkillNames = [];

        if (
            endorsedSkills &&
            Array.isArray(endorsedSkills) &&
            endorsedSkills.length > 0
        ) {
            for (const skillId of endorsedSkills) {
                const skill = await Skill.findOne({ skillId });
                if (!skill) {
                    return res.status(HttpStatusCode.BadRequest).json({
                        status: HttpStatusConstant.BAD_REQUEST,
                        code: HttpStatusCode.BadRequest,
                        message: ResponseMessageConstant.INVALID_SKILLS,
                    });
                }
            }

            for (const skillId of endorsedSkills) {
                const existingSkill = workExperience.skills.find(
                    (skill) => skill.skillId === skillId,
                );
                if (existingSkill) {
                    if (
                        !existingSkill.endorsedBy &&
                        !existingSkill.endorsedAt
                    ) {
                        existingSkill.endorsedBy = staffId;
                        existingSkill.endorsedAt = new Date();
                        const skill = await Skill.findOne({ skillId });
                        endorsedSkillNames.push(skill.skillName);
                    }
                } else {
                    const skill = await Skill.findOne({ skillId });
                    if (skill) {
                        workExperience.skills.push({
                            skillId: skillId,
                            endorsedBy: staffId,
                            endorsedAt: new Date(),
                        });
                        endorsedSkillNames.push(skill.skillName);
                    }
                }
            }

            await workExperience.save();
        }

        verification.revisions.push({
            revisionDate: new Date(),
            comments: comment,
        });
        await verification.save();

        const isEmailSend = await handleSendEmail({
            toAddresses: [user.email],
            source: CommonConstant.email.source.tech_team,
            subject: CommonConstant.email.workExperienceRevisionRequest.subject,
            htmlData: emailTemplates.workExperienceRevisionRequest(
                "Experience",
                user.username,
                comment,
                endorsedSkillNames,
                "localhost:3000",
            ),
        });

        if (!isEmailSend) {
            return res.status(HttpStatusCode.InternalServerError).json({
                status: HttpStatusConstant.ERROR,
                code: HttpStatusCode.InternalServerError,
                message: ResponseMessageConstant.REVISION_EMAIL_SENT_FAILED,
            });
        }

        return res.status(HttpStatusCode.Ok).json({
            status: HttpStatusConstant.OK,
            code: HttpStatusCode.Ok,
            message: ResponseMessageConstant.REVISION_EMAIL_SENT_SUCCESSFULLY,
        });
    } catch (error) {
        console.log(
            ErrorLogConstant.revisionController
                .handleWorkExperienceRevisionErrorLog,
            error.message,
        );
        res.status(HttpStatusCode.InternalServerError).json({
            status: HttpStatusConstant.ERROR,
            code: HttpStatusCode.InternalServerError,
        });
    }
};

exports.handleLicenseCertificationRevision = async (req, res) => {
    try {
        const { staffId } = req.staffSession;

        const staff = await Staff.findOne({ staffId });

        if (!staff) {
            return res.status(HttpStatusCode.NotFound).json({
                status: HttpStatusConstant.NOT_FOUND,
                code: HttpStatusCode.NotFound,
                message: ResponseMessageConstant.STAFF_NOT_FOUND,
            });
        }

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

        const user = await User.findOne({ userId: verification.userId });

        if (!user) {
            return res.status(HttpStatusCode.NotFound).json({
                status: HttpStatusConstant.NOT_FOUND,
                code: HttpStatusCode.NotFound,
                message: ResponseMessageConstant.USER_NOT_FOUND,
            });
        }

        const licenseCertification = await LicenseCertification.findOne({
            verificationId,
        });
        if (!licenseCertification) {
            return res.status(HttpStatusCode.NotFound).json({
                status: HttpStatusConstant.NOT_FOUND,
                code: HttpStatusCode.NotFound,
                message:
                    ResponseMessageConstant.LICENSE_CERTIFICATION_NOT_FOUND,
            });
        }

        const { comment, endorsedSkills } = req.body;

        const endorsedSkillNames = [];

        if (
            endorsedSkills &&
            Array.isArray(endorsedSkills) &&
            endorsedSkills.length > 0
        ) {
            for (const skillId of endorsedSkills) {
                const skill = await Skill.findOne({ skillId });
                if (!skill) {
                    return res.status(HttpStatusCode.BadRequest).json({
                        status: HttpStatusConstant.BAD_REQUEST,
                        code: HttpStatusCode.BadRequest,
                        message: ResponseMessageConstant.INVALID_SKILLS,
                    });
                }
            }

            for (const skillId of endorsedSkills) {
                const existingSkill = licenseCertification.skills.find(
                    (skill) => skill.skillId === skillId,
                );
                if (existingSkill) {
                    if (
                        !existingSkill.endorsedBy &&
                        !existingSkill.endorsedAt
                    ) {
                        existingSkill.endorsedBy = staffId;
                        existingSkill.endorsedAt = new Date();
                        const skill = await Skill.findOne({ skillId });
                        endorsedSkillNames.push(skill.skillName);
                    }
                } else {
                    const skill = await Skill.findOne({ skillId });
                    if (skill) {
                        licenseCertification.skills.push({
                            skillId: skillId,
                            endorsedBy: staffId,
                            endorsedAt: new Date(),
                        });
                        endorsedSkillNames.push(skill.skillName);
                    }
                }
            }

            await licenseCertification.save();
        }

        verification.revisions.push({
            revisionDate: new Date(),
            comments: comment,
        });
        await verification.save();

        const isEmailSend = await handleSendEmail({
            toAddresses: [user.email],
            source: CommonConstant.email.source.tech_team,
            subject:
                CommonConstant.email.licenseCertificationRevisionRequest
                    .subject,
            htmlData: emailTemplates.workExperienceRevisionRequest(
                "License & Certification",
                user.username,
                comment,
                endorsedSkillNames,
                "localhost:3000",
            ),
        });

        if (!isEmailSend) {
            return res.status(HttpStatusCode.InternalServerError).json({
                status: HttpStatusConstant.ERROR,
                code: HttpStatusCode.InternalServerError,
                message: ResponseMessageConstant.REVISION_EMAIL_SENT_FAILED,
            });
        }

        return res.status(HttpStatusCode.Ok).json({
            status: HttpStatusConstant.OK,
            code: HttpStatusCode.Ok,
            message: ResponseMessageConstant.REVISION_EMAIL_SENT_SUCCESSFULLY,
        });
    } catch (error) {
        console.log(
            ErrorLogConstant.revisionController
                .handleLicenseCertificationRevisionErrorLog,
            error.message,
        );
        res.status(HttpStatusCode.InternalServerError).json({
            status: HttpStatusConstant.ERROR,
            code: HttpStatusCode.InternalServerError,
        });
    }
};

exports.handleProjectRevision = async (req, res) => {
    try {
        const { staffId } = req.staffSession;

        const staff = await Staff.findOne({ staffId });

        if (!staff) {
            return res.status(HttpStatusCode.NotFound).json({
                status: HttpStatusConstant.NOT_FOUND,
                code: HttpStatusCode.NotFound,
                message: ResponseMessageConstant.STAFF_NOT_FOUND,
            });
        }

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

        const user = await User.findOne({ userId: verification.userId });

        if (!user) {
            return res.status(HttpStatusCode.NotFound).json({
                status: HttpStatusConstant.NOT_FOUND,
                code: HttpStatusCode.NotFound,
                message: ResponseMessageConstant.USER_NOT_FOUND,
            });
        }

        const project = await Project.findOne({ verificationId });
        if (!project) {
            return res.status(HttpStatusCode.NotFound).json({
                status: HttpStatusConstant.NOT_FOUND,
                code: HttpStatusCode.NotFound,
                message: ResponseMessageConstant.PROJECT_NOT_FOUND,
            });
        }

        const { comment, endorsedSkills } = req.body;

        const endorsedSkillNames = [];

        if (
            endorsedSkills &&
            Array.isArray(endorsedSkills) &&
            endorsedSkills.length > 0
        ) {
            for (const skillId of endorsedSkills) {
                const skill = await Skill.findOne({ skillId });
                if (!skill) {
                    return res.status(HttpStatusCode.BadRequest).json({
                        status: HttpStatusConstant.BAD_REQUEST,
                        code: HttpStatusCode.BadRequest,
                        message: ResponseMessageConstant.INVALID_SKILLS,
                    });
                }
            }

            for (const skillId of endorsedSkills) {
                const existingSkill = project.skills.find(
                    (skill) => skill.skillId === skillId,
                );
                if (existingSkill) {
                    if (
                        !existingSkill.endorsedBy &&
                        !existingSkill.endorsedAt
                    ) {
                        existingSkill.endorsedBy = staffId;
                        existingSkill.endorsedAt = new Date();
                        const skill = await Skill.findOne({ skillId });
                        endorsedSkillNames.push(skill.skillName);
                    }
                } else {
                    const skill = await Skill.findOne({ skillId });
                    if (skill) {
                        project.skills.push({
                            skillId: skillId,
                            endorsedBy: staffId,
                            endorsedAt: new Date(),
                        });
                        endorsedSkillNames.push(skill.skillName);
                    }
                }
            }

            await project.save();
        }

        verification.revisions.push({
            revisionDate: new Date(),
            comments: comment,
        });
        await verification.save();

        const isEmailSend = await handleSendEmail({
            toAddresses: [user.email],
            source: CommonConstant.email.source.tech_team,
            subject: CommonConstant.email.projectRevisionRequest.subject,
            htmlData: emailTemplates.workExperienceRevisionRequest(
                "Project",
                user.username,
                comment,
                endorsedSkillNames,
                "localhost:3000",
            ),
        });

        if (!isEmailSend) {
            return res.status(HttpStatusCode.InternalServerError).json({
                status: HttpStatusConstant.ERROR,
                code: HttpStatusCode.InternalServerError,
                message: ResponseMessageConstant.REVISION_EMAIL_SENT_FAILED,
            });
        }

        return res.status(HttpStatusCode.Ok).json({
            status: HttpStatusConstant.OK,
            code: HttpStatusCode.Ok,
            message: ResponseMessageConstant.REVISION_EMAIL_SENT_SUCCESSFULLY,
        });
    } catch (error) {
        console.log(
            ErrorLogConstant.revisionController.handleProjectRevisionErrorLog,
            error.message,
        );
        res.status(HttpStatusCode.InternalServerError).json({
            status: HttpStatusConstant.ERROR,
            code: HttpStatusCode.InternalServerError,
        });
    }
};

exports.handleActivityRevision = async (req, res) => {
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

        if (verification.verified) {
            return res.status(HttpStatusCode.Conflict).json({
                status: HttpStatusConstant.CONFLICT,
                code: HttpStatusCode.Conflict,
                message: ResponseMessageConstant.VERIFICATION_ALREADY_DONE,
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
            subject: CommonConstant.email.activityRevisionRequest.subject,
            htmlData: emailTemplates.educationRevisionRequest(
                "Activity",
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
            ErrorLogConstant.revisionController.handleActivityRevisionErrorLog,
            error.message,
        );
        res.status(HttpStatusCode.InternalServerError).json({
            status: HttpStatusConstant.ERROR,
            code: HttpStatusCode.InternalServerError,
        });
    }
};
