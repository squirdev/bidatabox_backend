const mongoose = require("mongoose");
const { Schema } = mongoose;

const PhoneDetectSchema = new mongoose.Schema(
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
    activenumber: { type: Number },
    unregisternumber: { type: Number },
    fileurl: { type: String },
  },
  { timestamps: true }
);

module.exports = mongoose.model("PhoneDetect", PhoneDetectSchema);
