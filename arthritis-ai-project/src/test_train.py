import tensorflow as tf
from tensorflow.keras.applications import ResNet50
from tensorflow.keras.layers import Dense, GlobalAveragePooling2D
from tensorflow.keras.models import Model
from tensorflow.keras.preprocessing.image import ImageDataGenerator
import matplotlib.pyplot as plt
import json
import os

# Mini-config
IMG_SIZE = (224, 224)
BATCH_SIZE = 4  # Small batch for testing
EPOCHS = 3  # Just 3 epochs for validation

# Data generators
train_datagen = ImageDataGenerator(rescale=1./255)
train_generator = train_datagen.flow_from_directory(
    'data/test_train',
    target_size=IMG_SIZE,
    batch_size=BATCH_SIZE,
    class_mode='categorical')

# Save class_indices for prediction use
os.makedirs('models', exist_ok=True)  # Make sure 'models' directory exists
with open('models/class_indices.json', 'w') as f:
    json.dump(train_generator.class_indices, f)

# Model setup (frozen ResNet50 + 1 dense layer)
base_model = ResNet50(weights='imagenet', include_top=False)
x = base_model.output
x = GlobalAveragePooling2D()(x)
x = Dense(2, activation='softmax')(x)
model = Model(base_model.input, x)

# Freeze base layers
for layer in base_model.layers:
    layer.trainable = False

model.compile(optimizer='adam', loss='categorical_crossentropy', metrics=['accuracy'])

# Test training
history = model.fit(
    train_generator,
    steps_per_epoch=2,  # Just 2 batches per epoch
    epochs=EPOCHS)

# Quick visualization
plt.plot(history.history['accuracy'])
plt.title('Test Training Accuracy')
plt.savefig('models/test_training_plot.png')  # Save training plot
plt.show()

# Save trained model
model.save('models/test_model.h5')



print("\n🔥 Test successful! Pipeline works.")
print("✅ class_indices.json saved inside 'models/'!")
print("✅ Training plot saved inside 'models/test_training_plot.png'.")
print("Next step: Push to Colab with full dataset")
