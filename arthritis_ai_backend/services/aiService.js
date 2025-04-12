const tf = require('@tensorflow/tfjs-node');
const sharp = require('sharp');

class AIService {
  constructor() {
    this.model = null;
    this.loadModel();
  }

  async loadModel() {
    // Load your actual OA model here
    this.model = await tf.loadGraphModel('file://./model/model.json');
  }

  async analyze(imagePath) {
    try {
      // 1. Preprocess medical image
      const buffer = await sharp(imagePath)
        .resize(224, 224)
        .normalize()
        .toBuffer();

      // 2. Convert to tensor
      const tensor = tf.node.decodeImage(buffer)
        .expandDims()
        .toFloat()
        .div(255.0);

      // 3. Run prediction
      const prediction = this.model.predict(tensor);
      const results = await prediction.array();

      // 4. Format medical results
      return {
        confidence: Math.round(results[0][0] * 100),
        severity: this._getSeverity(results[0][0]),
        affectedAreas: this._getAffectedAreas(results[0])
      };
    } catch (error) {
      console.error('AI Analysis Error:', error);
      throw new Error('Failed to analyze image');
    }
  }

  _getSeverity(confidence) {
    if (confidence > 0.85) return 'high';
    if (confidence > 0.65) return 'moderate';
    return 'low';
  }

  _getAffectedAreas(prediction) {
    // Customize based on your model output
    return ['Medial joint space', 'Femoral condyles'];
  }
}

module.exports = new AIService();