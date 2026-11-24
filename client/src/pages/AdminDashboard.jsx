import React, { useState, useEffect, useContext, useMemo } from 'react';
import { AuthContext } from '../context/AuthContext';
import api from '../utils/axios';
import { useNavigate } from 'react-router-dom';
import {
    FaSearch,
    FaFilter,
    FaSortAmountDown,
    FaSortAmountUp,
    FaEye,
    FaTimes,
    FaCalendarAlt,
    FaPlusCircle,
    FaTrashAlt,
    FaSpinner
} from 'react-icons/fa';

const STATUS_OPTIONS = ['Pending', 'Confirmed', 'In Progress', 'Completed', 'Cancelled'];

const AdminDashboard = () => {
    const { user } = useContext(AuthContext);
    const navigate = useNavigate();

    const [bookings, setBookings] = useState([]);
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);

    // Filters and Search state
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('All');
    const [sortBy, setSortBy] = useState('bookedAt');
    const [sortOrder, setSortOrder] = useState('desc');

    // Selected Booking Modal Details
    const [selectedBooking, setSelectedBooking] = useState(null);
    const [updatingId, setUpdatingId] = useState(null);
    const [statusChangeTrigger, setStatusChangeTrigger] = useState(0);

    // Create Event Form Modal / Toggle
    const [showEventForm, setShowEventForm] = useState(false);
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        date: '',
        location: '',
        category: 'Vedic Puja',
        ticketPrice: '',
        image: ''
    });

    // Re-fetch data and re-render whenever user authentication or statusChangeTrigger changes
    useEffect(() => {
        if (!user || user.role !== 'admin') {
            navigate('/login');
            return;
        }
        fetchData();
    }, [user, navigate, statusChangeTrigger]);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [eventsRes, bookingsRes] = await Promise.all([
                api.get('/events'),
                api.get('/bookings/my')
            ]);
            setEvents(eventsRes.data || []);
            setBookings(bookingsRes.data || []);
        } catch (error) {
            console.error('Error fetching admin data', error);
        } finally {
            setLoading(false);
        }
    };

    // Quick inline status change handler
    const handleStatusChange = async (bookingId, newStatus) => {
        try {
            setUpdatingId(bookingId);
            const { data } = await api.put(`/bookings/${bookingId}/status`, { status: newStatus });
            
            if (selectedBooking && selectedBooking._id === bookingId) {
                setSelectedBooking(data.booking);
            }

            // Triggers the useEffect to re-fetch and re-render the page
            setStatusChangeTrigger(prev => prev + 1);
        } catch (error) {
            alert(error.response?.data?.message || 'Error updating status');
        } finally {
            setUpdatingId(null);
        }
    };

    const handleCreateEvent = async (e) => {
        e.preventDefault();
        try {
            await api.post('/events', formData);
            setShowEventForm(false);
            setFormData({
                title: '',
                description: '',
                date: '',
                location: '',
                category: 'Vedic Puja',
                ticketPrice: '',
                image: ''
            });
            fetchData();
        } catch (error) {
            alert(error.response?.data?.message || 'Error creating Puja event');
        }
    };


    const handleDeleteEvent = async (id) => {
        if (window.confirm('Are you sure you want to delete this Puja? All devotee bookings for this Puja will also be permanently deleted.')) {
            try {
                await api.delete(`/events/${id}`);
                // Refresh data and re-render
                fetchData();
            } catch (error) {
                alert(error.response?.data?.message || 'Error deleting Puja');
            }
        }
    };

    // Filter and Sort Bookings
    const filteredBookings = useMemo(() => {
        let list = [...bookings];

        if (searchTerm.trim() !== '') {
            const query = searchTerm.toLowerCase();
            list = list.filter(b => {
                const bId = (b.bookingId || '').toLowerCase();
                const devotee = (b.devoteeName || b.userId?.name || '').toLowerCase();
                const puja = (b.pujaName || b.eventId?.title || '').toLowerCase();
                return bId.includes(query) || devotee.includes(query) || puja.includes(query);
            });
        }

        if (statusFilter !== 'All') {
            list = list.filter(b => b.status === statusFilter);
        }

        list.sort((a, b) => {
            let valA, valB;
            if (sortBy === 'amount') {
                valA = Number(a.amount) || 0;
                valB = Number(b.amount) || 0;
            } else if (sortBy === 'date') {
                valA = new Date(a.pujaDate || a.eventId?.date || a.createdAt).getTime();
                valB = new Date(b.pujaDate || b.eventId?.date || b.createdAt).getTime();
            } else if (sortBy === 'devotee') {
                valA = (a.devoteeName || a.userId?.name || '').toLowerCase();
                valB = (b.devoteeName || b.userId?.name || '').toLowerCase();
            } else if (sortBy === 'status') {
                valA = a.status || '';
                valB = b.status || '';
            } else {
                valA = new Date(a.bookedAt || a.createdAt).getTime();
                valB = new Date(b.bookedAt || b.createdAt).getTime();
            }

            if (valA < valB) return sortOrder === 'asc' ? -1 : 1;
            if (valA > valB) return sortOrder === 'asc' ? 1 : -1;
            return 0;
        });

        return list;
    }, [bookings, searchTerm, statusFilter, sortBy, sortOrder]);

    const getStatusBadge = (status) => {
        switch (status) {
            case 'Pending':
                return 'bg-amber-100 text-amber-800 border-amber-300';
            case 'Confirmed':
                return 'bg-emerald-100 text-emerald-800 border-emerald-300';
            case 'In Progress':
                return 'bg-blue-100 text-blue-800 border-blue-300';
            case 'Completed':
                return 'bg-purple-100 text-purple-800 border-purple-300';
            case 'Cancelled':
                return 'bg-rose-100 text-rose-800 border-rose-300';
            default:
                return 'bg-gray-100 text-gray-800 border-gray-300';
        }
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center py-24 text-gray-600">
                <FaSpinner className="animate-spin text-4xl text-amber-600 mb-4" />
                <p className="text-xl font-semibold">Loading Puja Admin Dashboard...</p>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto pb-16">
            {/* Header Banner */}
            <div className="bg-gradient-to-r from-amber-900 via-orange-900 to-amber-950 text-white rounded-3xl p-6 sm:p-8 mb-8 shadow-xl flex flex-col md:flex-row justify-between items-center gap-6">
                <div>
                    <span className="bg-amber-500/20 text-amber-300 border border-amber-400/30 text-xs px-3 py-1 rounded-full font-bold uppercase tracking-wider mb-2 inline-block">
                        Admin Portal
                    </span>
                    <h1 className="text-2xl sm:text-4xl font-black mb-2 tracking-tight">Puja Booking Dashboard</h1>
                    <p className="text-amber-200/80 text-sm sm:text-base">
                        Track devotee reservations, filter requests, and manage real-time Puja booking statuses.
                    </p>
                </div>
                <button
                    onClick={() => setShowEventForm(!showEventForm)}
                    className="w-full md:w-auto bg-amber-400 hover:bg-amber-300 text-amber-950 font-bold py-3 px-6 rounded-xl transition shadow-lg flex items-center justify-center gap-2"
                >
                    <FaPlusCircle />
                    {showEventForm ? 'Close Form' : '+ Add New Puja'}
                </button>
            </div>

            {/* Quick Metrics Bar */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
                <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex flex-col">
                    <span className="text-xs uppercase font-bold text-gray-400 mb-1">Total Bookings</span>
                    <span className="text-2xl font-black text-gray-900">{bookings.length}</span>
                </div>
                <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex flex-col">
                    <span className="text-xs uppercase font-bold text-amber-600 mb-1">Pending</span>
                    <span className="text-2xl font-black text-amber-600">
                        {bookings.filter(b => b.status === 'Pending').length}
                    </span>
                </div>
                <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex flex-col">
                    <span className="text-xs uppercase font-bold text-blue-600 mb-1">In Progress</span>
                    <span className="text-2xl font-black text-blue-600">
                        {bookings.filter(b => b.status === 'In Progress').length}
                    </span>
                </div>
                <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex flex-col">
                    <span className="text-xs uppercase font-bold text-emerald-600 mb-1">Completed</span>
                    <span className="text-2xl font-black text-emerald-600">
                        {bookings.filter(b => b.status === 'Completed').length}
                    </span>
                </div>
            </div>

            {/* Create Puja Event Section */}
            {showEventForm && (
                <div className="bg-white rounded-2xl p-6 sm:p-8 mb-8 shadow-sm border border-amber-200">
                    <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                        <FaPlusCircle className="text-amber-600" /> Create New Puja Ceremony
                    </h2>
                    <form onSubmit={handleCreateEvent} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">Puja Title</label>
                            <input
                                type="text"
                                required
                                value={formData.title}
                                onChange={e => setFormData({ ...formData, title: e.target.value })}
                                placeholder="e.g. Maha Mrityunjaya Havan"
                                className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-amber-500 focus:outline-none"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">Category</label>
                            <select
                                value={formData.category}
                                onChange={e => setFormData({ ...formData, category: e.target.value })}
                                className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-amber-500 focus:outline-none"
                            >
                                <option value="Vedic Puja">Vedic Puja</option>
                                <option value="Havan & Yagya">Havan & Yagya</option>
                                <option value="Special Aarti">Special Aarti</option>
                                <option value="Katha & Path">Katha & Path</option>
                                <option value="Temple Abhishek">Temple Abhishek</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">Auspicious Date & Time</label>
                            <input
                                type="datetime-local"
                                required
                                value={formData.date}
                                onChange={e => setFormData({ ...formData, date: e.target.value })}
                                className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-amber-500 focus:outline-none"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">Sanctum / Temple Location</label>
                            <input
                                type="text"
                                required
                                value={formData.location}
                                onChange={e => setFormData({ ...formData, location: e.target.value })}
                                placeholder="e.g. Kashi Vishwanath Temple, Varanasi"
                                className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-amber-500 focus:outline-none"
                            />
                        </div>
                        <div className="md:col-span-2">
                            <label className="block text-sm font-semibold text-gray-700 mb-2">Dakshina / Amount (₹)</label>
                            <input
                                type="number"
                                required
                                min="0"
                                value={formData.ticketPrice}
                                onChange={e => setFormData({ ...formData, ticketPrice: e.target.value })}
                                placeholder="0 for Free/Seva, or amount"
                                className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-amber-500 focus:outline-none"
                            />
                        </div>
                        <div className="md:col-span-2">
                            <label className="block text-sm font-semibold text-gray-700 mb-2">Cover Image URL</label>
                            <input
                                type="url"
                                value={formData.image}
                                onChange={e => setFormData({ ...formData, image: e.target.value })}
                                placeholder="https://images.unsplash.com/..."
                                className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-amber-500 focus:outline-none"
                            />
                        </div>
                        <div className="md:col-span-2">
                            <label className="block text-sm font-semibold text-gray-700 mb-2">Significance & Details</label>
                            <textarea
                                required
                                rows="3"
                                value={formData.description}
                                onChange={e => setFormData({ ...formData, description: e.target.value })}
                                placeholder="Explain rituals, sankalpam, and prasad details..."
                                className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-amber-500 focus:outline-none"
                            ></textarea>
                        </div>
                        <div className="md:col-span-2 flex justify-end gap-3">
                            <button
                                type="button"
                                onClick={() => setShowEventForm(false)}
                                className="px-5 py-2.5 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                className="px-6 py-2.5 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-lg transition shadow-md"
                            >
                                Publish Puja
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* Search, Filter & Sort Controls */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-5 mb-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 items-center">
                    {/* Search Bar */}
                    <div className="relative">
                        <FaSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search by ID, devotee, or Puja..."
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2.5 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-amber-500 focus:outline-none transition"
                        />
                        {searchTerm && (
                            <button
                                onClick={() => setSearchTerm('')}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                            >
                                <FaTimes className="text-xs" />
                            </button>
                        )}
                    </div>

                    {/* Status Filter */}
                    <div className="flex items-center gap-2">
                        <FaFilter className="text-gray-400 text-sm shrink-0" />
                        <select
                            value={statusFilter}
                            onChange={e => setStatusFilter(e.target.value)}
                            className="w-full py-2.5 px-3 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-amber-500 focus:outline-none"
                        >
                            <option value="All">All Statuses ({bookings.length})</option>
                            <option value="Pending">Pending</option>
                            <option value="Confirmed">Confirmed</option>
                            <option value="In Progress">In Progress</option>
                            <option value="Completed">Completed</option>
                            <option value="Cancelled">Cancelled</option>
                        </select>
                    </div>

                    {/* Sort By Field */}
                    <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold text-gray-500 shrink-0">Sort By:</span>
                        <select
                            value={sortBy}
                            onChange={e => setSortBy(e.target.value)}
                            className="w-full py-2.5 px-3 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-amber-500 focus:outline-none"
                        >
                            <option value="bookedAt">Booking Time</option>
                            <option value="date">Puja Date</option>
                            <option value="amount">Dakshina Amount</option>
                            <option value="devotee">Devotee Name</option>
                            <option value="status">Status</option>
                        </select>
                    </div>

                    {/* Sort Order Toggle */}
                    <div className="flex items-center justify-between sm:justify-start gap-2">
                        <button
                            onClick={() => setSortOrder(prev => (prev === 'asc' ? 'desc' : 'asc'))}
                            className="flex items-center gap-2 px-4 py-2.5 text-sm bg-gray-50 border border-gray-200 rounded-xl hover:bg-gray-100 font-medium text-gray-700 transition"
                        >
                            {sortOrder === 'asc' ? <FaSortAmountUp className="text-amber-600" /> : <FaSortAmountDown className="text-amber-600" />}
                            {sortOrder === 'asc' ? 'Ascending' : 'Descending'}
                        </button>
                        <span className="text-xs text-gray-500 ml-auto font-medium">
                            {filteredBookings.length} results
                        </span>
                    </div>
                </div>
            </div>

            {/* Searchable Table with Status Changes */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden mb-12">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-gray-50/75 border-b border-gray-200 text-[11px] font-black uppercase tracking-wider text-gray-500">
                                <th className="py-4 px-4 sm:px-6">Booking ID</th>
                                <th className="py-4 px-4 sm:px-6">Devotee</th>
                                <th className="py-4 px-4 sm:px-6">Puja Ceremony</th>
                                <th className="py-4 px-4 sm:px-6">Scheduled Date</th>
                                <th className="py-4 px-4 sm:px-6">Dakshina / Amount</th>
                                <th className="py-4 px-4 sm:px-6">Status</th>
                                <th className="py-4 px-4 sm:px-6 text-center">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 text-sm">
                            {filteredBookings.length === 0 ? (
                                <tr>
                                    <td colSpan="7" className="text-center py-12 text-gray-400">
                                        No Puja bookings match your search and filter criteria.
                                    </td>
                                </tr>
                            ) : (
                                filteredBookings.map(b => (
                                    <tr key={b._id} className="hover:bg-amber-50/40 transition">
                                        <td className="py-4 px-4 sm:px-6 font-mono font-bold text-gray-900 text-xs">
                                            {b.bookingId || b._id.substring(b._id.length - 8).toUpperCase()}
                                        </td>
                                        <td className="py-4 px-4 sm:px-6">
                                            <div className="font-semibold text-gray-900">{b.devoteeName || b.userId?.name || 'Devotee'}</div>
                                            <div className="text-xs text-gray-500">{b.userId?.email || b.devoteePhone || '—'}</div>
                                            {b.devoteeGotra && (
                                                <span className="inline-block text-[10px] bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded mt-0.5">
                                                    Gotra: {b.devoteeGotra}
                                                </span>
                                            )}
                                        </td>
                                        <td className="py-4 px-4 sm:px-6">
                                            <div className="font-medium text-gray-900 line-clamp-1">
                                                {b.pujaName || b.eventId?.title || 'Puja'}
                                            </div>
                                            <div className="text-xs text-gray-500">
                                                {b.eventId?.category || 'Vedic Ritual'}
                                            </div>
                                        </td>
                                        <td className="py-4 px-4 sm:px-6 text-gray-700 whitespace-nowrap">
                                            <div className="flex items-center gap-1.5 text-xs">
                                                <FaCalendarAlt className="text-amber-600 text-xs" />
                                                {new Date(b.pujaDate || b.eventId?.date || b.createdAt).toLocaleDateString('en-US', {
                                                    month: 'short',
                                                    day: 'numeric',
                                                    year: 'numeric'
                                                })}
                                            </div>
                                        </td>
                                        <td className="py-4 px-4 sm:px-6 font-semibold text-gray-900 whitespace-nowrap">
                                            {b.amount === 0 ? (
                                                <span className="text-emerald-600 font-bold">Free (Seva)</span>
                                            ) : (
                                                `₹${b.amount.toLocaleString()}`
                                            )}
                                        </td>
                                        <td className="py-4 px-4 sm:px-6">
                                            <div className="flex items-center gap-2">
                                                <select
                                                    value={b.status}
                                                    disabled={updatingId === b._id}
                                                    onChange={e => handleStatusChange(b._id, e.target.value)}
                                                    className={`text-xs font-bold py-1 px-2.5 rounded-lg border focus:outline-none transition cursor-pointer ${getStatusBadge(
                                                        b.status
                                                    )}`}
                                                >
                                                    {STATUS_OPTIONS.map(opt => (
                                                        <option key={opt} value={opt} className="bg-white text-gray-800 font-normal">
                                                            {opt}
                                                        </option>
                                                    ))}
                                                </select>
                                                {updatingId === b._id && (
                                                    <FaSpinner className="animate-spin text-amber-600 text-xs" />
                                                )}
                                            </div>
                                        </td>
                                        <td className="py-4 px-4 sm:px-6 text-center whitespace-nowrap">
                                            <button
                                                onClick={() => setSelectedBooking(b)}
                                                className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-800 bg-amber-50 hover:bg-amber-100 border border-amber-200 py-1.5 px-3 rounded-lg transition"
                                                title="View Booking Details"
                                            >
                                                <FaEye /> View Details
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Puja Offerings Management List */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 sm:p-8">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-bold text-gray-900">Active Puja Offerings ({events.length})</h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {events.map(ev => (
                        <div key={ev._id} className="border border-gray-200 rounded-xl overflow-hidden flex flex-col justify-between">
                            <div className="p-5">
                                <span className="text-[10px] uppercase font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded">
                                    {ev.category}
                                </span>
                                <h3 className="font-bold text-gray-900 mt-2 text-base">{ev.title}</h3>
                                <p className="text-xs text-gray-500 mt-1 line-clamp-2">{ev.description}</p>
                                <div className="mt-4 pt-3 border-t border-gray-100 flex justify-between text-xs text-gray-600">
                                    <span>Dakshina: <strong>{ev.ticketPrice === 0 ? 'Free' : `₹${ev.ticketPrice}`}</strong></span>
                                    <span>Location: <strong>{ev.location}</strong></span>
                                </div>
                            </div>
                            <div className="px-5 py-3 bg-gray-50 border-t border-gray-100 flex justify-end">
                                <button
                                    onClick={() => handleDeleteEvent(ev._id)}
                                    className="text-xs text-rose-600 hover:text-rose-800 font-bold flex items-center gap-1.5 transition"
                                >
                                    <FaTrashAlt /> Delete Puja
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Booking Details View Modal */}
            {selectedBooking && (
                <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
                    <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden border border-gray-100 animate-fadeIn">
                        <div className="bg-gradient-to-r from-amber-900 to-orange-900 text-white p-6 flex justify-between items-start">
                            <div>
                                <span className="text-xs font-mono font-bold uppercase tracking-wider text-amber-300">
                                    Booking Reference: {selectedBooking.bookingId || selectedBooking._id}
                                </span>
                                <h3 className="text-2xl font-bold mt-1">Puja Booking Details</h3>
                            </div>
                            <button
                                onClick={() => setSelectedBooking(null)}
                                className="text-white/70 hover:text-white p-1 rounded-full transition"
                            >
                                <FaTimes className="text-xl" />
                            </button>
                        </div>

                        <div className="p-6 sm:p-8 space-y-6 max-h-[75vh] overflow-y-auto">
                            <div className="bg-gray-50 rounded-2xl p-5 border border-gray-100">
                                <h4 className="text-xs uppercase font-black text-gray-400 tracking-wider mb-4">
                                    Devotee Information
                                </h4>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                                    <div>
                                        <p className="text-xs text-gray-500">Devotee Full Name</p>
                                        <p className="font-bold text-gray-900 text-base">{selectedBooking.devoteeName || selectedBooking.userId?.name || 'Devotee'}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-500">Email Address</p>
                                        <p className="font-semibold text-gray-800">{selectedBooking.userId?.email || 'N/A'}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-500">Contact Number</p>
                                        <p className="font-semibold text-gray-800">{selectedBooking.devoteePhone || 'Not provided'}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-500">Devotee Gotra</p>
                                        <p className="font-semibold text-amber-800">{selectedBooking.devoteeGotra || 'Not specified'}</p>
                                    </div>
                                    {selectedBooking.specialInstructions && (
                                        <div className="sm:col-span-2">
                                            <p className="text-xs text-gray-500">Sankalpam / Special Prayers</p>
                                            <p className="text-gray-800 italic bg-white p-3 rounded-lg border border-gray-200 mt-1">
                                                "{selectedBooking.specialInstructions}"
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="bg-amber-50/50 rounded-2xl p-5 border border-amber-200/60">
                                <h4 className="text-xs uppercase font-black text-amber-800 tracking-wider mb-4">
                                    Puja & Schedule Details
                                </h4>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                                    <div>
                                        <p className="text-xs text-gray-500">Puja Offering</p>
                                        <p className="font-bold text-gray-900 text-base">
                                            {selectedBooking.pujaName || selectedBooking.eventId?.title || 'Puja Ceremony'}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-500">Sanctum / Location</p>
                                        <p className="font-semibold text-gray-800">{selectedBooking.eventId?.location || 'Sanctum'}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-500">Puja Date & Time</p>
                                        <p className="font-semibold text-gray-800">
                                            {new Date(selectedBooking.pujaDate || selectedBooking.eventId?.date || selectedBooking.createdAt).toLocaleString()}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-500">Dakshina / Amount</p>
                                        <p className="font-bold text-emerald-700 text-lg">
                                            {selectedBooking.amount === 0 ? 'Free (Seva)' : `₹${selectedBooking.amount}`}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="border border-gray-200 rounded-2xl p-5">
                                <h4 className="text-xs uppercase font-black text-gray-500 tracking-wider mb-3">
                                    Update Booking Status
                                </h4>
                                <div className="flex flex-wrap gap-2">
                                    {STATUS_OPTIONS.map(st => (
                                        <button
                                            key={st}
                                            disabled={updatingId === selectedBooking._id}
                                            onClick={() => handleStatusChange(selectedBooking._id, st)}
                                            className={`px-4 py-2 text-xs font-bold rounded-xl border transition ${
                                                selectedBooking.status === st
                                                    ? 'bg-amber-800 text-white border-amber-900 shadow-sm'
                                                    : 'bg-white hover:bg-gray-100 text-gray-700 border-gray-300'
                                            }`}
                                        >
                                            {st}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div className="bg-gray-50 p-4 px-6 border-t border-gray-200 flex justify-end">
                            <button
                                onClick={() => setSelectedBooking(null)}
                                className="px-6 py-2.5 bg-gray-900 hover:bg-black text-white text-sm font-bold rounded-xl transition"
                            >
                                Close View
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminDashboard;
