// src/components/WorkflowPhases/AnalystPhase.js
// Վերլուծաբանի փուլի բաղադրիչ - տվյալների մշակում և վերլուծություն

import React, { useState, useEffect } from 'react';
import { useData } from '../../context/DataContext';
import { PhaseCard } from '../UI/Card';
import Button from '../UI/Button';
import Alert from '../UI/Alert';
import { getDataTypeLabel } from '../../utils/dataHelpers';

/**
 * AnalystPhase բաղադրիչ - վերլուծաբանի աշխատանքային փուլ
 * Պատասխանատու է տվյալների որակի գնահատման և առաջնային վերլուծության համար
 */
const AnalystPhase = ({
    isActive = true,
    isCompleted = false,
    onPhaseComplete,
    // НОВЫЕ ПРОПСЫ:
    projectId,
    projectStorage,
    onUpdateProject
}) => {
    const {
        currentData,
        projectName,
        dataType,
        setAnalysisWorkspace,
        setQualityMetrics,
        setActiveTab,
        setCurrentData,
        setProjectName,
        setDataType,
        setScenarios,
        setSyntheticData,
        setFinalRecommendations,
        setClusterData,
        setDecisionResults,
        setFuzzyResults,
        setRawData
    } = useData();

    const [isAnalyzing, setIsAnalyzing] = useState(false);

    useEffect(() => {
        if (!projectId || !projectStorage) return;

        // Получаем проект
        const project = projectStorage.getProject(projectId);
        if (!project) return;

        // --- 1. Загружаем данные ManagerPhase ---
        const managerData = project.workflowData.phases.manager?.data;
        if (managerData) {
            if (managerData.parsedData) {
                setCurrentData(managerData.parsedData);
            }
            if (managerData.projectName) {
                setProjectName(managerData.projectName);
            }
            if (managerData.dataType) {
                setDataType(managerData.dataType);
            }
            setRawData(managerData.rawData);

        }

        // --- 2. Загружаем данные AnalystPhase, если есть ---
        const analystData = project.workflowData.phases.analyst?.data;
        if (analystData) {
            if (analystData.dataPreview?.length > 0 && (!currentData || currentData.length === 0)) {
                setCurrentData(analystData.dataPreview);
            }
            if (analystData.syntheticDataGenerated) {
                setSyntheticData(analystData.syntheticData || []);
            }
        }

        // --- 3. Загружаем результаты DecisionPhase, если она завершена ---
        const decisionData = project.workflowData.phases.decision?.data;
        if (decisionData) {
            if (decisionData.decisionMatrix && typeof setDecisionResults === 'function') {
                setDecisionResults(decisionData.decisionMatrix);
            }
            if (decisionData.finalRecommendations && typeof setFinalRecommendations === 'function') {
                setFinalRecommendations(decisionData.finalRecommendations);
            }
        }

        // --- 4. Загружаем данные ExpertPhase, если она завершена ---
        const expertData = project.workflowData.phases.expert?.data;
        if (expertData) {
            if (expertData.fuzzyResults && typeof setFuzzyResults === 'function') {
                setFuzzyResults(expertData.fuzzyResults);
                console.log(expertData.fuzzyResults, 'expertData.fuzzyResults');
            }
            if (expertData.clusterData && typeof setClusterData === 'function') {
                setClusterData(expertData.clusterData);
            }
            if (project.scenarios && typeof setScenarios === 'function') {
                setScenarios(project.scenarios);
            }
        }

    }, [
        projectId,
        projectStorage,
        setCurrentData,
        setProjectName,
        setDataType,
        setSyntheticData,
        setDecisionResults,
        setFinalRecommendations,
        setFuzzyResults,
        setClusterData,
        setScenarios
    ]);

    /**
     * Տվյալների վերլուծության սկիզբ
     * Որակի մետրիկների հաշվարկ և վերլուծական տարածքի ակտիվացում
     */
    const startAnalysis = async () => {
        if (!currentData || currentData.length === 0) {
            alert('Տվյալները բացակայում են վերլուծության համար');
            return;
        }

        setIsAnalyzing(true);

        try {
            // Simulate analysis processing time
            await new Promise(resolve => setTimeout(resolve, 2000));

            // Վերլուծական տարածքի ցուցադրում
            setAnalysisWorkspace(true);

            // Տվյալների որակի գնահատման սիմուլյացիա
            const qualityAnalysis = analyzeDataQuality(currentData);
            setQualityMetrics(qualityAnalysis);

            // НОВОЕ: Сохраняем данные аналитической фазы
            if (projectStorage && projectId) {
                projectStorage.updateAnalystPhase(projectId, {
                    qualityMetrics: qualityAnalysis,
                    analysisStartTime: new Date().toISOString(),
                    dataPreview: currentData.slice(0, 5),
                    syntheticDataGenerated: false
                });
            }

            console.log('Տվյալների որակի վերլուծություն ավարտված:', qualityAnalysis);

            setIsAnalyzing(false);

            // Trigger automatic phase transition
            if (onPhaseComplete) {
                onPhaseComplete();
            }
            setActiveTab('fuzzy');

        } catch (error) {
            console.error('Վերլուծության սխալ:', error);
            alert('Վերլուծության ժամանակ սխալ առաջացավ');
            setIsAnalyzing(false);
        }
    };

    /**
     * Տվյալների որակի գնահատման ալգորիթմ
     * @param {Array} data - Վերլուծելիք տվյալներ
     * @returns {Object} Որակի մետրիկներ
     */
    const analyzeDataQuality = (data) => {
        if (!data || data.length === 0) {
            return {
                completeness: 0,
                accuracy: 0,
                missingValues: 0,
                outliers: 0,
                duplicates: 0
            };
        }

        const headers = Object.keys(data[0]);
        let totalCells = 0;
        let missingCells = 0;
        let duplicateRows = 0;
        let outlierCount = 0;

        // Բացակայող արժեքների հաշվարկ
        data.forEach(row => {
            headers.forEach(header => {
                totalCells++;
                const value = row[header];
                if (value === null || value === undefined || value === '' || value === 'null') {
                    missingCells++;
                }
            });
        });

        // Կրկնակի տողերի գտնում
        const seen = new Set();
        data.forEach(row => {
            const rowString = JSON.stringify(row);
            if (seen.has(rowString)) {
                duplicateRows++;
            } else {
                seen.add(rowString);
            }
        });

        // Նմանակման ալգորիթմ ոչ ստանդարտ արժեքների համար
        const numericColumns = headers.filter(header => {
            return data.some(row => {
                const value = row[header];
                return value !== null && !isNaN(parseFloat(value));
            });
        });

        numericColumns.forEach(header => {
            const values = data
                .map(row => parseFloat(row[header]))
                .filter(val => !isNaN(val));

            if (values.length > 0) {
                const mean = values.reduce((a, b) => a + b, 0) / values.length;
                const variance = values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length;
                const stdDev = Math.sqrt(variance);

                // Z-score մեթոդով ոչ ստանդարտ արժեքների գտնում
                values.forEach(val => {
                    const zScore = Math.abs((val - mean) / stdDev);
                    if (zScore > 2.5) { // 2.5 ստանդարտ շեղման սահման
                        outlierCount++;
                    }
                });
            }
        });

        // Որակի մետրիկների հաշվարկ
        const completeness = Math.max(0, Math.min(100, ((totalCells - missingCells) / totalCells) * 100));
        const accuracy = Math.max(0, Math.min(100,
            ((totalCells - missingCells - outlierCount) / totalCells) * 100
        ));

        return {
            completeness: Math.round(completeness),
            accuracy: Math.round(accuracy),
            missingValues: missingCells,
            outliers: outlierCount,
            duplicates: duplicateRows
        };
    };

    const getDataTypeLabel = (type) => {
        if (Array.isArray(type)) {
            const labels = {
                'demographic': 'Դեմոգրաֆիական',
                'healthcare': 'Առողջապահական',
                'quality_of_life': 'Կյանքի որակ',
                'educational': 'Կրթական'
            };
            return type.map(t => labels[t] || t).join(', ');
        }
        const labels = {
            'demographic': 'Դեմոգրաֆիական',
            'healthcare': 'Առողջապահական',
            'quality_of_life': 'Կյանքի որակ',
            'educational': 'Կրթական'
        };
        return labels[type] || type;
    };

    // Show inactive state when not active and not completed
    if (!isActive && !isCompleted) {
        return (
            <PhaseCard
                title="Վերլուծաբանական փուլ"
                icon="🔬"
                phase="analyst"
                className="opacity-60 w-full max-w-none"
            >
                {/* Status Badge */}
                <div className="mb-2 sm:mb-3 lg:mb-4">
                    <div className="flex items-center space-x-1.5 sm:space-x-2 text-gray-400 text-xs sm:text-sm font-medium">
                        <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-gray-400 rounded-full opacity-50"></span>
                        <span>Սպասում</span>
                    </div>
                </div>

                <Alert type="info" icon="ℹ️" title="Տվյալները բեռնվում են...">
                    <div className="text-xs sm:text-sm lg:text-base">
                        Մենեջերը պետք է մուտքագրի վերլուծության համար անհրաժեշտ տվյալները
                    </div>
                    <div className="mt-2">
                        <strong className="text-xs sm:text-sm">Վերլուծաբանի գործառույթները</strong>
                        <ul className="list-disc list-inside mt-1 space-y-0.5 text-xs sm:text-sm">
                            <li>Տվյալների որակի գնահատում</li>
                            <li>Բացակայող արժեքների հայտնաբերում</li>
                            <li>Ոչ ստանդարտ արժեքների բացահայտում</li>
                            <li>Տվյալների մաքրում</li>
                        </ul>
                    </div>
                </Alert>
            </PhaseCard>
        );
    }

    return (
        <PhaseCard
            title="Վերլուծաբանական փուլ"
            icon="🔬"
            phase="analyst"
            className={`w-full max-w-none transition-all duration-300 ${isCompleted
                ? 'bg-green-500/10 border-green-500/30'
                : isActive
                    ? 'bg-blue-500/10 border-blue-500/30 shadow-lg'
                    : 'opacity-60'
                }`}
        >
            {/* Status Badge */}
            <div className="mb-2 sm:mb-3 lg:mb-4">
                {isCompleted && (
                    <div className="flex items-center space-x-1.5 sm:space-x-2 text-green-400 text-xs sm:text-sm font-medium">
                        <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-green-400 rounded-full"></span>
                        <span>Ավարտված</span>
                    </div>
                )}
                {isActive && !isCompleted && (
                    <div className="flex items-center space-x-1.5 sm:space-x-2 text-green-400 text-xs sm:text-sm font-medium">
                        <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-green-400 rounded-full animate-pulse"></div>
                        <span>Ընթացքի մեջ</span>
                    </div>
                )}
            </div>

            <div className={`space-y-2 sm:space-y-3 lg:space-y-4 ${!isActive && !isCompleted ? 'pointer-events-none' : ''}`}>
                {/* Ստացված տվյալների ինֆորմացիա */}
                <Alert type="success" icon="✅" title="Տվյալները պատրաստ են">
                    <div className="space-y-1 sm:space-y-2">
                        <div className="text-xs sm:text-sm lg:text-base">
                            <strong className="font-semibold">Նախագիծ:</strong>
                            <span className="ml-1 break-words">{projectName}</span>
                        </div>
                        <div className="text-xs sm:text-sm lg:text-base">
                            <strong className="font-semibold">Տեսակ:</strong>
                            <span className="ml-1">{getDataTypeLabel(dataType)}</span>
                        </div>
                        <div className="grid grid-cols-1 xs:grid-cols-2 gap-1 sm:gap-2 text-xs sm:text-sm lg:text-base">
                            <div className="min-w-0">
                                <strong className="font-semibold">Տողերի քանակ:</strong>
                                <span className="ml-1">{currentData?.length || 0}</span>
                            </div>
                            <div className="min-w-0">
                                <strong className="font-semibold">Սյունակների քանակ:</strong>
                                <span className="ml-1">{currentData?.length > 0 ? Object.keys(currentData[0]).length : 0}</span>
                            </div>
                        </div>
                    </div>
                </Alert>

                {/* Տվյալների նախադիտում */}
                {/* {currentData && currentData.length > 0 && (
                    <div className="bg-gray-50 rounded-lg p-2 sm:p-3 lg:p-4">
                        <h4 className="font-bold text-xs sm:text-sm text-gray-700 mb-2">📋 Մուտքագրված տվյալներ</h4>
                        <div className="text-xs font-mono bg-white p-2 sm:p-3 rounded border max-h-24 sm:max-h-32 lg:max-h-40 overflow-auto">
                            <div className="font-bold text-blue-600 break-all text-xs leading-relaxed">
                                {Object.keys(currentData[0]).join(' | ')}
                            </div>
                            {currentData.slice(0, 3).map((row, index) => (
                                <div key={index} className="text-gray-600 break-all text-xs leading-relaxed">
                                    {Object.values(row).map(val => val || 'NULL').join(' | ')}
                                </div>
                            ))}
                            {currentData.length > 3 && (
                                <div className="text-gray-400 italic text-xs mt-1">
                                    ... եւ {currentData.length - 3} այլ տող
                                </div>
                            )}
                        </div>
                    </div>
                )} */}

                {/* Վերլուծության տեխնիկական մանրամասներ */}
                <div className="bg-blue-50 rounded-lg p-2 sm:p-3 lg:p-4">
                    <h4 className="font-bold text-xs sm:text-sm text-blue-800 mb-2">🔍 Վերլուծական գործընթացներ</h4>
                    <div className="text-xs sm:text-sm text-blue-700 space-y-0.5 sm:space-y-1">
                        <div>• Տվյալների ամբողջականության ստուգում</div>
                        <div>• Ոչ ստանդարտ արժեքների հայտնաբերում</div>
                        <div className="break-words">• Պակաս տվյալների դեպքում՝ սինթետիկ տվյալների գեներացում</div>
                        {isAnalyzing && (
                            <div className="flex items-center space-x-2 text-blue-600 font-medium mt-2 p-2 bg-blue-100 rounded">
                                <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-blue-600 rounded-full animate-pulse flex-shrink-0"></div>
                                <span className="text-xs sm:text-sm">Վերլուծությունն ընթացքի մեջ է...</span>
                            </div>
                        )}
                    </div>
                </div>

                {/* Վերլուծության մեկնարկ */}
                <div className="pt-2 sm:pt-3 lg:pt-4 border-t border-gray-200">
                    <Button
                        onClick={startAnalysis}
                        variant="analyst"
                        size="md"
                        className={`w-full text-xs sm:text-sm lg:text-base py-2.5 sm:py-3 lg:py-4 transition-all duration-300 ${isCompleted
                            ? 'bg-green-500 text-white cursor-default'
                            : ''
                            }`}
                        disabled={
                            isCompleted ||
                            isAnalyzing ||
                            !currentData ||
                            currentData.length === 0
                        }
                    >
                        {isAnalyzing ? (
                            <div className="flex items-center justify-center">
                                <div className="w-3 h-3 sm:w-4 sm:h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2 flex-shrink-0"></div>
                                <span className="hidden sm:inline">Վերլուծությունն ընթացքի մեջ է...</span>
                                <span className="sm:hidden">Ընթացքի մեջ է...</span>
                            </div>
                        ) : isCompleted ? (
                            <span>✅ Վերլուծությունը ավարտված է</span>
                        ) : (
                            <span>🔬 Սկսել վերլուծությունը</span>
                        )}
                    </Button>

                    <div className="mt-2 sm:mt-3 text-xs sm:text-sm text-white">
                        <div className="flex items-start space-x-1">
                            <span className="flex-shrink-0">💡</span>
                            <div className="min-w-0">
                                <strong className="font-semibold">Վերլուծության փուլը ներառում է:</strong>
                                <ul className="list-disc list-inside mt-1 space-y-0.5 sm:space-y-1 pl-0">
                                    <li className="break-words">Տվյալների որակի չափանիշների հաշվարկ</li>
                                    <li className="break-words">Վիզուալ հաշվետվության ստեղծում</li>
                                    <li className="break-words">Փորձագիտական փուլի նախապատրաստում</li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </PhaseCard>
    );
};

export default AnalystPhase;