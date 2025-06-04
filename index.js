const express = require("express");
const bodyParser = require("body-parser");
const formRoutes = require("./routes/sendEmailRoutes");
const { supabase } = require("./supabaseClient");

require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 5000;

const cors = require("cors");
app.use(cors());

// Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Routes
app.use("/api/send-expEmail", formRoutes);

app.use("/api/user/delete", async (req, res) => {
  const { userId } = req.body;

  const { error: profileError } = await supabase
    .from("profiles")
    .delete()
    .eq("id", userId);

  if (profileError) {
    console.error("Error deleting profile:", profileError);
    return res
      .status(500)
      .json({
        message: "Failed to delete profile",
        error: profileError.message,
      });
  }

  const { error: authError } = await supabase.auth.admin.deleteUser(userId);

  if (authError) {
    console.error("Error deleting user:", authError);
    return res
      .status(500)
      .json({ message: "Failed to delete user", error: authError.message });
  } else {
    console.log("User deleted successfully:", userId);
    return res.status(200).json({ message: "User deleted successfully" });
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on ${PORT}`);
});

module.exports = app; // Export the app for testing purposes
