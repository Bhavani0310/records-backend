const mongoose = require("mongoose");

const youtubeCourseSchema = new mongoose.Schema(
    {
        youtubeCourseId: {
            type: String,
            required: true,
        },
        authorId: {
            type: String,
            required: true,
        },
        playlistId: {
            type: String,
            required: true,
        },
        isCompleted: { type: Boolean, default: false },
        courseMetaData: { type: Object, required: true },
        courseContent: { type: Object, required: true },
        courseProgress: { type: Object, required: true },
        courseNotes: [
            {
                videoId: {
                    type: String,
                    required: true,
                },
                notes: [
                    {
                        text: {
                            type: String,
                            required: true,
                        },
                        time: {
                            type: Number,
                            required: true,
                        },
                        videoTime: {
                            type: Number,
                            required: true,
                        },
                    },
                ],
            },
        ],
    },
    { timestamps: true },
);

const Youtube_Course = mongoose.model("Youtube_Course", youtubeCourseSchema);

module.exports = Youtube_Course;
