import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Mail, Lock, ArrowRight, CheckCircle, BarChart2, Shield, Clock } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const features = [
    { icon: CheckCircle, title: 'Smart Leave Tracking', desc: 'Effortlessly track and manage every leave request in real time.' },
    { icon: BarChart2, title: 'Analytics & Reports', desc: 'Visual dashboards with insightful leave analytics at a glance.' },
    { icon: Shield, title: 'Role-Based Access', desc: 'Secure access for Admins, Managers, and Employees.' },
    { icon: Clock, title: 'Instant Approvals', desc: 'Approve or reject requests with one click, anytime.' },
];

const stats = [
    { value: '10k+', label: 'Employees Managed' },
    { value: '98%', label: 'Approval Rate' },
    { value: '5min', label: 'Avg Response Time' },
];

export default function LoginPage() {
    const [form, setForm] = useState({ email: '', password: '' });
    const [showPass, setShowPass] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const { login } = useAuth();
    const navigate = useNavigate();

    const ROLE_REDIRECT = {
        admin: '/dashboard/admin',
        manager: '/dashboard/manager',
        employee: '/dashboard/employee',
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            const user = await login(form.email, form.password);
            navigate(ROLE_REDIRECT[user.role] || '/dashboard/employee', { replace: true });
        } catch (err) {
            setError(err.response?.data?.message || 'Login failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex">
            {/* ── LEFT PANEL ── */}
            <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden flex-col">
                {/* Gradient background */}
                <div className="absolute inset-0 bg-gradient-to-br from-teal-600 via-emerald-700 to-teal-900" />

                {/* Decorative blobs */}
                <div className="absolute top-0 left-0 w-80 h-80 bg-white/10 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
                <div className="absolute bottom-0 right-0 w-96 h-96 bg-teal-400/20 rounded-full blur-3xl translate-x-1/3 translate-y-1/3" />
                <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-teal-300/10 rounded-full blur-2xl -translate-x-1/2 -translate-y-1/2" />

                {/* Dot grid pattern */}
                <div
                    className="absolute inset-0 opacity-10"
                    style={{
                        backgroundImage: 'radial-gradient(circle, #fff 1px, transparent 1px)',
                        backgroundSize: '28px 28px',
                    }}
                />

                {/* Content */}
                <div className="relative z-10 flex flex-col h-full p-12">
                    {/* Logo */}
                    <div className="flex items-center gap-3 mb-12">
                        <div className="w-11 h-11 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center border border-white/30 shadow-lg">
                            <svg viewBox="0 0 24 24" fill="none" className="w-6 h-6" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                                <rect x="3" y="4" width="18" height="18" rx="3" fill="white" fillOpacity="0.15" stroke="white" strokeWidth="1.8" />
                                <path d="M3 9h18" stroke="white" strokeWidth="1.8" />
                                <path d="M8 2v4M16 2v4" stroke="white" strokeWidth="1.8" />
                                <path d="M8.5 14.5l2.5 2.5 4.5-4.5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                        </div>
                        <div>
                            <span className="text-white font-black text-xl tracking-tight block leading-none">LeaveSync</span>
                            <span className="text-teal-200 text-xs font-medium">Smart Leave Management</span>
                        </div>
                    </div>

                    {/* Hero text */}
                    <div className="my-auto">
                        <div className="inline-flex items-center gap-2 bg-white/15 backdrop-blur-sm border border-white/20 rounded-full px-4 py-1.5 mb-6">
                            <span className="w-2 h-2 bg-teal-300 rounded-full animate-pulse" />
                            <span className="text-teal-100 text-xs font-semibold tracking-wide uppercase">Trusted by 500+ companies</span>
                        </div>
                        <h2 className="text-5xl font-black text-white leading-tight mb-5">
                            Welcome<br />Back! 👋
                        </h2>
                        <p className="text-teal-100 text-lg leading-relaxed max-w-sm mb-10">
                            Your smart leave management dashboard is one step away. Sign in and stay in control.
                        </p>

                        {/* Feature cards */}
                        <div className="space-y-3">
                            {features.map(({ icon: Icon, title, desc }) => (
                                <div key={title} className="flex items-start gap-3 bg-white/10 backdrop-blur-sm border border-white/15 rounded-2xl p-4">
                                    <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                                        <Icon size={15} className="text-teal-200" />
                                    </div>
                                    <div>
                                        <p className="text-white font-semibold text-sm">{title}</p>
                                        <p className="text-teal-200 text-xs leading-relaxed mt-0.5">{desc}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Stats row */}
                    <div className="mt-10 grid grid-cols-3 gap-4 border-t border-white/20 pt-8">
                        {stats.map(({ value, label }) => (
                            <div key={label} className="text-center">
                                <p className="text-2xl font-black text-white">{value}</p>
                                <p className="text-teal-200 text-xs mt-1">{label}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* ── RIGHT PANEL ── */}
            <div className="flex-1 flex items-center justify-center p-6 bg-gray-50 dark:bg-gray-950 relative overflow-hidden">
                {/* Subtle bg accent */}
                <div className="absolute top-0 right-0 w-72 h-72 bg-teal-100 dark:bg-teal-900/20 rounded-full blur-3xl opacity-50 translate-x-1/2 -translate-y-1/2" />
                <div className="absolute bottom-0 left-0 w-56 h-56 bg-emerald-100 dark:bg-emerald-900/20 rounded-full blur-3xl opacity-40 -translate-x-1/3 translate-y-1/3" />

                <div className="relative w-full max-w-md animate-slide-up">
                    {/* Mobile logo */}
                    <div className="flex items-center justify-center gap-2 lg:hidden mb-8">
                        <div className="w-9 h-9 bg-gradient-to-br from-teal-500 to-emerald-600 rounded-xl flex items-center justify-center shadow-green-md">
                            <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                                <rect x="3" y="4" width="18" height="18" rx="3" fill="white" fillOpacity="0.15" stroke="white" strokeWidth="1.8" />
                                <path d="M3 9h18" stroke="white" strokeWidth="1.8" />
                                <path d="M8 2v4M16 2v4" stroke="white" strokeWidth="1.8" />
                                <path d="M8.5 14.5l2.5 2.5 4.5-4.5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                        </div>
                        <span className="text-gray-900 dark:text-white font-black text-lg">LeaveSync</span>
                    </div>

                    {/* Header */}
                    <div className="mb-8">
                        <h1 className="text-3xl font-black text-gray-900 dark:text-white">Sign in</h1>
                        <p className="text-gray-500 dark:text-gray-400 mt-1 text-sm">Access your leave management dashboard</p>
                    </div>

                    {/* Card */}
                    <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-green-lg p-7 space-y-5">

                        {error && (
                            <div className="flex items-center gap-2.5 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 text-sm px-4 py-3 rounded-xl">
                                <span className="w-4 h-4 rounded-full border-2 border-red-500 flex items-center justify-center text-xs font-bold flex-shrink-0">!</span>
                                {error}
                            </div>
                        )}

                        {/* Email */}
                        <div className="space-y-1.5">
                            <label className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide">Email Address</label>
                            <div className="relative group">
                                <Mail size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-green-500 transition-colors" />
                                <input
                                    type="email"
                                    placeholder="john@company.com"
                                    value={form.email}
                                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                                    required
                                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                                />
                            </div>
                        </div>

                        {/* Password */}
                        <div className="space-y-1.5">
                            <label className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide">Password</label>
                            <div className="relative group">
                                <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-green-500 transition-colors" />
                                <input
                                    type={showPass ? 'text' : 'password'}
                                    placeholder="••••••••"
                                    value={form.password}
                                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                                    required
                                    className="w-full pl-10 pr-11 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPass(!showPass)}
                                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-green-500 transition-colors"
                                >
                                    {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
                                </button>
                            </div>
                        </div>

                        {/* Submit */}
                        <button
                            type="button"
                            onClick={handleSubmit}
                            disabled={loading}
                            className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl bg-gradient-to-r from-teal-500 to-emerald-600 hover:from-teal-600 hover:to-emerald-700 text-white font-bold text-sm shadow-green-md hover:shadow-green-lg transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed mt-1"
                        >
                            {loading ? (
                                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            ) : (
                                <>Sign In <ArrowRight size={16} /></>
                            )}
                        </button>

                        <p className="text-center text-sm text-gray-500 dark:text-gray-400">
                            Don't have an account?{' '}
                            <Link to="/register" className="text-teal-600 font-semibold hover:text-teal-700 hover:underline transition-colors">
                                Register here
                            </Link>
                        </p>
                    </div>


                </div>
            </div>
        </div>
    );
}
