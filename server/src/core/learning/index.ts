import { promises as fs } from 'fs';
import * as path from 'path';

interface Interaction {
  timestamp: number;
  input: string;
  command?: {
    type: string;
    action: string;
    parameters: Record<string, string>;
  };
  response: string;
  success: boolean;
  error?: string;
}

interface LearningMetrics {
  commandSuccessRate: number;
  commonPatterns: Array<{
    pattern: string;
    count: number;
  }>;
  failurePoints: Array<{
    type: string;
    count: number;
    examples: string[];
  }>;
}

export class LearningSystem {
  private interactions: Interaction[] = [];
  private readonly dbPath: string;
  private metrics: LearningMetrics = {
    commandSuccessRate: 0,
    commonPatterns: [],
    failurePoints: []
  };

  constructor(dbPath = path.join(process.cwd(), 'data', 'learning.json')) {
    this.dbPath = dbPath;
    this.loadInteractions().catch(console.error);
  }

  async recordInteraction(interaction: Omit<Interaction, 'timestamp'>): Promise<void> {
    const fullInteraction: Interaction = {
      ...interaction,
      timestamp: Date.now()
    };

    this.interactions.push(fullInteraction);
    await this.saveInteractions();
    await this.analyzeInteractions();
  }

  async getOptimizedPrompt(basePrompt: string): Promise<string> {
    // Analyze successful interactions to enhance the prompt
    const successfulCommands = this.interactions
      .filter(i => i.success && i.command)
      .map(i => i.command!);

    // Extract common command patterns
    const patterns = this.extractCommandPatterns(successfulCommands);

    // Add examples from successful interactions
    const examples = this.getTopExamples(3);

    // Build optimized prompt
    return `${basePrompt}\n\nCommon successful patterns:\n${patterns}\n\nExample interactions:\n${examples}`;
  }

  async getImprovedResponse(input: string): Promise<string | null> {
    // Find similar past successful interactions
    const similar = this.findSimilarInteractions(input);
    if (similar.length === 0) return null;

    // Use the most successful similar interaction as a template
    const bestMatch = similar[0];
    return this.adaptResponse(bestMatch.response, input);
  }

  async getSuggestions(partialInput: string): Promise<string[]> {
    return this.interactions
      .filter(i => i.success && i.input.toLowerCase().includes(partialInput.toLowerCase()))
      .map(i => i.input)
      .slice(0, 5);
  }

  getMetrics(): LearningMetrics {
    return { ...this.metrics };
  }

  private async loadInteractions(): Promise<void> {
    try {
      await fs.mkdir(path.dirname(this.dbPath), { recursive: true });
      const data = await fs.readFile(this.dbPath, 'utf8');
      this.interactions = JSON.parse(data);
    } catch (error) {
      // File doesn't exist or is invalid, start with empty array
      this.interactions = [];
    }
  }

  private async saveInteractions(): Promise<void> {
    await fs.writeFile(this.dbPath, JSON.stringify(this.interactions, null, 2));
  }

  private async analyzeInteractions(): Promise<void> {
    const recentInteractions = this.interactions.slice(-100); // Analyze last 100 interactions

    // Calculate success rate
    const successCount = recentInteractions.filter(i => i.success).length;
    this.metrics.commandSuccessRate = successCount / recentInteractions.length;

    // Find common patterns
    const patterns = new Map<string, number>();
    recentInteractions.forEach(i => {
      if (i.command) {
        const pattern = `${i.command.type} ${i.command.action}`;
        patterns.set(pattern, (patterns.get(pattern) || 0) + 1);
      }
    });

    this.metrics.commonPatterns = Array.from(patterns.entries())
      .map(([pattern, count]) => ({ pattern, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    // Analyze failure points
    const failures = new Map<string, { count: number; examples: string[] }>();
    recentInteractions.forEach(i => {
      if (!i.success && i.error) {
        const type = this.categorizeError(i.error);
        const current = failures.get(type) || { count: 0, examples: [] };
        failures.set(type, {
          count: current.count + 1,
          examples: [...current.examples, i.input].slice(-3) // Keep last 3 examples
        });
      }
    });

    this.metrics.failurePoints = Array.from(failures.entries())
      .map(([type, data]) => ({
        type,
        count: data.count,
        examples: data.examples
      }))
      .sort((a, b) => b.count - a.count);
  }

  private extractCommandPatterns(commands: NonNullable<Interaction['command']>[]): string {
    const patterns = commands.reduce((acc, cmd) => {
      const key = `${cmd.type} ${cmd.action}`;
      acc[key] = (acc[key] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(patterns)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([pattern, count]) => `- ${pattern} (used ${count} times)`)
      .join('\n');
  }

  private getTopExamples(count: number): string {
    return this.interactions
      .filter(i => i.success && i.command)
      .slice(-count)
      .map(i => `Input: ${i.input}\nCommand: ${i.command!.type} ${i.command!.action} ${
        Object.entries(i.command!.parameters)
          .map(([k, v]) => `${k}=${v}`)
          .join(' ')
      }`)
      .join('\n\n');
  }

  private findSimilarInteractions(input: string): Interaction[] {
    const words = input.toLowerCase().split(/\s+/);
    return this.interactions
      .filter(i => i.success)
      .map(i => ({
        interaction: i,
        similarity: this.calculateSimilarity(words, i.input.toLowerCase().split(/\s+/))
      }))
      .sort((a, b) => b.similarity - a.similarity)
      .filter(({ similarity }) => similarity > 0.5)
      .map(({ interaction }) => interaction);
  }

  private calculateSimilarity(words1: string[], words2: string[]): number {
    const common = words1.filter(w => words2.includes(w)).length;
    return common / Math.max(words1.length, words2.length);
  }

  private adaptResponse(template: string, newInput: string): string {
    // Simple adaptation: replace specific terms while keeping structure
    const inputWords = newInput.toLowerCase().split(/\s+/);
    return template.split(/\s+/).map(word => {
      const lword = word.toLowerCase();
      const match = inputWords.find(w => 
        w.length > 3 && (lword.includes(w) || w.includes(lword))
      );
      return match || word;
    }).join(' ');
  }

  private categorizeError(error: string): string {
    if (error.includes('not found')) return 'NOT_FOUND';
    if (error.includes('permission')) return 'PERMISSION_DENIED';
    if (error.includes('invalid')) return 'INVALID_INPUT';
    if (error.includes('timeout')) return 'TIMEOUT';
    return 'OTHER';
  }
}