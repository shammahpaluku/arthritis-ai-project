const pool = require('../db');
const aiService = require('../services/aiService');

module.exports = {
  async createResult(req, res) {
    const { patient_id, image_id } = req.body;
    
    try {
      const result = await pool.query(
        `INSERT INTO results (patient_id, image_id, diagnosis, confidence) 
         VALUES ($1, $2, 'pending', 0) RETURNING *`,
        [patient_id, image_id]
      );
      
      res.status(201).json(result.rows[0]);
    } catch (error) {
      console.error('Error creating result:', error);
      res.status(500).json({ error: 'Database error' });
    }
  },

  async getResult(req, res) {
    try {
      const result = await pool.query(
        `SELECT r.*, i.image_url, p.name as patient_name 
         FROM results r
         JOIN images i ON r.image_id = i.id
         JOIN patients p ON r.patient_id = p.id
         WHERE r.id = $1`,
        [req.params.id]
      );
      
      if (!result.rows.length) {
        return res.status(404).json({ error: 'Result not found' });
      }
      
      res.json(result.rows[0]);
    } catch (error) {
      console.error('Error fetching result:', error);
      res.status(500).json({ error: 'Database error' });
    }
  },

  async analyzeImage(req, res) {
    const { imageId } = req.params;
    
    try {
      // 1. Get image path
      const image = await pool.query(
        'SELECT image_url FROM images WHERE id = $1',
        [imageId]
      );
      
      if (!image.rows.length) {
        return res.status(404).json({ error: 'Image not found' });
      }

      // 2. Run AI analysis
      const analysis = await aiService.analyze(image.rows[0].image_url);

      // 3. Update result
      const updated = await pool.query(
        `UPDATE results SET 
          diagnosis = $1, 
          confidence = $2 
         WHERE image_id = $3 RETURNING *`,
        [analysis.severity, analysis.confidence, imageId]
      );

      res.json({
        ...updated.rows[0],
        affectedAreas: analysis.affectedAreas
      });
    } catch (error) {
      console.error('Analysis failed:', error);
      res.status(500).json({ error: error.message });
    }
  }
};