import argparse
from utils import ArthritisPreprocessor
import tensorflow as tf
import matplotlib.pyplot as plt

def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('--image', type=str, required=True, help='Path to input image')
    parser.add_argument('--model', type=str, default='models/arthritis_resnet50_model.h5')
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

if __name__ == "__main__":
    main()