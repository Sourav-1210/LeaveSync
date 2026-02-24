import { useEffect, useState } from 'react';
import { userService } from '../../services/api';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { Users, Mail, Building2, ShieldCheck } from 'lucide-react';

const ROLE_BADGE = {
    admin: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300',
    manager: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
    employee: 'bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-300',
};

export default function MyTeamPage() {
    const [team, setTeam] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        userService.getAll()
            .then(({ data }) => setTeam(data.users || []))
            .catch(console.error)
            .finally(() => setLoading(false));
    }, []);

    return (
        <DashboardLayout>
            <div className="mb-6">
                <h2 className="text-2xl font-black text-gray-900 dark:text-white">My Team</h2>
                <p className="text-gray-500 dark:text-gray-400 text-sm mt-0.5">All team members in the system</p>
            </div>

            {/* Summary card */}
            <div className="card flex items-center gap-4 mb-8 w-fit">
                <div className="w-11 h-11 bg-gradient-to-br from-teal-500 to-emerald-700 rounded-xl flex items-center justify-center">
                    <Users size={20} className="text-white" />
                </div>
                <div>
                    <p className="text-2xl font-black text-gray-900 dark:text-white">{team.length}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Total Members</p>
                </div>
            </div>

            {loading ? (
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {[...Array(6)].map((_, i) => (
                        <div key={i} className="card animate-pulse h-28 bg-gray-100 dark:bg-gray-800" />
                    ))}
                </div>
            ) : team.length === 0 ? (
                <div className="card text-center py-16 text-gray-400">
                    <Users size={40} className="mx-auto mb-3 opacity-30" />
                    <p className="font-medium">No team members found</p>
                </div>
            ) : (
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {team.map(member => (
                        <div key={member._id} className="card flex items-start gap-4 hover:shadow-md transition-shadow">
                            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-teal-400 to-emerald-600 flex items-center justify-center flex-shrink-0">
                                <span className="text-white font-bold text-lg">{member.name?.charAt(0).toUpperCase()}</span>
                            </div>
                            <div className="min-w-0 flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                    <p className="font-bold text-gray-900 dark:text-white text-sm truncate">{member.name}</p>
                                    <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-md flex-shrink-0 ${ROLE_BADGE[member.role]}`}>
                                        {member.role}
                                    </span>
                                </div>
                                <div className="flex items-center gap-1.5 text-xs text-gray-400 mb-1">
                                    <Mail size={11} /> <span className="truncate">{member.email}</span>
                                </div>
                                <div className="flex items-center gap-1.5 text-xs text-gray-400">
                                    <Building2 size={11} /> {member.department || 'General'}
                                </div>
                                <div className="flex items-center gap-1.5 mt-2">
                                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${member.isActive ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300' : 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400'}`}>
                                        {member.isActive ? 'Active' : 'Inactive'}
                                    </span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </DashboardLayout>
    );
}
