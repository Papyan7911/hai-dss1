import React, { useState, useEffect } from 'react';
import { useData } from '../../context/DataContext';
import { PhaseCard } from '../UI/Card';
import Button from '../UI/Button';
import Alert from '../UI/Alert';
import { applyFuzzyLogic } from '../../utils/fuzzyLogic';
import { performClustering } from '../../utils/clustering';
import { generateAIScenarios } from '../../utils/scenarios';

const ExpertPhase = ({
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
        syntheticData,
        projectName,
        dataType,
        setFuzzyResults,
        setClusterData,
        setScenarios,
        setActiveTab,
        setCurrentData,
        setSyntheticData,
        setDecisionResults,
        setFinalRecommendations,
        setProjectName,
        setDataType,
        setRawData
    } = useData();


    const [isProcessing, setIsProcessing] = useState(false);
    const [currentStep, setCurrentStep] = useState('');

    /**
     * Get current user ID - implement based on your auth system
     */
    const getCurrentUserId = () => {
        // Replace this with your actual user ID retrieval logic
        return parseInt(localStorage.getItem('userId')) || 1;
    };

    // НОВОЕ: Загружаем данные проекта из localStorage при монтировании
    useEffect(() => {
        if (!projectId || !projectStorage) return;


        const project = projectStorage.getProject(projectId);
        if (!project) return;

        const managerData = project.workflowData.phases.manager.data;

        if (managerData) {
            if (managerData.parsedData) {
                setCurrentData(managerData.parsedData);
            }
            // Устанавливаем имя проекта и тип данных, как в ManagerPhase
            if (managerData.projectName) {
                setProjectName(managerData.projectName);
            }
            if (managerData.dataType) {
                setDataType(managerData.dataType);
            }
            setRawData(managerData.rawData);

        }

        // --- 1. Подставляем данные аналитической фазы ---
        const analystData = project.workflowData.phases.analyst?.data;
        if (analystData?.dataPreview?.length > 0) {
            if (!currentData || currentData.length === 0) {
                // Подставляем dataPreview как текущие данные
                setCurrentData(analystData.dataPreview);
            }
        }

        // --- 2. Подставляем синтетические данные, если нужно ---
        if (analystData?.syntheticDataGenerated) {
            if (!syntheticData || syntheticData.length === 0) {
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

        // --- 4. Загружаем результаты ExpertPhase, если она завершена ---
        const expertData = project.workflowData.phases.expert?.data;
        if (expertData) {
            if (expertData.fuzzyResults && typeof setFuzzyResults === 'function') {
                setFuzzyResults(expertData.fuzzyResults);
            }
            if (expertData.clusterData && typeof setClusterData === 'function') {
                setClusterData(expertData.clusterData);
            }
            if (project.scenarios && typeof setScenarios === 'function') {
                setScenarios(project.scenarios);
            }
        }

    }, [projectId, projectStorage]);


    /**
     * Փորձագետի վերլուծության մեկնարկ
     * Ներառում է բոլոր խորացված վերլուծական մեթոդները
     */
    const startExpertAnalysis = async () => {
        if (!currentData || currentData.length === 0) {
            alert('Տվյալները բացակայում են փորձագետի վերլուծության համար');
            return;
        }

        setIsProcessing(true);

        try {
            // Անորոշ տրամաբանության կիրառում
            setCurrentStep('Անորոշ տրամաբանության վերլուծություն...');
            await new Promise(resolve => setTimeout(resolve, 1000));

            const fuzzyAnalysis = applyFuzzyLogic(currentData, dataType, syntheticData);
            setFuzzyResults(fuzzyAnalysis);
            console.log('Անորոշ տրամաբանության վերլուծություն:', fuzzyAnalysis);

            // Կլաստերիզացիա
            setCurrentStep('Տվյալների կլաստերիզացիա...');
            await new Promise(resolve => setTimeout(resolve, 2000));

            const clusters = performClustering(currentData, dataType);
            setClusterData(clusters);
            console.log('Կլաստերիզացիայի արդյունք:', clusters);

            // Prepare analysis results for AI scenarios
            const analysisResults = {
                fuzzyResults: fuzzyAnalysis,
                statistics: {
                    mean: currentData.reduce((sum, item) => sum + (typeof item === 'object' ? Object.values(item)[0] : item), 0) / currentData.length,
                    stdDev: 0,
                    min: Math.min(...currentData.map(item => typeof item === 'object' ? Object.values(item)[0] : item)),
                    max: Math.max(...currentData.map(item => typeof item === 'object' ? Object.values(item)[0] : item))
                }
            };

            // AI սցենարների գեներացիա
            setCurrentStep('Սցենարների գեներացում...');
            await new Promise(resolve => setTimeout(resolve, 2000));

            const userId = getCurrentUserId();
            const generatedScenarios = await generateAIScenarios(
                dataType,
                analysisResults,
                clusters
            );
            setScenarios(generatedScenarios);
            setCurrentStep('Վերլուծությունը ամփոփվում է...');
            await new Promise(resolve => setTimeout(resolve, 1000));

            // НОВОЕ: Сохраняем данные экспертной фазы
            if (projectStorage && projectId) {
                const summary = getExpertSummary();
                projectStorage.updateExpertPhase(projectId, {
                    fuzzyResults: fuzzyAnalysis,
                    clusterData: clusters,
                    scenarios: generatedScenarios,
                    expertSummary: summary,
                    processingSteps: ['fuzzy', 'clustering', 'scenarios']
                });
            }

            setIsProcessing(false);
            setCurrentStep('');

            // Trigger automatic phase transition
            if (onPhaseComplete) {
                onPhaseComplete();
            }

            setActiveTab('clustering');

        } catch (error) {
            console.error('Փորձագետի վերլուծության սխալ:', error);
            alert('Փորձագետի վերլուծության ժամանակ սխալ առաջացավ: ' + error.message);
            setIsProcessing(false);
            setCurrentStep('');
        }
    };

    /**
     * Փորձագետի վիճակագրական ամփոփում
     */
    const getExpertSummary = () => {
        const datasetSize = currentData?.length || 0;
        const syntheticSize = syntheticData?.length || 0;
        const totalProcessed = datasetSize + syntheticSize;

        return {
            originalDataset: datasetSize,
            syntheticDataset: syntheticSize,
            totalProcessed,
            analysisComplexity: getAnalysisComplexity(datasetSize),
            estimatedTime: getEstimatedProcessingTime(totalProcessed)
        };
    };

    /**
     * Վերլուծության բարդության գնահատում
     */
    const getAnalysisComplexity = (size) => {
        if (size < 100) return 'Պարզ';
        if (size < 1000) return 'Միջին';
        if (size < 10000) return 'Բարդ';
        return 'Շատ բարդ';
    };

    /**
     * Մշակման ժամանակի գնահատում
     */
    const getEstimatedProcessingTime = (size) => {
        const baseTime = Math.ceil(size / 100) * 2;
        return `${baseTime}-${baseTime + 5} վայրկյան`;
    };

    // Show inactive state when not active and not completed
    if (!isActive && !isCompleted) {
        return (
            <PhaseCard
                title="Փորձագիտական փուլ"
                icon="🧠"
                phase="expert"
                className="opacity-60 w-full max-w-none"
            >
                {/* Status Badge */}
                <div className="mb-3 sm:mb-4">
                    <div className="flex items-center space-x-2 text-gray-400 text-sm font-medium">
                        <span className="w-2 h-2 bg-gray-400 rounded-full opacity-50"></span>
                        <span>Սպասում</span>
                    </div>
                </div>

                <Alert type="info" icon="ℹ️" title="Վերլուծությունը մշակվում է...">
                    <div className="text-sm sm:text-base">
                        Վերլուծաբանը պետք է ավարտի տվյալների մշակումը
                    </div>
                    <div className="mt-2 text-xs sm:text-sm">
                        <strong>Փորձագետի մեթոդաբանություն</strong>
                        <ul className="list-disc list-inside mt-1 space-y-1">
                            <li>🔮 Ոչ հստակ տրամաբանության կիրառում</li>
                            <li>🎯 Խելացի կլաստերացում</li>
                            <li>📊 Գծապատկերային վերլուծություն</li>
                            <li>🤖 Կանխատեսման մոդելներ</li>
                            <li>📋 Որոշումների սցենարների գեներացում</li>
                        </ul>
                    </div>
                </Alert>
            </PhaseCard>
        );
    }

    const summary = getExpertSummary();

    return (
        <PhaseCard
            title="Փորձագիտական փուլ"
            icon="🧠"
            phase="expert"
            className={`w-full max-w-none transition-all duration-300 ${isCompleted
                ? 'bg-green-500/10 border-green-500/30'
                : isActive
                    ? 'bg-blue-500/10 border-blue-500/30 shadow-lg'
                    : 'opacity-60'
                }`}
        >
            {/* Status Badge */}
            <div className="mb-3 sm:mb-4">
                {isCompleted && (
                    <div className="flex items-center space-x-2 text-green-400 text-sm font-medium">
                        <span className="w-2 h-2 bg-green-400 rounded-full"></span>
                        <span>Ավարտված</span>
                    </div>
                )}
                {isActive && !isCompleted && (
                    <div className="flex items-center space-x-2 text-green-400 text-sm font-medium">
                        <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                        <span>Ընթացքի մեջ</span>
                    </div>
                )}
            </div>

            <div className={`space-y-3 sm:space-y-4 ${!isActive && !isCompleted ? 'pointer-events-none' : ''}`}>
                {/* Ստացված վերլուծության ինֆորմացիա */}
                <Alert type="success" icon="✅" title="Վերլուծաբանական փուլի տվյալները պատրաստ են">
                    <div className="text-sm sm:text-base">
                        Պատրաստ է փորձագիտական փուլի խորացված վերլուծության համար
                    </div>
                    <div className="mt-2 text-xs sm:text-sm space-y-1">
                        <div className="break-words">
                            <strong>Նախագիծ:</strong>
                            <span className="ml-1">{projectName}</span>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-1 sm:gap-2">
                            <div>
                                <strong>Տվյալների ծավալ:</strong> {summary.totalProcessed} տող
                            </div>
                            <div>
                                <strong>Բարդություն:</strong> {summary.analysisComplexity}
                            </div>
                        </div>
                    </div>
                </Alert>

                {/* Processing Status */}
                {/* {isProcessing && currentStep && (
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 sm:p-4">
                        <div className="flex items-start sm:items-center space-x-3">
                            <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin flex-shrink-0 mt-0.5 sm:mt-0"></div>
                            <div className="min-w-0 flex-1">
                                <div className="font-medium text-blue-800 text-sm break-words">{currentStep}</div>
                                <div className="text-blue-600 text-xs">
                                    Որոշում է կայացվում...
                                </div>
                            </div>
                        </div>
                    </div>
                )} */}

                {/* Փորձագետի վերլուծական գործիքակազմ */}
                <div className="bg-purple-50 rounded-lg p-3 sm:p-4">
                    <h4 className="font-bold text-sm text-purple-800 mb-2 sm:mb-3">🧠  Փորձագիտական փուլի գործիքակազմ</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3 text-xs">
                        <div className={`bg-white rounded p-2 sm:p-3 shadow-sm transition-all duration-300 ${isProcessing && currentStep.includes('Ոչ հստակ') ? 'ring-2 ring-blue-400 bg-blue-50' : ''
                            }`}>
                            <div className="font-bold text-purple-700 text-xs sm:text-sm">🔮 Fuzzy Logic</div>
                            <div className="text-purple-600 text-xs break-words">Անորոշության մոդելավորում</div>
                        </div>
                        <div className={`bg-white rounded p-2 sm:p-3 shadow-sm transition-all duration-300 ${isProcessing && currentStep.includes('կլաստերիզացիա') ? 'ring-2 ring-blue-400 bg-blue-50' : ''
                            }`}>
                            <div className="font-bold text-purple-700 text-xs sm:text-sm">🤖 ACAS (Ավտոմատ ընտրություն)</div>
                            <div className="text-purple-600 text-xs break-words">Օպտիմալ կլաստերացում</div>
                        </div>
                        <div className="bg-white rounded p-2 sm:p-3 shadow-sm">
                            <div className="font-bold text-purple-700 text-xs sm:text-sm">📊 Statistical Analysis</div>
                            <div className="text-purple-600 text-xs break-words">Խորացված ստատիստիկա</div>
                        </div>
                        <div className={`bg-white rounded p-2 sm:p-3 shadow-sm transition-all duration-300 ${isProcessing && currentStep.includes('Սցենարների') ? 'ring-2 ring-blue-400 bg-blue-50' : ''
                            }`}>
                            <div className="font-bold text-purple-700 text-xs sm:text-sm">🤖Scenario Planning</div>
                            <div className="text-purple-600 text-xs break-words">Փորձագետի գիտելիքներ</div>
                        </div>
                    </div>
                </div>

                {/* Մշակման կանխատեսում */}
                <div className="bg-indigo-50 rounded-lg p-3 sm:p-4">
                    <h4 className="font-bold text-sm text-indigo-800 mb-2">⏱️ Մշակման կանխատեսում</h4>
                    <div className="text-xs sm:text-sm text-indigo-700 space-y-1">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-1 sm:gap-2">
                            <div>• Բնօրինակ տվյալներ: {summary.originalDataset} տող</div>
                            <div>• Սինթետիկ տվյալներ: {summary.syntheticDataset} տող</div>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-1 sm:gap-2">
                            <div>• Գնահատված ժամանակ: {summary.estimatedTime}</div>
                            <div>• Վերլուծության բարդություն: {summary.analysisComplexity}</div>
                        </div>
                    </div>
                </div>

                {/* Մեթոդաբանական նկարագրություն */}
                <details className="bg-gray-50 rounded-lg p-3 sm:p-4">
                    <summary className="font-bold text-sm text-gray-700 cursor-pointer hover:text-gray-900 select-none">
                        📚 Կիրառվող մեթոդաբանություն
                    </summary>
                    <div className="mt-3 text-xs sm:text-sm text-gray-600 space-y-2">
                        <div>
                            <strong className="block sm:inline">1. Ոչ հստակ տրամաբանություն (Fuzzy Logic):</strong>
                            <span className="block sm:inline sm:ml-1">Մշակում է տվյալների անորոշությունը և վստահության մակարդակները:</span>
                        </div>
                        <div>
                            <strong className="block sm:inline">2. 🤖 ACAS (Ավտոմատ ընտրություն):</strong>
                            <span className="block sm:inline sm:ml-1">Բացահայտում է թաքնված օրինաչափությունները և խմբավորումները:</span>
                        </div>
                    </div>
                </details>

                {/* Փորձագետի վերլուծության մեկնարկ */}
                <div className="pt-3 sm:pt-4 border-t border-gray-200">
                    <Button
                        onClick={startExpertAnalysis}
                        variant="expert"
                        size="md"
                        className={`w-full text-sm sm:text-base py-3 sm:py-4 transition-all duration-300 ${isCompleted
                            ? 'bg-green-500 text-white cursor-default'
                            : ''
                            }`}
                        disabled={
                            isCompleted ||
                            isProcessing ||
                            !currentData ||
                            currentData.length === 0
                        }
                    >
                        {isProcessing ? (
                            <div className="flex items-center justify-center">
                                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                                <span className="hidden sm:inline">
                                    Վերլուծությունն ընթացքի մեջ է...
                                </span>
                                <span className="sm:hidden">Ընթացքի մեջ է...</span>
                            </div>
                        ) : isCompleted ? (
                            <span className="text-center">✅ Փորձագիտական փուլի վերլուծությունը ավարտված է</span>
                        ) : (
                            <span>🧠 Սկսել վերլուծությունը</span>
                        )}
                    </Button>

                    <div className="mt-3 text-xs sm:text-sm text-white">
                        🎯 <strong>Վերլուծության արդյունք:</strong>
                        <ul className="list-disc list-inside mt-1 space-y-1 pl-2 sm:pl-0">
                            <li className="break-words">Տվյալների խմբավորման օպտիմալացում</li>
                            <li className="break-words">Որոշումներ ընդունմանն աջակցող սցենարների գեներացում</li>
                            <li className="break-words">Մենեջերի համար օպտիմալ գործնական առաջարկություններ</li>
                        </ul>
                    </div>
                </div>
            </div>
        </PhaseCard>
    );
}

export default ExpertPhase;