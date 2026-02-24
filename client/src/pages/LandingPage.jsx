import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import {
    Sun, Moon, CheckCircle, Clock, Users, BarChart2, Shield,
    Zap, ChevronRight, ArrowRight, Calendar, Bell, FileText,
    Star, Twitter, Github, Linkedin, Mail, Menu, X
} from 'lucide-react';

/* ─── Animated counter hook ─── */
function useCounter(target, duration = 1800, start = false) {
    const [count, setCount] = useState(0);
    useEffect(() => {
        if (!start) return;
        let startTime = null;
        const step = (ts) => {
            if (!startTime) startTime = ts;
            const progress = Math.min((ts - startTime) / duration, 1);
            setCount(Math.floor(progress * target));
            if (progress < 1) requestAnimationFrame(step);
        };
        requestAnimationFrame(step);
    }, [target, duration, start]);
    return count;
}

/* ─── Intersection Observer hook ─── */
function useInView(threshold = 0.15) {
    const ref = useRef(null);
    const [inView, setInView] = useState(false);
    useEffect(() => {
        const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setInView(true); }, { threshold });
        if (ref.current) obs.observe(ref.current);
        return () => obs.disconnect();
    }, [threshold]);
    return [ref, inView];
}

/* ─── Stat card ─── */
function StatCard({ target, suffix, label, color }) {
    const [ref, inView] = useInView();
    const count = useCounter(target, 1800, inView);
    return (
        <div ref={ref} style={{ transitionDelay: '100ms' }}
            className={`text-center transition-all duration-700 ${inView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
            <p className={`text-4xl lg:text-5xl font-black ${color}`}>{count.toLocaleString()}{suffix}</p>
            <p className="text-gray-500 dark:text-gray-400 text-sm mt-1 font-medium">{label}</p>
        </div>
    );
}

/* ─── Feature card ─── */
function FeatureCard({ icon: Icon, title, desc, color, delay }) {
    const [ref, inView] = useInView();
    return (
        <div ref={ref}
            style={{ transitionDelay: `${delay}ms` }}
            className={`group relative p-6 rounded-2xl border bg-white dark:bg-gray-900 border-gray-100 dark:border-gray-800 hover:border-green-300 dark:hover:border-green-700 hover:shadow-xl hover:shadow-green-100 dark:hover:shadow-green-900/20 transition-all duration-500 cursor-default ${inView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${color} group-hover:scale-110 transition-transform duration-300`}>
                <Icon size={22} className="text-white" />
            </div>
            <h3 className="font-bold text-gray-900 dark:text-white text-lg mb-2">{title}</h3>
            <p className="text-gray-500 dark:text-gray-400 text-sm leading-relaxed">{desc}</p>
        </div>
    );
}

/* ─── Step card ─── */
function StepCard({ number, title, desc, delay }) {
    const [ref, inView] = useInView();
    return (
        <div ref={ref} style={{ transitionDelay: `${delay}ms` }}
            className={`flex gap-4 transition-all duration-700 ${inView ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-8'}`}>
            <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center text-white font-black text-sm shadow-lg shadow-green-200 dark:shadow-green-900">
                {number}
            </div>
            <div>
                <h4 className="font-bold text-gray-900 dark:text-white mb-1">{title}</h4>
                <p className="text-gray-500 dark:text-gray-400 text-sm leading-relaxed">{desc}</p>
            </div>
        </div>
    );
}

/* ─── Testimonial card ─── */
function TestimonialCard({ name, role, company, text, avatar, delay }) {
    const [ref, inView] = useInView();
    return (
        <div ref={ref} style={{ transitionDelay: `${delay}ms` }}
            className={`p-6 rounded-2xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 shadow-sm hover:shadow-lg transition-all duration-500 ${inView ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`}>
            <div className="flex gap-1 mb-3">
                {[...Array(5)].map((_, i) => <Star key={i} size={14} className="text-amber-400 fill-amber-400" />)}
            </div>
            <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed mb-4">"{text}"</p>
            <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-green-400 to-emerald-600 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                    {avatar}
                </div>
                <div>
                    <p className="font-semibold text-gray-900 dark:text-white text-sm">{name}</p>
                    <p className="text-xs text-gray-400">{role}, {company}</p>
                </div>
            </div>
        </div>
    );
}

const FEATURES = [
    { icon: Calendar, title: 'Smart Leave Requests', desc: 'Employees can apply for any leave type with date picker, reason field, and instant submission in seconds.', color: 'bg-gradient-to-br from-green-500 to-emerald-600', delay: 0 },
    { icon: CheckCircle, title: 'One-Click Approval', desc: 'Managers get instant notifications and can approve or reject requests with optional comments in one click.', color: 'bg-gradient-to-br from-blue-500 to-blue-700', delay: 100 },
    { icon: BarChart2, title: 'Analytics Dashboard', desc: 'Visualize leave trends, approval rates, and team availability with beautiful Chart.js powered dashboards.', color: 'bg-gradient-to-br from-purple-500 to-purple-700', delay: 200 },
    { icon: Shield, title: 'Role-Based Access', desc: 'Three-tier security: Employees, Managers, and Admins each see only what they need — nothing more.', color: 'bg-gradient-to-br from-orange-500 to-red-600', delay: 300 },
    { icon: Bell, title: 'Real-Time Notifications', desc: 'Toast notifications keep everyone up to date on leave status changes, approvals, and rejections instantly.', color: 'bg-gradient-to-br from-pink-500 to-rose-600', delay: 400 },
    { icon: Zap, title: 'Lightning Fast', desc: 'Built on React 19 + Vite, the entire UI loads in under a second. No lag. No frustration. Just speed.', color: 'bg-gradient-to-br from-amber-500 to-yellow-600', delay: 500 },
];

const STEPS = [
    { number: '01', title: 'Create your account', desc: 'Register as Employee, Manager, or Admin. Role-specific dashboard loads automatically after login.' },
    { number: '02', title: 'Apply for leave', desc: 'Choose leave type, pick dates, add a reason, and submit your leave request in under 30 seconds.' },
    { number: '03', title: 'Manager reviews request', desc: 'Your manager gets notified, reviews your request, and approves or rejects it with a comment.' },
    { number: '04', title: 'Track your status', desc: 'Check your leave history, see real-time status updates, and plan your time off with confidence.' },
];

const TESTIMONIALS = [
    { name: 'Priya Mehta', role: 'HR Manager', company: 'TechCorp', text: 'LeaveSync cut our leave processing time by 80%. Our employees love how simple it is to apply and track.', avatar: 'P', delay: 0 },
    { name: 'Rahul Singh', role: 'Team Lead', company: 'Infosys', text: 'Finally, a leave management tool that actually makes sense. Clean UI, fast approvals, zero confusion.', avatar: 'R', delay: 150 },
    { name: 'Ananya Gupta', role: 'Software Engineer', company: 'Wipro', text: 'Applying for leave used to be a nightmare. With LeaveSync, I do it in seconds directly from my dashboard.', avatar: 'A', delay: 300 },
];

export default function LandingPage() {
    const { dark: isDark, toggle: toggleTheme } = useTheme();
    const [scrolled, setScrolled] = useState(false);
    const [menuOpen, setMenuOpen] = useState(false);
    const [heroVisible, setHeroVisible] = useState(false);

    useEffect(() => {
        setTimeout(() => setHeroVisible(true), 80);
        const onScroll = () => setScrolled(window.scrollY > 20);
        window.addEventListener('scroll', onScroll);
        return () => window.removeEventListener('scroll', onScroll);
    }, []);

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-950 transition-colors duration-300">

            {/* ── NAVBAR ── */}
            <nav className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 ${scrolled ? 'bg-white/90 dark:bg-gray-950/90 backdrop-blur-xl shadow-sm border-b border-gray-100 dark:border-gray-800' : 'bg-transparent'}`}>
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16">
                        {/* Logo */}
                        <Link to="/" className="flex items-center gap-2.5">
                            <div className="w-8 h-8 bg-gradient-to-br from-teal-500 to-emerald-700 rounded-xl flex items-center justify-center shadow-lg shadow-teal-200 dark:shadow-teal-900">
                                <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                                    <rect x="3" y="4" width="18" height="18" rx="3" fill="white" fillOpacity="0.2" stroke="white" strokeWidth="1.8" />
                                    <path d="M3 9h18" stroke="white" strokeWidth="1.8" />
                                    <path d="M8 2v4M16 2v4" stroke="white" strokeWidth="1.8" />
                                    <path d="M8.5 14.5l2 2 4-4" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                            </div>
                            <span className="font-black text-gray-900 dark:text-white text-lg">LeaveSync</span>
                        </Link>

                        {/* Desktop links */}
                        <div className="hidden md:flex items-center gap-8">
                            {['Features', 'How It Works', 'Testimonials'].map(l => (
                                <a key={l} href={`#${l.toLowerCase().replace(/ /g, '-')}`}
                                    className="text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-green-600 dark:hover:text-green-400 transition-colors">
                                    {l}
                                </a>
                            ))}
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-3">
                            <button onClick={toggleTheme}
                                className="w-9 h-9 flex items-center justify-center rounded-xl bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300 transition-all">
                                {isDark ? <Sun size={16} /> : <Moon size={16} />}
                            </button>
                            <Link to="/login" className="hidden md:inline-flex text-sm font-semibold text-gray-700 dark:text-gray-300 hover:text-green-600 dark:hover:text-green-400 transition-colors">
                                Sign In
                            </Link>
                            <Link to="/register" className="btn-primary text-sm py-2 px-4">
                                Get Started <ArrowRight size={14} />
                            </Link>
                            <button onClick={() => setMenuOpen(!menuOpen)} className="md:hidden w-9 h-9 flex items-center justify-center rounded-xl bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300">
                                {menuOpen ? <X size={18} /> : <Menu size={18} />}
                            </button>
                        </div>
                    </div>
                </div>
                {/* Mobile menu */}
                {menuOpen && (
                    <div className="md:hidden bg-white dark:bg-gray-900 border-t border-gray-100 dark:border-gray-800 px-4 py-4 space-y-3">
                        {['Features', 'How It Works', 'Testimonials'].map(l => (
                            <a key={l} href={`#${l.toLowerCase().replace(/ /g, '-')}`} onClick={() => setMenuOpen(false)}
                                className="block text-sm font-medium text-gray-600 dark:text-gray-400 py-2">
                                {l}
                            </a>
                        ))}
                        <Link to="/login" onClick={() => setMenuOpen(false)} className="block text-sm font-medium text-gray-700 dark:text-gray-300 py-2">Sign In</Link>
                    </div>
                )}
            </nav>

            {/* ── HERO ── */}
            <section className="relative min-h-screen flex items-center overflow-hidden pt-16">
                {/* Background blobs */}
                <div className="absolute inset-0 pointer-events-none overflow-hidden">
                    <div className="absolute top-20 -left-32 w-[500px] h-[500px] bg-green-400/20 dark:bg-green-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDuration: '4s' }} />
                    <div className="absolute bottom-10 -right-32 w-[400px] h-[400px] bg-emerald-400/20 dark:bg-emerald-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDuration: '6s' }} />
                    <div className="absolute top-1/2 left-1/2 w-[300px] h-[300px] bg-blue-400/10 dark:bg-blue-500/5 rounded-full blur-3xl" style={{ transform: 'translate(-50%, -50%)' }} />
                </div>

                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 relative z-10">
                    <div className="grid lg:grid-cols-2 gap-16 items-center">
                        {/* Left */}
                        <div className={`transition-all duration-1000 ${heroVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'}`}>
                            {/* Badge */}
                            <div className="inline-flex items-center gap-2 bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-800 text-green-700 dark:text-green-400 text-xs font-semibold px-4 py-1.5 rounded-full mb-6">
                                <Zap size={12} className="fill-green-500 text-green-500" />
                                Trusted by 500+ companies worldwide
                            </div>

                            <h1 className="text-5xl lg:text-6xl font-black text-gray-900 dark:text-white leading-tight mb-6">
                                Manage{' '}
                                <span className="relative">
                                    <span className="text-gradient">Employee</span>
                                </span>
                                {' '}Leaves Without the{' '}
                                <span className="text-gradient">Chaos</span>
                            </h1>
                            <p className="text-xl text-gray-500 dark:text-gray-400 leading-relaxed mb-8 max-w-xl">
                                LeaveSync gives HR teams, managers, and employees a single platform to apply, track, and approve leave — beautifully.
                            </p>

                            <div className="flex flex-col sm:flex-row gap-4 mb-10">
                                <Link to="/register" className="btn-primary text-base py-3.5 px-7 justify-center">
                                    Start Free Today <ArrowRight size={18} />
                                </Link>
                                <Link to="/login" className="btn-secondary text-base py-3.5 px-7 text-center">
                                    Sign In →
                                </Link>
                            </div>

                            {/* Trust badges */}
                            <div className="flex flex-wrap gap-4">
                                {['✅ No credit card', '⚡ Setup in 2 minutes', '🔒 Enterprise security'].map(t => (
                                    <span key={t} className="text-sm text-gray-500 dark:text-gray-400 font-medium">{t}</span>
                                ))}
                            </div>
                        </div>

                        {/* Right — UI mockup card */}
                        <div className={`hidden lg:flex justify-center transition-all duration-1000 delay-300 ${heroVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'}`}>
                            <div className="relative w-full max-w-md">
                                {/* Shadow card behind */}
                                <div className="absolute -inset-4 bg-gradient-to-br from-green-400/30 to-emerald-600/30 rounded-3xl blur-2xl" />

                                {/* Main UI card */}
                                <div className="relative bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-gray-100 dark:border-gray-800 overflow-hidden">
                                    {/* Top bar */}
                                    <div className="px-5 py-3.5 bg-gray-50 dark:bg-gray-800 border-b border-gray-100 dark:border-gray-700 flex items-center gap-2">
                                        <div className="w-3 h-3 rounded-full bg-red-400" />
                                        <div className="w-3 h-3 rounded-full bg-amber-400" />
                                        <div className="w-3 h-3 rounded-full bg-green-400" />
                                        <div className="flex-1 ml-4 text-xs text-gray-400 text-center">leavesync.app/dashboard</div>
                                    </div>

                                    {/* Dashboard preview */}
                                    <div className="p-5 space-y-4">
                                        {/* Stats row */}
                                        <div className="grid grid-cols-3 gap-3">
                                            {[
                                                { label: 'Total Leaves', value: '14', color: 'from-blue-500 to-blue-700' },
                                                { label: 'Approved', value: '9', color: 'from-green-500 to-emerald-700' },
                                                { label: 'Pending', value: '3', color: 'from-amber-500 to-orange-600' },
                                            ].map(s => (
                                                <div key={s.label} className={`rounded-xl bg-gradient-to-br ${s.color} p-3 text-white`}>
                                                    <p className="text-xs opacity-80">{s.label}</p>
                                                    <p className="text-2xl font-black">{s.value}</p>
                                                </div>
                                            ))}
                                        </div>

                                        {/* Leave list */}
                                        <div className="space-y-2">
                                            {[
                                                { type: 'Sick Leave', date: 'Feb 10–12', status: 'Approved', color: 'bg-green-100 text-green-700' },
                                                { type: 'Casual Leave', date: 'Mar 1–2', status: 'Pending', color: 'bg-amber-100 text-amber-700' },
                                                { type: 'Annual Leave', date: 'Mar 20–25', status: 'Rejected', color: 'bg-red-100 text-red-700' },
                                            ].map(l => (
                                                <div key={l.type} className="flex items-center justify-between p-3 rounded-xl bg-gray-50 dark:bg-gray-800">
                                                    <div>
                                                        <p className="text-xs font-semibold text-gray-800 dark:text-gray-200">{l.type}</p>
                                                        <p className="text-[10px] text-gray-400">{l.date}</p>
                                                    </div>
                                                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${l.color}`}>{l.status}</span>
                                                </div>
                                            ))}
                                        </div>

                                        {/* Apply button */}
                                        <button className="w-full py-2.5 rounded-xl bg-gradient-to-r from-green-500 to-emerald-600 text-white text-sm font-semibold flex items-center justify-center gap-2">
                                            <Calendar size={14} /> Apply for Leave
                                        </button>
                                    </div>
                                </div>

                                {/* Floating badges */}
                                <div className="absolute -top-4 -right-4 bg-white dark:bg-gray-800 shadow-xl border border-gray-100 dark:border-gray-700 rounded-xl px-3 py-2 flex items-center gap-2 animate-bounce" style={{ animationDuration: '3s' }}>
                                    <CheckCircle size={14} className="text-green-500" />
                                    <span className="text-xs font-semibold text-gray-800 dark:text-gray-200">Leave Approved!</span>
                                </div>
                                <div className="absolute -bottom-4 -left-4 bg-white dark:bg-gray-800 shadow-xl border border-gray-100 dark:border-gray-700 rounded-xl px-3 py-2 flex items-center gap-2">
                                    <Users size={14} className="text-blue-500" />
                                    <span className="text-xs font-semibold text-gray-800 dark:text-gray-200">12 active users</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Scroll indicator */}
                <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1 opacity-50">
                    <span className="text-xs text-gray-400 font-medium">Scroll to explore</span>
                    <div className="w-px h-8 bg-gradient-to-b from-gray-300 to-transparent" />
                </div>
            </section>

            {/* ── STATS ── */}
            <section className="py-16 border-y border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-4">
                        <StatCard target={500} suffix="+" label="Companies using LeaveSync" color="text-green-600 dark:text-green-400" />
                        <StatCard target={25000} suffix="+" label="Leave requests processed" color="text-blue-600 dark:text-blue-400" />
                        <StatCard target={98} suffix="%" label="Customer satisfaction rate" color="text-emerald-600 dark:text-emerald-400" />
                        <StatCard target={10} suffix="x" label="Faster than paper-based flow" color="text-purple-600 dark:text-purple-400" />
                    </div>
                </div>
            </section>

            {/* ── FEATURES ── */}
            <section id="features" className="py-24 bg-gray-50 dark:bg-gray-950">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <span className="text-xs font-bold uppercase tracking-widest text-green-600 dark:text-green-400">Features</span>
                        <h2 className="text-4xl font-black text-gray-900 dark:text-white mt-2 mb-3">Everything you need,<br />nothing you don't</h2>
                        <p className="text-gray-500 dark:text-gray-400 max-w-xl mx-auto">A clean, focused feature set designed for real HR teams — built for speed, not complexity.</p>
                    </div>
                    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
                        {FEATURES.map(f => <FeatureCard key={f.title} {...f} />)}
                    </div>
                </div>
            </section>

            {/* ── HOW IT WORKS ── */}
            <section id="how-it-works" className="py-24 bg-white dark:bg-gray-900">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid lg:grid-cols-2 gap-16 items-center">
                        <div>
                            <span className="text-xs font-bold uppercase tracking-widest text-green-600 dark:text-green-400">How It Works</span>
                            <h2 className="text-4xl font-black text-gray-900 dark:text-white mt-2 mb-3">From request to approval<br />in minutes</h2>
                            <p className="text-gray-500 dark:text-gray-400 mb-10 max-w-md">Our streamlined 4-step process eliminates email chains and paper forms forever.</p>
                            <div className="space-y-7">
                                {STEPS.map((s, i) => <StepCard key={i} {...s} delay={i * 120} />)}
                            </div>
                        </div>
                        {/* Visual */}
                        <div className="hidden lg:flex justify-end">
                            <div className="relative w-96 h-96">
                                <div className="absolute inset-0 bg-gradient-to-br from-green-100 to-emerald-100 dark:from-green-900/30 dark:to-emerald-900/30 rounded-3xl" />
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <div className="relative">
                                        {/* Orbit circles */}
                                        <div className="w-48 h-48 rounded-full border-2 border-dashed border-green-300 dark:border-green-700 animate-spin" style={{ animationDuration: '20s' }}>
                                            <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-10 h-10 rounded-xl bg-white dark:bg-gray-900 shadow-lg flex items-center justify-center border border-gray-100 dark:border-gray-700">
                                                <Calendar size={18} className="text-green-500" />
                                            </div>
                                            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 w-10 h-10 rounded-xl bg-white dark:bg-gray-900 shadow-lg flex items-center justify-center border border-gray-100 dark:border-gray-700">
                                                <CheckCircle size={18} className="text-green-500" />
                                            </div>
                                        </div>
                                        {/* Center */}
                                        <div className="absolute inset-0 flex items-center justify-center">
                                            <div className="w-20 h-20 bg-gradient-to-br from-green-500 to-emerald-700 rounded-2xl flex items-center justify-center shadow-2xl shadow-green-300 dark:shadow-green-900">
                                                <FileText size={32} className="text-white" />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* ── TESTIMONIALS ── */}
            <section id="testimonials" className="py-24 bg-gray-50 dark:bg-gray-950">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-14">
                        <span className="text-xs font-bold uppercase tracking-widest text-green-600 dark:text-green-400">Testimonials</span>
                        <h2 className="text-4xl font-black text-gray-900 dark:text-white mt-2 mb-3">Loved by HR teams across India</h2>
                    </div>
                    <div className="grid md:grid-cols-3 gap-6">
                        {TESTIMONIALS.map(t => <TestimonialCard key={t.name} {...t} />)}
                    </div>
                </div>
            </section>

            {/* ── CTA BANNER ── */}
            <section className="py-20 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-green-600 via-emerald-600 to-teal-700" />
                <div className="absolute inset-0 opacity-20">
                    <div className="absolute top-0 left-0 w-72 h-72 bg-white rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
                    <div className="absolute bottom-0 right-0 w-72 h-72 bg-white rounded-full blur-3xl translate-x-1/2 translate-y-1/2" />
                </div>
                <div className="relative z-10 max-w-3xl mx-auto px-4 text-center">
                    <h2 className="text-4xl lg:text-5xl font-black text-white mb-5 leading-tight">
                        Ready to simplify<br />leave management?
                    </h2>
                    <p className="text-green-100 text-lg mb-8">Join thousands of HR teams that trust LeaveSync. Free to start, scales with your team.</p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Link to="/register"
                            className="inline-flex items-center justify-center gap-2 bg-white text-green-700 font-bold py-3.5 px-8 rounded-xl hover:bg-green-50 transition-all hover:scale-105 shadow-lg">
                            Get Started Free <ChevronRight size={18} />
                        </Link>
                        <Link to="/login"
                            className="inline-flex items-center justify-center gap-2 bg-white/10 backdrop-blur text-white font-semibold py-3.5 px-8 rounded-xl border border-white/30 hover:bg-white/20 transition-all">
                            Sign In →
                        </Link>
                    </div>
                </div>
            </section>

            {/* ── FOOTER ── */}
            <footer className="bg-gray-950 dark:bg-black text-gray-400">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
                    <div className="grid md:grid-cols-4 gap-10 mb-12">
                        {/* Brand */}
                        <div className="md:col-span-2">
                            <div className="flex items-center gap-2.5 mb-4">
                                <div className="w-8 h-8 bg-gradient-to-br from-teal-500 to-emerald-700 rounded-xl flex items-center justify-center">
                                    <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                                        <rect x="3" y="4" width="18" height="18" rx="3" fill="white" fillOpacity="0.2" stroke="white" strokeWidth="1.8" />
                                        <path d="M3 9h18" stroke="white" strokeWidth="1.8" />
                                        <path d="M8 2v4M16 2v4" stroke="white" strokeWidth="1.8" />
                                        <path d="M8.5 14.5l2 2 4-4" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                    </svg>
                                </div>
                                <span className="font-black text-white text-lg">LeaveSync</span>
                            </div>
                            <p className="text-gray-400 text-sm leading-relaxed max-w-xs mb-6">
                                The modern leave management system built for fast-moving teams. Apply, approve, track — all in one place.
                            </p>
                            <div className="flex gap-3">
                                {[
                                    { icon: Twitter, href: '#' },
                                    { icon: Github, href: '#' },
                                    { icon: Linkedin, href: '#' },
                                    { icon: Mail, href: '#' },
                                ].map(({ icon: Icon, href }) => (
                                    <a key={href + Icon.name} href={href}
                                        className="w-9 h-9 rounded-lg bg-gray-800 hover:bg-green-600 flex items-center justify-center text-gray-400 hover:text-white transition-all">
                                        <Icon size={15} />
                                    </a>
                                ))}
                            </div>
                        </div>

                        {/* Product */}
                        <div>
                            <h4 className="text-white font-bold text-sm mb-4">Product</h4>
                            <ul className="space-y-2.5">
                                {['Features', 'How It Works', 'Security', 'Changelog'].map(l => (
                                    <li key={l}><a href="#" className="text-sm hover:text-green-400 transition-colors">{l}</a></li>
                                ))}
                            </ul>
                        </div>

                        {/* Company */}
                        <div>
                            <h4 className="text-white font-bold text-sm mb-4">Company</h4>
                            <ul className="space-y-2.5">
                                {['About', 'Blog', 'Careers', 'Contact'].map(l => (
                                    <li key={l}><a href="#" className="text-sm hover:text-green-400 transition-colors">{l}</a></li>
                                ))}
                            </ul>
                        </div>
                    </div>

                    {/* Bottom bar */}
                    <div className="border-t border-gray-800 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
                        <p className="text-xs text-gray-500">© 2026 LeaveSync. All rights reserved. Built with ❤️ in India.</p>
                        <div className="flex gap-5 text-xs">
                            {['Privacy Policy', 'Terms of Service', 'Cookie Policy'].map(l => (
                                <a key={l} href="#" className="text-gray-500 hover:text-green-400 transition-colors">{l}</a>
                            ))}
                        </div>
                    </div>
                </div>
            </footer>

        </div>
    );
}
