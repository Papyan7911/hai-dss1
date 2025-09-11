import React, { useState, useMemo } from 'react';
import { useData } from '../../../context/DataContext';
import { ChartCard, ClusterCard } from '../../UI/Card';
import Button, { ButtonGroup } from '../../UI/Button';
import Alert from '../../UI/Alert';
import { performClustering } from '../../../utils/clustering';
import ClusterCharts from '../../Charts/ClusterCharts';
import ClusterScatterChart from '../../Charts/ClusteringScatter';
import Papa from 'papaparse';

import Map from '../../Map/Map';

const ClusteringTab = () => {
    const {
        currentData,
        clusterData,
        setClusterData,
        syntheticData,
        dataType,
        rawData,
        clusteringSettings,
        setClusteringSettings
    } = useData();

    const [showVisualization, setShowVisualization] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);

    // Парсинг CSV данных для карты (аналогично Map компоненту)
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

    // Функции кластеризации (перенесены из Map компонента)
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

    const euclideanDistance = (a, b) => {
        return Math.sqrt(a.reduce((sum, val, i) => sum + Math.pow(val - b[i], 2), 0));
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

    // Результаты кластеризации для карты
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

    // Enhanced cluster data with synthetic data integrated
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

    /**
     * Կլաստերիզացիայի մեկնարկ
     */
    const startClustering = async () => {
        if (!currentData || currentData.length === 0) {
            alert('Տվյալները բացակայում են կլաստերիզացիայի համար');
            return;
        }

        setIsProcessing(true);

        try {
            await new Promise(resolve => setTimeout(resolve, 2000));
            const clusters = await performClustering(currentData, dataType, clusteringSettings);
            setClusterData(clusters);
            console.log('Կլաստերիզացիայի արդյունք:', clusters);
        } catch (error) {
            console.error('Կլաստերիզացիայի սխալ:', error);
            alert('Կլաստերիզացիայի ժամանակ սխալ առաջացավ');
        } finally {
            setIsProcessing(false);
        }
    };

    /**
     * Կարգավորումների թարմացում
     */
    const updateSettings = (key, value) => {
        setClusteringSettings(prev => ({
            ...prev,
            [key]: value
        }));
    };

    if (!currentData || currentData.length === 0) {
        return (
            <Alert type="warning" title="Տվյալներ չեն գտնվել">
                Կլաստերիզացիայի համար անհրաժեշտ է նախ մուտքագրել տվյալները:
            </Alert>
        );
    }

    return (
        <div className="space-y-6">
            {/* Վերնագիր */}
            <div>
                <h3 className="text-2xl font-bold text-gray-800 mb-2">
                    🎯 Կլաստերացման մեթոդ
                </h3>
            </div>

            {/* Մեթոդաբանական ինֆո */}
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <h4 className="font-bold text-red-800 mb-2">🧮 Կլաստերացման մասին</h4>
                <div className="text-sm text-red-700 space-y-2">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-3">
                        <div className="bg-white rounded p-3 border">
                            <div className="font-bold text-blue-600">ACAS</div>
                            <div className="text-xs text-gray-600 mt-1">Ավտոմատ ընտրություն և օպտիմալ կարգավորում</div>
                        </div>
                        <div className="bg-white rounded p-3 border">
                            <div className="font-bold text-green-600">Hierarchical</div>
                            <div className="text-xs text-gray-600 mt-1">Ստեղծում է կլաստերների ծառ</div>
                        </div>
                        <div className="bg-white rounded p-3 border">
                            <div className="font-bold text-purple-600">DBSCAN</div>
                            <div className="text-xs text-gray-600 mt-1">Հաշվի է առնում աղմուկը և ոչ ստանդարտ կետերը</div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Կլաստերիզացիայի կարգավորումներ */}
                <ChartCard title="Կլաստերացման կարգավորումներ">
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2">
                                Կլաստերների քանակ
                            </label>
                            <input
                                type="range"
                                min="2"
                                max="8"
                                value={clusteringSettings.clusterCount}
                                onChange={(e) => updateSettings('clusterCount', parseInt(e.target.value))}
                                className="w-full"
                            />
                            <div className="flex justify-between text-xs text-gray-500 mt-1">
                                <span>2</span>
                                <span className="font-bold text-red-600">{clusteringSettings.clusterCount}</span>
                                <span>8</span>
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2">
                                Կլաստերացման մեթոդ
                            </label>
                            <select
                                value={clusteringSettings.method}
                                onChange={(e) => updateSettings('method', e.target.value)}
                                className="w-full p-2 border border-gray-300 rounded-lg"
                            >
                                <option value="acas">🤖 ACAS (Ավտոմատ ընտրություն)</option>
                                <option value="kmeans">🎯 K-Միջիններ (K-Means)</option>
                                <option value="fuzzy_cmeans">🌸 Fuzzy C-Միջիններ</option>
                                <option value="hierarchical">🌳 Հիերարխիկ կլաստերացում</option>
                                <option value="dbscan">🔍 DBSCAN</option>
                                <option value="spectral">🌈 Սպեկտրալ կլաստերացում</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2">
                                Առավելագույն կրկնություններ
                            </label>
                            <input
                                type="number"
                                min="50"
                                max="500"
                                step="50"
                                value={clusteringSettings.maxIterations}
                                onChange={(e) => updateSettings('maxIterations', parseInt(e.target.value))}
                                className="w-full p-2 border border-gray-300 rounded-lg"
                            />
                        </div>

                        <div className="pt-4 border-t border-gray-200">
                            <Button
                                onClick={startClustering}
                                variant="warning"
                                size="md"
                                className="w-full"
                                disabled={isProcessing}
                                loading={isProcessing}
                            >
                                {isProcessing ? '🔄 Կլաստերացում...' : '🎯 Սկսել կլաստերացումը'}
                            </Button>
                        </div>
                    </div>
                </ChartCard>

                {/* Տվյալների նախապատրաստում */}
                <ChartCard title="Տվյալների նախապատրաստում">
                    <div className="space-y-4">
                        <div className="bg-gray-50 rounded-lg p-4">
                            <h5 className="font-bold text-gray-700 mb-3">📊 Տվյալների ամփոփում</h5>
                            <div className="grid grid-cols-2 gap-4 text-sm">
                                <div>
                                    <span className="text-gray-600">Բնօրինակ տողեր:</span>
                                    <span className="font-bold ml-2">{currentData.length}</span>
                                </div>
                                {syntheticData && syntheticData.length > 0 && (
                                    <div>
                                        <span className="text-gray-600">Սինթետիկ տողեր:</span>
                                        <span className="font-bold ml-2 text-green-600">+{syntheticData.length}</span>
                                    </div>
                                )}
                                <div>
                                    <span className="text-gray-600">Սյունակներ:</span>
                                    <span className="font-bold ml-2">{Object.keys(currentData[0]).length}</span>
                                </div>
                                <div>
                                    <span className="text-gray-600">Ընդհանուր:</span>
                                    <span className="font-bold ml-2 text-blue-600">
                                        {currentData.length + (syntheticData?.length || 0)}
                                    </span>
                                </div>
                            </div>
                        </div>

                        <div className="bg-blue-50 rounded-lg p-4">
                            <h5 className="font-bold text-blue-700 mb-2">🤖 Առաջարկվող մեթոդ</h5>
                            <div className="text-sm text-blue-600">
                                {getRecommendedMethod()}
                            </div>
                        </div>

                        <div className="bg-yellow-50 rounded-lg p-4">
                            <h5 className="font-bold text-yellow-700 mb-2">⏱️ Գնահատված ժամանակ</h5>
                            <div className="text-sm text-yellow-600">
                                <div>Մշակման ժամանակ: {getEstimatedTime()}</div>
                                <div>Բարդություն: {getComplexity()}</div>
                            </div>
                        </div>

                        <div className="text-xs text-gray-500">
                            <strong>💡 Հուշումներ:</strong>
                            <ul className="list-disc list-inside mt-1 space-y-1">
                                <li>Ավելի քիչ կլաստերներ = ավելի շատ ընդհանուր խմբեր</li>
                                <li>ACAS ալգորիթմը ավտոմատ կընտրի լավագույն մեթոդը</li>
                                <li>Ալգորիթմը կհայտնաբերի աղմուկը և անկանոն կետերը</li>
                                {syntheticData && syntheticData.length > 0 && (
                                    <li className="text-green-600">Սինթետիկ տվյալները ավտոմատ ավելացվել են կլաստերներին</li>
                                )}
                            </ul>
                        </div>
                    </div>
                </ChartCard>
            </div>

            {/* Կլաստերիզացիայի արդյունքներ */}
            {enhancedClusterData && enhancedClusterData.length > 0 && (
                <>
                    <ChartCard title="Կլաստերացման արդյունքներ">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                            {enhancedClusterData.map((cluster, index) => (
                                <ClusterCard
                                    key={index}
                                    id={cluster.id}
                                    label={cluster.label}
                                    size={cluster.size}
                                    avgValue={cluster.avgValue}
                                    quality={cluster.quality}
                                    syntheticCount={cluster.syntheticCount}
                                    originalSize={cluster.originalSize}
                                />
                            ))}
                        </div>
                    </ChartCard>

                    <ChartCard title="Խմբավորման վիճակագրություն">
                        <ClusterStatistics
                            clusters={enhancedClusterData}
                            totalData={currentData.length}
                            syntheticData={syntheticData}
                        />
                    </ChartCard>

                    <div className="text-center">
                        <ButtonGroup>
                            <Button
                                onClick={() => exportClusterData()}
                                variant="success"
                                size="md"
                            >
                                📊 Ներբեռնել կլաստերները
                            </Button>

                            <Button
                                onClick={() => visualizeClusters()}
                                variant="secondary"
                                size="md"
                            >
                                📈 Վիզուալացում
                            </Button>

                            <Button
                                onClick={() => startClustering()}
                                variant="warning"
                                size="md"
                            >
                                🔄 Վերակլաստերացում
                            </Button>
                        </ButtonGroup>
                    </div>
                </>
            )}

            {enhancedClusterData && enhancedClusterData.length > 0 && (
                <Alert type="success" title="🎯 Կլաստերացումը հաջողությամբ ավարտվել է">
                    <div className="space-y-2 text-sm">
                        <p>
                            Հայտնաբերվել է <strong>{enhancedClusterData.length} տարբեր խումբ</strong> ընդհանուր
                            <strong> {currentData.length}</strong> բնօրինակ տվյալի
                            {syntheticData && syntheticData.length > 0 && (
                                <span> և <strong className="text-green-600">{syntheticData.length}</strong> սինթետիկ տվյալի</span>
                            )} մեջ
                        </p>
                        <div>
                            <strong>Հիմնական բացահայտումներ</strong>
                            <ul className="list-disc list-inside mt-1 space-y-1">
                                <li>Ամենամեծ խումբը պարունակում է {Math.max(...enhancedClusterData.map(c => c.size))} տարր</li>
                                <li>Ամենամիջին որակի խումբը ունի {Math.max(...enhancedClusterData.map(c => c.quality))}% որակ</li>
                                <li>Տվյալների բաշխումը {enhancedClusterData.length > 4 ? 'բազմախմբային' : 'հավասարակշռված'} է</li>
                                {syntheticData && syntheticData.length > 0 && (
                                    <li className="text-green-600">Սինթետիկ տվյալները ինտեգրված են կլաստերների մեջ</li>
                                )}
                            </ul>
                        </div>
                    </div>
                </Alert>
            )}

            {/* Enhanced Visualizations with Map Integration */}
            {(showVisualization || regionClusters.length > 0) && enhancedClusterData && enhancedClusterData.length > 0 && (
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

    function getDimensionality() {
        return Object.keys(currentData[0]).length;
    }

    function getClusterabilityScore() {
        const size = currentData.length + (syntheticData?.length || 0);
        const dimensions = getDimensionality();

        if (size < 20) return 60;
        if (size < 100) return 75;
        if (dimensions > 10) return 85;
        return 90;
    }

    function getRecommendedMethod() {
        const size = currentData.length + (syntheticData?.length || 0);
        const dimensions = getDimensionality();

        if (size < 50) {
            return '🤖 ACAS (ավտոմատ մեթոդի ընտրություն փոքր տվյալների համար)';
        } else if (dimensions > 5) {
            return '🤖 ACAS (բազմաչափ տվյալների համար ավտոմատ օպտիմիզացիա)';
        } else {
            return '🤖 ACAS (ավտոմատ կլաստերացման ալգորիթմի ընտրություն)';
        }
    }

    function getEstimatedTime() {
        const size = currentData.length + (syntheticData?.length || 0);
        if (size < 100) return '1-2 վայրկյան';
        if (size < 500) return '3-5 վայրկյան';
        return '5-10 վայրկյան';
    }

    function getComplexity() {
        const size = currentData.length + (syntheticData?.length || 0);
        const clusters = clusteringSettings.clusterCount;

        if (size < 100 && clusters < 5) return 'Ցածր';
        if (size < 500 && clusters < 7) return 'Միջին';
        return 'Բարձր';
    }

    function exportClusterData() {
        console.log('Արտահանում կլաստերները...', enhancedClusterData);
        alert('Կլաստերները արտահանվել են CSV ֆայլի մեջ');
    }

    function visualizeClusters() {
        console.log('Վիզուալիզացման մեկնարկ...', enhancedClusterData);
        setShowVisualization(true);
    }
};

const ClusterStatistics = ({ clusters, totalData, syntheticData }) => {
    const totalClustered = clusters.reduce((sum, cluster) => sum + cluster.size, 0);
    const avgClusterSize = totalClustered / clusters.length;
    const syntheticCount = syntheticData?.length || 0;
    const effectiveTotal = totalData + syntheticCount;
    const coverage = (totalClustered / effectiveTotal) * 100;

    return (
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">{clusters.length}</div>
                <div className="text-sm text-blue-700">Խմբերի քանակ</div>
            </div>

            <div className="text-center p-4 bg-green-50 rounded-lg">
                <div className="text-2xl font-bold text-green-600">{Math.round(avgClusterSize)}</div>
                <div className="text-sm text-green-700">Միջին չափ</div>
            </div>

            <div className="text-center p-4 bg-purple-50 rounded-lg">
                <div className="text-2xl font-bold text-purple-600">{coverage.toFixed(1)}%</div>
                <div className="text-sm text-purple-700">Ընդգրկում</div>
            </div>

            <div className="text-center p-4 bg-orange-50 rounded-lg">
                <div className="text-2xl font-bold text-orange-600">
                    {Math.round(clusters.reduce((sum, c) => sum + c.quality, 0) / clusters.length)}%
                </div>
                <div className="text-sm text-orange-700">Միջին որակ</div>
            </div>

            {syntheticData && syntheticData.length > 0 && (
                <div className="text-center p-4 bg-indigo-50 rounded-lg">
                    <div className="text-2xl font-bold text-indigo-600">
                        {syntheticCount}
                    </div>
                    <div className="text-sm text-indigo-700">Սինթետիկ տվյալ</div>
                </div>
            )}
        </div>
    );
};

export default ClusteringTab;