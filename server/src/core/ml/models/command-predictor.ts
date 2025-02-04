import * as tf from '@tensorflow/tfjs-node';
import { loadModel, saveModel } from '../utils/model-io';
import { TextEncoder } from '../utils/text-encoder';
import { ModelConfig } from '../types';

export class CommandPredictor {
    private model: tf.LayersModel | null = null;
    private encoder: TextEncoder;
    private config: ModelConfig;

    constructor(config: ModelConfig) {
        this.config = config;
        this.encoder = new TextEncoder(config.vocab_size);
    }

    async initialize(): Promise<void> {
        try {
            // Try to load existing model
            this.model = await loadModel('command-predictor');
        } catch {
            // Create new model if loading fails
            this.model = this.buildModel();
            await this.saveModel();
        }
    }

    private buildModel(): tf.LayersModel {
        const model = tf.sequential();

        // Embedding layer
        model.add(tf.layers.embedding({
            inputDim: this.config.vocab_size,
            outputDim: this.config.embedding_dim,
            inputLength: this.config.max_sequence_length,
        }));

        // Bidirectional LSTM layers
        model.add(tf.layers.bidirectional({
            layer: tf.layers.lstm({
                units: this.config.lstm_units,
                returnSequences: true,
            }),
            inputShape: [this.config.max_sequence_length, this.config.embedding_dim],
        }));

        // Self-attention using dense layers
        const attention = tf.layers.dense({
            units: this.config.lstm_units * 2,
            activation: 'tanh',
            name: 'attention',
        });

        const attentionWeights = tf.layers.dense({
            units: 1,
            activation: 'softmax',
            name: 'attention_weights',
        });

        model.add(attention);
        model.add(attentionWeights);
        model.add(tf.layers.flatten());

        // Dense layers
        model.add(tf.layers.dense({
            units: this.config.dense_units,
            activation: 'relu',
        }));

        model.add(tf.layers.dropout({ rate: this.config.dropout_rate }));

        // Output layer
        model.add(tf.layers.dense({
            units: this.config.num_command_types,
            activation: 'softmax',
        }));

        // Compile model
        model.compile({
            optimizer: tf.train.adam(this.config.learning_rate),
            loss: 'categoricalCrossentropy',
            metrics: ['accuracy'],
        });

        return model;
    }

    async train(
        inputs: string[],
        labels: number[],
        validationSplit = 0.2,
        epochs = 10
    ): Promise<tf.History> {
        if (!this.model) {
            throw new Error('Model not initialized');
        }

        // Encode input text
        const encodedInputs = await this.encoder.batchEncode(inputs);
        
        // Convert labels to one-hot encoding
        const oneHotLabels = tf.oneHot(labels, this.config.num_command_types);

        // Train model
        const history = await this.model.fit(encodedInputs, oneHotLabels, {
            epochs,
            validationSplit,
            callbacks: {
                onEpochEnd: (epoch, logs) => {
                    console.log(`Epoch ${epoch + 1}`);
                    if (logs) {
                        console.log(`Training loss: ${logs.loss.toFixed(4)}`);
                        console.log(`Training accuracy: ${logs.acc.toFixed(4)}`);
                        if (logs.val_loss) {
                            console.log(`Validation loss: ${logs.val_loss.toFixed(4)}`);
                            console.log(`Validation accuracy: ${logs.val_acc.toFixed(4)}`);
                        }
                    }
                },
            },
        });

        // Save updated model
        await this.saveModel();

        return history;
    }

    async predict(input: string): Promise<{
        commandType: number;
        confidence: number;
    }> {
        if (!this.model) {
            throw new Error('Model not initialized');
        }

        // Encode input
        const encoded = await this.encoder.encode(input);
        
        // Make prediction
        const prediction = this.model.predict(encoded) as tf.Tensor;
        
        // Get command type with highest probability
        const commandTypeTensor = prediction.argMax(-1);
        const commandType = (await commandTypeTensor.data())[0];
        
        // Get confidence score
        const probabilities = await prediction.data();
        const confidence = probabilities[commandType];

        // Cleanup tensors
        prediction.dispose();
        commandTypeTensor.dispose();

        return {
            commandType,
            confidence,
        };
    }

    async saveModel(): Promise<void> {
        if (!this.model) {
            throw new Error('No model to save');
        }
        await saveModel(this.model, 'command-predictor');
    }

    async updateFromExamples(examples: Array<{ input: string; commandType: number }>): Promise<void> {
        const inputs = examples.map(ex => ex.input);
        const labels = examples.map(ex => ex.commandType);
        await this.train(inputs, labels, 0.1, 1); // Quick update with new examples
    }

    getEncoder(): TextEncoder {
        return this.encoder;
    }
}