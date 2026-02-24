import { SkeletonRow } from './Loader';

const DataTable = ({ columns, data, loading, emptyMessage = 'No data found' }) => {
    return (
        <div className="overflow-x-auto rounded-xl border border-gray-100 dark:border-gray-800">
            <table className="w-full text-sm">
                <thead>
                    <tr className="bg-gray-50 dark:bg-gray-800 border-b border-gray-100 dark:border-gray-700">
                        {columns.map((col) => (
                            <th
                                key={col.key}
                                className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400"
                                style={col.width ? { width: col.width } : {}}
                            >
                                {col.label}
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-50 dark:divide-gray-800 bg-white dark:bg-gray-900">
                    {loading ? (
                        [...Array(5)].map((_, i) => <SkeletonRow key={i} />)
                    ) : data.length === 0 ? (
                        <tr>
                            <td colSpan={columns.length} className="px-6 py-16 text-center text-gray-400 dark:text-gray-600">
                                <div className="flex flex-col items-center gap-2">
                                    <span className="text-3xl">📭</span>
                                    <p className="font-medium">{emptyMessage}</p>
                                </div>
                            </td>
                        </tr>
                    ) : (
                        data.map((row, i) => (
                            <tr key={row._id || i} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                                {columns.map((col) => (
                                    <td key={col.key} className="px-6 py-4 text-gray-700 dark:text-gray-300">
                                        {col.render ? col.render(row[col.key], row) : row[col.key] ?? '—'}
                                    </td>
                                ))}
                            </tr>
                        ))
                    )}
                </tbody>
            </table>
        </div>
    );
};

export default DataTable;
