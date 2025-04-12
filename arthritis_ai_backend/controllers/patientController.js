const pool = require('../db');

module.exports = {
  // Create new patient
  async createPatient(req, res) {
    const { name, age, gender } = req.body;
    
    try {
      const result = await pool.query(
        `INSERT INTO patients (name, age, gender) 
         VALUES ($1, $2, $3) RETURNING *`,
        [name, age || null, gender || null]
      );
      
      res.status(201).json(result.rows[0]);
    } catch (error) {
      console.error('Error creating patient:', error);
      res.status(500).json({ error: 'Database error' });
    }
  },

  // Get all patients
  async getPatients(req, res) {
    try {
      const { search = '', page = 1, limit = 10 } = req.query;
      const offset = (page - 1) * limit;
      
      const patients = await pool.query(
        `SELECT p.*, 
         COUNT(r.id) as analysis_count,
         MAX(r.created_at) as last_analysis
         FROM patients p
         LEFT JOIN results r ON p.id = r.patient_id
         WHERE p.name ILIKE $1
         GROUP BY p.id
         ORDER BY p.name
         LIMIT $2 OFFSET $3`,
        [`%${search}%`, limit, offset]
      );
      
      const count = await pool.query(
        `SELECT COUNT(*) FROM patients WHERE name ILIKE $1`,
        [`%${search}%`]
      );
      
      res.json({
        data: patients.rows,
        pagination: {
          total: parseInt(count.rows[0].count),
          page: parseInt(page),
          limit: parseInt(limit)
        }
      });
    } catch (error) {
      console.error('Error fetching patients:', error);
      res.status(500).json({ error: 'Database error' });
    }
  },

  // Get patient by ID
  async getPatient(req, res) {
    try {
      const patient = await pool.query(
        `SELECT p.*, 
         json_agg(
           json_build_object(
             'id', r.id,
             'diagnosis', r.diagnosis,
             'confidence', r.confidence,
             'date', r.created_at,
             'image_url', i.image_url
           )
         ) as analyses
         FROM patients p
         LEFT JOIN results r ON p.id = r.patient_id
         LEFT JOIN images i ON r.image_id = i.id
         WHERE p.id = $1
         GROUP BY p.id`,
        [req.params.id]
      );
      
      if (!patient.rows.length) {
        return res.status(404).json({ error: 'Patient not found' });
      }
      
      res.json(patient.rows[0]);
    } catch (error) {
      console.error('Error fetching patient:', error);
      res.status(500).json({ error: 'Database error' });
    }
  },

  // Update patient
  async updatePatient(req, res) {
    const { id } = req.params;
    const { name, age, gender } = req.body;
    
    try {
      const result = await pool.query(
        `UPDATE patients 
         SET name = $1, age = $2, gender = $3 
         WHERE id = $4 RETURNING *`,
        [name, age, gender, id]
      );
      
      if (!result.rows.length) {
        return res.status(404).json({ error: 'Patient not found' });
      }
      
      res.json(result.rows[0]);
    } catch (error) {
      console.error('Error updating patient:', error);
      res.status(500).json({ error: 'Database error' });
    }
  },

  // Delete patient
  async deletePatient(req, res) {
    try {
      const result = await pool.query(
        'DELETE FROM patients WHERE id = $1 RETURNING *',
        [req.params.id]
      );
      
      if (!result.rows.length) {
        return res.status(404).json({ error: 'Patient not found' });
      }
      
      res.json({ message: 'Patient deleted successfully' });
    } catch (error) {
      console.error('Error deleting patient:', error);
      res.status(500).json({ error: 'Database error' });
    }
  }
};