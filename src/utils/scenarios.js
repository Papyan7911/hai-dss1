// src/utils/scenarios.js
import axios from 'axios';

/**
 * Գլխավոր ֆունկցիա՝ սցենարների ստեղծման համար
 */
export const generateAIScenarios = async (dataType, analysisResults, clusterData = [], contextData = {}) => {
    try {
        // Prompt-ի պատրաստում
        const cleanedResults = { ...analysisResults };
        delete cleanedResults.fuzzyResults?.confidenceDistribution;
        console.log(cleanedResults, 'jjjjjjjjjjjj');

        const prompt = buildContextPrompt(dataType, cleanedResults, clusterData, contextData);

        console.log(prompt, '🔥 Prompt');

        // Ուղարկում backend-ին՝ ամբողջ cluster data-ով
        const response = await axios.post(
            'https://gateway.amracode.am/api/v1/ai/ask',
            {
                dataType,
                analysisResults,
                clusters: clusterData,   // <— передаём JSON, а не вставляем в prompt
            },
            {
                timeout: 60000,
                headers: { 'Content-Type': 'application/json' },
            }
        );

        console.log('✅ AI Response Data:', response.data);

        let parsed = response.data.reply;

        if (typeof parsed === 'string') parsed = JSON.parse(parsed);

        const scenarios = parsed?.scenarios || [];

        return scenarios.map((scenario, index) => ({
            id: `ai_${Date.now()}_${index}`,

            // Հայերեն բանալիները
            title: scenario.name || scenario["name"] || `Սցենար ${index + 1}`,
            description: scenario.description || scenario["description"] || "",

            // Կանխադրույթներ (assumptions)
            preconditions: scenario.assumptions || scenario["assumptions"] || [],

            // Ռիսկեր
            risks: (scenario.risks || scenario["risks"] || []).map(risk => ({
                title: risk.title || risk["title"] || "",
                impact: risk.impact || risk["impact"] || "medium",
                probability: risk.probability || risk["probability"] || 0.5,
                response: risk.treatment || risk["treatment"] || "",
                mitigationSteps: risk.mitigation_steps || risk["mitigation_steps"] || [],
            })),

            // Գործողություններ
            actions: (scenario.recommended_actions || scenario["recommended_actions"] || []).map(action => ({
                step: action.step || action["step"] || "",
                responsible: action.responsible || action["responsible"] || "",
                deadline: action.deadline || action["deadline"] || "",
                justification: action.justification || action["justification"] || "",
            })),

            // Սպասվող արդյունքներ
            expectedOutcomes: scenario.expected_measurable_outcomes || scenario["expected_measurable_outcomes"] || [],

            // Առաջնահերթություն
            priority: scenario.priority || 'medium',
            priorityText: (() => {
                const priority = scenario.priority || 'medium';
                switch (priority) {
                    case 'high': return 'Բարձր առաջնահերթություն';
                    case 'medium': return 'Միջին առաջնահերթություն';
                    case 'low': return 'Ցածր առաջնահերթություն';
                    default: return 'Միջին առաջնահերթություն';
                }
            })()
        }));


    } catch (error) {
        console.error('AI Scenario Generation Error:', error);
        throw error;
    }
};

/**
 * Prompt-ի պատրաստում (հայերեն)
 */
const buildContextPrompt = (dataType, analysisResults, clusterData, contextData) => {
    const dataTypeTranslations = {
        demographic: 'դեմոգրաֆիական',
        healthcare: 'առողջապահական',
        quality_of_life: 'կյանքի որակի',
        educational: 'կրթական',
    };

    let prompt = `Մենեջերական որոշումների համակարգ - ${dataTypeTranslations[dataType] || dataType} տվյալների վերլուծություն։ Խնդրում եմ մշակել առավելագույնը 3 սցենար հայերենով։`;

    // Վստահության մակարդակ
    if (analysisResults?.fuzzyResults) {
        const fr = analysisResults.fuzzyResults;
        prompt += `\nՎստահության մակարդակ:\n• Բարձր: ${fr.high || 0}%\n• Միջին: ${fr.medium || 0}%\n• Ցածր: ${fr.low || 0}%`;
        if (fr.analysis) prompt += `\nՀաշվետվություն: ${fr.analysis}`;
    }

    // Վերլուծության ստատիստիկա
    if (analysisResults?.statistics) {
        const stats = analysisResults.statistics;
        prompt += `\nՎերլուծության ստատիստիկա:\n• Միջին արժեք: ${stats.mean ?? 'N/A'}\n• Մինիմալ արժեք: ${stats.min ?? 'N/A'}\n• Մաքսիմալ արժեք: ${stats.max ?? 'N/A'}`;
    }

    // Խմբեր՝ ամբողջական տվյալներով
    if (clusterData?.length) {
        prompt += `\nՀայտնաբերված խմբեր և տվյալները:\n`;
        clusterData.forEach(c => {
            prompt += `\n• ${c.label} (հարուստություն: ${c.avgValue}, որակ: ${c.quality}, չափնված անձինք: ${c.size})`;
            c.points?.forEach((p, pi) => {
                prompt += `\n   • Պատկերված անձ ${pi + 1}:`;
                Object.entries(p.originalData || {}).forEach(([key, value]) => {
                    prompt += ` ${key}: ${value};`;
                });
            });
        });
    }

    if (contextData?.budget) prompt += `\nԲյուջե: ${contextData.budget}`;

    prompt += `\nԽնդրում եմ ստեղծել յուրաքանչյուր սցենարի համար՝ վերնագիր, նկարագրություն, ռիսկեր, առաջարկվող գործողություններ, սպասվող արդյունքներ և կանխադրույթներ:`;

    return prompt;
};
