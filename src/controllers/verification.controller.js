const Joi = require("joi");

// Importing models
const User = require("../models/user.model");
const Education = require("../models/profile/education.model");
const WorkExperience = require("../models/profile/work-experience.model");
const Skill = require("../models/skill.model");
const Profile_Verification = require("../models/profile_verification.model");
const Staff = require("../models/staff.model");
const LicenseCertification = require("../models/profile/license-certification.model");
const Project = require("../models/profile/project.model");
const Activity = require("../models/profile/activity.model");

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
        await education.save();

        verification.verified = true;
        await verification.save();

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

exports.handleVerifyWorkExperience = async (req, res) => {
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

        const workExperience = await WorkExperience.findOne({ verificationId });
        if (!workExperience) {
            return res.status(HttpStatusCode.NotFound).json({
                status: HttpStatusConstant.NOT_FOUND,
                code: HttpStatusCode.NotFound,
                message: ResponseMessageConstant.WORK_EXPERIENCE_NOT_FOUND,
            });
        }

        const { endorsedSkills } = req.body;

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

            const endorsedSkillNames = [];

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
        }

        for (const skill of workExperience.skills) {
            if (skill.endorsedBy) {
                skill.verified = true;
            }
        }

        workExperience.verified = true;
        await workExperience.save();

        verification.verified = true;
        await verification.save();

        res.status(HttpStatusCode.Ok).json({
            status: HttpStatusConstant.SUCCESS,
            code: HttpStatusCode.Ok,
            message: ResponseMessageConstant.VERIFICATION_DONE_SUCCESSFULLY,
        });
    } catch (error) {
        console.log(
            ErrorLogConstant.verificationController
                .handleVerifyWorkExperienceErrorLog,
            error.message,
        );
        res.status(HttpStatusCode.InternalServerError).json({
            status: HttpStatusConstant.ERROR,
            code: HttpStatusCode.InternalServerError,
        });
    }
};

exports.handleGetVerifyWorkExperienceDetails = async (req, res) => {
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

        const workExperience = await WorkExperience.findOne({ verificationId });
        if (!workExperience) {
            return res.status(HttpStatusCode.NotFound).json({
                status: HttpStatusConstant.NOT_FOUND,
                code: HttpStatusCode.NotFound,
                message: ResponseMessageConstant.WORK_EXPERIENCE_NOT_FOUND,
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

        const skillIds = workExperience.skills.map((skill) => skill.skillId);

        const skills = await Skill.find({ skillId: { $in: skillIds } });

        const skillDetails = [];

        for (const skill of workExperience.skills) {
            const endorsedBy = skill.endorsedBy;
            const correspondingSkill = skills.find(
                (s) => s.skillId === skill.skillId,
            );

            skillDetails.push({
                skillId: skill.skillId,
                skillName: correspondingSkill.skillName,
                endorsed: endorsedBy ? true : false,
            });
        }

        const workExperienceResponse = {
            userId: user.userId,
            userName: user.username,
            workExperienceId: workExperience.workExperienceId,
            role: workExperience.role,
            companyName: workExperience.companyName,
            employeeId: workExperience.employeeId,
            workType: workExperience.workType,
            location: workExperience.location,
            locationType: workExperience.locationType,
            startDate: workExperience.startDate,
            endDate: workExperience.endDate,
            skills: skillDetails,
        };

        return res.status(HttpStatusCode.Ok).json({
            status: HttpStatusConstant.OK,
            code: HttpStatusCode.Ok,
            data: workExperienceResponse,
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

exports.handleVerifyLicenseCertification = async (req, res) => {
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

        const { endorsedSkills } = req.body;

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

            const endorsedSkillNames = [];

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
        }

        for (const skill of licenseCertification.skills) {
            if (skill.endorsedBy) {
                skill.verified = true;
            }
        }

        licenseCertification.verified = true;
        await licenseCertification.save();

        verification.verified = true;
        await verification.save();

        res.status(HttpStatusCode.Ok).json({
            status: HttpStatusConstant.SUCCESS,
            code: HttpStatusCode.Ok,
            message: ResponseMessageConstant.VERIFICATION_DONE_SUCCESSFULLY,
        });
    } catch (error) {
        console.log(
            ErrorLogConstant.verificationController
                .handleVerifyLicenseCertificationErrorLog,
            error.message,
        );
        res.status(HttpStatusCode.InternalServerError).json({
            status: HttpStatusConstant.ERROR,
            code: HttpStatusCode.InternalServerError,
        });
    }
};

exports.handleGetVerifyLicenseCertificationDetails = async (req, res) => {
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

        const user = await User.findOne({ userId: verification.userId });

        if (!user) {
            return res.status(HttpStatusCode.NotFound).json({
                status: HttpStatusConstant.NOT_FOUND,
                code: HttpStatusCode.NotFound,
                message: ResponseMessageConstant.USER_NOT_FOUND,
            });
        }

        const skillIds = licenseCertification.skills.map(
            (skill) => skill.skillId,
        );

        const skills = await Skill.find({ skillId: { $in: skillIds } });

        const skillDetails = [];

        for (const skill of licenseCertification.skills) {
            const endorsedBy = skill.endorsedBy;
            const correspondingSkill = skills.find(
                (s) => s.skillId === skill.skillId,
            );

            skillDetails.push({
                skillId: skill.skillId,
                skillName: correspondingSkill.skillName,
                endorsed: endorsedBy ? true : false,
            });
        }

        const licenseCertificationResponse = {
            userId: user.userId,
            userName: user.username,
            licenseCertificationId: licenseCertification.licenseCertificationId,
            certificationName: licenseCertification.certificationName,
            organization: licenseCertification.organization,
            doneVia: licenseCertification.doneVia,
            issuedDate: licenseCertification.issuedDate,
            expirationDate: licenseCertification.expirationDate,
            credentialId: licenseCertification.credentialId,
            credentialURL: licenseCertification.credentialURL,
            skills: skillDetails,
        };

        return res.status(HttpStatusCode.Ok).json({
            status: HttpStatusConstant.OK,
            code: HttpStatusCode.Ok,
            data: licenseCertificationResponse,
        });
    } catch (error) {
        console.log(
            ErrorLogConstant.verificationController
                .handleGetVerifyLicenseCertificationDetailsErrorLog,
            error.message,
        );
        res.status(HttpStatusCode.InternalServerError).json({
            status: HttpStatusConstant.ERROR,
            code: HttpStatusCode.InternalServerError,
        });
    }
};

exports.handleVerifyProject = async (req, res) => {
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

        const project = await Project.findOne({ verificationId });
        if (!project) {
            return res.status(HttpStatusCode.NotFound).json({
                status: HttpStatusConstant.NOT_FOUND,
                code: HttpStatusCode.NotFound,
                message: ResponseMessageConstant.PROJECT_NOT_FOUND,
            });
        }

        const { endorsedSkills } = req.body;

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

            const endorsedSkillNames = [];

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
        }

        for (const skill of project.skills) {
            if (skill.endorsedBy) {
                skill.verified = true;
            }
        }

        project.verified = true;
        await project.save();

        verification.verified = true;
        await verification.save();

        res.status(HttpStatusCode.Ok).json({
            status: HttpStatusConstant.SUCCESS,
            code: HttpStatusCode.Ok,
            message: ResponseMessageConstant.VERIFICATION_DONE_SUCCESSFULLY,
        });
    } catch (error) {
        console.log(
            ErrorLogConstant.verificationController.handleVerifyProjectErrorLog,
            error.message,
        );
        res.status(HttpStatusCode.InternalServerError).json({
            status: HttpStatusConstant.ERROR,
            code: HttpStatusCode.InternalServerError,
        });
    }
};

exports.handleGetVerifyProjectDetails = async (req, res) => {
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

        const project = await Project.findOne({ verificationId });
        if (!project) {
            return res.status(HttpStatusCode.NotFound).json({
                status: HttpStatusConstant.NOT_FOUND,
                code: HttpStatusCode.NotFound,
                message: ResponseMessageConstant.PROJECT_NOT_FOUND,
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

        const skillIds = workExperience.skills.map((skill) => skill.skillId);

        const skills = await Skill.find({ skillId: { $in: skillIds } });

        const skillDetails = [];

        for (const skill of project.skills) {
            const endorsedBy = skill.endorsedBy;
            const correspondingSkill = skills.find(
                (s) => s.skillId === skill.skillId,
            );

            skillDetails.push({
                skillId: skill.skillId,
                skillName: correspondingSkill.skillName,
                endorsed: endorsedBy ? true : false,
            });
        }

        const projectResponse = {
            userId: user.userId,
            userName: user.username,
            projectId: project.projectId,
            projectName: project.projectName,
            associatedWith: project.associatedWith,
            projectType: project.projectType,
            startDate: project.startDate,
            endDate: project.endDate,
            projectLink: project.projectLink,
            description: project.description,
            skills: skillDetails,
        };

        return res.status(HttpStatusCode.Ok).json({
            status: HttpStatusConstant.OK,
            code: HttpStatusCode.Ok,
            data: projectResponse,
        });
    } catch (error) {
        console.log(
            ErrorLogConstant.verificationController
                .handleGetVerifyProjectDetailsErrorLog,
            error.message,
        );
        res.status(HttpStatusCode.InternalServerError).json({
            status: HttpStatusConstant.ERROR,
            code: HttpStatusCode.InternalServerError,
        });
    }
};

exports.handleVerifyActivity = async (req, res) => {
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

        const activity = await Activity.findOne({ verificationId });
        if (!activity) {
            return res.status(HttpStatusCode.NotFound).json({
                status: HttpStatusConstant.NOT_FOUND,
                code: HttpStatusCode.NotFound,
                message: ResponseMessageConstant.ACTIVITY_NOT_FOUND,
            });
        }

        activity.verified = true;
        await activity.save();

        verification.verified = true;
        await verification.save();

        res.status(HttpStatusCode.Ok).json({
            status: HttpStatusConstant.SUCCESS,
            code: HttpStatusCode.Ok,
            message: ResponseMessageConstant.VERIFICATION_DONE_SUCCESSFULLY,
        });
    } catch (error) {
        console.log(
            ErrorLogConstant.verificationController
                .handleVerifyActivityErrorLog,
            error.message,
        );
        res.status(HttpStatusCode.InternalServerError).json({
            status: HttpStatusConstant.ERROR,
            code: HttpStatusCode.InternalServerError,
        });
    }
};

exports.handleGetVerifyActivityDetails = async (req, res) => {
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

        const activity = await Activity.findOne({ verificationId });
        if (!activity) {
            return res.status(HttpStatusCode.NotFound).json({
                status: HttpStatusConstant.NOT_FOUND,
                code: HttpStatusCode.NotFound,
                message: ResponseMessageConstant.ACTIVITY_NOT_FOUND,
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

        const activityResponse = {
            userId: user.userId,
            userName: user.username,
            activityId: activity.activityId,
            activityName: activity.activityName,
            organisation: activity.organisation,
            activityType: activity.activityType,
            startDate: activity.startDate,
            endDate: activity.endDate,
            description: activity.description,
        };
        return res.status(HttpStatusCode.Ok).json({
            status: HttpStatusConstant.OK,
            code: HttpStatusCode.Ok,
            data: activityResponse,
        });
    } catch (error) {
        console.log(
            ErrorLogConstant.verificationController
                .handleGetVerifyActivityDetailsErrorLog,
            error.message,
        );
        res.status(HttpStatusCode.InternalServerError).json({
            status: HttpStatusConstant.ERROR,
            code: HttpStatusCode.InternalServerError,
        });
    }
};
