const mongoose = require("mongoose");
const { Schema } = mongoose;

const SocialDetectSchema = new mongoose.Schema(
  {
    userid: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    username: { type: String, required: true },
    taskname: { type: String, required: true },
    sendid: { type: String, required: true },
    entirenumber: { type: Number },
    type: { type: String },
    activeday: { type: String },
    validnumber: { type: Number },
    activatednumber: { type: Number },
    unknownnumber: { type: Number },
    compressedfileurl: { type: String },
    validfileurl: { type: String },
    csvfileurl: { type: String },
  },
  { timestamps: true }
);

module.exports = mongoose.model("SocialDetect", SocialDetectSchema);
