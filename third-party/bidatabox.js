const express = require("express");
const fileUpload = require("express-fileupload");
const axios = require("axios");
const FormData = require("form-data");
const fs = require("fs");
const path = require("path");

const BIDATABOX_ACCOUNT = "@svsjnsj";
const BIDATABOX_PASSWORD = "sv123vip";

module.exports.uploadPhoneDetectFile = async ({ file }) => {
  try {
    const tempDir = path.join(__dirname, "temp");

    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { recursive: true });
    }

    // Save temp file
    const tempPath = path.join(tempDir, file.name);
    await file.mv(tempPath);

    const form = new FormData();
    form.append("account", BIDATABOX_ACCOUNT);
    form.append("pass", BIDATABOX_PASSWORD);
    form.append("file", fs.createReadStream(tempPath));

    const response = await axios.post(
      "http://i.ihmjc.com/api/Upload.ashx",
      form,
      {
        headers: form.getHeaders(),
      }
    );

    fs.unlinkSync(tempPath);

    return response.data;
  } catch (error) {
    console.error("Upload error:", error.message);
    return { ERR: "Upload failed" };
  }
};

module.exports.uploadSocialDetectFile = async ({
  file,
  social,
  taskName,
  activeDay,
}) => {
  try {
    const tempDir = path.join(__dirname, "temp");

    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { recursive: true });
    }

    // Save temp file
    const tempPath = path.join(tempDir, file.name);
    await file.mv(tempPath);

    const form = new FormData();
    form.append("account", BIDATABOX_ACCOUNT);
    form.append("pass", BIDATABOX_PASSWORD);
    form.append(
      "type",
      social == "TG" ? "383C1C76FA98B34C" : "0BEFA8CB12B65D0E"
    );
    form.append("days", activeDay);
    form.append("file", fs.createReadStream(tempPath));

    const response = await axios.post(
      "http://i.ihmjc.com/api/UploadGj.ashx",
      form,
      {
        headers: form.getHeaders(),
      }
    );

    fs.unlinkSync(tempPath);

    return response.data;
  } catch (error) {
    console.error("Upload error:", error.message);
    return { ERR: "Upload failed" };
  }
};

module.exports.PhoneQuery = async ({ sendID }) => {
  try {
    const form = new FormData();
    form.append("account", BIDATABOX_ACCOUNT);
    form.append("pass", BIDATABOX_PASSWORD);
    form.append("sendID", sendID);

    const response = await axios.post(
      "http://i.ihmjc.com/api/Query.ashx",
      form,
      {
        headers: form.getHeaders(),
      }
    );

    return response.data;
  } catch (error) {
    console.error("Query error:", error.message);
    return { error: "Query failed" };
  }
};

module.exports.SocialQuery = async ({ sendID }) => {
  try {
    const form = new FormData();
    form.append("account", BIDATABOX_ACCOUNT);
    form.append("pass", BIDATABOX_PASSWORD);
    form.append("sendID", sendID);

    const response = await axios.post(
      "http://i.ihmjc.com/api/Query.ashx",
      form,
      {
        headers: form.getHeaders(),
      }
    );

    return response.data;
  } catch (error) {
    console.error("Query error:", error.message);
    return { error: "Query failed" };
  }
};

module.exports.resultDownload = async ({ sendID, type }) => {
  try {
    const form = new FormData();
    form.append("account", BIDATABOX_ACCOUNT);
    form.append("pass", BIDATABOX_PASSWORD);
    form.append("sendID", sendID);
    form.append("type", type);

    const config = {
      headers: form.getHeaders(),
    };

    if (type === 1) {
      config.responseType = "arraybuffer";
    }

    const response = await axios.post(
      "http://i.ihmjc.com/api/Download.ashx",
      form,
      config
    );

    return response.data;
  } catch (error) {
    console.error("Download error:", error.message);
    return { ERR: "Download failed" };
  }
};

module.exports.getBalance = async () => {
  try {
    const form = new FormData();
    form.append("account", BIDATABOX_ACCOUNT);
    form.append("pass", BIDATABOX_PASSWORD);

    const response = await axios.post(
      "http://i.ihmjc.com/api/Balance.ashx",
      form,
      {
        headers: form.getHeaders(),
      }
    );

    return response.data;
  } catch (error) {
    console.error("Query error:", error.message);
    return { error: "Query failed" };
  }
};
