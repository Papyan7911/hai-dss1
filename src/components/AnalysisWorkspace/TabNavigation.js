import React from 'react';
import { useData } from '../../context/DataContext';
/**
 * TabNavigation բաղադրիչ - վերլուծական տաբերի նավիգացիա
 * @param {Object} props - Բաղադրիչի պրոպսեր
 * @param {string} props.activeTab - Ակտիվ տաբ
 * @param {Function} props.onTabChange - Տաբի փոփոխության ֆունկցիա
 * @param {number} props.projectPhase - Ընթացիկ նախագծի փուլ
 */
const TabNavigation = ({ activeTab, onTabChange, projectPhase }) => {
    const {
        currentData,
        syntheticData,
        fuzzyResults,
        clusterData,
        scenarios,
    } = useData();

    /**
     * Ֆունկցիա enabled-ի հաշվարկման համար՝ projectPhase-ի հիման վրա
     * @param {string} tabId - Տաբի ID
     * @returns {boolean} Մատչելի է թե ոչ
     */
    const getTabEnabled = (tabId) => {
        // Եթե projectPhase չկա, օգտագործում ենք հին տրամաբանությունը
        if (projectPhase === undefined || projectPhase === null) {
            switch (tabId) {
                case 'analysis':
                    return true;
                case 'synthetic':
                case 'fuzzy':
                case 'clustering':
                    return currentData && currentData.length > 0;
                case 'scenarios':
                    return fuzzyResults !== null && clusterData && clusterData.length > 0;
                case 'results':
                    return true;
                default:
                    return false;
            }
        }

        // Նոր տրամաբանություն projectPhase-ի հիման վրա
        switch (tabId) {
            case 'analysis':
                return projectPhase >= 0; // Միշտ մատչելի
            case 'synthetic':
                return projectPhase >= 0; // Մատչելի 0 փուլից
            case 'fuzzy':
                return projectPhase > 1; // Մատչելի 1 փուլից
            case 'clustering':
                return projectPhase > 2; // Մատչելի 2 փուլից
            case 'scenarios':
                return projectPhase >= 3; // Մատչելի 3 փուլից
            case 'results':
                return projectPhase >= 3; // Մատչելի 4 փուլից (ամփոփում)
            default:
                return false;
        }
    };

    /**
     * Տաբերի կոնֆիգուրացիա
     */
    const tabs = [
        {
            id: 'analysis',
            label: 'Առաջնային վերլուծություն',
            icon: '📈',
            description: 'Տվյալների որակի գնահատում',
            enabled: getTabEnabled('analysis'),
            completed: currentData && currentData.length > 0
        },
        {
            id: 'synthetic',
            label: 'Սինթետիկ տվյալներ',
            icon: '🧬',
            description: 'Արհեստական տվյալների գեներացում',
            enabled: getTabEnabled('synthetic'),
            completed: syntheticData && syntheticData.length > 0
        },
        {
            id: 'fuzzy',
            label: 'Ոչ հստակ տրամաբանություն',
            icon: '🔮',
            description: 'Վստահության մակարդակի գնահատում',
            enabled: getTabEnabled('fuzzy'),
            completed: fuzzyResults !== null
        },
        {
            id: 'clustering',
            label: 'Կլաստերացում',
            icon: '🎯',
            description: 'Տվյալների խմբավորում',
            enabled: getTabEnabled('clustering'),
            completed: clusterData && clusterData.length > 0
        },
        {
            id: 'scenarios',
            label: 'Սցենարներ',
            icon: '📋',
            description: 'Որոշումային սցենարների գեներացիա',
            enabled: getTabEnabled('scenarios'),
            completed: scenarios && scenarios.length > 0
        },
        {
            id: 'results',
            label: 'Արդյունքներ',
            icon: '📊',
            description: 'Վերջնական տեղեկագիր',
            enabled: getTabEnabled('results'),
            completed: currentData && currentData.length > 0
        }
    ];

    /**
     * Տաբի սեղմելու մշակում
     * @param {string} tabId - Տաբի նույնականացուցիչ
     * @param {boolean} enabled - Տաբի մատչելիություն
     */
    const handleTabClick = (tabId, enabled) => {
        if (enabled) {
            onTabChange(tabId);
        }
    };

    /**
     * Տաբի CSS դասերի ձևավորում
     * @param {Object} tab - Տաբի օբյեկտ
     * @returns {string} CSS դասեր
     */
    const getTabClasses = (tab) => {
        let classes = `
      relative px-4 py-3 rounded-lg font-medium text-sm transition-all duration-300 cursor-pointer
      border-2 flex items-center space-x-2 min-w-0 flex-shrink-0
    `;

        if (!tab.enabled) {
            // Անջատված տաբ
            classes += ` 
        bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed
        opacity-50
      `;
        } else if (activeTab === tab.id) {
            // Ակտիվ տաբ
            classes += `
        bg-gradient-to-r from-blue-500 to-purple-600 text-white border-blue-500
        shadow-lg transform scale-105 z-10
      `;
        } else {
            // Մատչելի տաբ
            classes += `
        bg-white text-gray-700 border-gray-300 hover:border-blue-400 hover:bg-blue-50
        hover:shadow-md hover:scale-102
      `;
        }

        return classes.trim().replace(/\s+/g, ' ');
    };

    /**
     * Հաջողության ինդիկատորի ցուցադրում
     * @param {Object} tab - Տաբի օբյեկտ
     * @returns {JSX.Element|null} Հաջողության ինդիկատոր
     */
    const renderSuccessIndicator = (tab) => {
        if (!tab.completed) return null;

        return (
            <div className={`
        absolute -top-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center text-xs
        ${activeTab === tab.id ? 'bg-white text-green-600' : 'bg-green-500 text-white'}
        shadow-sm
      `}>
                ✓
            </div>
        );
    };

    /**
     * Մատչելիության ինդիկատորի ցուցադրում
     * @param {Object} tab - Տաբի օբյեկտ
     * @returns {JSX.Element|null} Մատչելիության ինդիկատոր
     */
    const renderAccessibilityIndicator = (tab) => {
        if (tab.enabled) return null;

        return (
            <div className="absolute -top-1 -right-1 w-5 h-5 bg-gray-400 rounded-full flex items-center justify-center text-xs text-white shadow-sm">
                🔒
            </div>
        );
    };

    return (
        <div className="border-b-2 border-gray-200 pb-4 py-5 px-5">
            {/* Տաբերի կոնտեյներ */}
            <div className="flex flex-wrap gap-2 lg:gap-3">
                {tabs.map((tab) => (
                    <div
                        key={tab.id}
                        className={getTabClasses(tab)}
                        onClick={() => handleTabClick(tab.id, tab.enabled)}
                        title={tab.enabled ? tab.description : 'Այս տաբը դեռ մատչելի չէ'}
                    >
                        {/* Տաբի բովանդակություն */}
                        <div className="flex items-center space-x-2 min-w-0">
                            {/* Նշան */}
                            <span className="text-lg flex-shrink-0">{tab.icon}</span>

                            {/* Տեքստ */}
                            <span className="font-medium truncate">
                                {tab.label}
                            </span>
                        </div>

                        {/* Կարգավիճակի ինդիկատորներ */}
                        {renderSuccessIndicator(tab)}
                        {renderAccessibilityIndicator(tab)}
                    </div>
                ))}
            </div>

            {/* Ակտիվ տաբի մանրամասն տեղեկություններ */}
            <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center justify-between">
                    <div>
                        <h4 className="font-bold text-gray-800">
                            {tabs.find(t => t.id === activeTab)?.icon} {tabs.find(t => t.id === activeTab)?.label}
                        </h4>
                        <p className="text-sm text-gray-600 mt-1">
                            {tabs.find(t => t.id === activeTab)?.description}
                        </p>
                    </div>

                    {/* Տաբի վիճակագրություն */}
                    <div className="text-right">
                        <TabStatistics activeTab={activeTab} />
                    </div>
                </div>
            </div>
        </div>
    );
};

/**
 * Տաբի վիճակագրության բաղադրիչ
 * @param {Object} props - Պրոպսեր
 * @param {string} props.activeTab - Ակտիվ տաբ
 */
const TabStatistics = ({ activeTab }) => {
    const {
        currentData,
        syntheticData,
        fuzzyResults,
        clusterData,
        scenarios
    } = useData();

    const getStatistics = () => {
        switch (activeTab) {
            case 'analysis':
                return {
                    label: 'Տողեր',
                    value: currentData?.length || 0,
                    suffix: ''
                };
            case 'synthetic':
                return {
                    label: 'Գեներացված',
                    value: syntheticData?.length || 0,
                    suffix: ''
                };
            case 'fuzzy':
                return {
                    label: 'Բարձր վստահություն',
                    value: fuzzyResults?.high || 0,
                    suffix: '%'
                };
            case 'clustering':
                return {
                    label: 'Խմբեր',
                    value: clusterData?.length || 0,
                    suffix: ''
                };
            case 'scenarios':
                return {
                    label: 'Սցենարներ',
                    value: scenarios?.length || 0,
                    suffix: ''
                };
            case 'results':
                return {
                    label: 'Ամբողջական',
                    value: currentData && syntheticData ? 100 : 0,
                    suffix: '%'
                };
            default:
                return {
                    label: '',
                    value: 0,
                    suffix: ''
                };
        }
    };

    const stats = getStatistics();

    return (
        <div className="text-sm">
            <div className="font-bold text-lg text-blue-600">
                {stats.value}{stats.suffix}
            </div>
            <div className="text-gray-500">
                {stats.label}
            </div>
        </div>
    );
};

/**
 * Տաբի հուշումների բաղադրիչ
 * @param {Object} props - Պրոպսեր
 * @param {string} props.activeTab - Ակտիվ տաբ
 */


export default TabNavigation;