export interface ModelConfig {
    // Vocabulary settings
    vocab_size: number;
    max_sequence_length: number;

    // Model architecture
    embedding_dim: number;
    lstm_units: number;
    num_attention_heads: number;
    dense_units: number;
    dropout_rate: number;
    num_command_types: number;

    // Training settings
    learning_rate: number;
    batch_size: number;
}

export interface TrainingMetrics {
    loss: number;
    accuracy: number;
    val_loss?: number;
    val_accuracy?: number;
    epoch: number;
}

export interface PredictionResult {
    commandType: number;
    confidence: number;
    logits?: number[];
}

export interface ModelMetadata {
    version: string;
    timestamp: number;
    metrics: {
        accuracy: number;
        loss: number;
    };
    config: ModelConfig;
}

export interface ModelSaveOptions {
    includeOptimizer?: boolean;
    metadata?: Partial<ModelMetadata>;
}

export interface ModelLoadOptions {
    strict?: boolean;
    loadOptimizer?: boolean;
}

export interface TrainingCallback {
    onEpochBegin?: (epoch: number) => void;
    onEpochEnd?: (epoch: number, metrics: TrainingMetrics) => void;
    onBatchBegin?: (batch: number) => void;
    onBatchEnd?: (batch: number, metrics: TrainingMetrics) => void;
}

export interface TrainingOptions {
    epochs?: number;
    batchSize?: number;
    validationSplit?: number;
    shuffle?: boolean;
    callbacks?: TrainingCallback[];
}

export interface DatasetOptions {
    batchSize?: number;
    shuffle?: boolean;
    validationSplit?: number;
    seed?: number;
}

export interface TokenizerConfig {
    vocabSize: number;
    maxLength: number;
    specialTokens?: {
        pad?: string;
        unk?: string;
        start?: string;
        end?: string;
    };
}

export interface VocabularyStats {
    totalTokens: number;
    uniqueTokens: number;
    coverage: number;
    mostCommon: Array<[string, number]>;
}

export interface EncodingResult {
    ids: number[];
    mask?: number[];
    typeIds?: number[];
}

export interface BatchEncodingResult {
    ids: number[][];
    mask?: number[][];
    typeIds?: number[][];
}

export interface ModelStats {
    parameters: number;
    trainableParameters: number;
    nonTrainableParameters: number;
    layers: number;
    memoryUsage: {
        weights: number;
        activations: number;
        total: number;
    };
}

export interface TrainingHistory {
    epochs: number[];
    metrics: {
        loss: number[];
        accuracy: number[];
        val_loss?: number[];
        val_accuracy?: number[];
    };
}

export interface ModelPerformance {
    inferenceTime: number;
    throughput: number;
    memoryUsage: number;
    accuracy: number;
}