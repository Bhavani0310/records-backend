const Joi = require("joi");
const bcrypt = require("bcryptjs");

// Importing Models
const User = require("../models/user.model");
const Daily_Learning = require("../models/daily_learning.model");
const SkillCategory = require("../models/skill-category.model");
const Institution = require("../models/institution.model");
const Department = require("../models/department.model");
const Staff = require("../models/staff.model");
const Skill = require("../models/skill.model");
const Job = require("../models/job.model");

// Importing Constants
const HttpStatusConstant = require("../constants/http-message.constant");
const HttpStatusCode = require("../constants/http-code.constant");
const ResponseMessageConstant = require("../constants/response-message.constant");
const ErrorLogConstant = require("../constants/error-log.constant");

// Importing Controllers
const youtubeController = require("./youtube.controller");

// Importing Utils
const { getStartAndEndDate } = require("../utils/date.util");

// Importing Functions
const {
    appendSkillsDetails,
    appendInteresetBasedSkillsDetails,
} = require("../controllers/profile/profile.controller");

const getSkillRepository = async (userId) => {
    try {
        const userProfileInfoResponse = await User.aggregate([
            {
                $match: {
                    userId,
                },
            },
            {
                $lookup: {
                    from: "educations",
                    localField: "userId",
                    foreignField: "userId",
                    as: "educations",
                },
            },
            {
                $lookup: {
                    from: "workexperiences",
                    localField: "userId",
                    foreignField: "userId",
                    as: "workexperiences",
                },
            },
            {
                $lookup: {
                    from: "licensecertifications",
                    localField: "userId",
                    foreignField: "userId",
                    as: "licensecertifications",
                },
            },
            {
                $lookup: {
                    from: "projects",
                    localField: "userId",
                    foreignField: "userId",
                    as: "projects",
                },
            },
            {
                $lookup: {
                    from: "activities",
                    localField: "userId",
                    foreignField: "userId",
                    as: "activities",
                },
            },
            {
                $project: {
                    _id: 0,
                    userId: 0,
                    password: 0,
                    createdAt: 0,
                    updatedAt: 0,
                    __v: 0,
                    "educations._id": 0,
                    "educations.userId": 0,
                    "educations.createdAt": 0,
                    "educations.updatedAt": 0,
                    "educations.__v": 0,
                    "educations.verificationId": 0,
                    "workexperiences._id": 0,
                    "workexperiences.userId": 0,
                    "workexperiences.createdAt": 0,
                    "workexperiences.updatedAt": 0,
                    "workexperiences.__v": 0,
                    "workexperiences.verificationId": 0,
                    "workexperiences.skills._id": 0,
                    "licensecertifications._id": 0,
                    "licensecertifications.userId": 0,
                    "licensecertifications.createdAt": 0,
                    "licensecertifications.updatedAt": 0,
                    "licensecertifications.__v": 0,
                    "licensecertifications.verificationId": 0,
                    "licensecertifications.skills._id": 0,
                    "projects._id": 0,
                    "projects.userId": 0,
                    "projects.createdAt": 0,
                    "projects.updatedAt": 0,
                    "projects.__v": 0,
                    "projects.verificationId": 0,
                    "projects.skills._id": 0,
                    "activities._id": 0,
                    "activities.userId": 0,
                    "activities.createdAt": 0,
                    "activities.updatedAt": 0,
                    "activities.__v": 0,
                    "activities.verificationId": 0,
                },
            },
        ]);

        userProfileInfoResponse[0].interestBasedSkills =
            await appendInteresetBasedSkillsDetails(
                userProfileInfoResponse[0].interestBasedSkills,
            );

        userProfileInfoResponse[0].workexperiences = await appendSkillsDetails(
            userProfileInfoResponse[0].workexperiences,
        );
        userProfileInfoResponse[0].licensecertifications =
            await appendSkillsDetails(
                userProfileInfoResponse[0].licensecertifications,
            );
        userProfileInfoResponse[0].projects = await appendSkillsDetails(
            userProfileInfoResponse[0].projects,
        );

        let skillCategoryCounts = {};

        let interestBasedSkills = {};
        userProfileInfoResponse[0].interestBasedSkills.forEach((skill) => {
            interestBasedSkills[skill.skillName] = {
                skillName: skill.skillName,
                skillId: skill.skillId,
                endorsedCount: 0,
            };
        });

        const workExperiences = userProfileInfoResponse[0].workexperiences;
        const licenseCertifications =
            userProfileInfoResponse[0].licensecertifications;
        const projects = userProfileInfoResponse[0].projects;

        let roleBasedSkills = {};

        const extractSkillsAndCountEndorsements = (array) => {
            array.forEach((item) => {
                item.skills.forEach((skill) => {
                    const { skillName, endorsedBy } = skill;
                    const skillCategoryId = skill.skillCategoryId;
                    if (!skillCategoryCounts.hasOwnProperty(skillCategoryId)) {
                        skillCategoryCounts[skillCategoryId] = 0;
                    }
                    skillCategoryCounts[skillCategoryId]++;
                    if (interestBasedSkills.hasOwnProperty(skillName)) {
                        if (endorsedBy) {
                            interestBasedSkills[skillName].endorsedCount++;
                        }
                    } else {
                        if (!roleBasedSkills.hasOwnProperty(skillName)) {
                            roleBasedSkills[skillName] = {
                                skill: skillName,
                                skillId: skill.skillId,
                                endorsedCount: 0,
                            };
                        }
                        if (endorsedBy) {
                            roleBasedSkills[skillName].endorsedCount++;
                        }
                    }
                });
            });
        };

        extractSkillsAndCountEndorsements(workExperiences, interestBasedSkills);
        extractSkillsAndCountEndorsements(licenseCertifications);
        extractSkillsAndCountEndorsements(projects);

        interestBasedSkills = Object.values(interestBasedSkills);
        roleBasedSkills = Object.values(roleBasedSkills);

        const sortSkillsByEndorsement = (skillsArray) => {
            skillsArray.sort((a, b) => b.endorsedCount - a.endorsedCount);
            return skillsArray;
        };

        interestBasedSkills = sortSkillsByEndorsement(interestBasedSkills);
        roleBasedSkills = sortSkillsByEndorsement(roleBasedSkills);

        const allSkillCategories = await SkillCategory.find({});

        const skillCategoryNameMap = {};
        allSkillCategories.forEach((category) => {
            skillCategoryNameMap[category.skillCategoryId] =
                category.categoryName;
        });

        let totalCount = 0;
        for (item in skillCategoryCounts) {
            totalCount += skillCategoryCounts[item];
        }

        for (item in skillCategoryCounts) {
            const percentage = (skillCategoryCounts[item] / totalCount) * 100;
            skillCategoryCounts[item] = percentage.toFixed(2);
        }

        const skillCategoryCountsWithName = {};
        Object.keys(skillCategoryCounts).forEach((categoryId) => {
            const categoryName = skillCategoryNameMap[categoryId];
            if (categoryName) {
                skillCategoryCountsWithName[categoryName] =
                    skillCategoryCounts[categoryId];
            }
        });

        const skillRepository = {
            skillBadges: {
                roleBasedCount: Object.keys(roleBasedSkills).length,
                interestBasedCount: Object.keys(interestBasedSkills).length,
            },
            percentages: skillCategoryCountsWithName,
            roleBasedSkills: roleBasedSkills,
            interestBasedSkills: interestBasedSkills,
        };

        return skillRepository;
    } catch (error) {
        throw error;
    }
};

const getlearningActivites = async (userId) => {
    try {
        const formatDate = (date) => {
            const year = date.getFullYear();
            const month = String(date.getMonth() + 1).padStart(2, "0");
            const day = String(date.getDate()).padStart(2, "0");
            return `${year}-${month}-${day}`;
        };

        const startEndDates = getStartAndEndDate(
            new Date().toISOString().split("T")[0],
        );

        const monthlyLearning = await Daily_Learning.find({
            userId: userId,
            date: {
                $gte: startEndDates.monthStart,
                $lte: startEndDates.monthEnd,
            },
        });

        const datesArray = [];
        const currentDate = new Date(startEndDates.monthStart);
        while (currentDate <= new Date(startEndDates.monthEnd)) {
            datesArray.push(new Date(currentDate));
            currentDate.setDate(currentDate.getDate() + 1);
        }

        const formattedDates = datesArray.map((date) => formatDate(date));

        const learningActivitiesByDate = new Map();
        monthlyLearning.forEach((activity) => {
            const dateKey = formatDate(activity.date);
            learningActivitiesByDate.set(dateKey, activity.learned);
        });

        const learningActivities = formattedDates.map((date) => ({
            date: date,
            learned: Math.round(learningActivitiesByDate.get(date) / 3600) || 0,
        }));

        return learningActivities;
    } catch (error) {
        throw error;
    }
};

const getMoMPerformance = async (userId) => {
    try {
        const formatDate = (date) => {
            const year = date.getFullYear();
            const month = String(date.getMonth() + 1).padStart(2, "0");
            const day = String(date.getDate()).padStart(2, "0");
            return `${year}-${month}-${day}`;
        };

        const currentDate = new Date();
        const currentMonthStart = new Date(
            currentDate.getFullYear(),
            currentDate.getMonth(),
            1,
        );
        const currentMonthEnd = new Date(
            currentDate.getFullYear(),
            currentDate.getMonth() + 1,
            0,
        );

        const prevMonthStart = new Date(
            currentDate.getFullYear(),
            currentDate.getMonth() - 1,
            1,
        );
        const prevMonthEnd = new Date(
            currentDate.getFullYear(),
            currentDate.getMonth(),
            0,
        );

        const monthlyLearningCurrent = await Daily_Learning.find({
            userId: userId,
            date: {
                $gte: currentMonthStart,
                $lte: currentMonthEnd,
            },
        });

        const monthlyLearningPrev = await Daily_Learning.find({
            userId: userId,
            date: {
                $gte: prevMonthStart,
                $lte: prevMonthEnd,
            },
        });

        const currentMonthTotal = monthlyLearningCurrent.reduce(
            (total, activity) => total + activity.learned,
            0,
        );
        const prevMonthTotal = monthlyLearningPrev.reduce(
            (total, activity) => total + activity.learned,
            0,
        );

        // const currentMonthLearningHours = Math.round(currentMonthTotal / 3600);
        // const previosMonthLearningHours = Math.round(prevMonthTotal / 3600);
        const currentMonthLearningHours = 40;
        const previosMonthLearningHours = 100;

        if (previosMonthLearningHours == 0 && currentMonthLearningHours == 0)
            return 0;
        if (previosMonthLearningHours == 0 && currentMonthLearningHours != 0)
            return 100;
        const percentage = Math.round(
            ((currentMonthLearningHours - previosMonthLearningHours) /
                previosMonthLearningHours) *
                100,
        );
        return percentage;
    } catch (error) {
        throw error;
    }
};

exports.handleGetDashboard = async (req, res) => {
    try {
        const { userId } = req.userSession;

        const user = await User.findOne({
            userId,
        });

        if (!user) {
            res.status(HttpStatusCode.NotFound).json({
                status: HttpStatusConstant.NOT_FOUND,
                code: HttpStatusCode.NotFound,
                message: ResponseMessageConstant.USER_NOT_FOUND,
            });
        }

        const coursesInProgress =
            await youtubeController.handleGetCourseProgress(userId);

        const skillRepository = await getSkillRepository(userId);

        const userGoalType = user.goalType;
        const userGoalHours = user.goalHours;

        const currentDate = new Date().toISOString().split("T")[0];
        const startEndDates = getStartAndEndDate(currentDate);

        let userLearningHours = 0;
        if (userGoalType === "week") {
            const weeklyLearning = await Daily_Learning.find({
                userId: userId,
                date: {
                    $gte: startEndDates.weekStart,
                    $lte: startEndDates.weekEnd,
                },
            });
            userLearningHours = weeklyLearning.reduce(
                (total, learning) => total + learning.learned,
                0,
            );
        } else if (userGoalType === "month") {
            const monthlyLearning = await Daily_Learning.find({
                userId: userId,
                date: {
                    $gte: startEndDates.monthStart,
                    $lte: startEndDates.monthEnd,
                },
            });
            userLearningHours = monthlyLearning.reduce(
                (total, learning) => total + learning.learned,
                0,
            );
        } else if (userGoalType === "year") {
            const yearlyLearning = await Daily_Learning.find({
                userId: userId,
                date: {
                    $gte: startEndDates.yearStart,
                    $lte: startEndDates.yearEnd,
                },
            });
            userLearningHours = yearlyLearning.reduce(
                (total, learning) => total + learning.learned,
                0,
            );
        }
        const goal = {
            goalType: userGoalType,
            goalTarget: userGoalHours,
            goalDone: Math.round(userLearningHours / 3600),
            goalDonePercentage: Math.round(
                (userLearningHours / 3600 / userGoalHours) * 100,
            ),
        };

        const learningActivities = await getlearningActivites(userId);

        const MoMPerformance = await getMoMPerformance(userId);

        const dashboard = {
            goal: goal,
            skillRepository: skillRepository,
            learningActivities: learningActivities,
            momPercentage: MoMPerformance,
            coursesInProgress: coursesInProgress,
        };

        res.send(dashboard);
    } catch (error) {
        console.log(
            ErrorLogConstant.dashboardController.handleGetDashboardErrorLog,
            error.message,
        );
        res.status(HttpStatusCode.InternalServerError).json({
            status: HttpStatusConstant.ERROR,
            code: HttpStatusCode.InternalServerError,
        });
    }
};

exports.handleGetStaffDepartmentDashboard = async (req, res) => {
    try {
        const { staffId } = req.staffSession;

        const staff = await Staff.findOne({ staffId });

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

        const students = await User.aggregate([
            {
                $match: {
                    departmentId,
                },
            },
            {
                $lookup: {
                    from: "educations",
                    localField: "userId",
                    foreignField: "userId",
                    as: "educations",
                },
            },
            {
                $lookup: {
                    from: "workexperiences",
                    localField: "userId",
                    foreignField: "userId",
                    as: "workExperiences",
                },
            },
            {
                $lookup: {
                    from: "licensecertifications",
                    localField: "userId",
                    foreignField: "userId",
                    as: "licenceCertifications",
                },
            },
            {
                $lookup: {
                    from: "projects",
                    localField: "userId",
                    foreignField: "userId",
                    as: "projects",
                },
            },
        ]);

        const startEndDates = getStartAndEndDate(
            new Date().toISOString().split("T")[0],
        );

        let learningHoursSum = 0;
        let activeStudents = 0;
        let totalRoleBasedSkills = 0;
        let totalInterestBasedSkills = 0;

        const skillCount = {};

        const studentDetails = [];

        for (const student of students) {
            const dailyLearnings = await Daily_Learning.find({
                userId: student.userId,
                date: {
                    $gte: startEndDates.monthStart,
                    $lte: startEndDates.monthEnd,
                },
            });
            let studentLearningHours = 0;
            for (const dailyLearning of dailyLearnings) {
                learningHoursSum += dailyLearning.learned;
                studentLearningHours += dailyLearning.learned;
            }
            studentLearningHours = Math.round(studentLearningHours / 3600);
            const rollNumber = student.rollNumber;
            const courseStartYear = student.courseStartYear;
            const courseEndYear = student.courseEndYear;
            const studentInfo = {
                userId: student.userId,
                departmentName: department.name,
                fullName: student.fullName,
                rollNumber: rollNumber,
                studentLearningHours: studentLearningHours,
                courseStartYear: courseStartYear,
                courseEndYear: courseEndYear,
            };
            studentDetails.push(studentInfo);

            if (student.isActive) {
                activeStudents++;
            }

            for (const workExp of student.workExperiences) {
                for (const skill of workExp.skills) {
                    if (student.interestBasedSkills.includes(skill.skillId)) {
                        totalInterestBasedSkills++;
                    } else {
                        totalRoleBasedSkills++;
                    }
                    if (!skillCount[skill.skillId]) {
                        skillCount[skill.skillId] = 0;
                    }
                    skillCount[skill.skillId]++;
                }
            }

            for (const license of student.licenceCertifications) {
                for (const skill of license.skills) {
                    if (student.interestBasedSkills.includes(skill.skillId)) {
                        totalInterestBasedSkills++;
                    } else {
                        totalRoleBasedSkills++;
                    }
                    if (!skillCount[skill.skillId]) {
                        skillCount[skill.skillId] = 0;
                    }
                    skillCount[skill.skillId]++;
                }
            }

            for (const project of student.projects) {
                for (const skill of project.skills) {
                    if (student.interestBasedSkills.includes(skill.skillId)) {
                        totalInterestBasedSkills++;
                    } else {
                        totalRoleBasedSkills++;
                    }
                    if (!skillCount[skill.skillId]) {
                        skillCount[skill.skillId] = 0;
                    }
                    skillCount[skill.skillId]++;
                }
            }
        }

        studentDetails.sort(
            (a, b) => b.studentLearningHours - a.studentLearningHours,
        );

        const top10MostActiveStudents = studentDetails.slice(0, 10);

        let totalCount = totalRoleBasedSkills + totalInterestBasedSkills;

        const skillIds = Object.keys(skillCount);
        const skillWithCount = {};
        for (const skillId of skillIds) {
            const skill = await Skill.findOne({ skillId: skillId });
            const skillName = skill.skillName;
            if (skillName) {
                skillWithCount[skillName] = (
                    (skillCount[skillId] / totalCount) *
                    100
                ).toFixed(2);
            }
        }

        const totalMontlyHoursOfInvolvement = Math.round(
            learningHoursSum / 3600,
        );

        let totalJobs = 0;
        let totalHired = 0;
        const jobs = await Job.find({ institutionId });

        for (const job of jobs) {
            if (job.departments.includes(departmentId)) {
                totalJobs++;
                totalHired += job.hiredCount;
            }
        }

        return res.status(HttpStatusCode.Ok).json({
            status: HttpStatusConstant.OK,
            code: HttpStatusCode.Ok,
            data: {
                departmentName: department.name,
                studentsPlacedThisYear: totalHired,
                totalJobsPosted: totalJobs,
                totalMontlyHoursOfInvolvement,
                skillsBeingLearntActively: totalCount,
                activeStudents,
                mostAcquiredSkills: skillWithCount,
                mostActiveStudents: top10MostActiveStudents,
            },
        });
    } catch (error) {
        console.log(
            ErrorLogConstant.dashboardController
                .handleGetStaffDepartmentDashboardErrorLog,
            error.message,
        );
        res.status(HttpStatusCode.InternalServerError).json({
            status: HttpStatusConstant.ERROR,
            code: HttpStatusCode.InternalServerError,
        });
    }
};

exports.handleGetAdminInstitutionDashboard = async (req, res) => {
    try {
        const { staffId } = req.staffSession;

        const staff = await Staff.findOne({ staffId });

        const institutionId = staff.institutionId;

        const institution = await Institution.findOne({ institutionId });
        if (!institution) {
            return res.status(HttpStatusCode.NotFound).json({
                status: HttpStatusConstant.NOT_FOUND,
                code: HttpStatusCode.NotFound,
                message: ResponseMessageConstant.INSTITUTION_NOT_FOUND,
            });
        }

        const students = await User.aggregate([
            {
                $match: {
                    institutionId,
                },
            },
            {
                $lookup: {
                    from: "educations",
                    localField: "userId",
                    foreignField: "userId",
                    as: "educations",
                },
            },
            {
                $lookup: {
                    from: "workexperiences",
                    localField: "userId",
                    foreignField: "userId",
                    as: "workExperiences",
                },
            },
            {
                $lookup: {
                    from: "licensecertifications",
                    localField: "userId",
                    foreignField: "userId",
                    as: "licenceCertifications",
                },
            },
            {
                $lookup: {
                    from: "projects",
                    localField: "userId",
                    foreignField: "userId",
                    as: "projects",
                },
            },
        ]);

        const startEndDates = getStartAndEndDate(
            new Date().toISOString().split("T")[0],
        );

        let learningHoursSum = 0;
        let activeStudents = 0;
        let totalRoleBasedSkills = 0;
        let totalInterestBasedSkills = 0;

        const skillCount = {};

        const studentDetails = [];

        for (const student of students) {
            const dailyLearnings = await Daily_Learning.find({
                userId: student.userId,
                date: {
                    $gte: startEndDates.monthStart,
                    $lte: startEndDates.monthEnd,
                },
            });
            let studentLearningHours = 0;
            for (const dailyLearning of dailyLearnings) {
                learningHoursSum += dailyLearning.learned;
                studentLearningHours += dailyLearning.learned;
            }
            studentLearningHours = Math.round(studentLearningHours / 3600);
            const rollNumber = student.rollNumber;
            const courseStartYear = student.courseStartYear;
            const courseEndYear = student.courseEndYear;
            const studentInfo = {
                userId: student.userId,
                fullName: student.fullName,
                departmentId: student.departmentId,
                rollNumber: rollNumber,
                isActive: student.isActive,
                studentLearningHours: studentLearningHours,
                courseStartYear: courseStartYear,
                courseEndYear: courseEndYear,
            };
            studentDetails.push(studentInfo);

            if (student.isActive) {
                activeStudents++;
            }

            for (const workExp of student.workExperiences) {
                for (const skill of workExp.skills) {
                    if (student.interestBasedSkills.includes(skill.skillId)) {
                        totalInterestBasedSkills++;
                    } else {
                        totalRoleBasedSkills++;
                    }
                    if (!skillCount[skill.skillId]) {
                        skillCount[skill.skillId] = 0;
                    }
                    skillCount[skill.skillId]++;
                }
            }

            for (const license of student.licenceCertifications) {
                for (const skill of license.skills) {
                    if (student.interestBasedSkills.includes(skill.skillId)) {
                        totalInterestBasedSkills++;
                    } else {
                        totalRoleBasedSkills++;
                    }
                    if (!skillCount[skill.skillId]) {
                        skillCount[skill.skillId] = 0;
                    }
                    skillCount[skill.skillId]++;
                }
            }

            for (const project of student.projects) {
                for (const skill of project.skills) {
                    if (student.interestBasedSkills.includes(skill.skillId)) {
                        totalInterestBasedSkills++;
                    } else {
                        totalRoleBasedSkills++;
                    }
                    if (!skillCount[skill.skillId]) {
                        skillCount[skill.skillId] = 0;
                    }
                    skillCount[skill.skillId]++;
                }
            }
        }

        const departmentLearningHours = {};
        const departmentActiveStudents = {};

        for (const student of studentDetails) {
            const departmentId = student.departmentId;
            if (!departmentLearningHours[departmentId]) {
                departmentLearningHours[departmentId] = 0;
            }
            departmentLearningHours[departmentId] +=
                student.studentLearningHours;
            if (student.isActive) {
                if (!departmentActiveStudents[departmentId]) {
                    departmentActiveStudents[departmentId] = 0;
                }
                departmentActiveStudents[departmentId]++;
            }
        }
        const departments = await Department.find({ institutionId });
        const departmentMap = {};
        departments.forEach((department) => {
            departmentMap[department.departmentId] = department.name;
        });
        const mostActiveDepartments = Object.entries(
            departmentLearningHours,
        ).map(([departmentId, totalLearningHours]) => ({
            departmentId: departmentId,
            department: departmentMap[departmentId],
            activeStudents: departmentActiveStudents[departmentId] || 0,
            totalLearningHours,
        }));

        mostActiveDepartments.sort(
            (a, b) => b.totalLearningHours - a.totalLearningHours,
        );

        const top10MostActiveDepartments = mostActiveDepartments.slice(0, 10);

        let totalCount = totalRoleBasedSkills + totalInterestBasedSkills;

        const skillIds = Object.keys(skillCount);
        const skillWithCount = {};
        for (const skillId of skillIds) {
            const skill = await Skill.findOne({ skillId: skillId });
            const skillName = skill.skillName;
            if (skillName) {
                skillWithCount[skillName] = (
                    (skillCount[skillId] / totalCount) *
                    100
                ).toFixed(2);
            }
        }

        const totalMontlyHoursOfInvolvement = Math.round(
            learningHoursSum / 3600,
        );

        let totalJobs = 0;
        let totalHired = 0;
        const jobs = await Job.find({ institutionId });

        for (const job of jobs) {
            totalJobs++;
            totalHired += job.hiredCount;
        }

        return res.status(HttpStatusCode.Ok).json({
            status: HttpStatusConstant.OK,
            code: HttpStatusCode.Ok,
            data: {
                InstitutionName: institution.name,
                studentsPlacedThisYear: totalHired,
                totalJobsPosted: totalJobs,
                totalMontlyHoursOfInvolvement,
                skillsBeingLearntActively: totalCount,
                activeStudents,
                mostAcquiredSkills: skillWithCount,
                mostActiveDepartments: top10MostActiveDepartments,
            },
        });
    } catch (error) {
        console.log(
            ErrorLogConstant.dashboardController
                .handleGetAdminInstitutionDashboardErrorLog,
            error.message,
        );
        res.status(HttpStatusCode.InternalServerError).json({
            status: HttpStatusConstant.ERROR,
            code: HttpStatusCode.InternalServerError,
        });
    }
};

exports.handleGetAdminDepartmentDashboard = async (req, res) => {
    try {
        const { staffId } = req.staffSession;

        const staff = await Staff.findOne({ staffId });

        const institutionId = staff.institutionId;

        const institution = await Institution.findOne({ institutionId });

        if (!institution) {
            return res.status(HttpStatusCode.NotFound).json({
                status: HttpStatusConstant.NOT_FOUND,
                code: HttpStatusCode.NotFound,
                message: ResponseMessageConstant.INSTITUTION_NOT_FOUND,
            });
        }

        const { departmentId } = req.params;

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

        const students = await User.aggregate([
            {
                $match: {
                    departmentId,
                },
            },
            {
                $lookup: {
                    from: "educations",
                    localField: "userId",
                    foreignField: "userId",
                    as: "educations",
                },
            },
            {
                $lookup: {
                    from: "workexperiences",
                    localField: "userId",
                    foreignField: "userId",
                    as: "workExperiences",
                },
            },
            {
                $lookup: {
                    from: "licensecertifications",
                    localField: "userId",
                    foreignField: "userId",
                    as: "licenceCertifications",
                },
            },
            {
                $lookup: {
                    from: "projects",
                    localField: "userId",
                    foreignField: "userId",
                    as: "projects",
                },
            },
        ]);

        const startEndDates = getStartAndEndDate(
            new Date().toISOString().split("T")[0],
        );

        let learningHoursSum = 0;
        let activeStudents = 0;
        let totalRoleBasedSkills = 0;
        let totalInterestBasedSkills = 0;

        const skillCount = {};

        const studentDetails = [];

        for (const student of students) {
            const dailyLearnings = await Daily_Learning.find({
                userId: student.userId,
                date: {
                    $gte: startEndDates.monthStart,
                    $lte: startEndDates.monthEnd,
                },
            });
            let studentLearningHours = 0;
            for (const dailyLearning of dailyLearnings) {
                learningHoursSum += dailyLearning.learned;
                studentLearningHours += dailyLearning.learned;
            }
            studentLearningHours = Math.round(studentLearningHours / 3600);
            const rollNumber = student.rollNumber;
            const courseStartYear = student.courseStartYear;
            const courseEndYear = student.courseEndYear;
            const studentInfo = {
                userId: student.userId,
                departmentName: department.name,
                fullName: student.fullName,
                rollNumber: rollNumber,
                studentLearningHours: studentLearningHours,
                courseStartYear: courseStartYear,
                courseEndYear: courseEndYear,
            };
            studentDetails.push(studentInfo);

            if (student.isActive) {
                activeStudents++;
            }

            for (const workExp of student.workExperiences) {
                for (const skill of workExp.skills) {
                    if (student.interestBasedSkills.includes(skill.skillId)) {
                        totalInterestBasedSkills++;
                    } else {
                        totalRoleBasedSkills++;
                    }
                    if (!skillCount[skill.skillId]) {
                        skillCount[skill.skillId] = 0;
                    }
                    skillCount[skill.skillId]++;
                }
            }

            for (const license of student.licenceCertifications) {
                for (const skill of license.skills) {
                    if (student.interestBasedSkills.includes(skill.skillId)) {
                        totalInterestBasedSkills++;
                    } else {
                        totalRoleBasedSkills++;
                    }
                    if (!skillCount[skill.skillId]) {
                        skillCount[skill.skillId] = 0;
                    }
                    skillCount[skill.skillId]++;
                }
            }

            for (const project of student.projects) {
                for (const skill of project.skills) {
                    if (student.interestBasedSkills.includes(skill.skillId)) {
                        totalInterestBasedSkills++;
                    } else {
                        totalRoleBasedSkills++;
                    }
                    if (!skillCount[skill.skillId]) {
                        skillCount[skill.skillId] = 0;
                    }
                    skillCount[skill.skillId]++;
                }
            }
        }

        studentDetails.sort(
            (a, b) => b.studentLearningHours - a.studentLearningHours,
        );

        const top10MostActiveStudents = studentDetails.slice(0, 10);

        let totalCount = totalRoleBasedSkills + totalInterestBasedSkills;

        const skillIds = Object.keys(skillCount);
        const skillWithCount = {};
        for (const skillId of skillIds) {
            const skill = await Skill.findOne({ skillId: skillId });
            const skillName = skill.skillName;
            if (skillName) {
                skillWithCount[skillName] = (
                    (skillCount[skillId] / totalCount) *
                    100
                ).toFixed(2);
            }
        }

        const totalMontlyHoursOfInvolvement = Math.round(
            learningHoursSum / 3600,
        );

        let totalJobs = 0;
        let totalHired = 0;
        const jobs = await Job.find({ institutionId });

        for (const job of jobs) {
            if (job.departments.includes(departmentId)) {
                totalJobs++;
                totalHired += job.hiredCount;
            }
        }

        return res.status(HttpStatusCode.Ok).json({
            status: HttpStatusConstant.OK,
            code: HttpStatusCode.Ok,
            data: {
                departmentName: department.name,
                studentsPlacedThisYear: totalHired,
                totalJobsPosted: totalJobs,
                totalMontlyHoursOfInvolvement,
                skillsBeingLearntActively: totalCount,
                activeStudents,
                mostAcquiredSkills: skillWithCount,
                mostActiveStudents: top10MostActiveStudents,
            },
        });
    } catch (error) {
        console.log(
            ErrorLogConstant.dashboardController
                .handleGetAdminDepartmentDashboardErrorLog,
            error.message,
        );
        res.status(HttpStatusCode.InternalServerError).json({
            status: HttpStatusConstant.ERROR,
            code: HttpStatusCode.InternalServerError,
        });
    }
};

exports.handleUpdateProfile = async (req, res) => {
    try {
        const { staffId } = req.params;

        const staff = await Staff.findOne({ staffId });

        if (!staff) {
            return res.status(HttpStatusCode.NotFound).json({
                status: HttpStatusConstant.NOT_FOUND,
                code: HttpStatusCode.NotFound,
                message: ResponseMessageConstant.STAFF_NOT_FOUND,
            });
        }

        const { fullName, designation, mobile } = req.body;

        const userValidation = Joi.object({
            fullName: Joi.string().required(),
            designation: Joi.string().required(),
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

        staff.fullName = fullName;
        staff.designation = designation;
        staff.mobile = mobile;

        await staff.save();

        res.status(HttpStatusCode.Ok).json({
            status: HttpStatusConstant.SUCCESS,
            code: HttpStatusCode.Ok,
            message: ResponseMessageConstant.PROFILE_UPDATED_SUCCESSFULLY,
        });
    } catch (error) {
        console.log(
            ErrorLogConstant.dashboardController.handleUpdateProfileErrorLog,
            error.message,
        );
        res.status(HttpStatusCode.InternalServerError).json({
            status: HttpStatusConstant.ERROR,
            code: HttpStatusCode.InternalServerError,
        });
    }
};

exports.handleGetInstitutionUsers = async (req, res) => {
    try {
        const { staffId } = req.staffSession;

        const staff = await Staff.findOne({ staffId });

        const institutionId = staff.institutionId;

        const institution = await Institution.findOne({
            institutionId,
        });
        if (!institution) {
            return res.status(HttpStatusCode.NotFound).json({
                status: HttpStatusConstant.NOT_FOUND,
                code: HttpStatusCode.NotFound,
                message: ResponseMessageConstant.INSTITUTION_NOT_FOUND,
            });
        }

        const staffs = await Staff.find({
            institutionId,
            staffId: { $ne: staffId },
        }).select(
            "-_id -password -__v -institutionId -departmentId -mobile -designation",
        );

        return res.status(HttpStatusCode.Ok).json({
            status: HttpStatusConstant.OK,
            code: HttpStatusCode.Ok,
            data: staffs,
        });
    } catch (error) {
        console.log(
            ErrorLogConstant.dashboardController
                .handleGetInstitutionUsersErrorLog,
            error.message,
        );
        res.status(HttpStatusCode.InternalServerError).json({
            status: HttpStatusConstant.ERROR,
            code: HttpStatusCode.InternalServerError,
        });
    }
};
