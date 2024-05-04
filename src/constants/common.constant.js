module.exports = {
    signatureCookieName: "Record-Signature",
    email: {
        charSet: "UTF-8",
        source: {
            tech_team: "Record Team <tech@getrecord.in>",
        },
        verificationEmail: {
            subject: "Record - Email Address Verification Request",
        },
        resetPasswordEmail: {
            subject: "Record - Reset Password Request",
        },
        verificationOfEducation: {
            subject: (username, degree, branch, institution) =>
                `Record: Verification of education of ${username}, ${degree} in ${branch} in ${institution}`,
        },
        verificationOfWorkExperience: {
            subject: (name, role, employeeId, companyName) =>
                `Record: Verification of employment of ${name}, ${role} (${employeeId}) in ${companyName}`,
        },
        verificationOfLicenseCertification: {
            subject: (name, certificationName, credentialId) =>
                `Record: Verification of Licenses and Certification of ${name}, ${certificationName} (${credentialId})`,
        },
        verificationOfProject: {
            subject: (name, projectName, associatedWith) =>
                `Record: Verification of Project of ${name}, ${projectName} (${associatedWith})`,
        },
        verificationOfActivity: {
            subject: (name, activityName, organisation) =>
                `Record: Verification of Project of ${name}, ${activityName} ${organisation}`,
        },
        jobNotification: {
            subject: (companyName, jobDesignation) =>
                `Record: ${companyName} is hiring ${jobDesignation}`,
        },
        educationRevisionRequest: {
            subject: "Record: Education details revision request",
        },
        workExperienceRevisionRequest: {
            subject: "Record: Experience details revision request",
        },
        licenseCertificationRevisionRequest: {
            subject: "Record: License & Certification details revision request",
        },
        projectRevisionRequest: {
            subject: "Record: Project details revision request",
        },
        activityRevisionRequest: {
            subject: "Record: Activity details revision request",
        },
    },
};
