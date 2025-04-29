import argparse
import tensorflow as tf
import matplotlib.pyplot as plt
from utils import ArthritisPreprocessor

def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('--image', type=str, required=True, help='Path to input image')
    parser.add_argument('--model', type=str, default='models/arthritis_resnet50_model.h5')
    parser.add_argument('--export_tflite', action='store_true', help='Export model to TFLite format')
    parser.add_argument('--export_js', action='store_true', help='Export model metadata for TensorFlow.js')
    args = parser.parse_args()

    # Initialize system
    preprocessor = ArthritisPreprocessor(args.model)
    model = tf.keras.models.load_model(args.model)
    
    # Process and predict
    processed_img = preprocessor.preprocess_image(args.image)
    pred = model.predict(processed_img)
    result = preprocessor.decode_prediction(pred)
    
    # Visualize
    img = plt.imread(args.image)
    plt.imshow(img)
    plt.title(f"Prediction: {result['class']} ({result['confidence']:.2%})")
    plt.axis('off')
    plt.savefig('static/prediction_result.png')  # For web apps
    plt.show()
    
    print("\n🔍 Prediction Results:")
    print(f"Class: {result['class']}")
    print(f"Confidence: {result['confidence']:.2%}")
    print("All probabilities:", result['all_classes'])

    # ➤ Export TFLite model if flag set
    if args.export_tflite:
        converter = tf.lite.TFLiteConverter.from_keras_model(model)
        tflite_model = converter.convert()
        with open('models/arthritis_model.tflite', 'wb') as f:
            f.write(tflite_model)
        print("\n✅ TFLite model exported as 'models/arthritis_model.tflite'")

    # ➤ Export metadata for TensorFlow.js usage
    if args.export_js:
        import json
        try:
            from tensorflow.keras.preprocessing.image import ImageDataGenerator
            datagen = ImageDataGenerator()
            dummy_gen = datagen.flow_from_directory('data/full_dataset/train', target_size=(224, 224))
            class_labels = list(dummy_gen.class_indices.keys())
        except:
            class_labels = ['class_0', 'class_1']  # fallback

        with open('models/model_metadata.json', 'w') as f:
            json.dump({
                'input_size': [224, 224, 3],
                'class_labels': class_labels
            }, f)
        print("✅ Exported model metadata for TensorFlow.js")

if __name__ == "__main__":
    main()
