
const MONGODB_URI =
  process.env.MONGODB_URI ||
  "mongodb+srv://lorenzezz0987:Lorenzezz003421@cluster0.vovdaod.mongodb.net/test?retryWrites=true&w=majority&appName=Cluster0";

const JWT_SECRET = process.env.JWT_SECRET || "bennykyut3421.!";

module.exports = {
  MONGODB_URI,
  JWT_SECRET,
};
