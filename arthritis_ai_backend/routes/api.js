const express = require("express");
const router = express.Router();
const pool = require("../db");
const upload = require("../config/upload");
const ImageService = require("../services/imageService");
const uploadController = require("../controllers/uploadController");
const { authenticate } = require("../middleware/authenticate");

// ============================
// 🖼️ Image Upload
// ============================
router.post("/upload", upload.single("image"), uploadController.uploadImage);

// ============================
// 📝 Add new analysis result (No role check)
// ============================
router.post("/results", authenticate(), async (req, res) => {
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
// 🔍 Get result by ID (No role check)
// ============================
router.get('/results/:id', authenticate(), async (req, res) => {
  try {
    const results = await pool.query(
      `SELECT 
        r.*, 
        i.image_url, 
        p.name as patient_name,
        p.age as patient_age,
        p.gender as patient_gender
       FROM results r
       JOIN images i ON r.image_id = i.id
       JOIN patients p ON r.patient_id = p.id
       ORDER BY r.created_at DESC`
    );
    res.json(results.rows);
  } catch (error) {
    console.error("Error fetching results:", error);
    res.status(500).json({ error: "Server error" });
  }
});

// ============================
// 📄 Get results for a patient (No role check)
// ============================
router.get("/results/patient", authenticate(), async (req, res) => {
  try {
    const patientQuery = await pool.query(
      'SELECT id FROM patients WHERE user_id = $1',
      [req.user.id]
    );

    if (!patientQuery.rows.length) {
      return res.status(404).json({
        error: "No patient record found for this user",
        solution: "Ensure patients.user_id matches users.id"
      });
    }

    const patientId = patientQuery.rows[0].id;

    const results = await pool.query(
      `SELECT 
        r.id,
        r.diagnosis,
        r.confidence,
        r.created_at,
        r.severity,
        i.image_url,
        p.name AS patient_name,
        p.age AS patient_age,
        p.gender AS patient_gender
       FROM results r
       JOIN patients p ON r.patient_id = p.id
       JOIN images i ON r.image_id = i.id
       WHERE r.patient_id = $1
       ORDER BY r.created_at DESC`,
      [patientId]
    );

    res.json(results.rows);
  } catch (error) {
    console.error("Patient results error:", {
      error: error.message,
      userId: req.user.id,
      timestamp: new Date()
    });
    res.status(500).json({
      error: "Failed to load patient results",
      details: process.env.NODE_ENV === "development" ? error.message : null
    });
  }
});

// ============================
// 📜 Get all results (No role check)
// ============================
router.get("/results", authenticate(), async (req, res) => {
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
// ✏️ Update an existing result (No role check)
// ============================
router.put("/results/:id", authenticate(), async (req, res) => {
  try {
    const resultId = parseInt(req.params.id);
    const { diagnosis, confidence } = req.body;

    if (isNaN(resultId)) {
      return res.status(400).json({ error: "Invalid result ID" });
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
// ❌ Delete a result (No role check)
// ============================
router.delete("/results/:id", authenticate(), async (req, res) => {
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

// ============================
// 🖼️ Analysis Route (Image Upload + Analysis)
// ============================
router.post('/api/analysis', authenticate, upload.single('image'), async (req, res) => {
  try {
    const patientInfo = JSON.parse(req.body.patientInfo);
    const file = req.file;
    
    // 1. Save patient info if new patient (e.g., insert into patients table)
    const patientResult = await pool.query(
      'INSERT INTO patients (name, age, gender) VALUES ($1, $2, $3) RETURNING *',
      [patientInfo.name, patientInfo.age, patientInfo.gender]
    );
    const patientId = patientResult.rows[0].id;
    
    // 2. Process the image (using your AI service)
    const analysisResult = await ImageService.processImage(file.path); // Assuming ImageService processes the image
    const diagnosis = analysisResult.diagnosis;
    const confidence = analysisResult.confidence;

    // 3. Save the analysis result
    const result = await pool.query(
      "INSERT INTO results (patient_id, image_id, diagnosis, confidence) VALUES ($1, $2, $3, $4) RETURNING *",
      [patientId, file.filename, diagnosis, confidence]
    );

    res.json({
      analysisId: result.rows[0].id,
      message: 'Analysis completed successfully'
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
