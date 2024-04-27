const mongoose = require("mongoose");

const connectDB = async () => {
    try {
        const connectionInstance = await mongoose.connect(
            `${process.env.MONGODB_CONNECTION_URI}`,
        );
        console.log(
            `MongoDB Connected !! DB HOST: ${connectionInstance.connection.host}`,
        );
    } catch (error) {
        console.log("MongoDB Connection Error: ", error);
        process.exit(1);
    }
};

module.exports = connectDB;
