/**
 * Client for parsing Gherkin feature files
 * Handles: Parse steps, parse datasets, parse scenarios
 */
export class ParserClient {
    /**
     * Parse Gherkin steps from feature file content
     */
    parseGherkinSteps(featureContent) {
        const steps = [];
        const lines = featureContent.split('\n');
        let currentStep = null;
        let datatableLines = [];
        let commentLines = [];
        let inScenario = false;
        for (const line of lines) {
            const trimmed = line.trim();
            if (!trimmed)
                continue;
            if (trimmed.match(/^(Scenario|Scenario Outline):/i)) {
                inScenario = true;
                continue;
            }
            if (trimmed.match(/^(Examples|@):/i) || trimmed.startsWith('@')) {
                inScenario = false;
                continue;
            }
            if (!inScenario)
                continue;
            const stepMatch = trimmed.match(/^(Given|When|Then|And|But)\s+(.+)$/i);
            if (stepMatch) {
                if (currentStep) {
                    if (datatableLines.length > 0) {
                        currentStep.datatable = datatableLines.join('\n');
                    }
                    if (commentLines.length > 0) {
                        currentStep.comment = commentLines.join('\n');
                    }
                    steps.push(currentStep);
                    datatableLines = [];
                    commentLines = [];
                }
                currentStep = {
                    keyword: stepMatch[1].toUpperCase(),
                    text: stepMatch[2]
                };
            }
            else if (trimmed.startsWith('|') && inScenario && currentStep) {
                datatableLines.push(trimmed);
            }
            else if (trimmed.startsWith('#') && inScenario && currentStep && datatableLines.length === 0) {
                const commentText = trimmed.replace(/^#+\s*/, '');
                if (commentText) {
                    commentLines.push(commentText);
                }
            }
        }
        if (currentStep) {
            if (datatableLines.length > 0) {
                currentStep.datatable = datatableLines.join('\n');
            }
            if (commentLines.length > 0) {
                currentStep.comment = commentLines.join('\n');
            }
            steps.push(currentStep);
        }
        return steps;
    }
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
    parseDatasets(featureContent) {
        const datasets = [];
        const lines = featureContent.split('\n');
        let currentTag = '';
        let inExamples = false;
        let headers = [];
        for (let i = 0; i < lines.length; i++) {
            const trimmed = lines[i].trim();
            if (trimmed.startsWith('@')) {
                currentTag = trimmed.substring(1);
                continue;
            }
            if (trimmed.match(/^Examples:/i)) {
                inExamples = true;
                headers = [];
                continue;
            }
            if (trimmed.match(/^(Scenario|Scenario Outline):/i)) {
                inExamples = false;
                currentTag = '';
                headers = [];
                continue;
            }
            if (inExamples && trimmed.startsWith('|')) {
                const cells = trimmed.split('|').map(c => c.trim()).filter(c => c);
                if (headers.length === 0) {
                    headers = cells;
                }
                else {
                    const cleanedValues = cells.map(value => value.replace(/^["'](.*)["']$/, '$1'));
                    datasets.push({
                        tag: currentTag,
                        name: currentTag,
                        params: headers,
                        values: cleanedValues
                    });
                }
            }
        }
        return datasets;
    }
    /**
     * Parse scenario names from feature file (placeholder for future implementation)
     */
    parseScenarios(featureContent) {
        // TODO: Implement scenario extraction
        throw new Error('Not implemented yet');
    }
    /**
     * Parse tags from feature file (placeholder for future implementation)
     */
    parseTags(featureContent) {
        // TODO: Implement tag extraction
        throw new Error('Not implemented yet');
    }
}
//# sourceMappingURL=ParserClient.js.map