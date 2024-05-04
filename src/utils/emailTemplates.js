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

exports.jobOpportunity = (username, postedJob, otherJobs) => {
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
                <p>Dear ${username},</p>
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
