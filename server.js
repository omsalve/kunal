const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const Contact = require("./contact"); // Importing your existing Mongoose schema

// Load environment variables for local testing
if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config();
}

const app = express();
app.use(cors());
app.use(express.json());

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => console.log("MongoDB Connected"))
  .catch(err => console.log("MongoDB Connection Error:", err));

// ================= CONTACT FORM =================
app.post("/contact", async (req, res) => {
  try {
    const { name, phone, email, service, message } = req.body;

    if (!name || !phone) {
      return res.status(400).json({ success: false, message: "Name and phone required" });
    }

    // Save lead to MongoDB
    const newLead = new Contact({ name, phone, email, service, message });
    await newLead.save();

    res.json({
      success: true,
      whatsapp: `https://api.whatsapp.com/send?phone=919137426363&text=New Lead:%0AName:${name}%0APhone:${phone}%0AService:${service}`
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// ================= GET LEADS =================
app.get("/leads", async (req, res) => {
  try {
    const leads = await Contact.find().sort({ createdAt: -1 }); // Newest first
    res.json(leads);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Export the app for Vercel Serverless functionality
module.exports = app;

// Keep the server listening for local testing
if (process.env.NODE_ENV !== 'production') {
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
}