const Loader = ({ fullScreen = false, size = 'md' }) => {
    const sizeMap = { sm: 'h-5 w-5', md: 'h-8 w-8', lg: 'h-12 w-12' };
    const spinner = (
        <div className="flex flex-col items-center gap-3">
            <div className={`${sizeMap[size]} border-4 border-green-200 border-t-green-500 rounded-full animate-spin`} />
            {fullScreen && <p className="text-gray-500 dark:text-gray-400 text-sm font-medium">Loading...</p>}
        </div>
    );

    if (fullScreen) {
        return (
            <div className="fixed inset-0 flex items-center justify-center bg-white/80 dark:bg-gray-950/80 backdrop-blur-sm z-50">
                {spinner}
            </div>
        );
    }

    return <div className="flex justify-center py-8">{spinner}</div>;
};

export const SkeletonCard = () => (
    <div className="card animate-pulse space-y-4">
        <div className="h-4 w-1/3 bg-gray-200 dark:bg-gray-700 rounded-lg" />
        <div className="h-8 w-1/2 bg-gray-200 dark:bg-gray-700 rounded-lg" />
        <div className="h-3 w-2/3 bg-gray-100 dark:bg-gray-800 rounded-lg" />
    </div>
);

export const SkeletonRow = () => (
    <tr className="animate-pulse">
        {[...Array(5)].map((_, i) => (
            <td key={i} className="px-6 py-4">
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded-lg" />
            </td>
        ))}
    </tr>
);

export default Loader;
