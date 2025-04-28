import tensorflow as tf
import numpy as np
import json
from tensorflow.keras.preprocessing.image import load_img, img_to_array

class ArthritisPreprocessor:
    def __init__(self, model_path='models/arthritis_resnet50_model.h5'):
        self.img_size = (224, 224)
        self.class_indices = self._load_class_indices()
        
    def _load_class_indices(self):
        with open('models/class_indices.json') as f:
            return json.load(f)
    
    def preprocess_image(self, img_path):
        """Handles single image preprocessing"""
        img = load_img(img_path, target_size=self.img_size)
        img_array = img_to_array(img) / 255.0
        return np.expand_dims(img_array, axis=0)
    
    def decode_prediction(self, pred):
        """Converts model output to readable results"""
        class_idx = np.argmax(pred)
        return {
            'class': list(self.class_indices.keys())[class_idx],
            'confidence': float(pred[0][class_idx]),
            'all_classes': {
                cls: float(conf) for cls, conf in 
                zip(self.class_indices.keys(), pred[0])
            }
        }