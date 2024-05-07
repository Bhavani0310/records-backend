exports.educationRevisionRequest = (type, username, comment, link) => {
    return `<!DOCTYPE html>
                <html lang="en">
                <body style="font-family: Arial, sans-serif;">

                    <div style="max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ccc;">
                        <h2 style="text-align: center;">Record</h2>
                        <h4 style="text-align: center;">Update Your ${type} Details</h4>
                        <hr>
                        
                        <p>Dear ${username},</p>
                        <p>You have received a revision request from your verifier:</p>
                        <div style="background-color: #f2f2f2; padding: 10px; border-radius: 5px;">
                            <p>${comment}</p>
                        </div>
                        <div style="text-align: center; margin-top: 10px;">
                            <a href=${link} style="display: inline-block; background-color: #007bff; color: #fff; text-decoration: none; padding: 10px 20px; border-radius: 5px;">Update Now</a>
                        </div>
                        <hr>
                        <p style="text-align: center; font-size: 0.8rem;">This email was sent by Records.</p>
                    </div>

                </body>

                </html>
                `;
};

exports.workExperienceRevisionRequest = (
    type,
    username,
    comment,
    endorsedSkills,
    link,
) => {
    const endorsedSkillsHTML = endorsedSkills
        .map((skill) => {
            return `<span style="background-color: #f2f2f2; padding: 10px; border-radius: 5px;">${skill}</span>`;
        })
        .join(" ");
    return `<!DOCTYPE html>
                <html lang="en">
                <body style="font-family: Arial, sans-serif;">

                    <div style="max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ccc;">
                        <h2 style="text-align: center;">Record</h2>
                        <h4 style="text-align: center;">Update Your ${type} Details</h4>
                        <hr>
                        
                        <p>Dear ${username},</p>
                        <p>You have received a revision request from your verifier:</p>
                        <div style="background-color: #f2f2f2; padding: 10px; border-radius: 5px;">
                            <p>${comment}</p>
                        </div>
                        <div style="text-align: center; margin-top: 10px;">
                            <a href=${link} style="display: inline-block; background-color: #007bff; color: #fff; text-decoration: none; padding: 10px 20px; border-radius: 5px;">Update Now</a>
                        </div>
                        <p>Endorsed Skills: ${endorsedSkillsHTML}</p>
                        <hr>
                        <p style="text-align: center; font-size: 0.8rem;">This email was sent by Records.</p>
                    </div>

                </body>

                </html>
                `;
};

exports.educationVerificationRequest = (
    type,
    username,
    degree,
    branch,
    institution,
    link,
) => {
    return `<!DOCTYPE html>
                <html lang="en">

                <body style="font-family: Arial, sans-serif;">

                    <div style="max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ccc;">
                        <h2 style="text-align: center;">${type} Records Verification Required</h2>
                        <hr>
                        
                        <p>Dear Verifier,</p>
                        <p><strong>${username}</strong> has added their ${type} as a <strong>${degree}</strong> in <strong>${branch}</strong> in <strong>${institution}</strong>. Please verify the details using the following link:</p>
                        <div style="text-align: center; margin-top: 20px;">
                            <a href=${link} style="display: inline-block; background-color: #007bff; color: #fff; text-decoration: none; padding: 10px 20px; border-radius: 5px;">Verify Now</a>
                        </div>
                        <p>If you dont recognize this as true, you can safely ignore this email.</p>
                        <hr>
                        <p style="text-align: center; font-size: 0.8rem;">This email was sent by Records.</p>
                    </div>

                </body>

                </html>
                `;
};

exports.workExperienceVerificationRequest = (
    type,
    username,
    role,
    employeeId,
    companyName,
    link,
) => {
    return `<!DOCTYPE html>
                <html lang="en">

                <body style="font-family: Arial, sans-serif;">

                    <div style="max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ccc;">
                        <h2 style="text-align: center;">${type} Records Verification Required</h2>
                        <hr>
                        
                        <p>Dear Verifier,</p>
                        <p><strong>${username}</strong> has added their experience as a <strong>${role} (${employeeId})</strong> in <strong>${companyName}</strong>. Please verify the details using the following link:</p>
                        <div style="text-align: center; margin-top: 20px;">
                            <a href=${link} style="display: inline-block; background-color: #007bff; color: #fff; text-decoration: none; padding: 10px 20px; border-radius: 5px;">Verify Now</a>
                        </div>
                        <p>If you dont recognize this as true, you can safely ignore this email.</p>
                        <hr>
                        <p style="text-align: center; font-size: 0.8rem;">This email was sent by Records.</p>
                    </div>

                </body>

                </html>
                `;
};

exports.licenseCertificateVerificationRequest = (
    type,
    username,
    certificationName,
    organization,
    link,
) => {
    return `<!DOCTYPE html>
                <html lang="en">

                <body style="font-family: Arial, sans-serif;">

                    <div style="max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ccc;">
                        <h2 style="text-align: center;">${type} Records Verification Required</h2>
                        <hr>
                        
                        <p>Dear Verifier,</p>
                        <p><strong>${username}</strong> has added their License & Certification - <strong>${certificationName}</strong> in <strong>${organization}</strong>. Please verify the details using the following link:</p>
                        <div style="text-align: center; margin-top: 20px;">
                            <a href=${link} style="display: inline-block; background-color: #007bff; color: #fff; text-decoration: none; padding: 10px 20px; border-radius: 5px;">Verify Now</a>
                        </div>
                        <p>If you dont recognize this as true, you can safely ignore this email.</p>
                        <hr>
                        <p style="text-align: center; font-size: 0.8rem;">This email was sent by Records.</p>
                    </div>

                </body>

                </html>
                `;
};

exports.projectVerificationRequest = (
    type,
    username,
    projectName,
    associatedWith,
    link,
) => {
    return `<!DOCTYPE html>
                <html lang="en">

                <body style="font-family: Arial, sans-serif;">

                    <div style="max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ccc;">
                        <h2 style="text-align: center;">${type} Records Verification Required</h2>
                        <hr>
                        
                        <p>Dear Verifier,</p>
                        <p><strong>${username}</strong> has added their project - <strong>${projectName}</strong> while they worked at <strong>${associatedWith}</strong>. Please verify the details using the following link:</p>
                        <div style="text-align: center; margin-top: 20px;">
                            <a href=${link} style="display: inline-block; background-color: #007bff; color: #fff; text-decoration: none; padding: 10px 20px; border-radius: 5px;">Verify Now</a>
                        </div>
                        <p>If you dont recognize this as true, you can safely ignore this email.</p>
                        <hr>
                        <p style="text-align: center; font-size: 0.8rem;">This email was sent by Records.</p>
                    </div>

                </body>

                </html>
                `;
};

exports.activityVerificationRequest = (
    type,
    username,
    activityName,
    organisation,
    link,
) => {
    return `<!DOCTYPE html>
                <html lang="en">

                <body style="font-family: Arial, sans-serif;">

                    <div style="max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ccc;">
                        <h2 style="text-align: center;">${type} Records Verification Required</h2>
                        <hr>
                        
                        <p>Dear Verifier,</p>
                        <p><strong>${username}</strong> has added their activity - <strong>${activityName}</strong> in <strong>${organisation}</strong>. Please verify the details using the following link:</p>
                        <div style="text-align: center; margin-top: 20px;">
                            <a href=${link} style="display: inline-block; background-color: #007bff; color: #fff; text-decoration: none; padding: 10px 20px; border-radius: 5px;">Verify Now</a>
                        </div>
                        <p>If you dont recognize this as true, you can safely ignore this email.</p>
                        <hr>
                        <p style="text-align: center; font-size: 0.8rem;">This email was sent by Records.</p>
                    </div>

                </body>

                </html>
                `;
};

const generateOtherJobsHTML = (otherJobs) => {
    let otherJobsHTML = "";
    otherJobs.forEach((job) => {
        otherJobsHTML += `
            <div>
                <p><strong>${job.jobDesignation}</strong><br>
                    <strong>${job.companyName}</strong> | ${job.jobLocation} (${
            job.workplaceType
        })<br>
                    <strong>${job.jobType}</strong> | ${
            job.openings
        } Openings | Posted On: ${
            new Date(job.postedOn).toISOString().split("T")[0]
        }<br> <a href="#">Apply Now</a>
                </p>
            </div>
        `;
    });
    return otherJobsHTML;
};

exports.jobOpportunity = (fullName, postedJob, otherJobs) => {
    const postedJobHTML = `
        <div>
            <p><strong>${postedJob.jobDesignation}</strong><br>
                <strong>${postedJob.companyName}</strong> | ${postedJob.jobLocation} (${postedJob.workplaceType})<br>
                <strong>${postedJob.jobType}</strong> | ${postedJob.openings} Openings <a href="#">Apply Now</a>
            </p>
        </div>
    `;

    const otherJobsHTML = generateOtherJobsHTML(otherJobs);

    return `
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>New Placement Opportunity Alert</title>
        </head>
        <body style="font-family: Arial, sans-serif;">
            <div style="max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ccc;">
                <h2 style="text-align: center;">New Placement Opportunity Alert</h2>
                <hr>
                <p>Dear ${fullName},</p>
                <p>Your College is Recommending to apply to this opportunity:</p>
                ${postedJobHTML}
                <hr>
                <p>Other Assigned Opportunities:</p>
                ${otherJobsHTML}
                <hr>
                <p style="text-align: center; font-size: 0.8rem;">This email was sent by Records</p>
            </div>
        </body>
        </html>
    `;
};

exports.forgotPassword = (link) => {
    return `<!DOCTYPE html>
                <html lang="en">
                <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Forgot Password</title>
                <style>
                    /* Styles for better rendering in email clients */
                    body {
                    font-family: Arial, sans-serif;
                    line-height: 1.6;
                    margin: 0;
                    padding: 0;
                    }
                    .container {
                    max-width: 600px;
                    margin: 20px auto;
                    padding: 20px;
                    border: 1px solid #ccc;
                    border-radius: 5px;
                    }
                    h1 {
                    text-align: center;
                    }
                    p {
                    margin-bottom: 20px;
                    }
                    .button-container {
                    text-align: center;
                    }
                    .button {
                    display: inline-block;
                    padding: 10px 20px;
                    background-color: #007bff;
                    color: #fff;
                    text-decoration: none;
                    border-radius: 5px;
                    }
                    .button:hover {
                    background-color: #0056b3;
                    }
                </style>
                </head>
                <body>
                <div class="container">
                    <h1>Forgot Your Password?</h1>
                    <p>No worries, it happens! Click the button below to reset your password:</p>
                    <div class="button-container">
                    <a href=${link} class="button">Reset Password</a>
                    </div>
                    <p>If you didn't request a password reset, you can safely ignore this email.</p>
                    <p>Thanks,<br>Your Records Team</p>
                </div>
                </body>
                </html>
                `;
};

exports.forgotPasswordSuperAdmin = (password_reset_token) => {
    return `<!DOCTYPE html>
                <html lang="en">
                <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Forgot Password</title>
                <style>
                    /* Styles for better rendering in email clients */
                    body {
                    font-family: Arial, sans-serif;
                    line-height: 1.6;
                    margin: 0;
                    padding: 0;
                    background-color: #f4f4f4;
                    }
                    .container {
                    max-width: 600px;
                    margin: 20px auto;
                    padding: 20px;
                    border: 1px solid #ccc;
                    border-radius: 5px;
                    background-color: #fff;
                    box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
                    }
                    h1 {
                    text-align: center;
                    color: #333;
                    }
                    p {
                    margin-bottom: 20px;
                    color: #666;
                    }
                    .button-container {
                    text-align: center;
                    }
                    .button {
                    display: inline-block;
                    padding: 10px 20px;
                    background-color: #007bff;
                    color: #fff;
                    text-decoration: none;
                    border-radius: 5px;
                    }
                    .button:hover {
                    background-color: #0056b3;
                    }
                    .token-container {
                    background-color: #f9f9f9;
                    padding: 5px 10px;
                    border-radius: 5px;
                    text-align: center;
                    }
                </style>
                </head>
                <body>
                <div class="container">
                    <h1>Forgot Your Password?</h1>
                    <p>No worries, it happens! Below is your password reset token:</p>
                    <div class="token-container">
                    <p class="token"><strong>${password_reset_token}</strong></p>
                    </div>
                    <p>If you didn't request a password reset, you can safely ignore this email.</p>
                    <p>Thanks,<br>Your Records Team</p>
                </div>
                </body>
                </html>
                `;
};
