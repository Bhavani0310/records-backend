const express = require("express");
const cors = require("cors");

const app = express();

app.use(
    cors({
        origin: [process.env.STUDENT_WEBSITE, process.env.STAFF_WEBSITE],
        methods: ["GET", "PUT", "POST", "DELETE", "OPTIONS"],
        credentials: true,
    }),
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/", (req, res) => {
    res.send("Server is Live!!");
});

const routes = require("./routes");
app.use("/api", routes);

module.exports = app;
