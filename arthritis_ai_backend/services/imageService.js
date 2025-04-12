const sharp = require('sharp');
const path = require('path');
const fs = require('fs');
const tf = require('@tensorflow/tfjs-node');

class ImageService {
  static async processImage(filePath) {
    const processedDir = path.join(__dirname, '..', 'uploads', 'processed');
    if (!fs.existsSync(processedDir)) {
      fs.mkdirSync(processedDir, { recursive: true });
    }
    
    const filename = `processed_${path.basename(filePath)}`;
    const outputPath = path.join(processedDir, filename);
    
    try {
      // Medical image specific processing
      await sharp(filePath)
        .resize(1024, 1024, { 
          fit: 'inside',
          withoutEnlargement: true 
        })
        .normalize()  // Enhance contrast
        .linear(1.1, -(128 * 0.1))  // Brighten slightly
        .sharpen()
        .toFormat('jpeg')
        .toFile(outputPath);
        
      return outputPath;
    } catch (error) {
      console.error('Image processing failed:', error);
      throw new Error('Failed to process medical image');
    }
  }

  static validateImage(filePath) {
    const validTypes = [
      'image/jpeg', 
      'image/png',
      'application/dicom'
    ];
    
    const stats = fs.statSync(filePath);
    if (stats.size > 20 * 1024 * 1024) { // 20MB max
      throw new Error('File exceeds 20MB limit');
    }
    
    const ext = path.extname(filePath).toLowerCase();
    if (!['.jpg', '.jpeg', '.png', '.dcm'].includes(ext)) {
      throw new Error('Invalid file type. Only JPG/PNG/DICOM allowed');
    }
    
    return true;
  }
}

module.exports = ImageService;