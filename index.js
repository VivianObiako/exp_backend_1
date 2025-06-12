const express = require("express");
const multer = require("multer");
const bodyParser = require("body-parser");
const formRoutes = require("./routes/sendEmailRoutes");
const { supabase } = require("./supabaseClient");

require("dotenv").config();

const app = express();
const upload = multer();
const PORT = process.env.PORT || 5000;

const cors = require("cors");
app.use(cors());

// Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Routes
app.use("/api/send-expEmail", formRoutes);

// ...existing code...

// Health check/test API
app.get("/api/test", (req, res) => {
  res.status(200).json({ message: "Backend is working!" });
});

app.post("/api/user/delete", async (req, res) => {
  const { userId } = req.body;

  const { error: profileError } = await supabase
    .from("profiles")
    .delete()
    .eq("id", userId);

  if (profileError) {
    console.error("Error deleting profile:", profileError);
    return res.status(500).json({
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

app.post("/api/parse", upload.any(), async (req, res) => {
  try {
    const file = req.files[0];
    const receiverEmail = req.body.to;
    const transactionId = receiverEmail.match(/tx-([a-f0-9\-]+)@/i)[1] || "311604cb-32dc-4880-9b0b-41dc1ef8a67e";

    const filePath = `transactions/${transactionId}/${Date.now()}_${
      file.originalname
    }`;

    const { data, error } = await supabase.storage
      .from("documents")
      .upload(filePath, file.buffer, {
        contentType: file.mimetype,
        upsert: true,
      });

    if (error) {
      console.error("Error uploading file:", error);
      return res
        .status(500)
        .json({ message: "Failed to upload file", error: error.message });
    }

    const { data: transactionData, error: transactionError } = await supabase
      .from("transactions")
      .select("*")
      .eq("id", transactionId)
      .single();

    if (transactionError) {
      console.error(
        "Error fetching user id with transaction id:",
        transactionError
      );
      return res.status(500).json({
        message: "Failed to fetch user id with transaction id",
        error: transactionError.message,
      });
    }

    const {
      data: { publicUrl },
    } = supabase.storage.from("documents").getPublicUrl(filePath);

    const { data: docData, error: docError } = await supabase
      .from("transaction_documents")
      .insert({
        transaction_id: transactionId,
        title: file.originalname,
        document_type: 'other',
        file_url: publicUrl,
        file_size: file.size,
        uploaded_by: transactionData.user_id,
        checklist_item_id: null,
      })
      .select()
      .single();

    if (docError) {
      console.error("Error saving data in transaction documents table:", docError);
      return res.status(500).json({
        message: "Failed to save data in transaction documents table:",
        error: docError.message,
      });
    }

    res.status(200).json({ message: "File uploaded successfully", data });
  } catch (err) {
    console.error("Error in /api/parse:", err);
    res
      .status(500)
      .json({ message: "Internal server error", error: err.message });
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on ${PORT}`);
});

module.exports = app; // Export the app for testing purposes
