// routes/api.js
const express = require("express");
const router = express.Router();
const pool = require("../db"); // PostgreSQL connection
const upload = require("../config/upload");
const ImageService = require("../services/imageService");
const uploadController = require("../controllers/uploadController");
const { authenticate } = require("../middleware/authenticate"); // Auth middleware

// ============================
// 🖼️ Image Upload
// ============================
router.post("/upload", upload.single("image"), uploadController.uploadImage);

// ============================
// 📝 Add new analysis result
// ============================
router.post("/results", authenticate(["doctor"]), async (req, res) => {
  try {
    const { patient_id, image_id, diagnosis, confidence } = req.body;
    
    if (!patient_id || !image_id || !diagnosis || confidence === undefined) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const result = await pool.query(
      "INSERT INTO results (patient_id, image_id, diagnosis, confidence) VALUES ($1, $2, $3, $4) RETURNING *",
      [patient_id, image_id, diagnosis, parseFloat(confidence)]
    );
    
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error("Error inserting result:", error);
    res.status(500).json({ 
      error: "Server error",
      details: process.env.NODE_ENV === "development" ? error.message : undefined
    });
  }
});

// ============================
// 🔍 Get result by ID
// ============================
router.get("/results/:id", authenticate(), async (req, res) => {
  try {
    const { id } = req.params;
    
    if (isNaN(id)) {
      return res.status(400).json({ error: "Invalid result ID" });
    }

    const result = await pool.query(
      `SELECT r.*, i.image_url, i.uploaded_at 
       FROM results r 
       LEFT JOIN images i ON r.image_id = i.id 
       WHERE r.id = $1`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Result not found" });
    }
    
    if (req.user.role === "doctor") {
      const hasAccess = await pool.query(
        `SELECT 1 FROM doctor_patient 
         WHERE doctor_id = $1 AND patient_id = $2`,
        [req.user.id, result.rows[0].patient_id]
      );
      
      if (!hasAccess.rows.length) {
        return res.status(403).json({ error: "Unauthorized access" });
      }
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error("Error fetching result:", error);
    res.status(500).json({ 
      error: "Server error",
      details: process.env.NODE_ENV === "development" ? error.message : undefined
    });
  }
});

// ============================
// 📜 Get all results (Admin only)
// ============================
router.get("/results", authenticate(["admin"]), async (req, res) => {
  try {
    const results = await pool.query(
      `SELECT r.*, i.image_url, i.uploaded_at 
       FROM results r 
       LEFT JOIN images i ON r.image_id = i.id`
    );
    res.json(results.rows);
  } catch (error) {
    console.error("Error fetching results:", error);
    res.status(500).json({ 
      error: "Server error",
      details: process.env.NODE_ENV === "development" ? error.message : undefined
    });
  }
});

// ============================
// 📜 Get results for doctor
// ============================
router.get("/results/doctor", authenticate(["doctor"]), async (req, res) => {
  try {
    const doctorId = parseInt(req.user.id);
    
    if (isNaN(doctorId)) {
      return res.status(400).json({ error: "Invalid doctor ID" });
    }

    const results = await pool.query(
      `SELECT 
        r.id,
        r.patient_id,
        r.diagnosis,
        r.confidence,
        r.created_at,
        r.severity,
        p.name AS patient_name,
        p.age AS patient_age,
        p.gender AS patient_gender,
        i.image_url
       FROM results r
       JOIN patients p ON r.patient_id = p.id
       JOIN doctor_patient dp ON p.id = dp.patient_id
       JOIN images i ON r.image_id = i.id
       WHERE dp.doctor_id = $1
       ORDER BY r.created_at DESC`,
      [doctorId]
    );
    
    res.json(results.rows);
  } catch (error) {
    console.error("Error fetching doctor results:", error);
    res.status(500).json({ 
      error: "Server error",
      details: process.env.NODE_ENV === "development" ? error.message : undefined
    });
  }
});

// ============================
// ✅ Check doctor access to patient
// ============================
router.get("/patients/:id/access", authenticate(["doctor"]), async (req, res) => {
  try {
    const patientId = parseInt(req.params.id);
    const doctorId = parseInt(req.user.id);
    
    if (isNaN(patientId) || isNaN(doctorId)) {
      return res.status(400).json({ error: "Invalid ID format" });
    }

    const result = await pool.query(
      `SELECT 1 FROM doctor_patient 
       WHERE doctor_id = $1 AND patient_id = $2`,
      [doctorId, patientId]
    );
    
    res.json(!!result.rows.length);
  } catch (error) {
    console.error("Error checking access:", error);
    res.status(500).json({ 
      error: "Server error",
      details: process.env.NODE_ENV === "development" ? error.message : undefined
    });
  }
});

// ============================
// ✏️ Update an existing result
// ============================
router.put("/results/:id", authenticate(["doctor"]), async (req, res) => {
  try {
    const resultId = parseInt(req.params.id);
    const { diagnosis, confidence } = req.body;
    
    if (isNaN(resultId)) {
      return res.status(400).json({ error: "Invalid result ID" });
    }

    const hasAccess = await pool.query(
      `SELECT 1 FROM results r
       JOIN doctor_patient dp ON r.patient_id = dp.patient_id
       WHERE r.id = $1 AND dp.doctor_id = $2`,
      [resultId, req.user.id]
    );
    
    if (!hasAccess.rows.length) {
      return res.status(403).json({ error: "Unauthorized access" });
    }

    const result = await pool.query(
      "UPDATE results SET diagnosis = $1, confidence = $2 WHERE id = $3 RETURNING *",
      [diagnosis, parseFloat(confidence), resultId]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Result not found" });
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error("Error updating result:", error);
    res.status(500).json({ 
      error: "Server error",
      details: process.env.NODE_ENV === "development" ? error.message : undefined
    });
  }
});

// ============================
// ❌ Delete a result
// ============================
router.delete("/results/:id", authenticate(["admin"]), async (req, res) => {
  try {
    const resultId = parseInt(req.params.id);
    
    if (isNaN(resultId)) {
      return res.status(400).json({ error: "Invalid result ID" });
    }

    const result = await pool.query(
      "DELETE FROM results WHERE id = $1 RETURNING *", 
      [resultId]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Result not found" });
    }
    
    res.json({ message: "Result deleted successfully" });
  } catch (error) {
    console.error("Error deleting result:", error);
    res.status(500).json({ 
      error: "Server error",
      details: process.env.NODE_ENV === "development" ? error.message : undefined
    });
  }
});

module.exports = router;
