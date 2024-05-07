const express = require("express");
const path = require("path");
const database = require("./database");
const app = express();
const PORT = 3000;

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "public"));

app.use(express.static("public"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/", (req, res) => {
  res.render("index");
});

app.post("/login", async (req, res) => {
  var userData = {};
  try {
    const user = await database.User.findOne({ user_id: req.body.user_id });

    if (user) {
      userData.affiliate_id = user.affiliate_id;
      userData.balance = user.balance;
      userData.balance_affiliate = user.balance_affiliate;
      userData.user_id = user.user_id;
      res.status(200).send(JSON.stringify(userData));
      return;
    }

    const newUser = new database.User({
      affiliate_id: database.createAffiliateId(),
      balance: 0,
      balance_affiliate: 0,
      user_id: req.body.user_id,
      rate: 0,
    });
    await newUser.save();
    userData.affiliate_id = newUser.affiliate_id;
    userData.balance = newUser.balance;
    userData.balance_affiliate = newUser.balance_affiliate;
    userData.user_id = newUser.user_id;
    res.status(200).send(JSON.stringify(userData));
    return;
  } catch (error) {
    res.status(500).send("Error: " + error.message);
  }
});

app.post("/withdraw", async (req, res) => {
  try {
    const { user_id, amount, source } = req.body;
    const user = await database.User.findOne({ user_id });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    if (source === "dhc") {
      if (user.balance < amount) {
        return res.status(400).json({ message: "Insufficient balance" });
      }
    } else {
      if (user.balance_affiliate < amount) {
        return res.status(400).json({ message: "Insufficient balance" });
      }
    }

    user.withdrawal_request.push({ status: "pending", amount, source });
    await user.save();

    return res
      .status(200)
      .json({ message: "Withdrawal request sent successfully" });
  } catch (error) {
    console.error("Error requesting withdrawal:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
});

app.get("/admin", async (req, res) => {
  try {
    const users = await database.User.find();
    res.render("admin", { users });
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).send("Error fetching users");
  }
});

app.post("/admin/:id/delete", async (req, res) => {
  try {
    await database.User.findByIdAndDelete(req.params.id);
    res.redirect("/admin");
  } catch (error) {
    console.error("Error deleting user:", error);
    res.status(500).send("Error deleting user");
  }
});

app.get("/admin/:id/edit", async (req, res) => {
  try {
    const user = await database.User.findById(req.params.id);
    res.render("edit", { user });
  } catch (error) {
    console.error("Error editing user:", error);
    res.status(500).send("Error editing user");
  }
});

app.post("/admin/:id/edit", async (req, res) => {
  try {
    await database.User.findByIdAndUpdate(req.params.id, req.body);
    res.redirect("/admin");
  } catch (error) {
    console.error("Error updating user:", error);
    res.status(500).send("Error updating user");
  }
});

app.post("/admin/withdraw/:id", async (req, res) => {
  try {
    const userId = req.params.id;
    const { requestId } = req.body;

    const user = await database.User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const withdrawalRequestIndex = user.withdrawal_request.findIndex(
      (request) => request._id == requestId,
    );

    if (withdrawalRequestIndex === -1) {
      return res.status(404).json({ message: "Withdrawal request not found" });
    }

    const withdrawalRequest = user.withdrawal_request[withdrawalRequestIndex];

    if (withdrawalRequest.status !== "pending") {
      return res
        .status(400)
        .json({ message: "Withdrawal request has already been processed" });
    }

    const source = withdrawalRequest.source;
    if (source === "dhc") {
      user.balance -= withdrawalRequest.amount;
    } else if (source === "affiliate") {
      user.balance_affiliate -= withdrawalRequest.amount;
    } else {
      return res.status(400).json({ message: "Invalid withdrawal source" });
    }

    user.withdrawal_history.push({
      status: "completed",
      amount: withdrawalRequest.amount,
      source: withdrawalRequest.source,
      createdAt: new Date(),
    });

    user.withdrawal_request.splice(withdrawalRequestIndex, 1);

    await user.save();

    return res.redirect("/admin");
  } catch (error) {
    console.error("Error processing withdrawal request:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
});

app.post("/admin/reject/:id", async (req, res) => {
  try {
    const userId = req.params.id;
    const { requestId } = req.body;

    const user = await database.User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const withdrawalRequestIndex = user.withdrawal_request.findIndex(
      (request) => request._id == requestId,
    );

    if (withdrawalRequestIndex === -1) {
      return res.status(404).json({ message: "Withdrawal request not found" });
    }

    const withdrawalRequest = user.withdrawal_request[withdrawalRequestIndex];

    if (withdrawalRequest.status !== "pending") {
      return res
        .status(400)
        .json({ message: "Withdrawal request has already been processed" });
    }

    withdrawalRequest.status = "rejected";
    user.withdrawal_request.splice(withdrawalRequestIndex, 1);

    user.withdrawal_history.push({
      status: "rejected",
      amount: withdrawalRequest.amount,
      source: withdrawalRequest.source,
      createdAt: new Date(),
    });
    await user.save();

    return res.redirect("/admin");
  } catch (error) {
    console.error("Error rejecting withdrawal request:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port http://localhost:${PORT}`);
});
