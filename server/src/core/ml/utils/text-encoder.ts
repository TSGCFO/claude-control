import * as tf from '@tensorflow/tfjs-node';
import * as fs from 'fs/promises';
import * as path from 'path';

export class TextEncoder {
    private vocabulary: Map<string, number>;
    private reverseVocabulary: Map<number, string>;
    private readonly vocabSize: number;
    private readonly maxLength: number;
    private readonly unkToken: string = '[UNK]';
    private readonly padToken: string = '[PAD]';

    constructor(vocabSize: number, maxLength: number = 128) {
        this.vocabSize = vocabSize;
        this.maxLength = maxLength;
        this.vocabulary = new Map();
        this.reverseVocabulary = new Map();
        
        // Initialize with special tokens
        this.vocabulary.set(this.padToken, 0);
        this.vocabulary.set(this.unkToken, 1);
        this.reverseVocabulary.set(0, this.padToken);
        this.reverseVocabulary.set(1, this.unkToken);
    }

    private tokenize(text: string): string[] {
        // Simple whitespace tokenization for now
        // Could be enhanced with BPE or WordPiece
        return text.toLowerCase()
            .replace(/[^\w\s]/g, ' ')
            .split(/\s+/)
            .filter(token => token.length > 0);
    }

    async buildVocabulary(texts: string[]): Promise<void> {
        const tokenFrequency = new Map<string, number>();
        
        // Count token frequencies
        for (const text of texts) {
            const tokens = this.tokenize(text);
            for (const token of tokens) {
                tokenFrequency.set(token, (tokenFrequency.get(token) || 0) + 1);
            }
        }

        // Sort by frequency
        const sortedTokens = Array.from(tokenFrequency.entries())
            .sort((a, b) => b[1] - a[1])
            .slice(0, this.vocabSize - 2) // Reserve space for special tokens
            .map(([token]) => token);

        // Build vocabulary
        let idx = 2; // Start after special tokens
        for (const token of sortedTokens) {
            this.vocabulary.set(token, idx);
            this.reverseVocabulary.set(idx, token);
            idx++;
        }
    }

    async encode(text: string): Promise<tf.Tensor2D> {
        const tokens = this.tokenize(text);
        const encoded = new Array(this.maxLength).fill(0); // Pad token

        for (let i = 0; i < Math.min(tokens.length, this.maxLength); i++) {
            const token = tokens[i];
            encoded[i] = this.vocabulary.get(token) || this.vocabulary.get(this.unkToken)!;
        }

        return tf.tensor2d([encoded], [1, this.maxLength]);
    }

    async batchEncode(texts: string[]): Promise<tf.Tensor2D> {
        const batchSize = texts.length;
        const encoded = new Array(batchSize).fill(0).map(() => 
            new Array(this.maxLength).fill(0)
        );

        for (let i = 0; i < batchSize; i++) {
            const tokens = this.tokenize(texts[i]);
            for (let j = 0; j < Math.min(tokens.length, this.maxLength); j++) {
                const token = tokens[j];
                encoded[i][j] = this.vocabulary.get(token) || this.vocabulary.get(this.unkToken)!;
            }
        }

        return tf.tensor2d(encoded, [batchSize, this.maxLength]);
    }

    decode(encoded: number[]): string {
        return encoded
            .map(idx => this.reverseVocabulary.get(idx) || this.unkToken)
            .filter(token => token !== this.padToken)
            .join(' ');
    }

    getVocabSize(): number {
        return this.vocabulary.size;
    }

    async save(savePath: string): Promise<void> {
        const vocabularyObj = Object.fromEntries(this.vocabulary);
        const data = {
            vocabulary: vocabularyObj,
            vocabSize: this.vocabSize,
            maxLength: this.maxLength
        };

        await fs.mkdir(path.dirname(savePath), { recursive: true });
        await fs.writeFile(savePath, JSON.stringify(data, null, 2), 'utf-8');
    }

    static async load(loadPath: string): Promise<TextEncoder> {
        const fileContent = await fs.readFile(loadPath, 'utf-8');
        const data = JSON.parse(fileContent);
        
        const encoder = new TextEncoder(data.vocabSize, data.maxLength);
        encoder.vocabulary = new Map(Object.entries(data.vocabulary));
        encoder.reverseVocabulary = new Map(
            Array.from(encoder.vocabulary.entries()).map(([k, v]) => [v, k])
        );
        
        return encoder;
    }
}