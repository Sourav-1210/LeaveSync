import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Eye, EyeOff, User, Mail, Lock, Building, ArrowRight, Briefcase, Users, Sparkles } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const ROLES = [
    {
        value: 'employee',
        icon: Briefcase,
        label: 'Employee',
        emoji: '👨‍💼',
        desc: 'Apply & track your leave requests',
        color: 'from-blue-500 to-blue-600',
        bg: 'bg-blue-50 dark:bg-blue-900/20',
        border: 'border-blue-500',
        text: 'text-blue-600 dark:text-blue-400',
    },
    {
        value: 'manager',
        icon: Users,
        label: 'Manager',
        emoji: '🧑‍💻',
        desc: 'Review & approve leave requests',
        color: 'from-violet-500 to-violet-600',
        bg: 'bg-violet-50 dark:bg-violet-900/20',
        border: 'border-violet-500',
        text: 'text-violet-600 dark:text-violet-400',
    },
];

const perks = [
    '✓ Free to get started — no card needed',
    '✓ Instant access to your dashboard',
    '✓ Leave balance tracked automatically',
    '✓ Email notifications on every update',
];

export default function RegisterPage() {
    const [searchParams] = useSearchParams();
    const [form, setForm] = useState({
        name: '', email: '', password: '', confirmPassword: '',
        role: searchParams.get('role') || 'employee', department: '',
    });
    const [showPass, setShowPass] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const { register } = useAuth();
    const navigate = useNavigate();

    const ROLE_REDIRECT = {
        admin: '/dashboard/admin',
        manager: '/dashboard/manager',
        employee: '/dashboard/employee',
    };

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
        setError('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        if (form.password !== form.confirmPassword) { setError('Passwords do not match'); return; }
        if (form.password.length < 6) { setError('Password must be at least 6 characters'); return; }
        setLoading(true);
        try {
            const { confirmPassword, ...submitData } = form;
            const user = await register(submitData);
            navigate(ROLE_REDIRECT[user.role] || '/dashboard/employee', { replace: true });
        } catch (err) {
            setError(err.response?.data?.message || 'Registration failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const selectedRole = ROLES.find(r => r.value === form.role);

    return (
        <div className="min-h-screen flex">
            {/* ── LEFT PANEL ── */}
            <div className="hidden lg:flex lg:w-5/12 relative overflow-hidden flex-col">
                <div className="absolute inset-0 bg-gradient-to-br from-teal-600 via-emerald-700 to-teal-900" />

                {/* Blobs */}
                <div className="absolute -top-20 -left-20 w-80 h-80 bg-white/10 rounded-full blur-3xl" />
                <div className="absolute -bottom-20 -right-20 w-96 h-96 bg-teal-400/20 rounded-full blur-3xl" />
                <div className="absolute top-1/3 right-0 w-48 h-48 bg-teal-300/15 rounded-full blur-2xl" />

                {/* Dot grid */}
                <div
                    className="absolute inset-0 opacity-10"
                    style={{
                        backgroundImage: 'radial-gradient(circle, #fff 1px, transparent 1px)',
                        backgroundSize: '28px 28px',
                    }}
                />

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

                    {/* Main content */}
                    <div className="my-auto">
                        <div className="inline-flex items-center gap-2 bg-white/15 backdrop-blur-sm border border-white/20 rounded-full px-4 py-1.5 mb-6">
                            <Sparkles size={12} className="text-teal-300" />
                            <span className="text-teal-100 text-xs font-semibold tracking-wide uppercase">Join 10,000+ professionals</span>
                        </div>
                        <h2 className="text-5xl font-black text-white leading-tight mb-5">
                            Start Your<br />Journey 🚀
                        </h2>
                        <p className="text-teal-100 text-lg leading-relaxed max-w-sm mb-10">
                            Create your account in seconds and experience the most effortless way to manage employee leaves.
                        </p>

                        {/* Perks */}
                        <div className="space-y-3 mb-10">
                            {perks.map(p => (
                                <div key={p} className="flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/15 rounded-xl px-4 py-2.5">
                                    <span className="text-teal-200 text-sm">{p}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Testimonial */}
                    <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-5">
                        <p className="text-green-100 text-sm italic leading-relaxed mb-3">
                            "LeaveSync cut our HR workload by 60%. Leave requests that used to take days are now approved in minutes."
                        </p>
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-gradient-to-br from-green-300 to-emerald-400 rounded-full flex items-center justify-center">
                                <span className="text-green-900 font-black text-xs">SP</span>
                            </div>
                            <div>
                                <p className="text-white font-semibold text-xs">Sneha Patel</p>
                                <p className="text-teal-300 text-xs">HR Manager, TechCorp India</p>
                            </div>
                            <div className="ml-auto flex text-yellow-400 text-xs gap-0.5">★★★★★</div>
                        </div>
                    </div>
                </div>
            </div>

            {/* ── RIGHT PANEL ── */}
            <div className="flex-1 flex items-center justify-center p-6 bg-gray-50 dark:bg-gray-950 overflow-y-auto relative">
                {/* Subtle bg accents */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-teal-100 dark:bg-teal-900/20 rounded-full blur-3xl opacity-50 translate-x-1/2 -translate-y-1/2 pointer-events-none" />
                <div className="absolute bottom-0 left-0 w-56 h-56 bg-emerald-100 dark:bg-emerald-900/20 rounded-full blur-3xl opacity-40 -translate-x-1/3 translate-y-1/3 pointer-events-none" />

                <div className="relative w-full max-w-md py-6 animate-slide-up">
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
                    <div className="mb-6">
                        <h1 className="text-3xl font-black text-gray-900 dark:text-white">Create Account</h1>
                        <p className="text-gray-500 dark:text-gray-400 mt-1 text-sm">Fill in the details below to get started</p>
                    </div>

                    {/* Card */}
                    <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-green-lg p-7 space-y-5">

                        {error && (
                            <div className="flex items-center gap-2.5 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 text-sm px-4 py-3 rounded-xl">
                                <span className="w-4 h-4 rounded-full border-2 border-red-500 flex items-center justify-center text-xs font-bold flex-shrink-0">!</span>
                                {error}
                            </div>
                        )}

                        {/* Role selector */}
                        <div className="space-y-2">
                            <label className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide">I am joining as...</label>
                            <div className="grid grid-cols-2 gap-3">
                                {ROLES.map(({ value, icon: Icon, emoji, label, desc, bg, border, text }) => (
                                    <button
                                        key={value}
                                        type="button"
                                        onClick={() => setForm({ ...form, role: value })}
                                        className={`relative p-4 rounded-xl border-2 text-left transition-all duration-200 ${form.role === value
                                            ? `${border} ${bg}`
                                            : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 bg-white dark:bg-gray-800/50'
                                            }`}
                                    >
                                        {form.role === value && (
                                            <div className="absolute top-2.5 right-2.5 w-4 h-4 bg-green-500 rounded-full flex items-center justify-center">
                                                <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                                </svg>
                                            </div>
                                        )}
                                        <span className="text-xl mb-1.5 block">{emoji}</span>
                                        <p className={`font-bold text-sm ${form.role === value ? text : 'text-gray-900 dark:text-white'}`}>{label}</p>
                                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 leading-snug">{desc}</p>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Full Name */}
                        <div className="space-y-1.5">
                            <label className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide">Full Name</label>
                            <div className="relative group">
                                <User size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-green-500 transition-colors" />
                                <input
                                    name="name" type="text" placeholder="John Doe"
                                    value={form.name} onChange={handleChange} required
                                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                                />
                            </div>
                        </div>

                        {/* Email */}
                        <div className="space-y-1.5">
                            <label className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide">Email Address</label>
                            <div className="relative group">
                                <Mail size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-green-500 transition-colors" />
                                <input
                                    name="email" type="email" placeholder="john@company.com"
                                    value={form.email} onChange={handleChange} required
                                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                                />
                            </div>
                        </div>

                        {/* Department / Role */}
                        <div className="space-y-1.5">
                            <label className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide">Role <span className="text-gray-400 normal-case font-normal">(optional)</span></label>
                            <div className="relative group">
                                <Building size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-green-500 transition-colors pointer-events-none z-10" />
                                <select
                                    name="department"
                                    value={form.department}
                                    onChange={handleChange}
                                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all appearance-none cursor-pointer"
                                >
                                    <option value="">Select department...</option>
                                    <option value="Engineering">Engineering</option>
                                    <option value="HR">HR</option>
                                    <option value="Sales">Sales</option>
                                    <option value="Finance">Finance</option>
                                    <option value="Marketing">Marketing</option>
                                    <option value="Operations">Operations</option>
                                    <option value="Design">Design</option>
                                    <option value="Product">Product</option>
                                    <option value="Legal">Legal</option>
                                    <option value="Support">Support</option>
                                </select>
                            </div>
                        </div>



                        {/* Password row */}
                        <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-1.5">
                                <label className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide">Password</label>
                                <div className="relative group">
                                    <Lock size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-green-500 transition-colors" />
                                    <input
                                        name="password" type={showPass ? 'text' : 'password'}
                                        placeholder="Min. 6 chars" value={form.password} onChange={handleChange} required
                                        className="w-full pl-9 pr-9 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                                    />
                                    <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-green-500 transition-colors">
                                        {showPass ? <EyeOff size={14} /> : <Eye size={14} />}
                                    </button>
                                </div>
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide">Confirm</label>
                                <div className="relative group">
                                    <Lock size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-green-500 transition-colors" />
                                    <input
                                        name="confirmPassword" type={showConfirm ? 'text' : 'password'}
                                        placeholder="Repeat" value={form.confirmPassword} onChange={handleChange} required
                                        className="w-full pl-9 pr-9 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                                    />
                                    <button type="button" onClick={() => setShowConfirm(!showConfirm)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-green-500 transition-colors">
                                        {showConfirm ? <EyeOff size={14} /> : <Eye size={14} />}
                                    </button>
                                </div>
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
                                <>Create Account <ArrowRight size={16} /></>
                            )}
                        </button>

                        <p className="text-center text-sm text-gray-500 dark:text-gray-400">
                            Already have an account?{' '}
                            <Link to="/login" className="text-teal-600 font-semibold hover:text-teal-700 hover:underline transition-colors">
                                Sign in
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
