import * as tf from '@tensorflow/tfjs-node';
import { v4 as uuidv4 } from 'uuid';
import { TextEncoder } from '../ml/utils/text-encoder';

interface ConversationTurn {
    id: string;
    timestamp: number;
    userInput: string;
    systemResponse: string;
    embedding?: number[];
    metadata: {
        intent?: string;
        confidence?: number;
        executedCommands?: string[];
        success?: boolean;
        error?: string;
    };
}

interface UserPreference {
    id: string;
    category: string;
    value: any;
    lastUpdated: number;
    confidence: number;
}

interface SystemState {
    activeCommands: string[];
    resourceUsage: {
        cpu: number;
        memory: number;
    };
    lastError?: {
        message: string;
        timestamp: number;
    };
}

interface SimilarityResult {
    turn: ConversationTurn;
    similarity: number;
}

export class ContextManager {
    private conversationHistory: ConversationTurn[] = [];
    private userPreferences: Map<string, UserPreference> = new Map();
    private systemState: SystemState;
    private encoder: TextEncoder;
    private readonly maxHistoryLength = 100;
    private readonly relevanceThreshold = 0.7;

    constructor() {
        this.systemState = this.initializeSystemState();
        this.encoder = new TextEncoder(10000); // Vocabulary size of 10k
    }

    async addConversationTurn(
        userInput: string,
        systemResponse: string,
        metadata: ConversationTurn['metadata'] = {}
    ): Promise<string> {
        const id = uuidv4();
        const embedding = await this.generateEmbedding(userInput);

        const turn: ConversationTurn = {
            id,
            timestamp: Date.now(),
            userInput,
            systemResponse,
            embedding: Array.from(await embedding.data()),
            metadata
        };

        this.conversationHistory.push(turn);
        
        // Prune history if it exceeds max length
        if (this.conversationHistory.length > this.maxHistoryLength) {
            this.conversationHistory = this.conversationHistory.slice(-this.maxHistoryLength);
        }

        return id;
    }

    async findRelevantContext(query: string, limit: number = 5): Promise<ConversationTurn[]> {
        const queryEmbedding = await this.generateEmbedding(query);
        
        // Calculate similarities with all history items
        const similarities: SimilarityResult[] = await Promise.all(
            this.conversationHistory.map(async (turn) => {
                if (!turn.embedding) {
                    return { turn, similarity: 0 };
                }
                const similarity = await this.calculateCosineSimilarity(
                    queryEmbedding,
                    tf.tensor1d(turn.embedding)
                );
                return { turn, similarity };
            })
        );

        // Sort by similarity and filter by threshold
        return similarities
            .filter(item => item.similarity >= this.relevanceThreshold)
            .sort((a, b) => b.similarity - a.similarity)
            .slice(0, limit)
            .map(item => item.turn);
    }

    updateUserPreference(category: string, value: any, confidence: number = 1): void {
        const preference: UserPreference = {
            id: uuidv4(),
            category,
            value,
            lastUpdated: Date.now(),
            confidence
        };

        this.userPreferences.set(category, preference);
    }

    getUserPreference(category: string): UserPreference | undefined {
        return this.userPreferences.get(category);
    }

    updateSystemState(update: Partial<SystemState>): void {
        this.systemState = {
            ...this.systemState,
            ...update
        };
    }

    getSystemState(): SystemState {
        return { ...this.systemState };
    }

    async getContextSummary(query: string): Promise<{
        relevantHistory: ConversationTurn[];
        preferences: UserPreference[];
        systemState: SystemState;
    }> {
        const relevantHistory = await this.findRelevantContext(query);
        const preferences = Array.from(this.userPreferences.values());

        return {
            relevantHistory,
            preferences,
            systemState: this.getSystemState()
        };
    }

    private async generateEmbedding(text: string): Promise<tf.Tensor1D> {
        // Use encoder to convert text to tensor
        const encoded = await this.encoder.encode(text);
        
        // For now, use mean pooling of encoded tokens
        return tf.tidy(() => {
            const mean = encoded.mean(1);
            return mean.squeeze() as tf.Tensor1D;
        });
    }

    private async calculateCosineSimilarity(
        a: tf.Tensor1D,
        b: tf.Tensor1D
    ): Promise<number> {
        return tf.tidy(() => {
            const normA = a.norm();
            const normB = b.norm();
            const dotProduct = a.dot(b);
            return dotProduct.div(normA.mul(normB));
        }).dataSync()[0];
    }

    private initializeSystemState(): SystemState {
        return {
            activeCommands: [],
            resourceUsage: {
                cpu: 0,
                memory: 0
            }
        };
    }

    // Analytics and Insights
    async analyzeUserBehavior(): Promise<{
        commonPatterns: string[];
        preferredCommands: string[];
        errorPatterns: string[];
    }> {
        const patterns = new Map<string, number>();
        const commands = new Map<string, number>();
        const errors = new Map<string, number>();

        for (const turn of this.conversationHistory) {
            // Analyze command patterns
            if (turn.metadata.executedCommands) {
                for (const cmd of turn.metadata.executedCommands) {
                    commands.set(cmd, (commands.get(cmd) || 0) + 1);
                }
            }

            // Track errors
            if (turn.metadata.error) {
                errors.set(turn.metadata.error, (errors.get(turn.metadata.error) || 0) + 1);
            }

            // Analyze input patterns (simplified)
            const words = turn.userInput.toLowerCase().split(/\s+/);
            for (let i = 0; i < words.length - 1; i++) {
                const pattern = `${words[i]} ${words[i + 1]}`;
                patterns.set(pattern, (patterns.get(pattern) || 0) + 1);
            }
        }

        return {
            commonPatterns: Array.from(patterns.entries())
                .sort((a, b) => b[1] - a[1])
                .slice(0, 10)
                .map(([pattern]) => pattern),
            preferredCommands: Array.from(commands.entries())
                .sort((a, b) => b[1] - a[1])
                .slice(0, 5)
                .map(([cmd]) => cmd),
            errorPatterns: Array.from(errors.entries())
                .sort((a, b) => b[1] - a[1])
                .slice(0, 5)
                .map(([error]) => error)
        };
    }

    // Cleanup and Maintenance
    async cleanup(): Promise<void> {
        // Clear old history
        const cutoffTime = Date.now() - (7 * 24 * 60 * 60 * 1000); // 7 days
        this.conversationHistory = this.conversationHistory.filter(
            turn => turn.timestamp > cutoffTime
        );

        // Clear tensor memory
        tf.dispose();
    }
}