const DashboardCard = ({ title, value, subtitle, icon: Icon, gradient, trend }) => {
    return (
        <div className={`relative overflow-hidden rounded-2xl p-6 text-white shadow-lg hover:shadow-xl transition-all duration-300 animate-slide-up border border-white/20 bg-white/10 backdrop-blur-xl before:absolute before:inset-0 before:bg-black/10 before:rounded-2xl ${gradient}`}>
            {/* Background decoration */}
            <div className="absolute -top-4 -right-4 w-24 h-24 rounded-full bg-white/10" />
            <div className="absolute -bottom-8 -right-8 w-36 h-36 rounded-full bg-white/5" />

            <div className="relative z-10 flex items-start justify-between">
                <div>
                    <p className="text-sm font-medium text-white/80 mb-1">{title}</p>
                    <p className="text-3xl font-bold tracking-tight">{value}</p>
                    {subtitle && <p className="text-xs text-white/70 mt-1">{subtitle}</p>}
                    {trend !== undefined && (
                        <span className={`text-xs font-semibold mt-2 inline-block ${trend >= 0 ? 'text-white/90' : 'text-red-200'}`}>
                            {trend >= 0 ? '↑' : '↓'} {Math.abs(trend)}% this month
                        </span>
                    )}
                </div>
                {Icon && (
                    <div className="p-3 bg-white/20 rounded-xl">
                        <Icon size={24} />
                    </div>
                )}
            </div>
        </div>
    );
};

export default DashboardCard;
