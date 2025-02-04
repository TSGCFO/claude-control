import * as tf from '@tensorflow/tfjs-node';
import * as path from 'path';
import * as fs from 'fs/promises';
import { ModelMetadata } from '../types';

const MODEL_DIR = path.join(process.cwd(), 'data', 'models');

export async function ensureModelDir(): Promise<void> {
    try {
        await fs.access(MODEL_DIR);
    } catch {
        await fs.mkdir(MODEL_DIR, { recursive: true });
    }
}

export async function saveModel(
    model: tf.LayersModel,
    name: string,
    metadata?: Partial<ModelMetadata>
): Promise<void> {
    await ensureModelDir();
    
    const modelPath = `file://${path.join(MODEL_DIR, name)}`;
    const metadataPath = path.join(MODEL_DIR, `${name}_metadata.json`);

    // Save model using TensorFlow.js built-in save
    await model.save(modelPath);

    // Save metadata
    if (metadata) {
        const fullMetadata: ModelMetadata = {
            version: metadata.version || '1.0.0',
            timestamp: metadata.timestamp || Date.now(),
            metrics: metadata.metrics || {
                accuracy: 0,
                loss: 0
            },
            config: metadata.config || {
                vocab_size: 0,
                max_sequence_length: 0,
                embedding_dim: 0,
                lstm_units: 0,
                num_attention_heads: 0,
                dense_units: 0,
                dropout_rate: 0,
                num_command_types: 0,
                learning_rate: 0,
                batch_size: 0
            }
        };

        await fs.writeFile(
            metadataPath,
            JSON.stringify(fullMetadata, null, 2)
        );
    }
}

export async function loadModel(name: string): Promise<tf.LayersModel> {
    await ensureModelDir();
    
    const modelPath = `file://${path.join(MODEL_DIR, name)}`;
    
    try {
        return await tf.loadLayersModel(`${modelPath}/model.json`);
    } catch (error) {
        throw new Error(`Failed to load model ${name}: ${error}`);
    }
}

export async function getModelMetadata(name: string): Promise<ModelMetadata | null> {
    const metadataPath = path.join(MODEL_DIR, `${name}_metadata.json`);
    
    try {
        const data = await fs.readFile(metadataPath, 'utf-8');
        return JSON.parse(data) as ModelMetadata;
    } catch {
        return null;
    }
}

export async function listModels(): Promise<string[]> {
    await ensureModelDir();
    
    try {
        const files = await fs.readdir(MODEL_DIR);
        return files
            .filter(file => file.endsWith('_metadata.json'))
            .map(file => file.replace('_metadata.json', ''));
    } catch {
        return [];
    }
}

export async function deleteModel(name: string): Promise<void> {
    const modelPath = path.join(MODEL_DIR, name);
    const metadataPath = path.join(MODEL_DIR, `${name}_metadata.json`);
    
    try {
        await fs.rm(modelPath, { recursive: true, force: true });
        await fs.unlink(metadataPath);
    } catch (error) {
        throw new Error(`Failed to delete model ${name}: ${error}`);
    }
}

export async function updateModelMetadata(
    name: string,
    metadata: Partial<ModelMetadata>
): Promise<void> {
    const currentMetadata = await getModelMetadata(name) || {
        version: '1.0.0',
        timestamp: Date.now(),
        metrics: {
            accuracy: 0,
            loss: 0
        },
        config: {
            vocab_size: 0,
            max_sequence_length: 0,
            embedding_dim: 0,
            lstm_units: 0,
            num_attention_heads: 0,
            dense_units: 0,
            dropout_rate: 0,
            num_command_types: 0,
            learning_rate: 0,
            batch_size: 0
        }
    };

    const updatedMetadata = {
        ...currentMetadata,
        ...metadata,
        timestamp: Date.now()
    };

    const metadataPath = path.join(MODEL_DIR, `${name}_metadata.json`);
    await fs.writeFile(
        metadataPath,
        JSON.stringify(updatedMetadata, null, 2)
    );
}