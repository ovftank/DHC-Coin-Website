const mongoose = require("mongoose");

mongoose.connect(
  "mongodb+srv://daylacaiid:NWnaCsd48Ovi3MfF@dhccoin.vgnyudr.mongodb.net/users?retryWrites=true&w=majority&appName=DHCCoin",
);
const db = mongoose.connection;
db.on("error", console.error.bind(console, "Connection error:"));
db.once("open", function () {
  console.log("Connected to MongoDB");
});

const userSchema = new mongoose.Schema({
  affiliate_id: { type: String, required: true, unique: true },
  balance: { type: Number, default: 0 },
  balance_affiliate: { type: Number, default: 0 },
  role: { type: String, required: true },
  user_id: { type: String, required: true },
  rate: { type: Number, default: 0 },
  withdrawal_request: [
    {
      status: { type: String, required: true },
      amount: { type: Number, required: true },
      source: { type: String, required: true },
      createdAt: { type: Date, default: Date.now },
    },
  ],
  withdrawal_history: [
    {
      status: { type: String, required: true },
      amount: { type: Number, required: true },
      source: { type: String, required: true },
      createdAt: { type: Date, default: Date.now },
    },
  ],
});

const coinSchema = new mongoose.Schema({
  coin: { type: String, required: true, unique: true },
  rate: { type: Number, required: true },
  countSell: { type: Number, default: 0 },
  countRound: { type: Number, default: 0 },
});

const createAffiliateId = () => {
  const characters =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let result = "";
  for (let i = 0; i < 10; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return result;
};

const adminSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
});
const User = mongoose.model("User", userSchema);
const Admin = mongoose.model("Admin", adminSchema);

module.exports = { db, User, Admin, createAffiliateId };
