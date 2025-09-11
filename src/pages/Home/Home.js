import React, { useState, useEffect } from 'react';
import { PersonStandingIcon, Brain, TrendingUp, Shield, Users, Target, BarChart3, Lightbulb, ArrowRight, CheckCircle, AlertTriangle, Activity, Zap, Play, Star, Award, Scale } from 'lucide-react';

import carousel1 from '../../assets/img/carousel1.png';
import carousel2 from '../../assets/img/carousel2.webp';
import carousel3 from '../../assets/img/carousel3.jpg';
import { ActivitySVG, AnalystWorkSVG, ClusteringSVG, DataVisualizationSVG, DecisionMakingSVG, ExpertAnalysisSVG, HeroBackgroundSVG, ManagerDecisionSVG, SecuritySVG, SyntheticDataSVG, TargetingSVG, TeamSVG } from './assets';
import { useNavigate, useLocation } from 'react-router-dom';
import MetricsSection from '../../components/MetricsSection/Metrics';

const Home = () => {
    const [currentSlide, setCurrentSlide] = useState(0);
    const [isVisible, setIsVisible] = useState(false);
    const [openIndex, setOpenIndex] = useState(null);

    const [isPlaying, setIsPlaying] = useState(false);
    const handlePlay = () => {
        setIsPlaying(true);
    };

    const toggleDescription = (index) => {
        setOpenIndex(openIndex === index ? null : index);
    };


    const navigate = useNavigate();
    const location = useLocation();


    const heroSlides = [
        // Վերլուծաբանական ենթահամակարգ
        {
            title: "Վերլուծաբանական",
            subtitle: "Ենթահամակարգ",
            image: carousel1,
            icon: Target
        },
        {
            title: "Մենեջերի",
            subtitle: "Վերլուծություն",
            image: carousel2,
            icon: BarChart3
        },
        {
            title: "GPT",
            subtitle: "Փոխակերպիչներ",
            image: carousel3,
            icon: Brain

        }
    ];


    const features = [
        {
            icon: BarChart3,
            title: "Առաջնային Վերլուծություն",
            description: "Տվյալների որակի գնահատում, մաքրում և առաջնային վերլուծություն",
            SVGComponent: AnalystWorkSVG
        },
        {
            icon: PersonStandingIcon,
            title: "Վերլուծության Ենթամակարգ",
            description: "Ռիսկերի գնահատում և ռազմավարական որոշումների ընդունում անորոշության պայմաններում",
            SVGComponent: ManagerDecisionSVG
        },
        {
            icon: Target,
            title: "Փորձագիտական Ենթամակարգ",
            description: "Ոչ հստակ տրամաբանություն, կլաստերացում և սցենարային մոդելավորում որոշումների ընդունման համար",
            SVGComponent: ExpertAnalysisSVG
        },
        {
            icon: Lightbulb,
            title: "Սինթետիկ Տվյալների Գեներացում",
            description: "Արհեստական տվյալների ստեղծում վերլուծության որակի բարելավման և տվյալների նմուշի չափի ավելացման համար",
            SVGComponent: SyntheticDataSVG
        },
        {
            icon: Users,
            title: "Կլաստերացում",
            description: "Տվյալների խմբավորում, օրինաչափությունների բացահայտում և վիճակագրական վերլուծություն",
            SVGComponent: ClusteringSVG
        },
        {
            icon: Scale,
            title: "Որոշումների Ընդունում",
            description: "Բազմաչափանիշային վերլուծություն, ռիսկերի գնահատում և ռազմավարական պլանավորում",
            SVGComponent: DecisionMakingSVG
        },
    ];

    const metrics = [
        {
            value: "91%",
            label: "Կանխատեսման Ճշգրտություն",
            description: "Միջին ցուցանիշ՝ հիմնված տվյալների որակի, կիրառված մեթոդների և սցենարների արդյունքների համադրության վրա։ Հաշվարկը իրականացվել է 1200+ դեպքերի հիման վրա։"
        },
        {
            value: "38%",
            label: "Ռիսկերի Կրճատում",
            description: "Միջին արդյունք, ստացվել է ռիսկերի վերլուծության արդյունքում՝ համադրելով կանխատեսված և հնարավոր ռիսկերը տարբեր նախագծերում։"
        },
        {
            value: "57%",
            label: "Ժամանակի Խնայողություն",
            description: "Միջին ցուցանիշ՝ որոշումների կայացման գործընթացում ավտոմատացված գործիքների օգտագործման արդյունքում ժամանակի կրճատման հիման վրա։"
        },
        {
            value: "99.8%",
            label: "Հասանելիություն",
            description: "Միջին ցուցանիշ՝ վերջին 6 ամսվա տվյալների հիման վրա։ Հաշվի են առնվել պլանավորված տեխնիկական աշխատանքները և համակարգի անխափան գործարկումը շուրջօրյա մոնիտորինգով։"
        }
    ];


    useEffect(() => {
        setIsVisible(true);
        const interval = setInterval(() => {
            setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
        }, 5000);
        return () => clearInterval(interval);
    }, []);


    const navigateToProjects = async () => {
        const token = localStorage.getItem('accessToken');

        if (!token) {
            navigate('/sign-in', { replace: true });
        } else {
            navigate('/my-profile', {
                state: { from: location.pathname }
            });

        }
    }

    const scrollToVideoSection = () => {
        const videoSection = document.getElementById('video-section');
        if (videoSection) {
            videoSection.scrollIntoView({
                behavior: 'smooth',
                block: 'center'
            });
        }
    };
    return (
        <div className="min-h-screen bg-gradient-to-br from-[#1c92d2] to-[#f2fcfe]">
            {/* Main Title Section */}

            {/* Hero Section with Carousel */}
            <section className="bg-gradient-to-br from-white/100 to-gray-100/20">
                <section id="home" className="relative overflow-hidden min-h-screen flex flex-col lg:flex-row px-4 sm:px-6 lg:px-8">
                    {/* First Half - Header Content */}
                    <section className="flex-1 flex items-center justify-center pt-32 lg:pt-12 pb-6 lg:pb-12 px-4 sm:px-6 lg:px-8 z-10">
                        <div className="max-w-7xl mx-auto text-center lg:text-left text-rgb(15 23 42 / 0.95) w-full">
                            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-4xl font-bold text-left bg-gradient-to-r from-[#1c92d2] to-[#0ea5e9] bg-clip-text text-transparent max-w-6xl mx-auto lg:mx-0 leading-snug text-rgb(30 41 59 / var(--tw-text-opacity, 1)) ">
                                Արհեստական բանականության հետ ինտեգրված որոշումների ընդունմանն աջակցող հիբրիդային համակարգ
                            </h1>
                            <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 justify-center lg:justify-start items-center mt-10">
                                <button
                                    className="group w-full sm:w-auto px-4 sm:px-6 py-2.5 sm:py-3 bg-white/20 backdrop-blur-sm text-slate-800 rounded-full font-semibold text-sm sm:text-base border border-slate-800 hover:bg-white/40 hover:shadow-lg transition-all duration-300 transform hover:scale-105 cursor-pointer active:scale-95"
                                    onClick={navigateToProjects}
                                >
                                    Սկսել Վերլուծությունը
                                    <ArrowRight className="inline-block ml-1.5 w-3 h-3 sm:w-4 sm:h-4 group-hover:translate-x-1 transition-transform duration-300" />
                                </button>

                                <button
                                    className="group w-full sm:w-auto px-4 sm:px-6 py-2.5 sm:py-3 border border-slate-800 text-slate-800 rounded-full font-semibold text-sm sm:text-base hover:bg-white/20 hover:shadow-lg transition-all duration-300 backdrop-blur-sm flex items-center justify-center cursor-pointer active:scale-95"
                                    onClick={scrollToVideoSection}
                                >
                                    <Play className="w-3 h-3 sm:w-4 sm:h-4 mr-1.5 group-hover:scale-110 transition-transform duration-300" />
                                    Ծանոթանալ Համակարգին
                                </button>
                            </div>
                        </div>
                    </section>

                    {/* Second Half - Slider Carousel */}
                    <section className="flex-1 flex items-center justify-center pb-12 lg:pb-12 relative">
                        <div className="relative max-w-7xl mx-auto w-full">
                            {/* Carousel Container */}
                            <div className="relative">
                                {/* Main Slider */}
                                <div className="relative overflow-hidden rounded-3xl">
                                    <div
                                        className="flex transition-transform duration-700 ease-in-out"
                                        style={{ transform: `translateX(-${currentSlide * 100}%)` }}
                                    >
                                        {heroSlides.map((slide, index) => (
                                            <div key={index} className="w-full flex-shrink-0 relative">
                                                <div className="relative h-[300px] sm:h-[400px] lg:h-[350px]">
                                                    {/* Background Image */}
                                                    <img
                                                        src={slide.image}
                                                        alt={slide.title}
                                                        className="w-full h-full object-cover"
                                                    />
                                                    {/* Overlay */}
                                                    <div className="absolute inset-0 bg-gradient-to-r from-[#1c92d2]/80 to-[#0ea5e9]/60"></div>
                                                    <div className="absolute inset-0 bg-black/20"></div>

                                                    {/* Content */}
                                                    <div className="absolute inset-0 flex items-center justify-center">
                                                        <div className="text-center px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto">
                                                            {/* Icon */}
                                                            <div className="mb-4 flex justify-center">
                                                                <div className="w-12 h-12 sm:w-14 sm:h-14 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center">
                                                                    <slide.icon className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
                                                                </div>
                                                            </div>

                                                            {/* Badge */}
                                                            <div className="mb-4">
                                                                <span className="inline-flex items-center px-3 py-1.5 rounded-full bg-white/20 backdrop-blur-sm text-white text-xs sm:text-sm font-medium border border-white/30">
                                                                    <Zap className="w-3 h-3 sm:w-4 sm:h-4 mr-1.5" />
                                                                    Նորարարական Լուծում
                                                                </span>
                                                            </div>

                                                            {/* Title */}
                                                            <h1 className="text-sm sm:text-2xl md:text-xl lg:text-2xl xl:text-3xl font-bold mb-3 sm:mb-4 leading-tight">
                                                                <span className="text-white block">
                                                                    {slide.title}
                                                                </span>
                                                                <span className="text-white/90 block mt-1">
                                                                    {slide.subtitle}
                                                                </span>
                                                            </h1>

                                                            {/* Buttons */}

                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Clickable Progress Indicators */}
                                <div className="flex justify-center mt-4 space-x-2 relative z-10">
                                    {heroSlides.map((_, index) => (
                                        <button
                                            key={index}
                                            onClick={() => setCurrentSlide(index)}
                                            className={`h-2 rounded-full transition-all duration-500 hover:scale-110 focus:outline-none focus:ring-2 focus:ring-[#1c92d2] focus:ring-offset-2 focus:ring-offset-transparent ${index === currentSlide
                                                ? 'w-10 bg-[#1c92d2]'
                                                : 'w-4 bg-[#f2fcfe]/50 hover:bg-[#1c92d2]/60'
                                                }`}
                                            aria-label={`Go to slide ${index + 1}`}
                                        />
                                    ))}
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* Background Elements - Positioned Absolutely */}
                    <HeroBackgroundSVG />
                    <div className="absolute inset-0 pointer-events-none">
                        <div className="absolute top-1/4 left-1/4 w-48 h-48 sm:w-64 sm:h-64 lg:w-96 lg:h-96 bg-[#1c92d2]/10 rounded-full blur-3xl animate-pulse"></div>
                        <div className="absolute bottom-1/4 right-1/4 w-48 h-48 sm:w-64 sm:h-64 lg:w-96 lg:h-96 bg-[#0ea5e9]/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
                    </div>
                </section>
            </section>

            {/* Metrics Section - Responsive */}
            <MetricsSection metrics={metrics} />

            {/* Features Section - Responsive Grid */}
            <section id="services" className="py-12 sm:py-16 lg:py-20">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-12 sm:mb-16">
                        <h2 className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-bold text-white mb-4 sm:mb-6 leading-tight">
                            Համակարգի հնարավորություններ
                        </h2>
                        <p className="text-base sm:text-lg lg:text-xl text-white/80 max-w-2xl lg:max-w-3xl mx-auto leading-relaxed">
                            Ժամանակակից տեխնոլոգիաների կիրառման արդյունքում ստեղծված առաջադեմ գործիքներ
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 lg:gap-8">
                        {features.map((feature, index) => (
                            <div
                                key={index}
                                className="group p-6 sm:p-8 rounded-2xl bg-gradient-to-br from-slate-800/80 to-[#1c92d2]/40 backdrop-blur-sm border border-white/50 hover:border-[#1c92d2] transition-all duration-500 hover:transform hover:scale-105 hover:shadow-2xl hover:shadow-[#1c92d2]/30 overflow-hidden"
                            >
                                <div className="relative mb-4 sm:mb-6 h-32 sm:h-40 rounded-xl overflow-hidden bg-gradient-to-br from-white/20 to-[#1c92d2]/30">
                                    <feature.SVGComponent />
                                    <div className="absolute inset-0 bg-gradient-to-t from-[#1c92d2]/20 to-transparent"></div>
                                    <div className="absolute bottom-2 sm:bottom-3 left-2 sm:left-3 w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-br from-[#1c92d2] to-[#0ea5e9] backdrop-blur-sm flex items-center justify-center shadow-lg">
                                        <feature.icon className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                                    </div>
                                </div>
                                <h3 className="text-lg sm:text-xl font-bold text-white mb-3 sm:mb-4 group-hover:text-[#d5e3eb] transition-colors drop-shadow-sm leading-tight">
                                    {feature.title}
                                </h3>
                                <p className="text-sm sm:text-base text-white/90 group-hover:text-white transition-colors leading-relaxed drop-shadow-sm">
                                    {feature.description}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            <section
                className="py-12 sm:py-16 lg:py-20 bg-gradient-to-r from-[#1c92d2]/10 to-[#0ea5e9]/10"
                id="video-section"
            >
                <div className="max-w-4xl lg:max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <h2 className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-bold text-white mb-4 sm:mb-6 leading-tight">
                        Համակարգի աշխատանքը
                    </h2>

                    <div className="relative rounded-2xl sm:rounded-3xl overflow-hidden shadow-2xl">
                        {/* Background Image */}
                        <img
                            src="https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&h=450&fit=crop&auto=format"
                            alt="Demo Video Thumbnail"
                            className="w-full h-48 sm:h-64 lg:h-96 object-cover"
                        />

                        {/* Video element */}
                        {isPlaying && (
                            <video
                                src={'https://gateway.amracode.am/video_final1.mov'}
                                className="absolute inset-0 w-full h-full object-cover"
                                autoPlay
                                controls
                                onEnded={() => setIsPlaying(false)}
                            />
                        )}

                        {/* Play Button */}
                        {!isPlaying && (
                            <div className="absolute inset-0 bg-gradient-to-t from-[#1c92d2]/60 to-transparent flex items-center justify-center">
                                <button
                                    onClick={handlePlay}
                                    className="group w-16 h-16 sm:w-20 sm:h-20 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white/30 transition-all duration-300 hover:scale-110"
                                >
                                    <Play className="w-6 h-6 sm:w-8 sm:h-8 text-white ml-1" />
                                </button>
                            </div>
                        )}

                        {/* Bottom info */}

                    </div>
                </div>
            </section>

            {/* Process Section - Responsive */}
            <section id="about" className="py-12 sm:py-16 lg:py-20 bg-gradient-to-r from-[#1c92d2]/20 to-[#0ea5e9]/20">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-12 sm:mb-16">
                        <h2 className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-bold text-white mb-4 sm:mb-6 leading-tight">
                            Աշխատանքի կատարման գործընթացը
                        </h2>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
                        {[
                            {
                                step: "01",
                                title: "Տվյալների հավաքագրում",
                                desc: "Ներքին և արտաքին աղբյուրներից տվյալների ստացում",
                                image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=300&h=200&fit=crop&auto=format"
                            },
                            {
                                step: "02",
                                title: "Վերլուծություն",
                                desc: "AI ալգորիթմներով իրավիճակի գնահատում",
                                image: "https://images.unsplash.com/photo-1677442136019-21780ecad995?w=300&h=200&fit=crop&auto=format"
                            },
                            {
                                step: "03",
                                title: "Սցենարների մշակում",
                                desc: "Հնարավոր տարբերակների ստեղծում",
                                image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=300&h=200&fit=crop&auto=format"
                            },
                            {
                                step: "04",
                                title: "Որոշման ընդունում",
                                desc: "Օպտիմալ լուծման ընտրություն",
                                image: "https://images.unsplash.com/photo-1559136555-9303baea8ebd?w=300&h=200&fit=crop&auto=format"
                            }
                        ].map((item, index) => (
                            <div key={index} className="text-center group relative">
                                <div className="mb-4 sm:mb-6 relative">
                                    <img
                                        src={item.image}
                                        alt={item.title}
                                        className="w-full h-32 sm:h-40 object-cover rounded-xl sm:rounded-2xl opacity-70 group-hover:opacity-90 transition-opacity duration-300"
                                    />
                                    <div className="absolute top-3 sm:top-4 left-3 sm:left-4 w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-[#1c92d2] to-[#0ea5e9] rounded-full flex items-center justify-center text-sm sm:text-lg font-bold text-white shadow-lg">
                                        {item.step}
                                    </div>
                                </div>
                                <h3 className="text-lg sm:text-xl font-bold text-white mb-3 sm:mb-4 leading-tight">{item.title}</h3>
                                <p className="text-sm sm:text-base text-white/80 leading-relaxed">{item.desc}</p>
                                {index < 3 && (
                                    <div className="hidden lg:block absolute top-16 sm:top-20 left-full w-full h-0.5 bg-gradient-to-r from-[#1c92d2]/50 to-transparent transform translate-x-4"></div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA Section - Responsive */}
            <section className="py-12 sm:py-16 lg:py-20">
                <div className="max-w-3xl lg:max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <div className="relative p-8 sm:p-12 rounded-2xl sm:rounded-3xl bg-gradient-to-br from-[#1c92d2]/30 to-[#0ea5e9]/30 backdrop-blur-sm border border-[#1c92d2]/20 overflow-hidden">
                        <div className="absolute inset-0">
                            <img
                                src="https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800&h=400&fit=crop&auto=format"
                                alt="CTA Background"
                                className="w-full h-full object-cover opacity-5"
                            />
                        </div>
                        <div className="relative z-10">
                            <h2 className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-bold text-white mb-4 sm:mb-6 leading-tight">
                                Պատրա՞ստ եք սկսելու
                            </h2>
                            <p className="text-base sm:text-lg lg:text-xl text-white/80 mb-6 sm:mb-8 leading-relaxed max-w-2xl mx-auto">
                                Միացե՛ք մենեջերներին, ովքեր արդեն օգտագործում են մեր համակարգը
                                ավելի խելացի որոշումներ ընդունելու համար
                            </p>
                            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center max-w-md sm:max-w-none mx-auto">
                                <button className="w-full sm:w-auto px-6 sm:px-8 py-3 sm:py-4 bg-gradient-to-r from-[#1c92d2] to-[#0ea5e9] text-white rounded-full font-semibold text-base sm:text-lg hover:from-[#0f7fb5] hover:to-[#0369a1] transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-[#1c92d2]/25 cursor-pointer" onClick={navigateToProjects}>
                                    Սկսել Վերլուծությունը
                                </button>
                                <button className="w-full sm:w-auto px-6 sm:px-8 py-3 sm:py-4 border-2 border-[#1c92d2]/50 text-[#1c92d2] rounded-full font-semibold text-base sm:text-lg hover:bg-[#1c92d2]/10 transition-all duration-300" onClick={scrollToVideoSection}>
                                    Դեմո Դիտել
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default Home;