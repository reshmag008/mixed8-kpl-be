const { Storage } = require("@google-cloud/storage");
const path = require("path");
const fs = require("fs");

const serviceAccount = process.env.GCP_SERVICE_ACCOUNT_KEY_JSON ? JSON.parse(process.env.GCP_SERVICE_ACCOUNT_KEY_JSON) : {};

// const storage = new Storage({
//   keyFilename: path.resolve(__dirname, "../keys/gcp-service.json"),
//   projectId: "smooth-kiln-478304-t6",
// });
const storage = new Storage({
  credentials: serviceAccount,
});

// console.log("Key exists:", fs.existsSync(path.resolve(__dirname, "../keys/gcp-service-account.json")));


const bucketName = "auction-players";
const bucket = storage.bucket(bucketName);
module.exports = { bucket };
