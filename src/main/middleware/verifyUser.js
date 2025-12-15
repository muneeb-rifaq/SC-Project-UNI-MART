import Authentication from "../modules/Authentication.js";

export const verifyRole = (expectedRole) => {
  return (req, res, next) => {
    console.log(
      "🔍 verifyRole middleware called for expectedRole:",
      expectedRole
    );
    console.log("📥 Request headers:", req.headers);

    const email = req.headers["x-user-email"];
    const verificationKey = req.headers["x-user-key"];

    if (!email || !verificationKey) {
      console.warn("⚠️ Missing login headers: x-user-email or x-user-key");
      return res
        .status(400)
        .json({ message: "Missing login credentials in headers" });
    }

    let isValid = false;
    try {
      isValid = Authentication.confirmUserKey(
        email,
        verificationKey,
        expectedRole
      );
      console.log(`🔑 Key validation result for ${email}:`, isValid);
    } catch (err) {
      console.error("❌ Error during key verification:", err);
      return res
        .status(500)
        .json({ message: "Internal server error during verification" });
    }

    if (!isValid) {
      console.warn(`🚫 Access denied for ${email} with role ${expectedRole}`);
      return res.status(403).json({ message: "Access denied" });
    }

    // Store the role back in headers (optional, for downstream usage)
    req.headers["x-user-role"] = expectedRole;
    console.log(`✅ Access granted for ${email} as ${expectedRole}`);

    next();
  };
};
