// routes/AuthRoutes.js
import express from "express";
import Authentication from "../modules/Authentication.js";

const router = express.Router();

router.post("/", async (req, res) => {
  const { email, password } = req.body;

  console.log("📥 Login attempt:", { email });

  if (!email || !password) {
    console.warn("⚠️ Missing email or password in request body");
    return res.status(400).json({ message: "Email and password are required" });
  }

  let result;
  try {
    // Verify login credentials
    result = await Authentication.verifyPermissions({ email, password });
  } catch (err) {
    console.error(
      "❌ Error during permission verification: (your {email, password} does not exist)",
      err
    );
    return res.status(500).json({ message: "Internal server error" });
  }

  if (!result) {
    console.warn(`⚠️ Invalid credentials for ${email}`);
    return res.status(401).json({ message: "Invalid credentials" });
  }

  console.log(`✅ Login successful for ${email}`, {
    role: result.role,
    key: result.key,
  });

  // Return ONLY loginOnlyDetails
  res.json({
    loginOnlyDetails: {
      userId: result.userId,
      email,
      role: result.role,
      verificationKey: result.key,
    },
  });
});

export default router;
