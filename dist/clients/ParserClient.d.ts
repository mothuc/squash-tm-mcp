import { GherkinStep } from '../types.js';
/**
 * Client for parsing Gherkin feature files
 * Handles: Parse steps, parse datasets, parse scenarios
 */
export declare class ParserClient {
    /**
     * Parse Gherkin steps from feature file content
     */
    parseGherkinSteps(featureContent: string): GherkinStep[];
    /**
     * Parse datasets from feature file content (Examples sections)
     * Each Examples block should have a unique @tag and creates one dataset per data row
     *
     * Format:
     *   @Dataset1
     *   Examples:
     *     | param1 | param2 |
     *     | value1 | value2 |
     *
     *   @Dataset2
     *   Examples:
     *     | param1 | param2 |
     *     | value3 | value4 |
     */
    parseDatasets(featureContent: string): Array<{
        tag: string;
        name: string;
        params: string[];
        values: string[];
    }>;
    /**
     * Parse scenario names from feature file (placeholder for future implementation)
     */
    parseScenarios(featureContent: string): Array<{
        name: string;
        type: 'Scenario' | 'Scenario Outline';
    }>;
    /**
     * Parse tags from feature file (placeholder for future implementation)
     */
    parseTags(featureContent: string): string[];
}
//# sourceMappingURL=ParserClient.d.ts.map