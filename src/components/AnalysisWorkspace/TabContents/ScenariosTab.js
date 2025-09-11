import React, { useEffect, useMemo, useState } from 'react';
import { useData } from '../../../context/DataContext';
import { ChartCard, ScenarioCard } from '../../UI/Card';
import Button, { ButtonGroup } from '../../UI/Button';
import Alert from '../../UI/Alert';
import Map from '../../Map/Map';
import ClusterCharts from '../../Charts/ClusterCharts';
import ClusterScatterChart from '../../Charts/ClusteringScatter';
import Papa from 'papaparse';
import { generateAIScenarios } from '../../../utils/scenarios';
import { useProjectStorage } from '../../../store/ProjectStorageManager';


/**
 * ScenariosTab բաղադրիչ - որոշումային սցենարների գեներացման ինտերֆեյս
 * Ստեղծում է գործնական գործողությունների սցենարներ մենեջերների համար
 */
const ScenariosTab = ({ projectId }) => {
    const {
        currentData,
        fuzzyResults,
        clusterData,
        scenarios,
        setScenarios,
        dataType,
        projectName,
        projectInfo,
        setClusterData,
        rawData,
        clusteringSettings,
        setClusteringSettings,
        syntheticData,
        analysisResults,
        expertData,
        project,
        projectData
    } = useData();


    const { updateProject, getProject } = useProjectStorage();

    const [isGenerating, setIsGenerating] = useState(false);
    const [selectedScenario, setSelectedScenario] = useState(null);
    const [filterPriority, setFilterPriority] = useState('all');

    function updateProjectDataById(projectId, newData) {
        const existingProject = getProject(projectId);
        console.log(existingProject);


        if (!existingProject) {
            console.warn('Проект не найден', projectId);
            return null;
        }

        // Объединяем старые данные и новые
        const updatedProject = updateProject(projectId, {
            ...existingProject, // сохраняем старые поля
            ...newData          // перезаписываем новые поля
        });

        console.log('Проект обновлён:', updatedProject);
        return updatedProject;
    }

    const enhancedClusterData = useMemo(() => {
        if (!clusterData || clusterData.length === 0) {
            return clusterData;
        }

        if (!syntheticData || syntheticData.length === 0) {
            return clusterData;
        }

        const syntheticPerCluster = Math.floor(syntheticData.length / clusterData.length);
        const remainingSynthetic = syntheticData.length % clusterData.length;

        return clusterData?.map((cluster, index) => {
            const syntheticCount = syntheticPerCluster + (index < remainingSynthetic ? 1 : 0);
            const startIndex = index * syntheticPerCluster + Math.min(index, remainingSynthetic);
            const clusterSyntheticData = syntheticData.slice(startIndex, startIndex + syntheticCount);

            return {
                ...cluster,
                syntheticPoints: clusterSyntheticData,
                originalSize: cluster.size,
                size: cluster.size + syntheticCount,
                hasSyntheticData: syntheticCount > 0,
                syntheticCount: syntheticCount,
                quality: Math.min(100, cluster.quality + (syntheticCount > 0 ? 5 : 0))
            };
        });
    }, [clusterData, syntheticData]);

    const parsedData = useMemo(() => {
        if (!rawData) return null;

        try {
            const result = Papa.parse(rawData, {
                header: true,
                skipEmptyLines: true,
                dynamicTyping: true
            });
            return result.data;
        } catch (error) {
            console.error('Սխալ CSV-ի վերլուծության ժամանակ:', error);
            return null;
        }
    }, [rawData]);


    const euclideanDistance = (a, b) => {
        return Math.sqrt(a.reduce((sum, val, i) => sum + Math.pow(val - b[i], 2), 0));
    };
    const normalizeFeatures = (features) => {
        const numFeatures = features[0].length;
        const mins = new Array(numFeatures).fill(Infinity);
        const maxs = new Array(numFeatures).fill(-Infinity);

        features.forEach(feature => {
            feature.forEach((value, i) => {
                mins[i] = Math.min(mins[i], value);
                maxs[i] = Math.max(maxs[i], value);
            });
        });

        return features.map(feature =>
            feature.map((value, i) => {
                const range = maxs[i] - mins[i];
                return range === 0 ? 0 : (value - mins[i]) / range;
            })
        );
    };
    const kMeans = (data, k, maxIterations = 100) => {
        const n = data.length;
        const d = data[0].length;

        let centroids = [];
        for (let i = 0; i < k; i++) {
            centroids.push(data[Math.floor(Math.random() * n)].slice());
        }

        let clusters = new Array(n);
        let changed = true;
        let iterations = 0;

        while (changed && iterations < maxIterations) {
            changed = false;
            iterations++;

            for (let i = 0; i < n; i++) {
                let minDist = Infinity;
                let closestCentroid = 0;

                for (let j = 0; j < k; j++) {
                    const dist = euclideanDistance(data[i], centroids[j]);
                    if (dist < minDist) {
                        minDist = dist;
                        closestCentroid = j;
                    }
                }

                if (clusters[i] !== closestCentroid) {
                    clusters[i] = closestCentroid;
                    changed = true;
                }
            }

            for (let j = 0; j < k; j++) {
                const clusterPoints = data.filter((_, i) => clusters[i] === j);
                if (clusterPoints.length > 0) {
                    for (let dim = 0; dim < d; dim++) {
                        centroids[j][dim] = clusterPoints.reduce((sum, point) => sum + point[dim], 0) / clusterPoints.length;
                    }
                }
            }
        }

        return clusters;
    };


    const performMapClustering = (data, k = 4) => {
        if (!data || data.length === 0) return [];

        const features = data.map(row => {
            const values = [];
            Object.keys(row).forEach(key => {
                if (key !== 'Регион' && typeof row[key] === 'number') {
                    values.push(row[key]);
                }
            });
            return values;
        });

        if (features.length === 0 || features[0].length === 0) return [];

        const normalizedFeatures = normalizeFeatures(features);
        const clusters = kMeans(normalizedFeatures, k);

        return data.map((row, index) => ({
            region: row['Регион'],
            cluster: clusters[index] + 1,
            data: row
        }));
    };

    const regionClusters = useMemo(() => {
        if (!parsedData || parsedData.length === 0) return [];

        const clustered = performMapClustering(parsedData, clusteringSettings.clusterCount);

        const regionNameMapping = {
            'Арагацотн': 'Արագածոտն',
            'Арарат': 'Արարատ',
            'Армавир': 'Արմավիր',
            'Гегаркуник': 'Գեղարքունիք',
            'Лори': 'Լոռի',
            'Котайк': 'Կոտայք',
            'Ширак': 'Շիրակ',
            'Сюник': 'Սյունիք',
            'Вайоц Дзор': 'Վայոց ձոր',
            'Тавуш': 'Տավուշ',
            'Ереван': 'Երևան'
        };

        return clustered.map(item => ({
            Claster: item.cluster,
            Регион: regionNameMapping[item.region] || item.region
        }));
    }, [parsedData, clusteringSettings.clusterCount]);

    /**
     * File download utility function
     */
    const downloadFile = (content, filename, mimeType = 'text/plain') => {
        const blob = new Blob([content], { type: mimeType });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    };

    /**
     * Սցենարների գեներացիայի մեկնարկ
     */


    const startScenarioGeneration = async () => {
        if (!fuzzyResults && !clusterData) {
            alert('Սցենարների գեներացման համար անհրաժեշտ է նախ կատարել անորոշ տրամաբանության և կլաստերիզացիայի վերլուծություն');
            return;
        }

        setIsGenerating(true);

        try {
            // Prepare analysis results for AI
            const numericValues = currentData?.map(item => {
                if (typeof item === 'object') {
                    // Берем первое числовое поле из объекта
                    const value = Object.values(item).find(v => !isNaN(parseFloat(v)));
                    return value ? parseFloat(value) : 0;
                }
                return Number(item) || 0;
            }) || [];

            const statistics = {
                mean: numericValues.length ? numericValues.reduce((sum, v) => sum + v, 0) / numericValues.length : 0,
                stdDev: 0, // если нужно, потом можно посчитать
                min: numericValues.length ? Math.min(...numericValues) : 0,
                max: numericValues.length ? Math.max(...numericValues) : 0
            };
            const analysisResults = {
                fuzzyResults: fuzzyResults,
                statistics
            };

            const generatedScenarios = await generateAIScenarios(
                dataType,
                analysisResults,
                clusterData
            );

            console.log(generatedScenarios, 'generatedScenariosgeneratedScenarios');

            setScenarios(generatedScenarios);
            updateProject(projectId, {
                scenarios: generatedScenarios
            });


        } catch (error) {
            console.error('Սցենարների գեներացիայի սխալ:', error);
            alert('Սցենարների գեներացման ժամանակ սխալ առաջացավ: ' + error.message);
        } finally {
            setIsGenerating(false);
        }
    };
    console.log(scenarios);


    /**
     * Get current user ID - implement based on your auth system
     */
    const getCurrentUserId = () => {
        // Replace this with your actual user ID retrieval logic
        return parseInt(localStorage.getItem('userId')) || 1;
    };

    /**
     * Սցենարների ֆիլտրավորում առաջնահերթության հիման վրա
     */
    const filteredScenarios = scenarios?.filter(scenario => {
        if (filterPriority === 'all') return true;
        return scenario?.risks?.some(risk => risk?.impact === filterPriority);
    }) || [];

    console.log(scenarios, 'բարելավման ծրագիր');


    /**
     * Սցենարի մանրամասների ցուցադրում
     */
    const showScenarioDetails = (scenario) => {
        setSelectedScenario(scenario);
    };

    /**
     * Սցենարի արտահանում
     */
    const exportScenario = (scenario) => {
        const content = generateScenarioReport(scenario);
        const filename = `scenario_${scenario.title.replace(/[^a-zA-Z0-9\u0531-\u0587]/g, '_')}_${new Date().toISOString().split('T')[0]}.txt`;
        downloadFile(content, filename);
        alert(`Սցենարը "${scenario.title}" արտահանվել է`);
    };

    /**
     * Բոլոր սցենարների արտահանում
     */
    const exportAllScenarios = () => {
        if (!scenarios || scenarios.length === 0) {
            alert('Արտահանելու համար սցենարներ չեն գտնվել');
            return;
        }

        const content = generateAllScenariosReport(scenarios, dataType, projectName);
        const filename = `all_scenarios_${projectName?.replace(/[^a-zA-Z0-9\u0531-\u0587]/g, '_') || 'project'}_${new Date().toISOString().split('T')[0]}.txt`;
        downloadFile(content, filename);
        alert(`${scenarios.length} սցենար արտահանվել է`);
    };

    /**
     * Սցենարի իրականացման պլանի արտահանում
     */
    const implementScenario = (scenario) => {
        const implementationPlan = generateImplementationPlan(scenario);
        const filename = `implementation_plan_${scenario.title.replace(/[^a-zA-Z0-9\u0531-\u0587]/g, '_')}_${new Date().toISOString().split('T')[0]}.txt`;
        downloadFile(implementationPlan, filename);
        alert(`Կիրառման պլանը պատրաստ է "${scenario.title}" սցենարի համար`);
    };

    if (!currentData || currentData.length === 0) {
        return (
            <Alert type="warning" title="Տվյալներ չեն գտնվել">
                Սցենարների գեներացման համար անհրաժեշտ է նախ մուտքագրել տվյալները:
            </Alert>
        );
    }
    console.log(regionClusters, 'regionClusters');


    console.log("DataType:", dataType);
    console.log("Analysis Results:", analysisResults);
    console.log("Cluster Data:", clusterData);


    console.log(scenarios, 'jhjjhjhj');


    return (
        <div className="space-y-6">
            {/* Վերնագիր */}
            <div>
                <h3 className="text-2xl font-bold text-white-800 mb-2">
                    📋 Սցենարների գեներացում մենեջերի համար
                </h3>
                {/* <p className="text-gray-600">
                    Որոշումների աջակցության գործնական սցենարների ինտելիգենտ ստեղծում AI-ի միջոցով
                </p> */}
            </div>

            {/* Նախագծի ինֆո և նախապայմաններ */}
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <h4 className="font-bold text-green-800 mb-2">📁 Նախագծի համատեքստ</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                    <div>
                        <span className="text-green-600">Նախագիծ:</span>
                        <span className="font-bold ml-2">{projectName || 'Անանուն'}</span>
                    </div>
                    <div>
                        <span className="text-green-600">Ոլորտ:</span>
                        <span className="font-bold ml-2">{getDataTypeLabel(dataType)}</span>
                    </div>
                    <div>
                        <span className="text-green-600">Վերլուծություն:</span>
                        <span className="font-bold ml-2">{fuzzyResults ? '✅' : '❌'}</span>
                    </div>
                    <div>
                        <span className="text-green-600">Կլաստերներ:</span>
                        <span className="font-bold ml-2">{clusterData?.length || 0}</span>
                    </div>
                </div>
            </div>

            {/* Սցենարների գեներացման կոճակ */}
            {(!scenarios || scenarios.length === 0) && (
                <div className="text-center py-8">
                    <div className="bg-blue-50 rounded-lg p-6 max-w-lg mx-auto">
                        {/* <h4 className="font-bold text-blue-800 mb-3">🤖 AI Սցենարային մոդելավորում</h4> */}
                        {/* <p className="text-sm text-blue-700 mb-4">
                            Արհեստական բանականությունը կվերլուծի ձեր տվյալները և կստեղծի 
                            հարմարեցված գործողությունների սցենարներ:
                        </p> */}

                        {/* Պատրաստության ստուգում */}
                        <div className="space-y-2 mb-4">
                            <ReadinessCheck
                                label="Տվյալների վերլուծություն"
                                ready={currentData && currentData.length > 0}
                            />
                            <ReadinessCheck
                                label="Ոչ հստակ տրամաբանություն"
                                ready={fuzzyResults !== null}
                            />
                            <ReadinessCheck
                                label="Կլաստերացում"
                                ready={clusterData && clusterData.length > 0}
                            />
                        </div>

                        <Button
                            onClick={startScenarioGeneration}
                            variant="success"
                            size="lg"
                            className="px-8"
                            disabled={isGenerating || (!fuzzyResults && !clusterData)}
                            loading={isGenerating}
                        >
                            {isGenerating ? '🔄 գեներացում...' : '🤖 Գեներացնել սցենարներ'}
                        </Button>
                    </div>
                </div>
            )}

            {/* Սցենարների ցուցադրում */}
            {scenarios && scenarios.length > 0 && (
                <>
                    {/* Ֆիլտրավորում և վիճակագրություն */}
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                        <div className="flex items-center space-x-4">
                            <span className="font-medium text-gray-700">Ֆիլտր:</span>
                            <select
                                value={filterPriority}
                                onChange={(e) => setFilterPriority(e.target.value)}
                                className="px-3 py-1 border border-gray-300 rounded-lg text-sm"
                            >
                                <option value="all">Բոլոր սցենարները ({scenarios.length})</option>
                                <option value="high">Բարձր առաջնահերթություն ({scenarios.filter(s => s?.risks[0]?.impact == 'high').length})</option>
                                <option value="medium">Միջին առաջնահերթություն ({scenarios.filter(s => s?.risks[0]?.impact == 'medium').length})</option>
                                <option value="low">Ցածր առաջնահերթություն ({scenarios.filter(s => s?.risks[0]?.impact == 'low').length})</option>
                            </select>
                        </div>

                        <ButtonGroup>
                            <Button
                                onClick={exportAllScenarios}
                                variant="secondary"
                                size="sm"
                            >
                                📄 Արտահանել բոլորը
                            </Button>
                            <Button
                                onClick={startScenarioGeneration}
                                variant="success"
                                size="sm"
                            >
                                🔄 Վերագեներացում
                            </Button>
                        </ButtonGroup>
                    </div>

                    {/* Սցենարների ցուցակ */}
                    <div className="space-y-4">
                        {filteredScenarios.map((scenario, index) => (
                            <div key={scenario.id || index} className="group">
                                <ScenarioCard
                                    id={scenario.id}
                                    title={scenario.title}
                                    description={scenario.description}
                                    priority={scenario.priority}
                                    priorityText={scenario.priorityText}
                                    preconditions={scenario.preconditions}
                                    risks={scenario.risks}
                                    actions={scenario.actions}
                                    expectedOutcomes={scenario.expectedOutcomes}
                                    className="transition-all duration-300 hover:shadow-lg cursor-pointer"
                                    onClick={() => showScenarioDetails(scenario)}
                                />

                                {/* AI ինդիկատոր */}
                                {/* {scenario.metadata?.aiGenerated && (
                                    <div className="mt-2 flex items-center space-x-2 text-xs text-blue-600">
                                        <span>🤖 AI-ով գեներացված</span>
                                        {scenario.confidenceText && <span>• {scenario.confidenceText}</span>}
                                    </div>
                                )} */}

                                {/* Սցենարի գործողությունների կոճակներ */}
                                <div className="mt-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                    <ButtonGroup>
                                        <Button
                                            onClick={() => exportScenario(scenario)}
                                            variant="secondary"
                                            size="sm"
                                        >
                                            📊 Մանրամասն տեղեկագիր
                                        </Button>
                                        <Button
                                            onClick={() => implementScenario(scenario)}
                                            variant="primary"
                                            size="sm"
                                        >
                                            🚀 Կիրառման պլան
                                        </Button>
                                    </ButtonGroup>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Սցենարների ամփոփ վիճակագրություն */}
                    <ChartCard title="Սցենարների վիճակագրություն">
                        <ScenarioStatistics scenarios={scenarios} />
                    </ChartCard>
                </>
            )}

            {/* Սցենարի մանրամասներ (մոդալ) */}
            {selectedScenario && (
                <ScenarioDetailsModal
                    scenario={selectedScenario}
                    onClose={() => setSelectedScenario(null)}
                    onExport={() => exportScenario(selectedScenario)}
                />
            )}

            {/* Սցենարների ավարտի ծանուցում */}
            {scenarios && scenarios.length > 0 && (
                <Alert type="success" title="Սցենարային մոդելավորումը հաջողությամբ ավարտվել է">
                    <div className="space-y-2 text-sm">
                        <p>
                            Գեներացվել է <strong>{scenarios.length} սցենար</strong>, որոնցից
                            <strong> {scenarios.filter(s => s.priority === 'high').length}</strong> բարձր առաջնահերթություն ունեն:
                        </p>
                        <div>
                            <strong>Գլխավոր ուղղություններ:</strong>
                            <ul className="list-disc list-inside mt-1 space-y-1">
                                {getMainDirections(scenarios).map((direction, index) => (
                                    <li key={index}>{direction}</li>
                                ))}
                            </ul>
                        </div>
                        {scenarios.some(s => s.metadata?.aiGenerated) && (
                            <div className="text-blue-600 text-xs flex items-center space-x-1">
                                {/* <span>🤖</span> */}
                                {/* <span>Մի քանի սցենար գեներացվել են արհեստական բանականության միջոցով</span> */}
                            </div>
                        )}
                    </div>
                </Alert>
            )}

            {(regionClusters.length > 0) && enhancedClusterData && enhancedClusterData.length > 0 && (
                <>
                    {/* Քարտեզի ցուցադրում */}
                    {regionClusters.length > 0 && (
                        <ChartCard title="🗺️ Մարզային կլաստերացման քարտեզ">
                            <div className="mb-4 p-4 bg-blue-50 rounded-lg">
                                <p className="text-sm text-blue-700">
                                    <strong>Քարտեզի տեղեկություն:</strong> Քարտեզը ցուցադրում է Հայաստանի մարզերի կլաստերացման արդյունքները։
                                    Յուրաքանչյուր գույնը ներկայացնում է տարբեր կլաստեր։
                                    Կլաստերների քանակ՝ <strong>{clusteringSettings.clusterCount}</strong>
                                </p>
                            </div>
                            <Map clusterCount={clusteringSettings.clusterCount} />
                        </ChartCard>
                    )}

                    <ClusterCharts clusters={enhancedClusterData} />
                    <ClusterScatterChart clusters={enhancedClusterData} />
                </>
            )}
        </div>
    );

    /**
     * Տվյալների տեսակի պիտակ
     */
    function getDataTypeLabel(value) {
        const labels = {
            'demographic': 'Դեմոգրաֆիական',
            'healthcare': 'Առողջապահական',
            'quality_of_life': 'Կյանքի որակ',
            'educational': 'Կրթական'
        };
        return labels[value] || 'Չսահմանված';
    }

    /**
     * Սցենարի տեղեկագիր
     */
    // Для одного сценария
    function generateScenarioReport(scenario) {
        const preconditions = (scenario.preconditions || [])
            .map((p, i) => `${i + 1}. ${p}`)
            .join("\n");

        const risks = (scenario.risks || [])
            .map(
                (r, i) => `
${i + 1}. ${r.title}
   - Ազդեցություն (Impact): ${r.impact}
   - Հավանականություն (Probability): ${r.probability}
   ${r.response ? `- Պատասխան (Response): ${r.response}` : ""}
   Քայլեր նվազեցման համար:
   ${(r.mitigationSteps || []).map((s) => `   • ${s}`).join("\n")}`
            )
            .join("\n");

        const actions = (scenario.actions || [])
            .map(
                (a, i) => `
${i + 1}. Քայլ: ${a.step}
   - Պատասխանատու: ${a.responsible}
   - Ժամկետ: ${a.deadline}
   - Հիմնավորում: ${a.justification}`
            )
            .join("\n");

        const outcomes = (scenario.expectedOutcomes || [])
            .map((o, i) => `${i + 1}. ${o}`)
            .join("\n");

        return `
ՍՑԵՆԱՐ
-------------------
Անուն: ${scenario.title || "—"}
Նկարագրություն: ${scenario.description || "—"}

ԿԱՆԽԱԴՐՈՒՅԹՆԵՐ
====================
${preconditions || "—"}

ՌԻՍԿԵՐ
=======
${risks || "—"}

ԳՈՐԾՈՂՈՒԹՅՈՒՆՆԵՐ
====================
${actions || "—"}

ՍՊԱՍՎՈՂ ԱՐԴՅՈՒՆՔՆԵՐ
====================
${outcomes || "—"}

ԱՌԱՋՆԱՀԵՐԹՈՒԹՅՈՒՆ
====================
${scenario.priorityText || scenario.priority || "—"}
`;
    };




    /**
     * Բոլոր սցենարների տեղեկագիր
     */
    function generateAllScenariosReport(scenarios, dataType, projectName) {
        return `
Նախագիծ: ${projectName || "—"}
Տվյալների տեսակ: ${dataType || "—"}

Ընդհանուր սցենարների քանակը: ${scenarios.length}
Բարձր առաջնահերթություն: ${scenarios.filter((s) => s.priority === "high").length}
Միջին առաջնահերթություն: ${scenarios.filter((s) => s.priority === "medium").length}
Ցածր առաջնահերթություն: ${scenarios.filter((s) => s.priority === "low").length}

====================================
ՍՑԵՆԱՐՆԵՐ
====================================

${scenarios
                .map(
                    (s, idx) => `
Սցենար ${idx + 1}: ${s.title || "—"}
Նկարագրություն: ${s.description || "—"}

Գործողություններ:
${(s.actions || [])
                            .map(
                                (a, i) =>
                                    `${i + 1}. ${a.step} (Պատասխանատու: ${a.responsible}, Ժամկետ: ${a.deadline})`
                            )
                            .join("\n") || "—"}

Ռիսկեր:
${(s.risks || [])
                            .map(
                                (r, i) =>
                                    `${i + 1}. ${r.title} (Ազդեցություն: ${r.impact}, Հավանականություն: ${r.probability})`
                            )
                            .join("\n") || "—"}
`
                )
                .join("\n")}
`;
    };


    /**
     * Կիրառման պլանի գեներացում
     */
    function generateImplementationPlan(scenario) {
        const actions = (scenario.actions || [])
            .map(
                (a, i) => `
${i + 1}. Քայլ: ${a.step}
   - Պատասխանատու: ${a.responsible}
   - Ժամկետ: ${a.deadline}
   - Հիմնավորում: ${a.justification}`
            )
            .join("\n");

        const risks = (scenario.risks || [])
            .map(
                (r, i) => `
${i + 1}. Ռիսկ: ${r.title}
   - Ազդեցություն: ${r.impact}
   - Հավանականություն: ${r.probability}
   ${(r.mitigationSteps || []).map((s) => `   • ${s}`).join("\n")}`
            )
            .join("\n");

        return `
Կիրառման պլան սցենարի համար: ${scenario.title || "—"}
======================================================

Քայլեր:
${actions || "—"}

Ռիսկեր և նվազեցման քայլեր:
${risks || "—"}

Սպասվող արդյունքներ:
${(scenario.expectedOutcomes || [])
                .map((o, i) => `${i + 1}. ${o}`)
                .join("\n") || "—"}

Պատասխանատու կողմեր:
${(scenario.actions || [])
                .map((a, i) => `${i + 1}. ${a.responsible}`)
                .join("\n") || "—"}

Ժամկետներ:
${(scenario.actions || [])
                .map((a, i) => `${i + 1}. ${a.deadline}`)
                .join("\n") || "—"}

Բյուջե:
${scenario.budget || "—"}
`;
    };

    /**
     * Գլխավոր ուղղությունների ստացում
     */
    function getMainDirections(scenarios) {
        const directions = scenarios.slice(0, 3).map(s => s.title);
        return directions;
    }
};

/**
 * Պատրաստության ստուգման բաղադրիչ
 */
const ReadinessCheck = ({ label, ready }) => {
    return (
        <div className="flex items-center justify-between text-sm">
            <span className="text-blue-700">{label}:</span>
            <span className={`font-bold ${ready ? 'text-green-600' : 'text-red-600'}`}>
                {ready ? '✅ Պատրաստ' : '❌ Բացակայում է'}
            </span>
        </div>
    );
};

/**
 * Սցենարների վիճակագրության բաղադրիչ
 */
const ScenarioStatistics = ({ scenarios }) => {
    // Считаем количество рисков по impact
    const impactCounts = scenarios?.flatMap(scenario => scenario?.risks?.map(risk => risk?.impact) ?? [])
        .reduce((acc, impact) => {
            if (impact) {
                acc[impact] = (acc[impact] ?? 0) + 1;
            }
            return acc;
        }, {});

    const totalActions = scenarios?.reduce((sum, scenario) => sum + (scenario?.actions?.length ?? 0), 0) ?? 0;
    const avgActionsPerScenario = scenarios?.length
        ? (totalActions / scenarios.length).toFixed(1)
        : '0.0';
    const aiGeneratedCount = scenarios?.filter(s => s?.metadata?.aiGenerated)?.length ?? 0;

    return (
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div className="text-center p-4 bg-red-50 rounded-lg">
                <div className="text-2xl font-bold text-red-600">{impactCounts?.high ?? 0}</div>
                <div className="text-sm text-red-700">Բարձր ազդեցություն</div>
            </div>

            <div className="text-center p-4 bg-yellow-50 rounded-lg">
                <div className="text-2xl font-bold text-yellow-600">{impactCounts?.medium ?? 0}</div>
                <div className="text-sm text-yellow-700">Միջին ազդեցություն</div>
            </div>

            <div className="text-center p-4 bg-green-50 rounded-lg">
                <div className="text-2xl font-bold text-green-600">{impactCounts?.low ?? 0}</div>
                <div className="text-sm text-green-700">Ցածր ազդեցություն</div>
            </div>

            <div className="text-center p-4 bg-blue-50 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">{avgActionsPerScenario}</div>
                <div className="text-sm text-blue-700">Միջին գործողություններ</div>
            </div>

            <div className="text-center p-4 bg-purple-50 rounded-lg">
                <div className="text-2xl font-bold text-purple-600">{aiGeneratedCount}</div>
                <div className="text-sm text-purple-700">գեներացված</div>
            </div>
        </div>
    );
};


// Маппер: backend → frontend
const mapBackendScenarioToFrontend = (scenario) => {
    return {
        name: scenario["անուն"],
        description: scenario["նկարագրություն"],
        assumptions: scenario["կանխադրույթներ"] || [],
        risks: scenario["ռիսկեր"]?.map(r => ({
            title: r["վերնագիր"],
            impact: r["ազդեցություն"],
            probability: r["հավանականություն"],
            response: r["մշակում"],
            mitigationSteps: r["մեղմացման_քայլեր"] || []
        })) || [],
        actions: scenario["առաջարկվող_գործողություններ"]?.map(a => ({
            step: a["քայլ"],
            responsible: a["պատասխանատու"],
            deadline: a["ժամկետ"],
            justification: a["փաստարկ"]
        })) || [],
        expectedResults: scenario["սպասվող_չափելի_արդյունքներ"] || []
    };
};



/**
 * Սցենարի մանրամասների մոդալ
 */
const ScenarioDetailsModal = ({ scenario, onClose, onExport }) => {
    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                {/* Վերնագիր */}
                <div className="flex justify-between items-start mb-4">
                    <div>
                        <h3 className="text-xl font-bold text-white-800">{scenario.title}</h3>

                    </div>
                    <button
                        onClick={onClose}
                        className="text-gray-500 hover:text-gray-700 text-2xl"
                    >
                        ×
                    </button>
                </div>

                {/* Առաջնահերթություն */}
                <div className={`inline-block px-3 py-1 rounded-full text-xs font-bold mb-4 ${scenario.priority === 'high' ? 'bg-red-200 text-red-800' :
                    scenario.priority === 'medium' ? 'bg-yellow-200 text-yellow-800' :
                        'bg-green-200 text-green-800'
                    }`}>
                    {scenario.priorityText}
                </div>

                {/* Վստահություն և իրականացվելիություն */}
                {(scenario.confidenceText || scenario.feasibilityText) && (
                    <div className="mb-4 flex space-x-4 text-sm">
                        {scenario.confidenceText && (
                            <span className="text-blue-600">📊 {scenario.confidenceText}</span>
                        )}
                        {scenario.feasibilityText && (
                            <span className="text-green-600">⚡ {scenario.feasibilityText}</span>
                        )}
                    </div>
                )}

                {/* Նկարագրություն */}
                <div className="mb-6">
                    <h4 className="font-bold text-gray-700 mb-2">📋 Նկարագրություն</h4>
                    <p className="text-gray-600 leading-relaxed">{scenario.description}</p>
                </div>

                {/* Գործողություններ */}
                <div className="mb-6">
                    <h4 className="font-bold text-gray-700 mb-2">🎯 Առաջարկվող գործողություններ</h4>
                    <ol className="list-decimal list-inside space-y-2">
                        {scenario.actions.map((action, index) => (
                            <li key={index} className="text-gray-600">{action}</li>
                        ))}
                    </ol>
                </div>

                {/* Չափանիշներ */}
                {scenario.indicators && scenario.indicators.length > 0 && (
                    <div className="mb-6">
                        <h4 className="font-bold text-gray-700 mb-2">📈 Չափանիշներ</h4>
                        <ul className="list-disc list-inside space-y-1">
                            {scenario.indicators.map((indicator, index) => (
                                <li key={index} className="text-gray-600">{indicator}</li>
                            ))}
                        </ul>
                    </div>
                )}

                {/* Ռիսկեր */}
                {scenario.risks && scenario.risks.length > 0 && (
                    <div className="mb-6">
                        <h4 className="font-bold text-gray-700 mb-2">⚠️ Ռիսկեր</h4>
                        <ul className="list-disc list-inside space-y-1">
                            {scenario.risks.map((risk, index) => (
                                <li key={index} className="text-gray-600">{risk}</li>
                            ))}
                        </ul>
                    </div>
                )}

                {/* Բյուջետ */}
                {scenario.estimatedBudget && (
                    <div className="mb-6">
                        <h4 className="font-bold text-gray-700 mb-2">💰 Գնահատվող բյուջետ</h4>
                        <p className="text-gray-600">{scenario.estimatedBudget}</p>
                    </div>
                )}

                {/* Ակնկալվող արդյունքներ */}
                {scenario.expectedOutcomes && scenario.expectedOutcomes.length > 0 && (
                    <div className="mb-6">
                        <h4 className="font-bold text-gray-700 mb-2">🎯 Ակնկալվող արդյունքներ</h4>
                        <ul className="list-disc list-inside space-y-1">
                            {scenario.expectedOutcomes.map((outcome, index) => (
                                <li key={index} className="text-gray-600">{outcome}</li>
                            ))}
                        </ul>
                    </div>
                )}

                {/* Մետադատարներ */}
                {scenario.metadata && (
                    <div className="mb-6 bg-gray-50 rounded-lg p-4">
                        <h4 className="font-bold text-gray-700 mb-2">🔍 Լրացուցիչ տեղեկություններ</h4>
                        <div className="text-sm text-gray-600 space-y-1">
                            <div>Գեներացման ամսաթիվ: {new Date(scenario.metadata.generatedAt).toLocaleDateString('hy-AM')}</div>
                            <div>Տվյալների տեսակ: {scenario.metadata.dataType}</div>
                            {scenario.metadata.aiGenerated && <div>գեներացված: Այո</div>}
                        </div>
                    </div>
                )}

                {/* Գործողությունների կոճակներ */}
                <div className="flex gap-3">
                    <Button
                        onClick={onExport}
                        variant="success"
                        size="md"
                        className="flex-1"
                    >
                        📊 Արտահանել տեղեկագիր
                    </Button>
                    <Button
                        onClick={onClose}
                        variant="secondary"
                        size="md"
                    >
                        Փակել
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default ScenariosTab;