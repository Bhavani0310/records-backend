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
            subject: (name, course) =>
                `Record - Verification of Education for ${name}, ${course}`,
        },
    },
};
