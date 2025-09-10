// src/components/AnalysisWorkspace/TabContents/FuzzyTab.js
// Անորոշ տրամաբանության վերլուծության տաբ - ամբողջական տարբերակ

import React, { useEffect } from 'react';
import { useData } from '../../../context/DataContext';
import { ChartCard, InfoCard } from '../../UI/Card';
import Button from '../../UI/Button';
import ProgressBar, { CircularProgress } from '../../UI/ProgressBar';
import Alert from '../../UI/Alert';
import { applyFuzzyLogic } from '../../../utils/fuzzyLogic';
import { getDataTypeLabel } from '../../../utils/dataHelpers';
import { FuzzyEngine } from '../../../utils/fuzzyEngine';
// import FuzzyLogic from '../../../libs/fuzzy-js/fuzzy';


/**
 * FuzzyTab բաղադրիչ - անորոշ տրամաբանության վերլուծության ինտերֆեյս
 * Ցուցադրում է տվյալների վստահության մակարդակները և անորոշության գնահատումը
 */
const FuzzyTab = () => {
    const {
        currentData,
        fuzzyResults,
        setFuzzyResults,
        dataType,
        rawData,
        syntheticData
    } = useData();

    console.log(fuzzyResults, 'applyFuzzyAnalysis');
    console.log(currentData, 'hhhhhh', rawData);


    /**
     * Անորոշ տրամաբանության կիրառում
     */
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

    useEffect(() => {
        // Check if fuzzyResults is empty
        if (!fuzzyResults || Object.keys(fuzzyResults).length === 0) {
            console.log('fuzzyResults is empty, applying analysis');
            applyFuzzyAnalysis();
        }
    }, [fuzzyResults]); // Run whenever fuzzyResults changes


    if (!currentData || currentData.length === 0) {
        return (
            <Alert type="warning" title="Տվյալներ չեն գտնվել">
                Անորոշ տրամաբանության վերլուծության համար անհրաժեշտ է նախ մուտքագրել տվյալները:
            </Alert>
        );
    }

    return (
        <div className="space-y-6">
            {/* Վերնագիր */}
            <div>
                <h3 className="text-2xl font-bold text-gray-800 mb-2">
                    🔮 Ոչ հստակ տրամաբանության կիրառում
                </h3>
                <p className="text-gray-600">
                    Տվյալների վստահության մակարդակի գնահատում և անորոշության գործոնների վերլուծություն
                </p>
            </div>

            {/* Մեթոդաբանական տեղեկություններ */}
            <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                <h4 className="font-bold text-purple-800 mb-2">🧠 Ոչ հստակ տրամաբանության մասին</h4>
                <div className="text-sm text-purple-700 space-y-2">
                    <p>
                        <strong>Fuzzy Logic</strong>-ը թույլ է տալիս գնահատել տվյալների որակը 0-ից 100 պարամետրերով,
                        որտեղ յուրաքանչյուր տվյալ ունի վստահության աստիճան:
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-3">
                        <div className="bg-white rounded p-3 border">
                            <div className="font-bold text-red-600">Ցածր վստահություն (0-40%)</div>
                            <div className="text-xs text-gray-600 mt-1">Բացակայող կամ անվստահելի տվյալներ</div>
                        </div>
                        <div className="bg-white rounded p-3 border">
                            <div className="font-bold text-yellow-600">Միջին վստահություն (40-70%)</div>
                            <div className="text-xs text-gray-600 mt-1">Մասամբ վստահելի, պահանջում է ստուգում</div>
                        </div>
                        <div className="bg-white rounded p-3 border">
                            <div className="font-bold text-green-600">Բարձր վստահություն (70-100%)</div>
                            <div className="text-xs text-gray-600 mt-1">Վստահելի և ճշգրիտ տվյալներ</div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Վերլուծության կոճակ */}
            {!fuzzyResults && (
                <div className="text-center">
                    <Button
                        onClick={applyFuzzyAnalysis}
                        variant="expert"
                        size="lg"
                        className="px-8"
                    >
                        🔮 Կիրառել ոչ հստակ տրամաբանություն
                    </Button>
                    <p className="text-sm text-gray-500 mt-2">
                        Վերլուծությունը կտևի 1-2 վայրկյան
                    </p>
                </div>
            )}

            {/* Վերլուծության արդյունքներ */}
            {fuzzyResults && (
                <>
                    {/* Վստահության բաշխում */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Շրջանակային գծապատկեր */}
                        {/* Վստահության բաշխում */}
                        <ChartCard
                            title="Վստահության բաշխում"
                            subtitle="Տվյալների վստահության մակարդակների տարանջատում"
                        >
                            <div className="flex justify-center mb-6">
                                <div className="relative">
                                    <CircularProgress
                                        value={fuzzyResults.high}
                                        size={160}
                                        color="green"
                                    >
                                        <div className="text-center">
                                            <div className="text-2xl font-bold text-green-600">
                                                {fuzzyResults.high}%
                                            </div>
                                            <div className="text-sm text-gray-600">
                                                Բարձր վստահություն
                                            </div>
                                        </div>
                                    </CircularProgress>
                                </div>
                            </div>

                            <div className="space-y-3">
                                <ConfidenceBar
                                    label="Ցածր վստահություն"
                                    value={fuzzyResults.low}
                                    color="red"
                                    icon="⚠️"
                                />
                                <ConfidenceBar
                                    label="Միջին վստահություն"
                                    value={fuzzyResults.medium}
                                    color="yellow"
                                    icon="⚡"
                                />
                                <ConfidenceBar
                                    label="Բարձր վստահություն"
                                    value={fuzzyResults.high}
                                    color="green"
                                    icon="✅"
                                />
                            </div>
                        </ChartCard>

                        {/* Վերլուծության ամփոփում */}
                        <ChartCard
                            title="Անորոշության վերլուծություն"
                            subtitle="Փորձագետի գնահատում և առաջարկություններ"
                        >
                            <div className="space-y-4">
                                {/* Հիմնական գնահատում */}
                                <div className="bg-gray-50 rounded-lg p-4">
                                    <h5 className="font-bold text-gray-800 mb-2">📋 Ընդհանուր գնահատում</h5>
                                    <p className="text-sm text-gray-700 leading-relaxed">
                                        {fuzzyResults.analysis}
                                    </p>
                                </div>

                                {/* Հայտնաբերված օրինակները */}
                                {fuzzyResults.patterns && fuzzyResults.patterns.length > 0 && (
                                    <div className="bg-blue-50 rounded-lg p-4">
                                        <h5 className="font-bold text-blue-800 mb-2">🔍 Հայտնաբերված օրինակներ</h5>
                                        <ul className="text-sm text-blue-700 space-y-1">
                                            {fuzzyResults.patterns.map((pattern, index) => (
                                                <li key={index} className="flex items-start">
                                                    <span className="text-blue-500 mr-2">•</span>
                                                    <span>{pattern}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                )}

                                {/* Անորոշության գործոններ */}
                                {fuzzyResults.uncertaintyFactors && fuzzyResults.uncertaintyFactors.length > 0 && (
                                    <div className="bg-orange-50 rounded-lg p-4">
                                        <h5 className="font-bold text-orange-800 mb-2">⚠️ Անորոշության գործոններ</h5>
                                        <ul className="text-sm text-orange-700 space-y-1">
                                            {fuzzyResults.uncertaintyFactors.map((factor, index) => (
                                                <li key={index} className="flex items-start">
                                                    <span className="text-orange-500 mr-2">•</span>
                                                    <span>{factor}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                )}

                                {fuzzyResults.socialDevelopment && (
                                    <div className="bg-green-50 rounded-lg p-4 border-l-4 border-green-400">
                                        <h5 className="font-bold text-green-800 mb-2 flex items-center">
                                            {getDataTypeLabel(dataType)} գնահատում
                                        </h5>
                                        <div className="text-sm text-green-700 space-y-2">
                                            <div className="flex justify-between items-center">
                                                <span>{getDataTypeLabel(dataType)} ինդեքս:</span>
                                                <span className="font-bold text-lg">
                                                    {Math.round(fuzzyResults.socialDevelopment.index)}/100
                                                </span>
                                            </div>
                                            <div className="flex justify-between items-center">
                                                <span>Կարգավիճակ:</span>
                                                <span className="font-bold text-green-600">
                                                    {fuzzyResults.socialDevelopment.interpretation.label}
                                                </span>
                                            </div>
                                            <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                                                <div
                                                    className="bg-green-500 h-2 rounded-full transition-all duration-500"
                                                    style={{ width: `${fuzzyResults.socialDevelopment.index}%` }}
                                                ></div>
                                            </div>
                                            <p className="text-xs mt-2 italic">
                                                {fuzzyResults.socialDevelopment.interpretation.description}
                                            </p>
                                        </div>
                                    </div>
                                )}

                                {/* Գործողությունների ինդիկատոր */}
                                <div className="text-center pt-2">
                                    <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getConfidenceIndicatorClass(fuzzyResults.high)}`}>
                                        {getConfidenceIndicatorIcon(fuzzyResults.high)}
                                        <span className="ml-2">{getConfidenceLabel(fuzzyResults.high)}</span>
                                    </div>
                                </div>
                            </div>
                        </ChartCard>
                    </div>

                    {/* Մետրիկների մանրամասներ - ՆՈՐ */}
                    {fuzzyResults.socialDevelopment && fuzzyResults.socialDevelopment.demographicMetrics && (
                        <ChartCard title="🎯 Դեմոգրաֆիական ցուցանիշներ" subtitle="Հիմնական ցուցանիշների վերլուծություն">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-3">
                                    <MetricBar
                                        label="Ծնելիության մակարդակ"
                                        value={Math.round(fuzzyResults.socialDevelopment.demographicMetrics.birth_rate)}
                                        color="blue"
                                        icon="👶"
                                        description="Բնակչության ծնելիության ցուցանիշ"
                                    />
                                    <MetricBar
                                        label="Մահացության մակարդակ"
                                        value={Math.round(fuzzyResults.socialDevelopment.demographicMetrics.death_rate)}
                                        color="red"
                                        icon="💔"
                                        description="Բնակչության մահացության ցուցանիշ"
                                    />
                                </div>
                                <div className="space-y-3">
                                    <MetricBar
                                        label="Բնական աճ"
                                        value={Math.round(fuzzyResults.socialDevelopment.demographicMetrics.natural_increase)}
                                        color="green"
                                        icon="📈"
                                        description="Բնակչության բնական աճի ցուցանիշ"
                                    />
                                    <MetricBar
                                        label="Ամուսնությունների մակարդակ"
                                        value={Math.round(fuzzyResults.socialDevelopment.demographicMetrics.marriage_rate)}
                                        color="purple"
                                        icon="💍"
                                        description="Ամուսնությունների գրանցման ցուցանիշ"
                                    />
                                </div>
                            </div>
                        </ChartCard>
                    )}

                    {/* Մանրամասն վիճակագրություն */}
                    <ChartCard title="Մանրամասն վստահության վիճակագրություն">
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <InfoCard
                                title="Ընդհանուր տողեր"
                                value={currentData.length}
                                icon="📊"
                                color="blue"
                            />
                            <InfoCard
                                title="Վստահելի տվյալներ"
                                value={Math.round(currentData.length * (fuzzyResults.high / 100))}
                                icon="✅"
                                color="green"
                            />
                            <InfoCard
                                title="Անորոշ տվյալներ"
                                value={Math.round(currentData.length * (fuzzyResults.medium / 100))}
                                icon="⚡"
                                color="yellow"
                            />
                            <InfoCard
                                title="Խնդրային տվյալներ"
                                value={Math.round(currentData.length * (fuzzyResults.low / 100))}
                                icon="⚠️"
                                color="red"
                            />
                        </div>
                    </ChartCard>

                    {/* Առաջարկություններ */}
                    {fuzzyResults.recommendations && fuzzyResults.recommendations.length > 0 && (
                        <Alert
                            type={getRecommendationAlertType(fuzzyResults.high)}
                            title="🔮 Փորձագետի առաջարկություններ"
                        >
                            <div className="space-y-3">
                                {fuzzyResults.recommendations.map((rec, index) => (
                                    <div key={index} className="border-l-2 border-gray-300 pl-3">
                                        <div className="flex items-center space-x-2">
                                            <span className={`px-2 py-1 rounded text-xs font-bold ${getPriorityClassArmenian(rec.priority)}`}>
                                                {getPriorityLabelArmenian(rec.priority)}
                                            </span>
                                            <span className="font-medium">{rec.action}</span>
                                        </div>
                                        <p className="text-sm text-gray-600 mt-1">{rec.reason}</p>
                                    </div>
                                ))}
                            </div>

                            <div className="mt-4 p-3 bg-gray-50 rounded">
                                <div className="text-sm">
                                    <strong>💡 Հաջորդ քայլեր:</strong>
                                    <ul className="list-disc list-inside mt-1 space-y-1">
                                        <li>Անցնել կլաստերացման փուլին</li>
                                        <li>Կիրառել տվյալների մաքրման տեխնիկաներ</li>
                                        <li>Ստեղծել նպատակային սցենարներ</li>
                                        <li>Իրականացնել հավելյալ տվյալների հավաքում</li>
                                    </ul>
                                </div>
                            </div>
                        </Alert>
                    )}

                    {/* Վերահարցում կոճակ */}
                    <div className="text-center">
                        <Button
                            onClick={applyFuzzyAnalysis}
                            variant="secondary"
                            size="md"
                        >
                            🔄 Վերլուծել կրկին
                        </Button>
                    </div>
                </>
            )}
        </div>
    );
};

/**
 * Վստահության գոտու բաղադրիչ
 */
const ConfidenceBar = ({ label, value, color, icon }) => {
    return (
        <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
                <span>{icon}</span>
                <span className="text-sm font-medium text-gray-700">{label}:</span>
            </div>
            <div className="flex items-center space-x-3 flex-1 ml-4">
                <div className="flex-1">
                    <ProgressBar
                        value={value}
                        color={color}
                        size="sm"
                        showValue={false}
                        animated={true}
                    />
                </div>
                <span className="text-sm font-bold text-gray-800 w-10 text-right">
                    {value}%
                </span>
            </div>
        </div>
    );
};

/**
 * Մետրիկի գոտու բաղադրիչ - ՆՈՐ
 */
const MetricBar = ({ label, value, color, icon, description }) => {
    const getColorClass = (color) => {
        const colors = {
            blue: 'bg-blue-500',
            red: 'bg-red-500',
            green: 'bg-green-500',
            purple: 'bg-purple-500',
            yellow: 'bg-yellow-500'
        };
        return colors[color] || 'bg-gray-500';
    };

    return (
        <div className="bg-white rounded-lg p-4 border border-gray-200 shadow-sm">
            <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-2">
                    <span className="text-lg">{icon}</span>
                    <div>
                        <span className="text-sm font-medium text-gray-800">{label}</span>
                        {description && (
                            <p className="text-xs text-gray-500">{description}</p>
                        )}
                    </div>
                </div>
                <span className="text-lg font-bold text-gray-800">
                    {value}
                </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                    className={`h-2 rounded-full transition-all duration-500 ${getColorClass(color)}`}
                    style={{ width: `${Math.min(value, 100)}%` }}
                ></div>
            </div>
        </div>
    );
};

/**
 * Վստահության ինդիկատորի CSS դասի ստացում
 */
const getConfidenceIndicatorClass = (highConfidence) => {
    if (highConfidence >= 80) {
        return 'bg-green-100 text-green-800';
    } else if (highConfidence >= 60) {
        return 'bg-yellow-100 text-yellow-800';
    } else {
        return 'bg-red-100 text-red-800';
    }
};

/**
 * Վստահության ինդիկատորի նշանի ստացում
 */
const getConfidenceIndicatorIcon = (highConfidence) => {
    if (highConfidence >= 80) {
        return '🟢';
    } else if (highConfidence >= 60) {
        return '🟡';
    } else {
        return '🔴';
    }
};

/**
 * Վստահության պիտակի ստացում
 */
const getConfidenceLabel = (highConfidence) => {
    if (highConfidence >= 80) {
        return 'Բարձր վստահություն';
    } else if (highConfidence >= 60) {
        return 'Միջին վստահություն';
    } else {
        return 'Ցածր վստահություն';
    }
};

/**
 * Առաջարկությունների ծանուցման տեսակի ստացում
 */
const getRecommendationAlertType = (highConfidence) => {
    if (highConfidence >= 80) {
        return 'success';
    } else if (highConfidence >= 60) {
        return 'warning';
    } else {
        return 'danger';
    }
};

/**
 * Հայերեն առաջնահերթության CSS դասի ստացում
 */
const getPriorityClassArmenian = (priority) => {
    switch (priority) {
        case 'high':
            return 'bg-red-200 text-red-800';
        case 'medium':
            return 'bg-yellow-200 text-yellow-800';
        case 'low':
            return 'bg-green-200 text-green-800';
        default:
            return 'bg-gray-200 text-gray-800';
    }
};

/**
 * Հայերեն առաջնահերթության պիտակի ստացում
 */
const getPriorityLabelArmenian = (priority) => {
    switch (priority) {
        case 'high':
            return 'ԲԱՐՁՐ';
        case 'medium':
            return 'ՄԻՋԻՆ';
        case 'low':
            return 'ՑԱԾՐ';
        default:
            return 'ՍՏԱՆԴԱՐՏ';
    }
};

export default FuzzyTab;