// routes/analysis.js
const express = require('express');
const router = express.Router();
const multer = require('multer');
const upload = multer({ dest: 'uploads/' });

router.post('/analysis', upload.single('image'), async (req, res) => {
  try {
    const patientInfo = JSON.parse(req.body.patientInfo);
    const file = req.file;
    
    // 1. Validate input
    if (!file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    // 2. Process the image (example)
    const analysisResult = await processImage(file.path);
    
    // 3. Save to database
    const result = await pool.query(
      `INSERT INTO analyses (patient_info, image_path, results) 
       VALUES ($1, $2, $3) RETURNING *`,
      [patientInfo, file.path, analysisResult]
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
