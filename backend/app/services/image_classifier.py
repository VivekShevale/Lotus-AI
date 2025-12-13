import os
import tensorflow as tf
from tensorflow.keras.preprocessing.image import ImageDataGenerator
from tensorflow.keras.applications import EfficientNetB0
from tensorflow.keras.layers import Dense, GlobalAveragePooling2D, Dropout
from tensorflow.keras.models import Model
from tensorflow.keras.optimizers import Adam


def train_image_classifier(
    dataset_path,
    img_size=(224, 224),
    batch_size=32,
    epochs=1,
    learning_rate=0.0001,
    model_save_path="image_model.h5"
):
    """
    Trains an image classifier on a medium-size dataset using EfficientNet + Transfer Learning.
    Returns accuracy, loss, and saved model path.
    """

    # ---- Data Generators ----
    train_datagen = ImageDataGenerator(
        rescale=1./255,
        rotation_range=20,
        width_shift_range=0.1,
        height_shift_range=0.1,
        zoom_range=0.2,
        horizontal_flip=True,
        validation_split=0.2
    )

    train_generator = train_datagen.flow_from_directory(
        dataset_path,
        target_size=img_size,
        batch_size=batch_size,
        class_mode="categorical",
        subset="training"
    )

    val_generator = train_datagen.flow_from_directory(
        dataset_path,
        target_size=img_size,
        batch_size=batch_size,
        class_mode="categorical",
        subset="validation"
    )

    num_classes = len(train_generator.class_indices)

    # ---- Base Model ----
    base_model = EfficientNetB0(
        weights="imagenet",
        include_top=False,
        input_shape=(img_size[0], img_size[1], 3)
    )
    base_model.trainable = False  # freeze for medium dataset

    # ---- Custom Layers ----
    x = base_model.output
    x = GlobalAveragePooling2D()(x)
    x = Dropout(0.3)(x)
    predictions = Dense(num_classes, activation='softmax')(x)
    model = Model(inputs=base_model.input, outputs=predictions)

    # ---- Compile ----
    model.compile(
        optimizer=Adam(learning_rate),
        loss="categorical_crossentropy",
        metrics=["accuracy"]
    )

    # ---- Train ----
    history = model.fit(
        train_generator,
        epochs=epochs,
        validation_data=val_generator
    )

    # ---- Save Model ----
    model.save(model_save_path)

    # ---- Return Output ----
    return {
        "train_accuracy": float(history.history["accuracy"][-1]),
        "val_accuracy": float(history.history["val_accuracy"][-1]),
        "train_loss": float(history.history["loss"][-1]),
        "val_loss": float(history.history["val_loss"][-1]),
        "classes": train_generator.class_indices,
        "model_path": model_save_path
    }