import { useState } from 'react';
import Modal from '../ui/Modal';
import { useReimbursement } from '../../context/ReimbursementContext';
import { Banknote, Calendar, Tag, FileText, Link } from 'lucide-react';

const CATEGORIES = ['Travel', 'Food', 'Equipment', 'Medical', 'Other'];

export default function ReimbursementFormModal({ isOpen, onClose }) {
    const { createReimbursement } = useReimbursement();
    const [submitting, setSubmitting] = useState(false);
    const [form, setForm] = useState({
        title: '',
        amount: '',
        category: 'Travel',
        description: '',
        expenseDate: new Date().toISOString().split('T')[0],
        receiptUrl: '', // This will store the Base64 data
    });
    const [fileName, setFileName] = useState('');

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            if (file.type !== 'application/pdf') {
                toast.error('Please upload a PDF file');
                e.target.value = '';
                return;
            }
            if (file.size > 2 * 1024 * 1024) { // 2MB limit
                toast.error('File size must be less than 2MB');
                e.target.value = '';
                return;
            }

            setFileName(file.name);
            const reader = new FileReader();
            reader.onloadend = () => {
                setForm({ ...form, receiptUrl: reader.result });
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            await createReimbursement(form);
            onClose();
            setForm({
                title: '',
                amount: '',
                category: 'Travel',
                description: '',
                expenseDate: new Date().toISOString().split('T')[0],
                receiptUrl: '',
            });
            setFileName('');
        } catch (err) {
            // Error managed in context
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="New Reimbursement Claim">
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className="label">Claim Title</label>
                    <div className="relative">
                        <FileText size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none z-10" />
                        <input
                            type="text"
                            required
                            placeholder="e.g. Client Dinner, MacBook Pro"
                            className="input input-icon"
                            value={form.title}
                            onChange={e => setForm({ ...form, title: e.target.value })}
                        />
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="label">Amount (₹)</label>
                        <div className="relative">
                            <Banknote size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-emerald-500 pointer-events-none z-10" />
                            <input
                                type="number"
                                required
                                min="1"
                                placeholder="0.00"
                                className="input input-icon font-bold"
                                value={form.amount}
                                onChange={e => setForm({ ...form, amount: e.target.value })}
                            />
                        </div>
                    </div>
                    <div>
                        <label className="label">Category</label>
                        <div className="relative">
                            <Tag size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none z-10" />
                            <select
                                className="input input-icon"
                                value={form.category}
                                onChange={e => setForm({ ...form, category: e.target.value })}
                            >
                                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                            </select>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="label">Expense Date</label>
                        <div className="relative">
                            <Calendar size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none z-10" />
                            <input
                                type="date"
                                required
                                max={new Date().toISOString().split('T')[0]}
                                className="input input-icon"
                                value={form.expenseDate}
                                onChange={e => setForm({ ...form, expenseDate: e.target.value })}
                            />
                        </div>
                    </div>
                    <div>
                        <label className="label">Receipt PDF (Optional)</label>
                        <div className="relative">
                            <Link size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none z-10" />
                            <input
                                type="file"
                                accept="application/pdf"
                                className="input input-icon file:mr-4 file:py-0 file:px-0 file:border-0 file:text-sm file:font-semibold file:bg-transparent file:text-teal-600 hover:file:text-teal-700 cursor-pointer text-xs"
                                onChange={handleFileChange}
                            />
                            {fileName && <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-teal-600 font-bold truncate max-w-[100px] bg-white px-1">PDF Selected</span>}
                        </div>
                    </div>
                </div>

                <div>
                    <label className="label">Description</label>
                    <textarea
                        required
                        rows={3}
                        placeholder="Briefly describe the expense..."
                        className="input resize-none"
                        value={form.description}
                        onChange={e => setForm({ ...form, description: e.target.value })}
                    />
                </div>

                <div className="flex gap-3 pt-2">
                    <button type="button" onClick={onClose} className="btn-secondary flex-1">Cancel</button>
                    <button type="submit" disabled={submitting} className="btn-primary flex-1">
                        {submitting ? 'Submitting...' : 'Submit Claim'}
                    </button>
                </div>
            </form>
        </Modal>
    );
}
