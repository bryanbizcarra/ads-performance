
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../services/supabase';
import {
    ChartBarIcon,
    CheckCircleIcon,
    ShieldCheckIcon,
    LightBulbIcon,
    DocumentTextIcon,
    UserGroupIcon,
    EnvelopeIcon,
    SparklesIcon,
    ArrowDownTrayIcon,
    CloudArrowUpIcon,
    ExclamationCircleIcon
} from '@heroicons/react/24/outline';

const Navbar = () => {
    const navigate = useNavigate();
    return (
        <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-xl border-b border-slate-200 px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate('/')}>
                <div className="bg-slate-900 p-2 rounded-lg">
                    <ChartBarIcon className="w-5 h-5 text-white" />
                </div>
                <div>
                    <h1 className="text-lg font-bold tracking-tight text-slate-900 leading-none">Ads Hub Pro</h1>
                    <p className="text-[9px] uppercase tracking-widest text-slate-400 font-bold">IA Analytics</p>
                </div>
            </div>
            <div className="flex items-center gap-6">
                <a href="#features" className="text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors hidden md:block">Ventajas</a>
                <a href="#how-to-use" className="text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors hidden md:block">Cómo usar</a>
                <a href="#pricing" className="text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors hidden md:block">Precios</a>
                <button
                    onClick={() => navigate('/login')}
                    className="bg-slate-900 text-white px-5 py-2 rounded-xl text-sm font-bold hover:bg-slate-800 transition-all shadow-lg shadow-slate-200"
                >
                    Iniciar Sesión
                </button>
            </div>
        </nav>
    );
};

const FeatureCard = ({ icon: Icon, title, description }: { icon: any, title: string, description: string }) => (
    <div className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm hover:shadow-xl transition-all hover:-translate-y-1">
        <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center mb-6">
            <Icon className="w-6 h-6 text-blue-600" />
        </div>
        <h3 className="text-xl font-bold text-slate-900 mb-3">{title}</h3>
        <p className="text-slate-500 leading-relaxed text-sm">{description}</p>
    </div>
);

const PricingSection = () => (
    <section id="pricing" className="px-6 py-24 bg-slate-50">
        <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16 space-y-4">
                <h2 className="text-3xl md:text-5xl font-extrabold text-slate-900">Planes a tu medida</h2>
                <p className="text-slate-500 max-w-2xl mx-auto">Comienza gratis hoy mismo y escala cuando estés listo para dominar el mercado.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
                {/* Trial Plan */}
                <div className="bg-white rounded-[3rem] p-10 border border-slate-200 shadow-sm hover:shadow-xl transition-all flex flex-col">
                    <div className="mb-8">
                        <h3 className="text-2xl font-bold text-slate-900 mb-2">Plan Trial</h3>
                        <p className="text-slate-500 text-sm">Prueba el poder de la IA sin costo.</p>
                    </div>
                    <div className="mb-8">
                        <span className="text-5xl font-black text-slate-900">$0</span>
                        <span className="text-slate-400 font-medium ml-2">5 días corridos</span>
                    </div>
                    <ul className="space-y-4 mb-10 flex-1">
                        <li className="flex items-center gap-3 text-slate-600 text-sm"><CheckCircleIcon className="w-5 h-5 text-emerald-500" /> 1 reporte estratégico IA al día</li>
                        <li className="flex items-center gap-3 text-slate-600 text-sm"><CheckCircleIcon className="w-5 h-5 text-emerald-500" /> Visualización de gráficos básicos</li>
                        <li className="flex items-center gap-3 text-slate-600 text-sm"><CheckCircleIcon className="w-5 h-5 text-emerald-500" /> Carga ilimitada de archivos</li>
                        <li className="flex items-center gap-3 text-slate-400 text-sm line-through"><ShieldCheckIcon className="w-5 h-5" /> Exportación en PDF</li>
                    </ul>
                    <a href="#contact" className="w-full py-4 bg-slate-100 hover:bg-slate-200 text-slate-900 rounded-2xl font-bold text-center transition-all">
                        Empezar Gratis
                    </a>
                </div>

                {/* Pro Plan */}
                <div className="bg-slate-900 rounded-[3rem] p-10 text-white shadow-2xl relative overflow-hidden flex flex-col">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-blue-600/20 blur-[60px] rounded-full"></div>
                    <div className="mb-8 relative z-10">
                        <div className="inline-block bg-blue-600 text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full mb-3">Recomendado</div>
                        <h3 className="text-2xl font-bold mb-2">Plan Pro</h3>
                        <p className="text-slate-400 text-sm">Para agencias y negocios en crecimiento.</p>
                    </div>
                    <div className="mb-8 relative z-10">
                        <span className="text-5xl font-black">$9.990</span>
                        <span className="text-slate-400 font-medium ml-2">/ mensual</span>
                    </div>
                    <ul className="space-y-4 mb-10 flex-1 relative z-10">
                        <li className="flex items-center gap-3 text-slate-200 text-sm"><CheckCircleIcon className="w-5 h-5 text-blue-400" /> 5 reportes estratégicos IA al día</li>
                        <li className="flex items-center gap-3 text-slate-200 text-sm"><CheckCircleIcon className="w-5 h-5 text-blue-400" /> Análisis profundo y consejos de escala</li>
                        <li className="flex items-center gap-3 text-slate-200 text-sm"><CheckCircleIcon className="w-5 h-5 text-blue-400" /> Exportación total en PDF</li>
                        <li className="flex items-center gap-3 text-slate-200 text-sm"><CheckCircleIcon className="w-5 h-5 text-blue-400" /> Soporte prioritario</li>
                    </ul>
                    <a href="#contact" className="w-full py-4 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl font-bold text-center transition-all relative z-10 shadow-xl shadow-blue-500/20">
                        Obtener Acceso Pro
                    </a>
                </div>
            </div>
        </div>
    </section>
);

const HowItWorksSection = () => (
    <section id="how-to-use" className="px-6 py-24 bg-slate-50">
        <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16 space-y-4">
                <h2 className="text-3xl md:text-5xl font-extrabold text-slate-900">¿Cómo usar la plataforma?</h2>
                <p className="text-slate-500 max-w-2xl mx-auto">Sigue estos 3 simples pasos para transformar tus datos en decisiones estratégicas.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {/* Step 1: Meta Ads */}
                <div className="bg-white p-8 rounded-[3rem] border border-slate-200 shadow-sm hover:shadow-xl transition-all group overflow-hidden relative">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/5 blur-2xl rounded-full -mr-12 -mt-12 group-hover:bg-blue-500/10 transition-colors"></div>
                    <div className="w-14 h-14 bg-blue-50 rounded-2xl flex items-center justify-center mb-6 text-2xl font-black text-blue-600 relative z-10">
                        1
                    </div>
                    <h3 className="text-xl font-bold text-slate-900 mb-4 relative z-10">Exporta de Meta Ads</h3>
                    <p className="text-slate-500 text-sm leading-relaxed mb-8 relative z-10">
                        Ve a tu Administrador de Anuncios, haz clic en el botón de exportar y selecciona <strong className="text-slate-900">"Exportar como .csv"</strong>. Asegúrate de incluir todas las columnas de rendimiento.
                    </p>
                    <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100 flex items-center justify-center mb-2 transform group-hover:scale-105 transition-transform">
                        <div className="flex flex-col items-center gap-2">
                            <ArrowDownTrayIcon className="w-8 h-8 text-blue-400" />
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Meta_Report_2026.csv</span>
                        </div>
                    </div>
                </div>

                {/* Step 2: Google Ads */}
                <div className="bg-white p-8 rounded-[3rem] border border-slate-200 shadow-sm hover:shadow-xl transition-all group overflow-hidden relative">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 blur-2xl rounded-full -mr-12 -mt-12 group-hover:bg-emerald-500/10 transition-colors"></div>
                    <div className="w-14 h-14 bg-emerald-50 rounded-2xl flex items-center justify-center mb-6 text-2xl font-black text-emerald-600 relative z-10">
                        2
                    </div>
                    <h3 className="text-xl font-bold text-slate-900 mb-4 relative z-10">Exporta de Google Ads</h3>
                    <p className="text-slate-500 text-sm leading-relaxed mb-8 relative z-10">
                        En tu panel de campañas, selecciona el rango de fecha, haz clic en el botón de <strong className="text-slate-900 text-sm italic">Descargar</strong> y elige el formato <strong className="text-slate-900">".pdf"</strong>.
                    </p>
                    <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100 flex items-center justify-center mb-2 transform group-hover:scale-105 transition-transform">
                        <div className="flex flex-col items-center gap-2">
                            <DocumentTextIcon className="w-8 h-8 text-emerald-400" />
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Google_Ads_Data.pdf</span>
                        </div>
                    </div>
                </div>

                {/* Step 3: Analyze */}
                <div className="bg-slate-900 p-8 rounded-[3rem] shadow-2xl transition-all group overflow-hidden relative text-white">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-blue-600/20 blur-[60px] rounded-full"></div>
                    <div className="w-14 h-14 bg-blue-600 rounded-2xl flex items-center justify-center mb-6 text-2xl font-black text-white relative z-10">
                        3
                    </div>
                    <h3 className="text-xl font-bold mb-4 relative z-10">Sube y Analiza</h3>
                    <p className="text-slate-400 text-sm leading-relaxed mb-8 relative z-10">
                        Arrastra tus archivos a nuestro panel y deja que la IA procese los datos. En segundos tendrás un reporte estratégico listo para usar.
                    </p>
                    <div className="bg-white/5 rounded-2xl p-4 border border-white/10 flex items-center justify-center mb-2 transform group-hover:scale-105 transition-transform">
                        <div className="flex flex-col items-center gap-2">
                            <CloudArrowUpIcon className="w-8 h-8 text-blue-400" />
                            <span className="text-[10px] font-bold text-blue-300 uppercase tracking-widest">Procesando con IA...</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </section>
);

export default function LandingPage() {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [formStatus, setFormStatus] = useState<'idle' | 'sending' | 'success'>('idle');
    const [errorMsg, setErrorMsg] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setFormStatus('sending');
        setErrorMsg(null);

        try {
            const { data, error } = await supabase.functions.invoke('send-contact-email', {
                body: { name, email }
            });

            if (error) throw error;
            setFormStatus('success');
        } catch (error: any) {
            console.error('Error sending request:', error);
            setErrorMsg('Hubo un error al enviar tu solicitud por correo. Por favor intenta de nuevo.');
            setFormStatus('idle');
        }
    };

    return (
        <div className="bg-slate-50 min-h-screen pt-20">
            <Navbar />
            {/* Hero Section */}
            <section className="px-6 py-16 md:py-24 max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                <div className="space-y-8 text-center lg:text-left">
                    <div className="inline-flex items-center gap-2 bg-emerald-50 text-emerald-600 px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider">
                        <SparklesIcon className="w-4 h-4" />
                        Impulsado por Inteligencia Artificial
                    </div>
                    <h1 className="text-5xl md:text-7xl font-extrabold text-slate-900 leading-[1.1] tracking-tight">
                        Toma el control de tus <span className="text-blue-600">anuncios</span> con IA.
                    </h1>
                    <p className="text-slate-500 text-lg md:text-xl max-w-xl mx-auto lg:mx-0 leading-relaxed">
                        Analiza tus reportes de Google y Meta Ads en segundos. Convierte datos complejos en estrategias accionables para tu negocio.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                        <a href="#contact" className="bg-slate-900 text-white px-8 py-4 rounded-2xl font-bold text-lg hover:bg-slate-800 transition-all shadow-2xl shadow-slate-300 flex items-center justify-center gap-2">
                            Solicitar Acceso
                        </a>
                        <a href="#features" className="bg-white text-slate-600 border border-slate-200 px-8 py-4 rounded-2xl font-bold text-lg hover:bg-slate-50 transition-all flex items-center justify-center gap-2">
                            Ver Ventajas
                        </a>
                    </div>

                </div>
                <div className="relative">
                    <div className="absolute -inset-4 bg-gradient-to-tr from-blue-500/10 to-emerald-500/10 blur-3xl rounded-full"></div>
                    <img
                        src="https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&q=80&w=2426&ixlib=rb-4.0.3"
                        alt="Dashboard Preview"
                        className="rounded-[2.5rem] shadow-2xl border border-white/50 relative z-10"
                    />
                </div>
            </section>

            {/* Features Section */}
            <section id="features" className="px-6 py-24 bg-white">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-16 space-y-4">
                        <h2 className="text-3xl md:text-5xl font-extrabold text-slate-900">Diseñado para Emprendedores</h2>
                        <p className="text-slate-500 max-w-2xl mx-auto">No pierdas horas en hojas de cálculo. Deja que nuestra IA identifique dónde estás ganando y dónde estás perdiendo dinero.</p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <FeatureCard
                            icon={ShieldCheckIcon}
                            title="Análisis de ROI Real"
                            description="Entiende exactamente cuánto te cuesta cada cliente y qué campañas están impulsando tu crecimiento real."
                        />
                        <FeatureCard
                            icon={LightBulbIcon}
                            title="Insights Estratégicos"
                            description="Recibe recomendaciones personalizadas para optimizar tus presupuestos y mejorar tus conversiones."
                        />
                        <FeatureCard
                            icon={DocumentTextIcon}
                            title="Carga de Reportes Fácil"
                            description="Simplemente arrastra tu PDF de Google Ads o CSV de Meta Ads. Nosotros nos encargamos del resto."
                        />
                    </div>
                </div>
            </section>

            {/* How It Works Section */}
            <HowItWorksSection />

            {/* Pricing Section */}
            <PricingSection />

            {/* Contact Form */}
            <section id="contact" className="px-6 py-24 bg-white">
                <div className="max-w-xl mx-auto">
                    <div className="text-center mb-12 space-y-4">
                        <h2 className="text-3xl font-extrabold text-slate-900">¿Listo para escalar?</h2>
                        <p className="text-slate-500">Déjanos tus datos y te contactaremos para habilitar tu acceso personalizado.</p>
                    </div>

                    {errorMsg && (
                        <div className="mb-6 bg-rose-50 border border-rose-100 text-rose-600 px-4 py-3 rounded-xl flex items-center gap-3 text-sm font-medium">
                            <ExclamationCircleIcon className="w-5 h-5 flex-shrink-0" />
                            {errorMsg}
                        </div>
                    )}

                    {formStatus === 'success' ? (
                        <div className="bg-emerald-50 border border-emerald-100 p-8 rounded-3xl text-center space-y-4">
                            <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto">
                                <CheckCircleIcon className="w-8 h-8 text-emerald-600" />
                            </div>
                            <h3 className="text-2xl font-bold text-emerald-900">¡Solicitud Enviada!</h3>
                            <p className="text-emerald-700">Revisaremos tus datos y te enviaremos un correo muy pronto para darte acceso al sistema.</p>
                            <button onClick={() => setFormStatus('idle')} className="text-emerald-600 font-bold underline">Enviar otra solicitud</button>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-slate-700 ml-1">Nombre Completo</label>
                                <div className="relative">
                                    <UserGroupIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                                    <input
                                        required
                                        type="text"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        placeholder="Ej. Juan Pérez"
                                        className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-slate-700 ml-1">Correo Electrónico</label>
                                <div className="relative">
                                    <EnvelopeIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                                    <input
                                        required
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        placeholder="juan@tuempresa.com"
                                        className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                                    />
                                </div>
                            </div>
                            <button
                                type="submit"
                                disabled={formStatus === 'sending'}
                                className="w-full bg-slate-900 text-white py-5 rounded-2xl font-bold text-lg hover:bg-slate-800 transition-all shadow-xl shadow-slate-200 disabled:opacity-50"
                            >
                                {formStatus === 'sending' ? 'Enviando...' : 'Quiero mi acceso'}
                            </button>
                        </form>
                    )
                    }
                </div>
            </section>

            <footer className="px-6 py-12 border-t border-slate-100 text-center">
                <div className="flex items-center gap-2 justify-center mb-6">
                    <div className="bg-slate-900 p-1.5 rounded-lg">
                        <ChartBarIcon className="w-4 h-4 text-white" />
                    </div>
                    <h1 className="text-sm font-bold tracking-tight text-slate-900">Ads Hub Pro</h1>
                </div>
                <p className="text-slate-400 text-xs">© 2026 Ads Performance Hub Pro • Chile • Todos los derechos reservados</p>
            </footer>
        </div>
    );
}
