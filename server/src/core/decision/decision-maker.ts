import { v4 as uuidv4 } from 'uuid';
import { ReasoningPipeline, ReasoningResult, ReasoningStep } from '../reasoning/reasoning-pipeline';
import { EnhancedLearningSystem } from '../learning/enhanced-learning';
import { ContextManager } from '../context/context-manager';

interface Decision {
    id: string;
    action: string;
    parameters: Record<string, any>;
    confidence: number;
    uncertainty: UncertaintyEstimate;
    explanation: string;
    alternatives: Alternative[];
    timestamp: number;
}

interface UncertaintyEstimate {
    total: number;
    sources: {
        modelUncertainty: number;
        dataUncertainty: number;
        contextUncertainty: number;
    };
    mitigationStrategies: string[];
}

interface Alternative {
    action: string;
    parameters: Record<string, any>;
    confidence: number;
    tradeoffs: {
        advantages: string[];
        disadvantages: string[];
    };
}

interface ExecutionResult {
    success: boolean;
    output?: any;
    error?: string;
    metrics: {
        executionTime: number;
        resourceUsage: Record<string, number>;
    };
}

interface ContextOutput {
    relevantHistory: Array<{
        timestamp: number;
        metadata: {
            executedCommands?: string[];
            success?: boolean;
        };
    }>;
}

export class DecisionMaker {
    private reasoningPipeline: ReasoningPipeline;
    private learningSystem: EnhancedLearningSystem;
    private contextManager: ContextManager;
    private readonly confidenceThreshold = 0.8;
    private readonly maxUncertainty = 0.3;

    constructor(
        reasoningPipeline: ReasoningPipeline,
        learningSystem: EnhancedLearningSystem,
        contextManager: ContextManager
    ) {
        this.reasoningPipeline = reasoningPipeline;
        this.learningSystem = learningSystem;
        this.contextManager = contextManager;
    }

    async makeDecision(input: string): Promise<Decision> {
        // Get reasoning result
        const reasoningResult = await this.reasoningPipeline.process(input);
        
        // Estimate uncertainty
        const uncertainty = await this.estimateUncertainty(reasoningResult);
        
        // Generate alternatives if uncertainty is high
        const alternatives = uncertainty.total > this.maxUncertainty ?
            await this.generateAlternatives(reasoningResult) : [];
        
        // Generate detailed explanation
        const explanation = this.generateExplanation(reasoningResult, uncertainty);

        return {
            id: uuidv4(),
            action: reasoningResult.actionPlan.steps[0].action,
            parameters: reasoningResult.actionPlan.steps[0].parameters,
            confidence: reasoningResult.confidence,
            uncertainty,
            explanation,
            alternatives,
            timestamp: Date.now()
        };
    }

    private async estimateUncertainty(
        reasoningResult: ReasoningResult
    ): Promise<UncertaintyEstimate> {
        // Get performance metrics from learning system
        const performanceReport = await this.learningSystem.getPerformanceReport();
        
        // Calculate different sources of uncertainty
        const modelUncertainty = 1 - performanceReport.overallAccuracy;
        const dataUncertainty = this.calculateDataUncertainty(reasoningResult);
        const contextUncertainty = this.calculateContextUncertainty(reasoningResult);

        // Calculate total uncertainty as weighted sum
        const total = (
            modelUncertainty * 0.4 +
            dataUncertainty * 0.3 +
            contextUncertainty * 0.3
        );

        // Generate mitigation strategies
        const mitigationStrategies = this.generateMitigationStrategies({
            modelUncertainty,
            dataUncertainty,
            contextUncertainty
        });

        return {
            total,
            sources: {
                modelUncertainty,
                dataUncertainty,
                contextUncertainty
            },
            mitigationStrategies
        };
    }

    private calculateDataUncertainty(reasoningResult: ReasoningResult): number {
        // Consider the amount and quality of evidence
        const evidenceStrength = reasoningResult.finalHypothesis.supportingEvidence.length /
            (reasoningResult.finalHypothesis.supportingEvidence.length +
             reasoningResult.finalHypothesis.counterEvidence.length);

        // Consider the confidence in the evidence
        const validationSteps = reasoningResult.steps.filter(
            (step: ReasoningStep) => step.type === 'validation'
        );
        const confidenceInEvidence = validationSteps.reduce(
            (acc: number, step: ReasoningStep) => acc * step.confidence, 
            1
        );

        return 1 - (evidenceStrength * 0.6 + confidenceInEvidence * 0.4);
    }

    private calculateContextUncertainty(reasoningResult: ReasoningResult): number {
        // Consider the relevance and recency of context
        const contextStep = reasoningResult.steps.find(
            (step: ReasoningStep) => step.type === 'context'
        );
        if (!contextStep) return 1;

        const contextRelevance = contextStep.confidence;
        const contextRecency = this.calculateContextRecency(contextStep.output as ContextOutput);

        return 1 - (contextRelevance * 0.7 + contextRecency * 0.3);
    }

    private calculateContextRecency(contextOutput: ContextOutput): number {
        const now = Date.now();
        const contextAge = now - Math.max(
            ...contextOutput.relevantHistory.map(h => h.timestamp)
        );
        
        // Convert age to hours and normalize
        const ageInHours = contextAge / (1000 * 60 * 60);
        return Math.max(0, 1 - (ageInHours / 24)); // Decay over 24 hours
    }

    private generateMitigationStrategies(uncertainties: {
        modelUncertainty: number;
        dataUncertainty: number;
        contextUncertainty: number;
    }): string[] {
        const strategies: string[] = [];

        if (uncertainties.modelUncertainty > 0.3) {
            strategies.push('Collect more training data for model improvement');
        }

        if (uncertainties.dataUncertainty > 0.3) {
            strategies.push('Request additional confirmation from user');
            strategies.push('Use more conservative action parameters');
        }

        if (uncertainties.contextUncertainty > 0.3) {
            strategies.push('Refresh context information');
            strategies.push('Consider recent system changes');
        }

        return strategies;
    }

    private async generateAlternatives(
        reasoningResult: ReasoningResult
    ): Promise<Alternative[]> {
        const alternatives: Alternative[] = [];

        // Generate alternative based on historical success
        const contextSummary = await this.contextManager.getContextSummary(
            reasoningResult.finalHypothesis.description
        );

        if (contextSummary.relevantHistory.length > 0) {
            const historicalSuccess = contextSummary.relevantHistory[0];
            alternatives.push({
                action: historicalSuccess.metadata.executedCommands?.[0] || 'fallback',
                parameters: { ...historicalSuccess.metadata },
                confidence: reasoningResult.confidence * 0.8,
                tradeoffs: {
                    advantages: ['Proven successful in similar context'],
                    disadvantages: ['May not fully address current requirements']
                }
            });
        }

        // Generate conservative alternative
        alternatives.push({
            action: 'safe_' + reasoningResult.actionPlan.steps[0].action,
            parameters: {
                ...reasoningResult.actionPlan.steps[0].parameters,
                safe_mode: true
            },
            confidence: reasoningResult.confidence * 0.9,
            tradeoffs: {
                advantages: ['Lower risk', 'Guaranteed safety checks'],
                disadvantages: ['Slower execution', 'Limited functionality']
            }
        });

        return alternatives;
    }

    private generateExplanation(
        reasoningResult: ReasoningResult,
        uncertainty: UncertaintyEstimate
    ): string {
        let explanation = `Decision based on ${reasoningResult.steps.length} reasoning steps:\n`;

        // Add reasoning steps
        explanation += reasoningResult.steps
            .map((step: ReasoningStep) => 
                `- ${step.type}: ${step.confidence.toFixed(2)} confidence`
            )
            .join('\n');

        // Add uncertainty analysis
        explanation += '\n\nUncertainty Analysis:';
        explanation += `\n- Model uncertainty: ${uncertainty.sources.modelUncertainty.toFixed(2)}`;
        explanation += `\n- Data uncertainty: ${uncertainty.sources.dataUncertainty.toFixed(2)}`;
        explanation += `\n- Context uncertainty: ${uncertainty.sources.contextUncertainty.toFixed(2)}`;

        // Add mitigation strategies if uncertainty is high
        if (uncertainty.total > this.maxUncertainty) {
            explanation += '\n\nMitigation Strategies:';
            explanation += uncertainty.mitigationStrategies
                .map(strategy => `\n- ${strategy}`)
                .join('');
        }

        return explanation;
    }

    async executeDecision(decision: Decision): Promise<ExecutionResult> {
        const startTime = Date.now();
        let success = false;
        let error: string | undefined;
        let output: any;

        try {
            // Check uncertainty threshold
            if (decision.uncertainty.total > this.maxUncertainty) {
                // Apply mitigation strategies
                decision = await this.applyMitigationStrategies(decision);
            }

            // Execute with monitoring
            const result = await this.monitoredExecution(decision);
            success = result.success;
            output = result.output;
            error = result.error;

            // Record execution result for learning
            await this.learningSystem.processInteraction(
                decision.explanation,
                { success, output, error },
                { executionTime: Date.now() - startTime }
            );

        } catch (err) {
            success = false;
            error = err instanceof Error ? err.message : 'Unknown error';
        }

        return {
            success,
            output,
            error,
            metrics: {
                executionTime: Date.now() - startTime,
                resourceUsage: await this.getResourceUsage()
            }
        };
    }

    private async applyMitigationStrategies(decision: Decision): Promise<Decision> {
        // Apply each mitigation strategy
        for (const strategy of decision.uncertainty.mitigationStrategies) {
            decision = await this.applyStrategy(decision, strategy);
        }
        return decision;
    }

    private async applyStrategy(
        decision: Decision,
        strategy: string
    ): Promise<Decision> {
        // Apply specific mitigation strategies
        switch (strategy) {
            case 'Use more conservative action parameters':
                return this.makeConservative(decision);
            case 'Request additional confirmation from user':
                return this.addValidation(decision);
            case 'Refresh context information':
                return this.refreshContext(decision);
            default:
                return decision;
        }
    }

    private makeConservative(decision: Decision): Decision {
        return {
            ...decision,
            parameters: {
                ...decision.parameters,
                safe_mode: true,
                timeout: (decision.parameters.timeout || 30000) * 2,
                retries: (decision.parameters.retries || 1) + 1
            }
        };
    }

    private addValidation(decision: Decision): Decision {
        return {
            ...decision,
            parameters: {
                ...decision.parameters,
                require_confirmation: true,
                validation_checks: true
            }
        };
    }

    private async refreshContext(decision: Decision): Promise<Decision> {
        const freshContext = await this.contextManager.getContextSummary(
            decision.explanation
        );
        
        return {
            ...decision,
            parameters: {
                ...decision.parameters,
                context: freshContext
            }
        };
    }

    private async monitoredExecution(
        decision: Decision
    ): Promise<{ success: boolean; output?: any; error?: string }> {
        // Implement actual execution logic here
        // This is a placeholder that simulates success
        return {
            success: true,
            output: { executed: decision.action }
        };
    }

    private async getResourceUsage(): Promise<Record<string, number>> {
        // Get actual resource usage metrics
        // This is a placeholder
        return {
            cpu: 0.1,
            memory: 0.2,
            io: 0.1
        };
    }
}