// Add these functions to your existing queries file or create a new one

// Store image details in the database
const storeImageUpload = async (db, patientId, imagePath, imageType) => {
  const query = `
    INSERT INTO images (patient_id, image_url, uploaded_at)
    VALUES ($1, $2, NOW())
    RETURNING id
  `;
  
  const result = await db.query(query, [patientId, imagePath]);
  return result.rows[0];
};

// Create a new analysis result (placeholder for AI integration)
const createAnalysisResult = async (db, imageId, patientId, status = 'pending') => {
  const query = `
    INSERT INTO results (image_id, patient_id, status, created_at, updated_at)
    VALUES ($1, $2, $3, NOW(), NOW())
    RETURNING id
  `;
  
  const result = await db.query(query, [imageId, patientId, status]);
  return result.rows[0];
};

// Get result by ID
const getResultById = async (db, resultId) => {
  const query = `
    SELECT r.*, i.file_path
    FROM results r
    LEFT JOIN images i ON r.image_id = i.id
    WHERE r.id = $1
  `;
  
  const result = await db.query(query, [resultId]);
  return result.rows[0];
};

// Export these functions along with any existing ones
module.exports = {
  // Include your existing queries here
  storeImageUpload,
  createAnalysisResult,
  getResultById
};