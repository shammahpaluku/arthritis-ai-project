const pool = require('../db');
const ImageService = require('../services/imageService');

async function uploadImage(req, res) {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }
    
    const { patientId } = req.body;
    
    if (!patientId) {
      return res.status(400).json({ error: 'Patient ID is required' });
    }
    
    // Verify patient exists
    const patient = await pool.query(
      'SELECT id FROM patients WHERE id = $1',
      [patientId]
    );
    
    if (!patient.rows.length) {
      return res.status(404).json({ error: 'Patient not found' });
    }
    
    // Process and validate image
    const processedPath = await ImageService.processImage(req.file.path);
    
    // Store in database
    const image = await pool.query(
      `INSERT INTO images (patient_id, image_url) 
       VALUES ($1, $2) RETURNING *`,
      [patientId, processedPath.replace('uploads/', '')]
    );
    
    // Create analysis record
    const analysis = await pool.query(
      `INSERT INTO results (patient_id, image_id, diagnosis, confidence) 
       VALUES ($1, $2, 'pending', 0) RETURNING *`,
      [patientId, image.rows[0].id]
    );
    
    // Log the upload
    await pool.query(
      `INSERT INTO logs (user_id, action) 
       VALUES ($1, $2)`,
      [req.user.id, `Uploaded image ${image.rows[0].id} for patient ${patientId}`]
    );
    
    res.status(201).json({
      success: true,
      imageId: image.rows[0].id,
      analysisId: analysis.rows[0].id,
      imageUrl: `/uploads/${processedPath.split('/').pop()}`
    });
    
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ 
      error: 'Upload failed',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}

module.exports = {
  uploadImage
};