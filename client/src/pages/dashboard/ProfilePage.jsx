import { useState, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useLeave } from '../../context/LeaveContext';
import { authService } from '../../services/api';
import DashboardLayout from '../../components/layout/DashboardLayout';
import {
    User, Mail, Building2, Shield, Phone, FileText,
    Edit3, Save, X, Calendar, CheckCircle, Clock, XCircle,
    Award, Briefcase, Hash, Camera, Trash2,
} from 'lucide-react';
import toast from 'react-hot-toast';

const ROLE_CONFIG = {
    admin: {
        label: 'Administrator',
        gradient: 'from-purple-500 to-violet-700',
        light: 'bg-purple-50 dark:bg-purple-900/20',
        badge: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300',
        ring: 'ring-purple-400',
    },
    manager: {
        label: 'Manager',
        gradient: 'from-blue-500 to-blue-700',
        light: 'bg-blue-50 dark:bg-blue-900/20',
        badge: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
        ring: 'ring-blue-400',
    },
    employee: {
        label: 'Employee',
        gradient: 'from-teal-500 to-emerald-600',
        light: 'bg-teal-50 dark:bg-teal-900/20',
        badge: 'bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-300',
        ring: 'ring-teal-400',
    },
};

function InfoRow({ icon: Icon, label, value, placeholder = '—' }) {
    return (
        <div className="flex items-start gap-3 py-3.5 border-b border-gray-100 dark:border-gray-800 last:border-0">
            <div className="w-9 h-9 rounded-xl bg-gray-50 dark:bg-gray-800 flex items-center justify-center flex-shrink-0">
                <Icon size={15} className="text-teal-500" />
            </div>
            <div className="flex-1 min-w-0">
                <p className="text-[11px] text-gray-400 uppercase tracking-wider font-semibold mb-0.5">{label}</p>
                <p className={`text-sm font-semibold ${value ? 'text-gray-900 dark:text-white' : 'text-gray-400 italic'}`}>
                    {value || placeholder}
                </p>
            </div>
        </div>
    );
}

export default function ProfilePage() {
    const { user, avatar, updateUser, updateAvatar } = useAuth();
    const { leaveList } = useLeave();
    const [editing, setEditing] = useState(false);
    const [saving, setSaving] = useState(false);
    const [uploadingAvatar, setUploadingAvatar] = useState(false);
    const fileInputRef = useRef(null);
    const [form, setForm] = useState({
        name: user?.name || '',
        department: user?.department || '',
        phone: user?.phone || '',
        bio: user?.bio || '',
    });

    const role = ROLE_CONFIG[user?.role] || ROLE_CONFIG.employee;

    const stats = {
        total: leaveList.length,
        approved: leaveList.filter(l => l.status === 'approved').length,
        pending: leaveList.filter(l => l.status === 'pending').length,
        rejected: leaveList.filter(l => l.status === 'rejected').length,
    };

    const joinedDate = user?.createdAt
        ? new Date(user.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
        : 'N/A';

    // ── Profile Picture Upload ──
    const handleAvatarClick = () => fileInputRef.current?.click();

    const handleFileChange = (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (!file.type.startsWith('image/')) {
            toast.error('Please select an image file');
            return;
        }
        if (file.size > 5 * 1024 * 1024) {
            toast.error('Image must be smaller than 5MB');
            return;
        }

        setUploadingAvatar(true);
        const reader = new FileReader();
        reader.onload = (ev) => {
            updateAvatar(ev.target.result);
            setUploadingAvatar(false);
            toast.success('Profile photo updated!');
        };
        reader.onerror = () => {
            setUploadingAvatar(false);
            toast.error('Failed to read image');
        };
        reader.readAsDataURL(file);

        // reset so same file can be re-selected
        e.target.value = '';
    };

    const handleRemoveAvatar = () => {
        updateAvatar(null);
        toast.success('Profile photo removed');
    };

    // ── Profile Info Save ──
    const handleSave = async () => {
        if (!form.name.trim()) return toast.error('Name is required');
        setSaving(true);
        try {
            const { data } = await authService.updateProfile(form);
            updateUser({ ...user, ...data.user });
            toast.success('Profile updated!');
            setEditing(false);
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to update profile');
        } finally { setSaving(false); }
    };

    const handleCancel = () => {
        setForm({ name: user?.name || '', department: user?.department || '', phone: user?.phone || '', bio: user?.bio || '' });
        setEditing(false);
    };

    const initials = user?.name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || '?';

    return (
        <DashboardLayout>
            {/* Hidden file input */}
            <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleFileChange}
            />

            {/* Page header */}
            <div className="mb-7">
                <h2 className="text-2xl font-black text-gray-900 dark:text-white">My Profile</h2>
                <p className="text-gray-500 dark:text-gray-400 text-sm mt-0.5">Manage your personal information and profile photo</p>
            </div>

            <div className="grid lg:grid-cols-3 gap-6">

                {/* ── LEFT COLUMN ── */}
                <div className="lg:col-span-1 space-y-5">

                    {/* Avatar Card */}
                    <div className="card overflow-hidden p-0">
                        {/* Banner */}
                        <div className={`h-24 bg-gradient-to-br ${role.gradient} relative`}>
                            <div className="absolute inset-0 opacity-20"
                                style={{ backgroundImage: 'radial-gradient(circle, #fff 1px, transparent 1px)', backgroundSize: '18px 18px' }} />
                        </div>

                        {/* Avatar + name section */}
                        <div className="px-6 pb-6">
                            {/* Avatar with upload overlay */}
                            <div className="relative w-24 h-24 -mt-12 mb-4">
                                <div className={`w-24 h-24 rounded-2xl overflow-hidden ring-4 ring-white dark:ring-gray-900 shadow-lg ${!avatar ? `bg-gradient-to-br ${role.gradient}` : ''} flex items-center justify-center`}>
                                    {avatar ? (
                                        <img src={avatar} alt="Profile" className="w-full h-full object-cover" />
                                    ) : (
                                        <span className="text-white text-3xl font-black">{initials}</span>
                                    )}
                                </div>

                                {/* Camera overlay button */}
                                <button
                                    onClick={handleAvatarClick}
                                    disabled={uploadingAvatar}
                                    title="Change profile photo"
                                    className="absolute inset-0 rounded-2xl bg-black/0 hover:bg-black/40 transition-all flex items-center justify-center group"
                                >
                                    {uploadingAvatar ? (
                                        <div className="w-5 h-5 border-2 border-white/60 border-t-white rounded-full animate-spin" />
                                    ) : (
                                        <Camera size={20} className="text-white opacity-0 group-hover:opacity-100 transition-opacity drop-shadow-md" />
                                    )}
                                </button>
                            </div>

                            <h3 className="text-xl font-black text-gray-900 dark:text-white">{user?.name}</h3>
                            <p className="text-gray-400 text-sm mb-3 truncate">{user?.email}</p>

                            <span className={`inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-full ${role.badge}`}>
                                <Shield size={11} /> {role.label}
                            </span>

                            {/* Photo action buttons */}
                            <div className="mt-4 flex gap-2">
                                <button
                                    onClick={handleAvatarClick}
                                    className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-teal-50 dark:bg-teal-900/20 text-teal-600 dark:text-teal-400 hover:bg-teal-100 dark:hover:bg-teal-900/40 text-xs font-semibold transition-colors border border-teal-200 dark:border-teal-800"
                                >
                                    <Camera size={13} /> Upload Photo
                                </button>
                                {avatar && (
                                    <button
                                        onClick={handleRemoveAvatar}
                                        title="Remove photo"
                                        className="p-2 rounded-xl bg-red-50 dark:bg-red-900/20 text-red-500 hover:bg-red-100 dark:hover:bg-red-900/40 transition-colors border border-red-200 dark:border-red-800"
                                    >
                                        <Trash2 size={13} />
                                    </button>
                                )}
                            </div>

                            {/* Edit Profile button */}
                            {!editing && (
                                <button onClick={() => setEditing(true)} className="btn-primary w-full flex items-center justify-center gap-2 mt-3">
                                    <Edit3 size={14} /> Edit Profile
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Leave Stats */}
                    <div className="card">
                        <h4 className="font-bold text-gray-900 dark:text-white text-sm mb-4 flex items-center gap-2">
                            <Calendar size={15} className="text-teal-500" /> Leave Summary
                        </h4>
                        <div className="grid grid-cols-2 gap-3">
                            {[
                                { label: 'Total', value: stats.total, icon: Calendar, color: 'text-blue-500', bg: 'bg-blue-50 dark:bg-blue-900/20' },
                                { label: 'Approved', value: stats.approved, icon: CheckCircle, color: 'text-emerald-500', bg: 'bg-emerald-50 dark:bg-emerald-900/20' },
                                { label: 'Pending', value: stats.pending, icon: Clock, color: 'text-amber-500', bg: 'bg-amber-50 dark:bg-amber-900/20' },
                                { label: 'Rejected', value: stats.rejected, icon: XCircle, color: 'text-red-500', bg: 'bg-red-50 dark:bg-red-900/20' },
                            ].map(({ label, value, icon: Icon, color, bg }) => (
                                <div key={label} className={`rounded-xl p-3.5 ${bg}`}>
                                    <div className="flex items-center gap-1.5 mb-1.5">
                                        <Icon size={12} className={color} />
                                        <p className="text-xs text-gray-500 dark:text-gray-400 font-semibold">{label}</p>
                                    </div>
                                    <p className={`text-2xl font-black ${color}`}>{value}</p>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Account Info */}
                    <div className="card">
                        <h4 className="font-bold text-gray-900 dark:text-white text-sm mb-4 flex items-center gap-2">
                            <Award size={15} className="text-teal-500" /> Account Details
                        </h4>
                        <div className="space-y-1 text-sm">
                            <div className="flex items-center justify-between py-2.5 border-b border-gray-100 dark:border-gray-800">
                                <span className="text-gray-400 flex items-center gap-2 text-xs"><Hash size={12} /> User ID</span>
                                <span className="font-mono text-xs text-gray-600 dark:text-gray-300 bg-gray-50 dark:bg-gray-800 px-2 py-0.5 rounded-lg">{user?._id?.slice(-8)}</span>
                            </div>
                            <div className="flex items-center justify-between py-2.5 border-b border-gray-100 dark:border-gray-800">
                                <span className="text-gray-400 flex items-center gap-2 text-xs"><Calendar size={12} /> Member Since</span>
                                <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">{joinedDate !== 'N/A' ? joinedDate : 'N/A'}</span>
                            </div>
                            <div className="flex items-center justify-between py-2.5">
                                <span className="text-gray-400 flex items-center gap-2 text-xs"><CheckCircle size={12} /> Status</span>
                                <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${user?.isActive ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300' : 'bg-red-100 text-red-600'}`}>
                                    {user?.isActive ? '● Active' : '● Inactive'}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* ── RIGHT COLUMN ── */}
                <div className="lg:col-span-2 space-y-5">

                    {/* Edit Form or Info Display */}
                    <div className="card">
                        <div className="flex items-center justify-between mb-6">
                            <h4 className="font-bold text-gray-900 dark:text-white flex items-center gap-2">
                                <User size={16} className="text-teal-500" />
                                {editing ? 'Edit Personal Information' : 'Personal Information'}
                            </h4>
                            {editing && (
                                <button onClick={handleCancel} className="p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors">
                                    <X size={16} />
                                </button>
                            )}
                        </div>

                        {editing ? (
                            <div className="space-y-4">
                                <div className="grid sm:grid-cols-2 gap-4">
                                    <div>
                                        <label className="label">Full Name *</label>
                                        <input
                                            value={form.name}
                                            onChange={e => setForm({ ...form, name: e.target.value })}
                                            className="input"
                                            placeholder="Your full name"
                                        />
                                    </div>
                                    <div>
                                        <label className="label">Role</label>
                                        <select
                                            value={form.department}
                                            onChange={e => setForm({ ...form, department: e.target.value })}
                                            className="input cursor-pointer"
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
                                <div>
                                    <label className="label">Phone Number</label>
                                    <input
                                        value={form.phone}
                                        onChange={e => setForm({ ...form, phone: e.target.value })}
                                        className="input"
                                        placeholder="+91 9876543210"
                                        type="tel"
                                    />
                                </div>

                                <div>
                                    <label className="label">Bio / About</label>
                                    <textarea
                                        value={form.bio}
                                        onChange={e => setForm({ ...form, bio: e.target.value })}
                                        rows={3}
                                        maxLength={300}
                                        placeholder="A short bio about yourself..."
                                        className="input resize-none"
                                    />
                                    <p className="text-xs text-gray-400 mt-1 text-right">{form.bio.length}/300</p>
                                </div>
                                <div className="flex gap-3 pt-1">
                                    <button onClick={handleCancel} className="btn-secondary flex-1">Cancel</button>
                                    <button onClick={handleSave} disabled={saving} className="btn-primary flex-1 flex items-center justify-center gap-2">
                                        {saving
                                            ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                            : <><Save size={15} /> Save Changes</>
                                        }
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div>
                                <InfoRow icon={User} label="Full Name" value={user?.name} />
                                <InfoRow icon={Mail} label="Email Address" value={user?.email} />
                                <InfoRow icon={Building2} label="Role" value={user?.department} />
                                <InfoRow icon={Phone} label="Phone Number" value={user?.phone} placeholder="Not provided" />

                                <InfoRow icon={Calendar} label="Member Since" value={joinedDate} />
                                <div className="flex items-start gap-3 pt-3.5">
                                    <div className="w-9 h-9 rounded-xl bg-gray-50 dark:bg-gray-800 flex items-center justify-center flex-shrink-0">
                                        <FileText size={15} className="text-teal-500" />
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-[11px] text-gray-400 uppercase tracking-wider font-semibold mb-1">Bio</p>
                                        <p className={`text-sm leading-relaxed ${user?.bio ? 'text-gray-700 dark:text-gray-300' : 'text-gray-400 italic'}`}>
                                            {user?.bio || 'No bio added yet. Click Edit Profile to add one.'}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Role & Permissions Card */}
                    <div className="card">
                        <h4 className="font-bold text-gray-900 dark:text-white text-sm mb-4 flex items-center gap-2">
                            <Briefcase size={15} className="text-teal-500" /> Role & Permissions
                        </h4>
                        <div className={`flex items-center gap-4 p-4 rounded-2xl bg-gradient-to-br ${role.gradient}`}>
                            <div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center flex-shrink-0 shadow-inner">
                                <Shield size={22} className="text-white" />
                            </div>
                            <div>
                                <p className="font-black text-white text-lg leading-tight">{role.label}</p>
                                <p className="text-white/80 text-xs mt-0.5">
                                    {user?.role === 'admin' && 'Full system access · Manage users, leaves, and roles'}
                                    {user?.role === 'manager' && 'Approve/reject team leaves · View team information'}
                                    {user?.role === 'employee' && 'Apply for leave · Track leave status and history'}
                                </p>
                            </div>
                        </div>

                        <div className="flex flex-wrap gap-2 mt-4">
                            {user?.role === 'admin' && ['Manage Users', 'Approve Leaves', 'View All Leaves', 'Manage Roles', 'System Settings'].map(p => (
                                <span key={p} className="text-xs font-semibold px-3 py-1.5 bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300 rounded-xl flex items-center gap-1.5 border border-purple-100 dark:border-purple-800/40">
                                    <CheckCircle size={10} /> {p}
                                </span>
                            ))}
                            {user?.role === 'manager' && ['Approve Leaves', 'Reject Leaves', 'View Team', 'Leave Reports'].map(p => (
                                <span key={p} className="text-xs font-semibold px-3 py-1.5 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 rounded-xl flex items-center gap-1.5 border border-blue-100 dark:border-blue-800/40">
                                    <CheckCircle size={10} /> {p}
                                </span>
                            ))}
                            {user?.role === 'employee' && ['Apply Leave', 'View History', 'Track Status', 'Cancel Pending'].map(p => (
                                <span key={p} className="text-xs font-semibold px-3 py-1.5 bg-teal-50 dark:bg-teal-900/20 text-teal-700 dark:text-teal-300 rounded-xl flex items-center gap-1.5 border border-teal-100 dark:border-teal-800/40">
                                    <CheckCircle size={10} /> {p}
                                </span>
                            ))}
                        </div>
                    </div>

                    {/* Recent Leave Activity */}
                    {leaveList.length > 0 && (
                        <div className="card">
                            <h4 className="font-bold text-gray-900 dark:text-white text-sm mb-4 flex items-center gap-2">
                                <Clock size={15} className="text-teal-500" /> Recent Leave Activity
                            </h4>
                            <div className="space-y-2.5">
                                {leaveList.slice(0, 4).map(leave => {
                                    const statusCfg = ({
                                        approved: { color: 'text-emerald-600', bg: 'bg-emerald-50 dark:bg-emerald-900/20', icon: CheckCircle },
                                        rejected: { color: 'text-red-500', bg: 'bg-red-50 dark:bg-red-900/20', icon: XCircle },
                                        pending: { color: 'text-amber-600', bg: 'bg-amber-50 dark:bg-amber-900/20', icon: Clock },
                                    })[leave.status] || { color: 'text-gray-500', bg: 'bg-gray-50 dark:bg-gray-800', icon: Clock };
                                    const StatusIcon = statusCfg.icon;
                                    return (
                                        <div key={leave._id} className="flex items-center gap-3 p-3.5 rounded-xl bg-gray-50 dark:bg-gray-800/60 border border-gray-100 dark:border-gray-800">
                                            <div className={`w-9 h-9 rounded-xl ${statusCfg.bg} flex items-center justify-center flex-shrink-0`}>
                                                <StatusIcon size={15} className={statusCfg.color} />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-semibold text-gray-900 dark:text-white capitalize">{leave.leaveType} Leave</p>
                                                <p className="text-xs text-gray-400 mt-0.5">
                                                    {new Date(leave.startDate).toLocaleDateString('en-GB')} – {new Date(leave.endDate).toLocaleDateString('en-GB')} · {leave.totalDays} day{leave.totalDays > 1 ? 's' : ''}
                                                </p>
                                            </div>
                                            <span className={`text-xs font-bold capitalize px-2.5 py-1 rounded-full ${statusCfg.bg} ${statusCfg.color}`}>
                                                {leave.status}
                                            </span>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </DashboardLayout>
    );
}
