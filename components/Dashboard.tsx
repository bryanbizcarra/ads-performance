
import React, { useState, useMemo, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { Campaign, DashboardStats, AnalysisSummary } from '../types';
import { parseCSV, formatCurrency, formatNumber } from '../utils/formatters';
import { generateExecutiveSummary, extractCampaignsFromPDF } from '../services/geminiService';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    ScatterChart, Scatter, ZAxis, Cell
} from 'recharts';
import {
    PlusCircleIcon,
    ArrowUpIcon,
    ArrowDownIcon,
    LightBulbIcon,
    ExclamationTriangleIcon,
    DocumentTextIcon,
    ChartBarIcon,
    ArrowDownTrayIcon,
    ChevronUpIcon,
    ChevronDownIcon,
    ArrowsUpDownIcon,
    CloudArrowUpIcon,
    SparklesIcon
} from '@heroicons/react/24/outline';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';

const KPIItem = ({ title, value, subValue, icon: Icon, colorClass }: any) => (
    <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm transition-all hover:shadow-md">
        <div className="flex justify-between items-start">
            <div>
                <p className="text-slate-500 text-sm font-medium mb-1">{title}</p>
                <h3 className="text-2xl font-bold text-slate-900">{value}</h3>
                {subValue && <p className="text-xs text-slate-400 mt-2">{subValue}</p>}
            </div>
            <div className={`p-2 rounded-xl ${colorClass}`}>
                <Icon className="w-6 h-6" />
            </div>
        </div>
    </div>
);

type SortDirection = 'asc' | 'desc' | null;
type SortKey = keyof Campaign;

export default function Dashboard() {
    const { signOut, role } = useAuth();

    // Map role to plan name for UI
    const planName = role === 'paid' ? 'Pro' : 'Trial';
    const iaLimit = role === 'paid' ? 5 : 1;

    const [campaigns, setCampaigns] = useState<Campaign[]>([]);
    const [platform, setPlatform] = useState<'meta' | 'google' | null>(null);
    const [summary, setSummary] = useState<AnalysisSummary | null>(null);
    const [loading, setLoading] = useState(false);
    const [exporting, setExporting] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [iaRequestsCount, setIaRequestsCount] = useState(0);
    const [sortConfig, setSortConfig] = useState<{ key: SortKey; direction: SortDirection }>({
        key: 'spend',
        direction: 'desc',
    });

    const dashboardRef = useRef<HTMLDivElement>(null);

    const fileToBase64 = (file: File): Promise<string> => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => {
                const base64String = (reader.result as string).split(',')[1];
                resolve(base64String);
            };
            reader.onerror = error => reject(error);
        });
    };

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, selectedPlatform: 'meta' | 'google') => {
        const file = e.target.files?.[0];
        if (!file) return;

        setLoading(true);
        try {
            if (selectedPlatform === 'google') {
                const base64 = await fileToBase64(file);
                const extractedData = await extractCampaignsFromPDF(base64);
                setCampaigns(extractedData);
            } else {
                const text = await file.text();
                const parsedData = parseCSV(text, 'meta');
                setCampaigns(parsedData);
            }
            setPlatform(selectedPlatform);
            setSummary(null);
        } catch (error) {
            alert("Error al procesar el archivo. Por favor, asegúrate de que sea un reporte válido.");
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleSort = (key: SortKey) => {
        let direction: SortDirection = 'desc';
        if (sortConfig.key === key && sortConfig.direction === 'desc') direction = 'asc';
        else if (sortConfig.key === key && sortConfig.direction === 'asc') direction = null;
        setSortConfig({ key, direction });
    };

    const stats = useMemo((): DashboardStats => {
        if (campaigns.length === 0) return {
            totalSpend: 0, totalResults: 0, avgCostPerResult: 0,
            starCampaign: null, underperformingCampaigns: [], platform: 'meta'
        };

        const totalSpend = campaigns.reduce((acc, c) => acc + c.spend, 0);
        const totalResults = campaigns.reduce((acc, c) => acc + c.results, 0);
        const avgCostPerResult = totalResults > 0 ? totalSpend / totalResults : 0;

        const star = [...campaigns].sort((a, b) => {
            if (b.results !== a.results) return b.results - a.results;
            return a.costPerResult - b.costPerResult;
        })[0];

        const underperforming = campaigns.filter(c => c.costPerResult > avgCostPerResult * 1.2);

        return { totalSpend, totalResults, avgCostPerResult, starCampaign: star, underperformingCampaigns: underperforming, platform: platform || 'meta' };
    }, [campaigns, platform]);

    const filteredAndSortedCampaigns = useMemo(() => {
        let result = campaigns.filter(c => c.name.toLowerCase().includes(searchTerm.toLowerCase()));
        if (sortConfig.key && sortConfig.direction) {
            result.sort((a, b) => {
                const valA = a[sortConfig.key];
                const valB = b[sortConfig.key];
                if (typeof valA === 'string' && typeof valB === 'string') {
                    return sortConfig.direction === 'asc' ? valA.localeCompare(valB) : valB.localeCompare(valA);
                }
                if (typeof valA === 'number' && typeof valB === 'number') {
                    return sortConfig.direction === 'asc' ? valA - valB : valB - valA;
                }
                return 0;
            });
        }
        return result;
    }, [campaigns, searchTerm, sortConfig]);

    const fetchSummary = async () => {
        if (iaRequestsCount >= iaLimit) {
            alert(`Has alcanzado el límite diario de tu Plan ${planName} (${iaLimit} reporte). Actualiza a Pro para más análisis.`);
            return;
        }
        setLoading(true);
        const result = await generateExecutiveSummary(stats, campaigns);
        setSummary(result);
        setIaRequestsCount(prev => prev + 1);
        setLoading(false);
    };

    const exportPDF = async () => {
        if (role === 'trial') {
            alert("El Plan Trial no permite exportar informes a PDF. ¡Pásate al Plan Pro!");
            return;
        }
        if (!dashboardRef.current) return;
        setExporting(true);
        try {
            const element = dashboardRef.current;
            const canvas = await html2canvas(element, {
                scale: 2,
                useCORS: true,
                backgroundColor: '#f8fafc',
                windowWidth: element.scrollWidth,
                scrollY: -window.scrollY
            });
            const imgData = canvas.toDataURL('image/png', 1.0);
            const pdf = new jsPDF('p', 'mm', 'a4');
            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = pdf.internal.pageSize.getHeight();
            const ratio = pdfWidth / (canvas.width / 2);
            const totalImgHeightInPDF = (canvas.height / 2) * ratio;
            let heightLeft = totalImgHeightInPDF;
            let position = 0;
            pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, totalImgHeightInPDF, undefined, 'FAST');
            heightLeft -= pdfHeight;
            while (heightLeft > 0) {
                position = heightLeft - totalImgHeightInPDF;
                pdf.addPage();
                pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, totalImgHeightInPDF, undefined, 'FAST');
                heightLeft -= pdfHeight;
            }
            pdf.save(`Reporte-${platform === 'google' ? 'Google' : 'Meta'}-${new Date().toISOString().split('T')[0]}.pdf`);
        } catch (error) {
            console.error('Error al exportar PDF:', error);
            window.print();
        } finally {
            setExporting(false);
        }
    };

    const SortIcon = ({ column }: { column: SortKey }) => {
        if (sortConfig.key !== column || !sortConfig.direction) return <ArrowsUpDownIcon className="w-3 h-3 opacity-30" />;
        return sortConfig.direction === 'asc' ? <ChevronUpIcon className="w-3 h-3 text-blue-600" /> : <ChevronDownIcon className="w-3 h-3 text-blue-600" />;
    };

    const resultsLabel = platform === 'google' ? 'Conversiones' : 'Resultados';
    const spendLabel = platform === 'google' ? 'Costo' : 'Importe Gastado';

    return (
        <div className="min-h-screen flex flex-col bg-slate-50">
            <nav className="bg-white border-b border-slate-200 sticky top-0 z-50 px-6 py-4 flex items-center justify-between no-print">
                <div className="flex items-center gap-2 cursor-pointer" onClick={() => { setCampaigns([]); setPlatform(null); setSummary(null); }}>
                    <div className="bg-slate-900 p-2 rounded-lg">
                        <ChartBarIcon className="w-6 h-6 text-white" />
                    </div>
                    <div>
                        <h1 className="text-xl font-bold tracking-tight text-slate-900">Ads Hub Pro</h1>
                        <p className="text-[10px] uppercase tracking-widest text-slate-400 font-semibold">Dashboard</p>
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    <span className={`text-[10px] uppercase font-bold tracking-widest px-3 py-1 rounded-full ${role === 'paid' ? 'bg-blue-100 text-blue-600' : 'bg-slate-100 text-slate-500'}`}>
                        Plan {planName}
                    </span>
                    <button onClick={signOut} className="text-sm font-bold text-slate-400 hover:text-slate-600 transition-colors mr-4">Cerrar Sesión</button>
                    {campaigns.length > 0 && (
                        <button
                            onClick={exportPDF}
                            disabled={exporting}
                            className="bg-slate-900 hover:bg-slate-800 text-white px-4 py-2 rounded-xl text-sm font-semibold transition-all flex items-center gap-2 shadow-lg disabled:opacity-50"
                        >
                            {exporting ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div> : <ArrowDownTrayIcon className="w-5 h-5" />}
                            {exporting ? 'Generando...' : 'Exportar PDF'}
                        </button>
                    )}
                </div>
            </nav>

            {/* Loading Overlay */}
            {loading && (
                <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] flex flex-col items-center justify-center text-white no-print">
                    <div className="bg-white p-10 rounded-3xl shadow-2xl flex flex-col items-center max-w-sm text-center">
                        <div className="w-16 h-16 border-4 border-slate-100 border-t-blue-600 rounded-full animate-spin mb-6"></div>
                        <h3 className="text-xl font-bold text-slate-900 mb-2">Procesando con IA</h3>
                        <p className="text-slate-500 text-sm">Estamos analizando tu informe para extraer hasta el último dato de rendimiento. Un momento...</p>
                    </div>
                </div>
            )}

            <main ref={dashboardRef} className="flex-1 max-w-7xl w-full mx-auto p-6 space-y-8 bg-slate-50">
                {campaigns.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-[75vh] text-center no-print">
                        <div className="mb-10 space-y-4">
                            <h2 className="text-4xl font-extrabold text-slate-900">Panel de Control Inteligente</h2>
                            <p className="text-slate-500 text-lg max-w-2xl mx-auto">Selecciona tu plataforma y sube el reporte para comenzar el análisis estratégico.</p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-4xl">
                            {/* Meta Card */}
                            <label className="group relative flex flex-col items-center p-10 bg-white border-2 border-dashed border-slate-200 rounded-[2.5rem] hover:border-blue-500 hover:shadow-2xl hover:-translate-y-1 transition-all cursor-pointer overflow-hidden">
                                <div className="absolute inset-0 bg-gradient-to-b from-blue-50/0 to-blue-50/0 group-hover:to-blue-50/50 transition-all"></div>
                                <div className="bg-blue-50 w-24 h-24 rounded-3xl flex items-center justify-center mb-8 group-hover:scale-110 transition-transform relative z-10">
                                    <svg className="w-12 h-12 text-blue-600" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.477 2 2 6.477 2 12c0 5.01 3.657 9.128 8.438 9.879V14.89h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 17.01 22 12c0-5.523-4.477-10-10-10z" /></svg>
                                </div>
                                <h3 className="text-2xl font-bold text-slate-900 mb-2 relative z-10">Meta Ads</h3>
                                <p className="text-slate-400 text-sm mb-10 max-w-[200px] relative z-10">Sube tu reporte en formato **CSV**</p>
                                <div className="flex items-center gap-2 bg-slate-900 text-white px-8 py-4 rounded-2xl font-bold shadow-xl group-hover:bg-blue-600 transition-colors relative z-10">
                                    <CloudArrowUpIcon className="w-6 h-6" />
                                    <span>Cargar CSV</span>
                                </div>
                                <input type="file" accept=".csv" onChange={(e) => handleFileUpload(e, 'meta')} className="hidden" />
                            </label>

                            {/* Google Card */}
                            <label className="group relative flex flex-col items-center p-10 bg-white border-2 border-dashed border-slate-200 rounded-[2.5rem] hover:border-emerald-500 hover:shadow-2xl hover:-translate-y-1 transition-all cursor-pointer overflow-hidden">
                                <div className="absolute inset-0 bg-gradient-to-b from-emerald-50/0 to-emerald-50/0 group-hover:to-emerald-50/50 transition-all"></div>
                                <div className="bg-emerald-50 w-24 h-24 rounded-3xl flex items-center justify-center mb-8 group-hover:scale-110 transition-transform relative z-10">
                                    <svg className="w-12 h-12 text-emerald-600" fill="currentColor" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" /><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" /><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" /><path d="M12 5.38c1.62 0 3.06.56 4.21 1.66l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" /></svg>
                                </div>
                                <h3 className="text-2xl font-bold text-slate-900 mb-2 relative z-10">Google Ads</h3>
                                <p className="text-slate-400 text-sm mb-10 max-w-[200px] relative z-10">Sube tu reporte en formato **PDF**</p>
                                <div className="flex items-center gap-2 bg-slate-900 text-white px-8 py-4 rounded-2xl font-bold shadow-xl group-hover:bg-emerald-600 transition-colors relative z-10">
                                    <DocumentTextIcon className="w-6 h-6" />
                                    <span>Cargar PDF</span>
                                </div>
                                <input type="file" accept=".pdf" onChange={(e) => handleFileUpload(e, 'google')} className="hidden" />
                            </label>
                        </div>
                    </div>
                ) : (
                    <>
                        <div className="flex items-center justify-between no-print">
                            <div className="flex items-center gap-3">
                                <span className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider flex items-center gap-2 ${platform === 'google' ? 'bg-emerald-100 text-emerald-700' : 'bg-blue-100 text-blue-700'}`}>
                                    <div className={`w-2 h-2 rounded-full ${platform === 'google' ? 'bg-emerald-500' : 'bg-blue-500'}`}></div>
                                    Analizando {platform === 'google' ? 'Google Ads' : 'Meta Ads'}
                                </span>
                                <button onClick={() => { setCampaigns([]); setPlatform(null); }} className="text-slate-400 hover:text-slate-600 text-xs font-semibold underline">Cambiar informe</button>
                            </div>
                            <p className="text-slate-400 text-xs font-medium italic">Análisis inteligente completado</p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <KPIItem title={spendLabel} value={formatCurrency(stats.totalSpend)} subValue="Inversión total detectada" icon={ArrowUpIcon} colorClass="bg-slate-50 text-slate-600" />
                            <KPIItem title={resultsLabel} value={formatNumber(stats.totalResults)} subValue="Acciones valiosas registradas" icon={PlusCircleIcon} colorClass="bg-emerald-50 text-emerald-600" />
                            <KPIItem title="CPA Promedio" value={formatCurrency(stats.avgCostPerResult)} subValue="Costo por cada conversión" icon={ArrowDownIcon} colorClass="bg-indigo-50 text-indigo-600" />
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            <div className="bg-emerald-50 border border-emerald-100 p-6 rounded-2xl flex gap-4 shadow-sm">
                                <div className="bg-emerald-100 p-2 rounded-lg self-start"><LightBulbIcon className="w-6 h-6 text-emerald-600" /></div>
                                <div>
                                    <h4 className="font-bold text-emerald-900 text-lg mb-1">Activo Ganador</h4>
                                    <p className="text-emerald-700 leading-relaxed">"{stats.starCampaign?.name}" lidera el periodo con un CPA de {formatCurrency(stats.starCampaign?.costPerResult || 0)}.</p>
                                </div>
                            </div>
                            <div className="bg-rose-50 border border-rose-100 p-6 rounded-2xl flex gap-4 shadow-sm">
                                <div className="bg-rose-100 p-2 rounded-lg self-start"><ExclamationTriangleIcon className="w-6 h-6 text-rose-600" /></div>
                                <div>
                                    <h4 className="font-bold text-rose-900 text-lg mb-1">Optimización Necesaria</h4>
                                    {stats.underperformingCampaigns.length > 0 ? (
                                        <p className="text-rose-700 leading-relaxed">"{stats.underperformingCampaigns[0].name}" excede el CPA promedio en un {((stats.underperformingCampaigns[0].costPerResult / stats.avgCostPerResult - 1) * 100).toFixed(0)}%.</p>
                                    ) : <p className="text-rose-700">El rendimiento de todas las campañas activas es óptimo.</p>}
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                            <div className="lg:col-span-2 bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
                                <h3 className="font-bold text-slate-900 text-lg mb-8">Volumen de {resultsLabel}</h3>
                                <div className="h-80">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart data={campaigns.slice(0, 8)}>
                                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                            <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 10 }} height={60} interval={0} angle={-15} textAnchor="end" />
                                            <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} />
                                            <Tooltip contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                                            <Bar dataKey="results" radius={[6, 6, 0, 0]} isAnimationActive={!exporting}>
                                                {campaigns.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.id === stats.starCampaign?.id ? '#10b981' : (platform === 'google' ? '#059669' : '#3b82f6')} />)}
                                            </Bar>
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>
                            <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
                                <h3 className="font-bold text-slate-900 text-lg mb-8">Eficiencia vs Inversión</h3>
                                <div className="h-80">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                                            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                                            <XAxis type="number" dataKey="spend" name="Inversión" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 10 }} />
                                            <YAxis type="number" dataKey="results" name={resultsLabel} axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 10 }} />
                                            <ZAxis type="number" dataKey="costPerResult" range={[50, 400]} />
                                            <Tooltip cursor={{ strokeDasharray: '3 3' }} />
                                            <Scatter name="Campañas" data={campaigns} isAnimationActive={!exporting}>
                                                {campaigns.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.costPerResult < stats.avgCostPerResult ? '#10b981' : '#f43f5e'} />)}
                                            </Scatter>
                                        </ScatterChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>
                        </div>

                        <div className="bg-slate-900 p-8 rounded-3xl text-white shadow-2xl relative overflow-hidden">
                            <div className="relative z-10">
                                <div className="flex items-center gap-3 mb-6">
                                    <div className="bg-blue-600 p-2 rounded-xl text-white"><SparklesIcon className="w-6 h-6" /></div>
                                    <h3 className="text-2xl font-bold">Resumen Estratégico IA</h3>
                                </div>
                                {summary ? (
                                    <div className="space-y-6">
                                        <p className="text-slate-300 text-lg leading-relaxed max-w-4xl italic">"{summary.overview}"</p>
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-4">
                                            <div className="bg-white/5 p-5 rounded-2xl border border-white/10">
                                                <h5 className="text-emerald-400 font-bold mb-3 flex items-center gap-2">
                                                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-400"></div>
                                                    Fortalezas
                                                </h5>
                                                <ul className="space-y-2 text-sm text-slate-300">{summary.strengths.map((s, i) => <li key={i}>• {s}</li>)}</ul>
                                            </div>
                                            <div className="bg-white/5 p-5 rounded-2xl border border-white/10">
                                                <h5 className="text-rose-400 font-bold mb-3 flex items-center gap-2">
                                                    <div className="w-1.5 h-1.5 rounded-full bg-rose-400"></div>
                                                    Riesgos
                                                </h5>
                                                <ul className="space-y-2 text-sm text-slate-300">{summary.weaknesses.map((w, i) => <li key={i}>• {w}</li>)}</ul>
                                            </div>
                                            <div className="bg-blue-400/10 p-5 rounded-2xl border border-blue-400/20">
                                                <h5 className="text-blue-400 font-bold mb-3 flex items-center gap-2">
                                                    <div className="w-1.5 h-1.5 rounded-full bg-blue-400"></div>
                                                    Recomendaciones
                                                </h5>
                                                <ul className="space-y-2 text-sm text-slate-200">{summary.recommendations.map((r, i) => <li key={i}>→ {r}</li>)}</ul>
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="flex flex-col items-center py-12 text-center no-print">
                                        <p className="text-slate-400 mb-6">Genera un análisis profundo de tu ROI basado en el informe cargado.</p>
                                        <button onClick={fetchSummary} disabled={loading} className="bg-white text-slate-900 px-8 py-3 rounded-2xl font-bold hover:bg-slate-100 flex items-center gap-3 disabled:opacity-50 transition-all shadow-xl shadow-black/20">
                                            {loading ? <div className="w-5 h-5 border-2 border-slate-900 border-t-transparent rounded-full animate-spin"></div> : <LightBulbIcon className="w-5 h-5" />}
                                            {loading ? 'Analizando...' : 'Analizar Rendimiento con IA'}
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden mb-12">
                            <div className="p-6 border-b border-slate-50 flex flex-col md:flex-row md:items-center justify-between gap-4 no-print">
                                <h3 className="font-bold text-slate-900 text-lg">Detalle por Campaña</h3>
                                <input type="text" placeholder="Buscar campaña..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-4 pr-4 py-2 bg-slate-50 border rounded-xl text-sm w-full md:w-64 outline-none focus:ring-2 focus:ring-slate-900/10" />
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full text-left text-sm">
                                    <thead>
                                        <tr className="bg-slate-50/50 text-slate-500 text-[10px] uppercase font-bold tracking-widest border-b">
                                            <th className="px-6 py-4 cursor-pointer" onClick={() => handleSort('name')}>Campaña <SortIcon column="name" /></th>
                                            <th className="px-6 py-4 cursor-pointer" onClick={() => handleSort('results')}>{resultsLabel} <SortIcon column="results" /></th>
                                            <th className="px-6 py-4 cursor-pointer" onClick={() => handleSort('costPerResult')}>CPA <SortIcon column="costPerResult" /></th>
                                            <th className="px-6 py-4 cursor-pointer" onClick={() => handleSort('spend')}>{spendLabel} <SortIcon column="spend" /></th>
                                            <th className="px-6 py-4 text-slate-400">Imp.</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-50">
                                        {filteredAndSortedCampaigns.map((c) => (
                                            <tr key={c.id} className="hover:bg-slate-50 transition-colors">
                                                <td className="px-6 py-4 font-semibold text-slate-900 max-w-xs truncate">{c.name}</td>
                                                <td className="px-6 py-4">{formatNumber(c.results)}</td>
                                                <td className="px-6 py-4">
                                                    <span className={`px-2 py-1 rounded-lg font-bold ${c.costPerResult > stats.avgCostPerResult * 1.1 ? 'bg-rose-50 text-rose-600' : 'bg-emerald-50 text-emerald-600'}`}>
                                                        {formatCurrency(c.costPerResult)}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 font-medium text-slate-600">{formatCurrency(c.spend)}</td>
                                                <td className="px-6 py-4 text-slate-400">{formatNumber(c.reach)}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </>
                )}
            </main>

            <footer className="bg-white border-t border-slate-100 py-8 px-6 no-print text-center">
                <p className="text-slate-400 text-xs">Ads Hub Pro Dashboard • {new Date().getFullYear()}</p>
            </footer>
        </div>
    );
}
