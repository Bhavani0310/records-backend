exports.revisionRequest = (type, username, comment, link) => {
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
