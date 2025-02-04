import { ContextManager } from '../context/context-manager';
import { CommandPredictor } from '../ml/models/command-predictor';
import { v4 as uuidv4 } from 'uuid';

export interface ReasoningStep {
    id: string;
    type: 'understanding' | 'context' | 'hypothesis' | 'validation' | 'planning';
    input: any;
    output: any;
    confidence: number;
    timestamp: number;
}

export interface Hypothesis {
    id: string;
    description: string;
    confidence: number;
    supportingEvidence: string[];
    counterEvidence: string[];
}

export interface ActionStep {
    action: string;
    parameters: Record<string, any>;
    expectedOutcome: string;
    confidence?: number;
    fallback?: string;
}

export interface ActionPlan {
    steps: ActionStep[];
    estimatedSuccess: number;
    potentialRisks: string[];
}

export interface ReasoningResult {
    steps: ReasoningStep[];
    finalHypothesis: Hypothesis;
    actionPlan: ActionPlan;
    confidence: number;
    explanation: string;
}

export interface ValidationResult {
    isValid: boolean;
    constraintsSatisfied: boolean;
    risksAcceptable: boolean;
    resourcesAvailable: boolean;
}

export class ReasoningPipeline {
    private contextManager: ContextManager;
    private commandPredictor: CommandPredictor;
    private readonly confidenceThreshold = 0.8;

    constructor(contextManager: ContextManager, commandPredictor: CommandPredictor) {
        this.contextManager = contextManager;
        this.commandPredictor = commandPredictor;
    }

    async process(input: string): Promise<ReasoningResult> {
        const steps: ReasoningStep[] = [];
        
        // Step 1: Initial Understanding
        const understanding = await this.understandInput(input);
        steps.push(understanding);

        if (understanding.confidence < this.confidenceThreshold) {
            return this.createClarificationResult(understanding);
        }

        // Step 2: Context Analysis
        const context = await this.analyzeContext(input, understanding.output);
        steps.push(context);

        // Step 3: Generate Hypotheses
        const hypotheses = await this.generateHypotheses(understanding.output, context.output);
        steps.push({
            id: uuidv4(),
            type: 'hypothesis',
            input: { understanding: understanding.output, context: context.output },
            output: hypotheses,
            confidence: Math.max(...hypotheses.map((h: Hypothesis) => h.confidence)),
            timestamp: Date.now()
        });

        // Step 4: Validate Best Hypothesis
        const bestHypothesis = hypotheses.reduce((a: Hypothesis, b: Hypothesis) => 
            a.confidence > b.confidence ? a : b
        );
        const validation = await this.validateHypothesis(bestHypothesis);
        steps.push(validation);

        if (!validation.output.isValid) {
            return this.createFallbackResult(steps, bestHypothesis);
        }

        // Step 5: Action Planning
        const plan = await this.createActionPlan(bestHypothesis, context.output);
        steps.push({
            id: uuidv4(),
            type: 'planning',
            input: bestHypothesis,
            output: plan,
            confidence: plan.estimatedSuccess,
            timestamp: Date.now()
        });

        return {
            steps,
            finalHypothesis: bestHypothesis,
            actionPlan: plan,
            confidence: validation.confidence,
            explanation: this.generateExplanation(steps)
        };
    }

    private async understandInput(input: string): Promise<ReasoningStep> {
        const prediction = await this.commandPredictor.predict(input);
        
        return {
            id: uuidv4(),
            type: 'understanding',
            input,
            output: {
                intent: prediction.commandType,
                confidence: prediction.confidence,
                entities: await this.extractEntities(input)
            },
            confidence: prediction.confidence,
            timestamp: Date.now()
        };
    }

    private async analyzeContext(
        input: string,
        understanding: any
    ): Promise<ReasoningStep> {
        const contextSummary = await this.contextManager.getContextSummary(input);
        const relevantPreferences = this.findRelevantPreferences(
            understanding,
            contextSummary.preferences
        );

        return {
            id: uuidv4(),
            type: 'context',
            input: { input, understanding },
            output: {
                relevantHistory: contextSummary.relevantHistory,
                preferences: relevantPreferences,
                systemState: contextSummary.systemState
            },
            confidence: this.calculateContextRelevance(contextSummary),
            timestamp: Date.now()
        };
    }

    private async generateHypotheses(
        understanding: any,
        context: any
    ): Promise<Hypothesis[]> {
        const hypotheses: Hypothesis[] = [];

        // Generate primary hypothesis
        hypotheses.push({
            id: uuidv4(),
            description: this.formulateHypothesis(understanding, context),
            confidence: understanding.confidence,
            supportingEvidence: this.findSupportingEvidence(understanding, context),
            counterEvidence: this.findCounterEvidence(understanding, context)
        });

        // Generate alternative hypotheses
        const alternatives = this.generateAlternatives(understanding, context);
        hypotheses.push(...alternatives);

        return hypotheses;
    }

    private async validateHypothesis(
        hypothesis: Hypothesis
    ): Promise<ReasoningStep> {
        const validation: ValidationResult = {
            isValid: hypothesis.confidence >= this.confidenceThreshold,
            constraintsSatisfied: this.checkConstraints(hypothesis),
            risksAcceptable: this.assessRisks(hypothesis),
            resourcesAvailable: await this.checkResources(hypothesis)
        };

        return {
            id: uuidv4(),
            type: 'validation',
            input: hypothesis,
            output: validation,
            confidence: this.calculateValidationConfidence(validation),
            timestamp: Date.now()
        };
    }

    private async createActionPlan(
        hypothesis: Hypothesis,
        context: any
    ): Promise<ActionPlan> {
        const steps = await this.planActions(hypothesis, context);
        const risks = this.identifyRisks(steps);
        
        return {
            steps,
            estimatedSuccess: this.estimateSuccess(steps, risks),
            potentialRisks: risks
        };
    }

    private async extractEntities(input: string): Promise<Record<string, any>> {
        // Simplified entity extraction
        const entities: Record<string, any> = {};
        
        // Extract paths
        const pathMatch = input.match(/(?:^|\s)(['"])?([\/\\][\w\s\-\.\/\\]+)\1(?:\s|$)/);
        if (pathMatch) entities.path = pathMatch[2];

        // Extract parameters (key=value)
        const paramMatches = input.matchAll(/(\w+)=(['"])?([^\s'"]+)\2?/g);
        for (const match of paramMatches) {
            entities[match[1]] = match[3];
        }

        return entities;
    }

    private findRelevantPreferences(
        understanding: any,
        preferences: any[]
    ): any[] {
        return preferences.filter(pref => 
            pref.category.toLowerCase().includes(understanding.intent.toLowerCase())
        );
    }

    private calculateContextRelevance(contextSummary: any): number {
        const hasRelevantHistory = contextSummary.relevantHistory.length > 0;
        const hasRelevantPreferences = contextSummary.preferences.length > 0;
        const systemStateValid = this.validateSystemState(contextSummary.systemState);

        return (
            (hasRelevantHistory ? 0.4 : 0) +
            (hasRelevantPreferences ? 0.3 : 0) +
            (systemStateValid ? 0.3 : 0)
        );
    }

    private validateSystemState(state: any): boolean {
        return (
            state.resourceUsage.cpu < 0.9 &&
            state.resourceUsage.memory < 0.9 &&
            !state.lastError
        );
    }

    private formulateHypothesis(
        understanding: any,
        context: any
    ): string {
        return `User intends to ${understanding.intent} with confidence ${
            understanding.confidence
        } based on ${context.relevantHistory.length} relevant past interactions`;
    }

    private findSupportingEvidence(
        understanding: any,
        context: any
    ): string[] {
        const evidence: string[] = [];

        if (understanding.confidence > 0.8) {
            evidence.push(`High confidence in intent understanding: ${understanding.confidence}`);
        }

        if (context.relevantHistory.length > 0) {
            evidence.push(`${context.relevantHistory.length} similar past interactions found`);
        }

        return evidence;
    }

    private findCounterEvidence(
        understanding: any,
        context: any
    ): string[] {
        const evidence: string[] = [];

        if (understanding.confidence < 0.8) {
            evidence.push(`Low confidence in intent understanding: ${understanding.confidence}`);
        }

        if (context.systemState.lastError) {
            evidence.push(`Recent system error: ${context.systemState.lastError.message}`);
        }

        return evidence;
    }

    private generateAlternatives(
        understanding: any,
        context: any
    ): Hypothesis[] {
        const alternatives: Hypothesis[] = [];

        // Generate alternative based on similar past interactions
        if (context.relevantHistory.length > 0) {
            const mostSimilar = context.relevantHistory[0];
            alternatives.push({
                id: uuidv4(),
                description: `Alternative interpretation based on similar past interaction: ${mostSimilar.userInput}`,
                confidence: understanding.confidence * 0.8,
                supportingEvidence: [`Similar interaction found with success: ${mostSimilar.metadata.success}`],
                counterEvidence: ['Based on historical similarity, not current intent']
            });
        }

        return alternatives;
    }

    private checkConstraints(hypothesis: Hypothesis): boolean {
        return hypothesis.counterEvidence.length === 0;
    }

    private assessRisks(hypothesis: Hypothesis): boolean {
        return hypothesis.confidence >= this.confidenceThreshold;
    }

    private async checkResources(hypothesis: Hypothesis): Promise<boolean> {
        const state = this.contextManager.getSystemState();
        return (
            state.resourceUsage.cpu < 0.8 &&
            state.resourceUsage.memory < 0.8
        );
    }

    private calculateValidationConfidence(validation: ValidationResult): number {
        return (
            (validation.isValid ? 0.4 : 0) +
            (validation.constraintsSatisfied ? 0.2 : 0) +
            (validation.risksAcceptable ? 0.2 : 0) +
            (validation.resourcesAvailable ? 0.2 : 0)
        );
    }

    private async planActions(
        hypothesis: Hypothesis,
        context: any
    ): Promise<ActionStep[]> {
        // Basic action planning
        return [{
            action: 'execute',
            parameters: {
                intent: hypothesis.description,
                confidence: hypothesis.confidence
            },
            expectedOutcome: 'Successful execution of user intent',
            confidence: hypothesis.confidence,
            fallback: 'Request clarification from user'
        }];
    }

    private identifyRisks(steps: ActionStep[]): string[] {
        const risks: string[] = [];

        if (steps.some(step => (step.confidence || 0) < this.confidenceThreshold)) {
            risks.push('Low confidence in some action steps');
        }

        return risks;
    }

    private estimateSuccess(
        steps: ActionStep[],
        risks: string[]
    ): number {
        const baseConfidence = steps.reduce((acc, step) => 
            acc * (step.confidence || 0.5), 1);
        const riskPenalty = risks.length * 0.1;
        
        return Math.max(0, Math.min(1, baseConfidence - riskPenalty));
    }

    private generateExplanation(steps: ReasoningStep[]): string {
        return steps
            .map(step => 
                `${step.type.toUpperCase()}: ${
                    typeof step.output === 'object' 
                        ? JSON.stringify(step.output)
                        : step.output
                } (confidence: ${step.confidence})`
            )
            .join('\n');
    }

    private createClarificationResult(
        understanding: ReasoningStep
    ): ReasoningResult {
        return {
            steps: [understanding],
            finalHypothesis: {
                id: uuidv4(),
                description: 'Insufficient confidence in understanding',
                confidence: understanding.confidence,
                supportingEvidence: [],
                counterEvidence: [`Low confidence: ${understanding.confidence}`]
            },
            actionPlan: {
                steps: [{
                    action: 'clarify',
                    parameters: { confidence: understanding.confidence },
                    expectedOutcome: 'Get clarification from user',
                    confidence: understanding.confidence
                }],
                estimatedSuccess: 0.5,
                potentialRisks: ['User frustration from additional interaction']
            },
            confidence: understanding.confidence,
            explanation: 'Need clarification due to low confidence in understanding'
        };
    }

    private createFallbackResult(
        steps: ReasoningStep[],
        hypothesis: Hypothesis
    ): ReasoningResult {
        const fallbackConfidence = hypothesis.confidence * 0.7;
        return {
            steps,
            finalHypothesis: hypothesis,
            actionPlan: {
                steps: [{
                    action: 'fallback',
                    parameters: { originalHypothesis: hypothesis },
                    expectedOutcome: 'Execute safe fallback action',
                    confidence: fallbackConfidence
                }],
                estimatedSuccess: 0.7,
                potentialRisks: ['May not fully address user intent']
            },
            confidence: fallbackConfidence,
            explanation: 'Using fallback plan due to validation failure'
        };
    }
}