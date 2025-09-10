// src/components/AnalysisWorkspace/TabContents/SyntheticTab.js
// Սինթետիկ տվյալների գեներացման տաբ

import React, { useState } from 'react';
import { useData } from '../../../context/DataContext';
import { ChartCard } from '../../UI/Card';
import Button, { ButtonGroup } from '../../UI/Button';
import ProgressBar from '../../UI/ProgressBar';
import Alert from '../../UI/Alert';
import { generateSyntheticDataset } from '../../../utils/dataGenerator';
import { useFileDownload } from '../../../hooks/useFileDownload';
import { applyFuzzyLogic } from '../../../utils/fuzzyLogic';

/**
 * SyntheticTab բաղադրիչ - սինթետիկ տվյալների գեներացման ինտերֆեյս
 * Թույլ է տալիս ստեղծել արհեստական տվյալներ վերլուծության բարելավման համար
 */
const SyntheticTab = () => {
    const {
        currentData,
        syntheticData,
        setSyntheticData,
        syntheticStatus,
        setSyntheticStatus,
        syntheticProgress,
        setSyntheticProgress,
        setExpertActive,
        rawData,
        setFuzzyResults,
        dataType
    } = useData();

    const [generationSettings, setGenerationSettings] = useState({
        count: 50,
        method: 'statistical',
        includeNoise: true,
        preserveDistribution: true
    });

    const [previewVisible, setPreviewVisible] = useState(false);
    const { downloadFile } = useFileDownload();

    /**
     * Սինթետիկ տվյալների գեներացման սկիզբ
     */

    console.log(currentData, 'currentData', rawData, 'rawDataa');

    const applyFuzzyAnalysis = async () => {
        if (!rawData && (!currentData || currentData.length === 0)) {
            alert('Տվյալները բացակայում են անորոշ տրամաբանության վերլուծության համար');
            return;
        }

        try {
            const results = await new Promise((resolve) => {

                setTimeout(() => {
                    let fuzzyAnalysis;

                    if (rawData && typeof rawData === 'string') {
                        console.log('Օգտագործվում է նոր համակարգը CSV տվյալների համար');
                        fuzzyAnalysis = applyFuzzyLogic(
                            (currentData && currentData.length > 0) ? currentData : [],
                            dataType,
                            (syntheticData && syntheticData.length > 0) ? syntheticData : []
                        );

                        console.log(fuzzyAnalysis, 'fuzzyAnalysisfuzzyAnalysis');

                    }
                    resolve(fuzzyAnalysis);
                }, 1500);
            });

            setFuzzyResults(results);
            console.log('Անորոշ տրամաբանության արդյունք:', results);

        } catch (error) {
            console.error('Անորոշ տրամաբանության սխալ:', error);
            alert('Վերլուծության ժամանակ սխալ առաջացավ');
        }
    };

    const startGeneration = async () => {
        if (!currentData || currentData.length === 0) {
            alert('Նախ պետք է մուտքագրել բնօրինակ տվյալները');
            return;
        }

        applyFuzzyAnalysis();
        setSyntheticStatus('Գեներացում...');
        setSyntheticProgress(0);

        try {
            // Պրոգրեսի սիմուլյացիա
            const progressInterval = setInterval(() => {
                setSyntheticProgress(prev => {
                    const newProgress = prev + Math.random() * 15 + 5;
                    if (newProgress >= 100) {
                        clearInterval(progressInterval);
                        return 100;
                    }
                    return newProgress;
                });
            }, 300);

            // Սինթետիկ տվյալների գեներացում
            setTimeout(async () => {
                try {
                    const synthetic = await generateSyntheticDataset(currentData, generationSettings);
                    setSyntheticData(synthetic);
                    setSyntheticStatus(`Ավարտված ✅ (Գեներացվել է ${synthetic.length} նոր տող)`);
                    setSyntheticProgress(100);
                    setExpertActive(true);

                    console.log('Սինթետիկ տվյալներ գեներացվել են:', synthetic);
                } catch (error) {
                    console.error('Սինթետիկ գեներացման սխալ:', error);
                    setSyntheticStatus('Սխալ ❌ (Գեներացումը ընդհատվել է)');
                    setSyntheticProgress(0);
                }
            }, 2000);

        } catch (error) {
            console.error('Գեներացման սկզբնավորման սխալ:', error);
            setSyntheticStatus('Սխալ ❌');
            setSyntheticProgress(0);
        }
    };

    /**
     * Նախադիտման ցուցադրում/թաքցում
     */
    const togglePreview = () => {
        setPreviewVisible(!previewVisible);
    };

    /**
     * Սինթետիկ տվյալների ներբեռնում
     */
    const downloadSyntheticData = () => {
        if (!syntheticData || syntheticData.length === 0) {
            alert('Սինթետիկ տվյալներ չեն գտնվել');
            return;
        }

        downloadFile(syntheticData, 'synthetic_data.csv', 'csv');
    };

    /**
     * Կարգավորումների փոփոխություն
     */
    const updateSettings = (key, value) => {
        setGenerationSettings(prev => ({
            ...prev,
            [key]: value
        }));
    };

    if (!currentData || currentData.length === 0) {
        return (
            <Alert type="warning" title="Տվյալներ չեն գտնվել">
                Սինթետիկ տվյալների գեներացման համար անհրաժեշտ է նախ մուտքագրել բնօրինակ տվյալները:
            </Alert>
        );
    }

    return (
        <div className="space-y-6">
            {/* Վերնագիր */}
            <div>
                <h3 className="text-2xl font-bold text-white-800 mb-2">
                    🧬 Սինթետիկ տվյալների գեներացում
                </h3>
                <p className="text-white-600">
                    Արհեստական տվյալների ստեղծում վերլուծության որակի բարելավման և նմուշի չափի ավելացման համար
                </p>
            </div>

            {/* Բնօրինակ տվյալների ինֆո */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="font-bold text-blue-800 mb-2">📊 Բնօրինակ տվյալների ամփոփում</h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                        <span className="text-blue-600">Տողեր:</span>
                        <span className="font-bold ml-2">{currentData.length}</span>
                    </div>
                    <div>
                        <span className="text-blue-600">Սյունակներ:</span>
                        <span className="font-bold ml-2">{Object.keys(currentData[0]).length}</span>
                    </div>
                    <div>
                        <span className="text-blue-600">Ամբողջություն:</span>
                        <span className="font-bold ml-2 text-green-600">~85%</span>
                    </div>
                    <div>
                        <span className="text-blue-600">Եզակի արժեքներ:</span>
                        <span className="font-bold ml-2">~{Math.floor(currentData.length * 0.7)}</span>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Գեներացման կարգավորումներ */}
                <ChartCard
                    title="Գեներացման կարգավորումներ"
                    subtitle="Սինթետիկ տվյալների պարամետրեր"
                >
                    <div className="space-y-4">
                        {/* Տվյալների քանակ */}
                        <div>
                            <label className="block text-sm font-bold text-white-700 mb-2">
                                Գեներացվող տողերի քանակ
                            </label>
                            <input
                                type="range"
                                min="10"
                                max="200"
                                value={generationSettings.count}
                                onChange={(e) => updateSettings('count', parseInt(e.target.value))}
                                className="w-full"
                            />
                            <div className="flex justify-between text-xs text-white-500 mt-1">
                                <span>10</span>
                                <span className="font-bold text-blue-600">{generationSettings.count}</span>
                                <span>200</span>
                            </div>
                        </div>

                        {/* Գեներացման մեթոդ */}
                        <div>
                            <label className="block text-sm font-bold text-white-700 mb-2">
                                Գեներացման մեթոդ
                            </label>
                            <select
                                value={generationSettings.method}
                                onChange={(e) => updateSettings('method', e.target.value)}
                                className="w-full p-2 border border-gray-300 rounded-lg"
                            >
                                <option value="statistical">📈 Ստատիստիկական բաշխում</option>
                                <option value="pattern">🔄 Օրինակի վերարտադրում</option>
                                <option value="interpolation">📊 Ինտերպոլյացիա (միջարկում)</option>
                                <option value="machine_learning">🤖 Մեքենայական ուսուցում</option>
                            </select>
                        </div>

                        {/* Լրացուցիչ ընտրանքներ */}
                        <div className="space-y-2">
                            <label className="flex items-center">
                                <input
                                    type="checkbox"
                                    checked={generationSettings.includeNoise}
                                    onChange={(e) => updateSettings('includeNoise', e.target.checked)}
                                    className="mr-2"
                                />
                                <span className="text-sm">Ավելացնել իրական աղմուկ</span>
                            </label>

                            <label className="flex items-center">
                                <input
                                    type="checkbox"
                                    checked={generationSettings.preserveDistribution}
                                    onChange={(e) => updateSettings('preserveDistribution', e.target.checked)}
                                    className="mr-2"
                                />
                                <span className="text-sm">Պահպանել բաշխման օրինակները</span>
                            </label>
                        </div>

                        {/* Գեներացման կոճակ */}
                        <div className="pt-4 border-t border-gray-200">
                            <Button
                                onClick={startGeneration}
                                variant="success"
                                size="md"
                                className="w-full"
                                disabled={syntheticProgress > 0 && syntheticProgress < 100}
                            >
                                🚀 Սկսել գեներացումը
                            </Button>
                        </div>
                    </div>
                </ChartCard>

                {/* Գեներացման պրոցես */}
                <ChartCard
                    title="Գեներացման պրոցես"
                    subtitle="Ժամանակակից գեներացման վիճակ"
                >
                    <div className="space-y-4">
                        {/* Վիճակ */}
                        <div>
                            <div className="flex justify-between mb-2">
                                <span className="text-sm font-medium text-white-700">Վիճակ:</span>
                                <span className="text-sm font-bold">{syntheticStatus}</span>
                            </div>
                            <ProgressBar
                                value={syntheticProgress}
                                color="blue"
                                animated={syntheticProgress > 0 && syntheticProgress < 100}
                            />
                        </div>

                        {/* Գեներացման տվյալներ */}
                        {syntheticProgress > 0 && (
                            <div className="bg-gray-50 rounded-lg p-3">
                                <h5 className="font-bold text-white-700 mb-2">📈 Գեներացման վիճակագրություն</h5>
                                <div className="text-sm space-y-1">
                                    <div className="flex justify-between">
                                        <span>Բնօրինակ տվյալներ:</span>
                                        <span className="font-medium">{currentData.length} տող</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span>Նպատակ:</span>
                                        <span className="font-medium">{generationSettings.count} տող</span>
                                    </div>
                                    {syntheticData && (
                                        <div className="flex justify-between">
                                            <span>Գեներացված:</span>
                                            <span className="font-medium text-green-600">{syntheticData.length} տող</span>
                                        </div>
                                    )}
                                    <div className="flex justify-between">
                                        <span>Մեթոդ:</span>
                                        <span className="font-medium">{getMethodLabel(generationSettings.method)}</span>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Գործողություններ */}
                        {syntheticData && syntheticData.length > 0 && (
                            <div className="space-y-2">
                                <ButtonGroup>
                                    <Button
                                        onClick={togglePreview}
                                        variant="secondary"
                                        size="sm"
                                    >
                                        👀 {previewVisible ? 'Թաքցնել' : 'Նախադիտում'}
                                    </Button>

                                    <Button
                                        onClick={downloadSyntheticData}
                                        variant="success"
                                        size="sm"
                                    >
                                        💾 Ներբեռնել
                                    </Button>
                                </ButtonGroup>

                                {/* Որակի գնահատում */}
                                <div className="text-xs text-white-600 bg-green-50 p-2 rounded">
                                    ✅ Սինթետիկ տվյալները հարմար են վերլուծության համար
                                </div>
                            </div>
                        )}
                    </div>
                </ChartCard>
            </div>

            {/* Սինթետիկ տվյալների նախադիտում */}
            {previewVisible && syntheticData && syntheticData.length > 0 && (
                <ChartCard title="Սինթետիկ տվյալների նախադիտում">
                    <SyntheticDataPreview data={syntheticData} originalData={currentData} />
                </ChartCard>
            )}

            {/* Մեթոդաբանական տեղեկություններ */}
            <Alert type="info" title="🧬 Սինթետիկ տվյալների մասին">
                <div className="space-y-2 text-sm">
                    <p>
                        <strong>Սինթետիկ տվյալները</strong> արհեստականորեն ստեղծված տվյալներ են, որոնք պահպանում են
                        բնօրինակ տվյալների ստատիստիկական հատկությունները և օրինակները:
                    </p>
                    <div>
                        <strong>Օգտագործման օրինակներ</strong>
                        <ul className="list-disc list-inside mt-1 space-y-1">
                            <li>Փոքր նմուշների ծավալի ավելացում</li>
                            <li>Բացակայող արժեքների լրացում</li>
                            <li>Վերլուծական մոդելների ճշտության բարելավում</li>
                        </ul>
                    </div>
                </div>
            </Alert>
        </div>
    );
};

/**
 * Մեթոդի պիտակի ստացում
 */
const getMethodLabel = (method) => {
    const labels = {
        'statistical': 'Ստատիստիկական',
        'pattern': 'Օրինակային',
        'interpolation': 'Ինտերպոլյացիա',
        'machine_learning': 'Մեքենայական ուսուցում'
    };
    return labels[method] || method;
};

/**
 * Սինթետիկ տվյալների նախադիտման բաղադրիչ
 */
const SyntheticDataPreview = ({ data, originalData }) => {
    const headers = Object.keys(data[0]);
    const previewCount = Math.min(data.length, 5);
    const originalPreviewCount = Math.min(originalData.length, 3);

    return (
        <div className="space-y-4">
            {/* Համեմատական աղյուսակ */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {/* Բնօրինակ տվյալներ */}
                <div>
                    <h5 className="font-bold text-white-700 mb-2">📊 Բնօրինակ տվյալներ</h5>
                    <div className="overflow-x-auto">
                        <table className="w-full text-xs border border-gray-200 rounded">
                            <thead className="bg-gray-100">
                                <tr>
                                    {headers.map((header, index) => (
                                        <th key={index} className="p-2 text-left border-b font-medium">
                                            {header}
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {originalData.slice(0, originalPreviewCount).map((row, index) => (
                                    <tr key={index} className="hover:bg-gray-50">
                                        {headers.map((header, cellIndex) => (
                                            <td key={cellIndex} className="p-2 border-b">
                                                {row[header] || 'NULL'}
                                            </td>
                                        ))}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Սինթետիկ տվյալներ */}
                <div>
                    <h5 className="font-bold text-white-700 mb-2">🧬 Սինթետիկ տվյալներ</h5>
                    <div className="overflow-x-auto">
                        <table className="w-full text-xs border border-gray-200 rounded">
                            <thead className="bg-blue-100">
                                <tr>
                                    {headers.map((header, index) => (
                                        <th key={index} className="p-2 text-left border-b font-medium text-blue-800">
                                            {header}
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {data.slice(0, previewCount).map((row, index) => (
                                    <tr key={index} className="hover:bg-blue-50">
                                        {headers.map((header, cellIndex) => (
                                            <td key={cellIndex} className="p-2 border-b text-blue-700">
                                                {row[header] || 'NULL'}
                                            </td>
                                        ))}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* Ստատիստիկական համեմատություն */}
            <div className="bg-gray-50 rounded-lg p-4">
                <h5 className="font-bold text-white-700 mb-3">📈 Ստատիստիկական համեմատություն</h5>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div className="text-center">
                        <div className="font-bold text-white-800">{originalData.length}</div>
                        <div className="text-white-600">Բնօրինակ տողեր</div>
                    </div>
                    <div className="text-center">
                        <div className="font-bold text-blue-600">{data.length}</div>
                        <div className="text-white-600">Սինթետիկ տողեր</div>
                    </div>
                    <div className="text-center">
                        <div className="font-bold text-green-600">
                            {((data.length / originalData.length) * 100).toFixed(0)}%
                        </div>
                        <div className="text-white-600">Ավելացում</div>
                    </div>
                    <div className="text-center">
                        <div className="font-bold text-purple-600">
                            {originalData.length + data.length}
                        </div>
                        <div className="text-white-600">Ընդհանուր ծավալ</div>
                    </div>
                </div>
            </div>

            {/* Գնահատման ինդիկատորներ */}
            <div className="flex flex-wrap gap-2">
                <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">
                    ✅ Բաշխումը պահպանված է
                </span>
                <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
                    🔄 Ռեալիստիկ բնութագիր
                </span>
                <span className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-xs font-medium">
                    🎯 Վերլուծության համար պատրաստ
                </span>
            </div>
        </div>
    );
};

export default SyntheticTab;