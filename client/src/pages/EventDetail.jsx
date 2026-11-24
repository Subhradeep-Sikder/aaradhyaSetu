import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../utils/axios';
import { AuthContext } from '../context/AuthContext';
import { FaCalendarAlt, FaMapMarkerAlt, FaOm, FaCheckCircle, FaTrashAlt } from 'react-icons/fa';

const EventDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useContext(AuthContext);
    const [event, setEvent] = useState(null);
    const [loading, setLoading] = useState(true);
    const [bookingLoading, setBookingLoading] = useState(false);
    const [error, setError] = useState('');
    const [successMsg, setSuccessMsg] = useState('');
    const [bookingRef, setBookingRef] = useState('');

    const [devoteeName, setDevoteeName] = useState(user?.name || '');
    const [devoteePhone, setDevoteePhone] = useState('');
    const [devoteeGotra, setDevoteeGotra] = useState('');
    const [specialInstructions, setSpecialInstructions] = useState('');

    useEffect(() => {
        if (user && !devoteeName) {
            setDevoteeName(user.name);
        }
    }, [user]);

    useEffect(() => {
        const fetchEvent = async () => {
            try {
                const { data } = await api.get(`/events/${id}`);
                setEvent(data);
            } catch (err) {
                setError('Failed to load Puja details.');
            } finally {
                setLoading(false);
            }
        };
        fetchEvent();
    }, [id]);

    const handleBooking = async (e) => {
        e.preventDefault();
        if (!user) {
            navigate('/login');
            return;
        }
        setBookingLoading(true);
        setError('');
        setSuccessMsg('');

        try {
            const { data } = await api.post('/bookings', {
                eventId: event._id,
                devoteeName: devoteeName || user.name,
                devoteePhone,
                devoteeGotra,
                specialInstructions,
                pujaDate: event.date
            });
            setBookingRef(data.booking?.bookingId || '');
            setSuccessMsg('Puja booking request submitted successfully! Awaiting temple confirmation.');
        } catch (err) {
            setError(err.response?.data?.message || 'Booking failed');
        } finally {
            setBookingLoading(false);
        }
    };

    const handleDeletePuja = async () => {
        if (window.confirm('Are you sure you want to delete this Puja? All associated devotee bookings will also be deleted.')) {
            try {
                await api.delete(`/events/${event._id}`);
                navigate(user.role === 'admin' ? '/admin' : '/');
            } catch (err) {
                alert(err.response?.data?.message || 'Error deleting Puja');
            }
        }
    };

    if (loading) return <div className="text-center py-20 text-xl font-semibold text-amber-800">Loading Puja details...</div>;
    if (error && !event) return <div className="text-center py-20 text-xl text-red-500">{error || 'Puja not found'}</div>;

    return (
        <div className="max-w-4xl mx-auto bg-white rounded-3xl shadow-xl overflow-hidden mt-6 border border-amber-100">
            {event.image ? (
                <div className="relative h-80 overflow-hidden">
                    <img src={event.image} alt={event.title} className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent"></div>
                    <div className="absolute bottom-6 left-6 text-white">
                        <span className="bg-amber-500 text-black text-xs font-black px-3 py-1 rounded-full uppercase tracking-wider">
                            {event.category || 'Vedic Puja'}
                        </span>
                    </div>
                </div>
            ) : (
                <div className="w-full h-64 bg-gradient-to-r from-amber-900 to-orange-950 flex items-center justify-center text-amber-200/40 text-6xl font-black uppercase tracking-widest">
                    <FaOm />
                </div>
            )}

            <div className="p-6 md:p-10">
                <div className="flex flex-col lg:flex-row justify-between items-start gap-8">
                    {/* Left Details */}
                    <div className="flex-1">
                        <div className="flex flex-wrap items-center justify-between gap-4 mb-3">
                            <h1 className="text-3xl md:text-4xl font-black text-gray-900">{event.title}</h1>
                            {user && (user.role === 'admin' || event.createdBy?._id === user._id || event.createdBy === user._id) && (
                                <button
                                    onClick={handleDeletePuja}
                                    className="inline-flex items-center gap-1.5 text-xs font-bold text-rose-600 bg-rose-50 hover:bg-rose-100 border border-rose-200 py-2 px-3.5 rounded-xl transition"
                                >
                                    <FaTrashAlt /> Delete Puja
                                </button>
                            )}
                        </div>
                        <p className="text-gray-600 text-base sm:text-lg leading-relaxed mb-6">{event.description}</p>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
                            <div className="flex items-center gap-3 text-gray-700 bg-amber-50/50 p-4 rounded-xl border border-amber-100">
                                <FaCalendarAlt className="text-amber-700 text-xl shrink-0" />
                                <div>
                                    <p className="text-xs text-gray-500 font-bold uppercase">Puja Date</p>
                                    <p className="text-sm font-semibold">{new Date(event.date).toLocaleDateString()} {new Date(event.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3 text-gray-700 bg-amber-50/50 p-4 rounded-xl border border-amber-100">
                                <FaMapMarkerAlt className="text-amber-700 text-xl shrink-0" />
                                <div>
                                    <p className="text-xs text-gray-500 font-bold uppercase">Sanctum / Location</p>
                                    <p className="text-sm font-semibold">{event.location}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right Devotee Booking Form */}
                    <div className="bg-gray-50 p-6 rounded-2xl border border-gray-200 min-w-[320px] w-full lg:w-96 shrink-0 shadow-sm">
                        <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                            <FaOm className="text-amber-600" /> Devotee Registration
                        </h3>

                        <div className="flex justify-between items-center py-2 border-b border-gray-200 mb-6 text-sm">
                            <span className="text-gray-500 font-semibold">Dakshina</span>
                            <span className="font-black text-lg text-amber-900">
                                {event.ticketPrice === 0 ? <span className="text-emerald-600">Free (Seva)</span> : `₹${event.ticketPrice}`}
                            </span>
                        </div>

                        {successMsg ? (
                            <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-4 rounded-xl text-center space-y-2">
                                <FaCheckCircle className="text-2xl text-emerald-600 mx-auto" />
                                <p className="font-bold">{successMsg}</p>
                                {bookingRef && (
                                    <p className="text-xs font-mono font-bold bg-emerald-100 py-1 rounded">
                                        ID: {bookingRef}
                                    </p>
                                )}
                                <button
                                    onClick={() => navigate('/dashboard')}
                                    className="mt-3 text-xs bg-emerald-700 hover:bg-emerald-800 text-white font-bold py-2 px-4 rounded-lg transition"
                                >
                                    View in Dashboard
                                </button>
                            </div>
                        ) : (
                            <form onSubmit={handleBooking} className="space-y-4">
                                {error && <div className="text-xs text-red-600 font-bold bg-red-50 p-2 rounded">{error}</div>}

                                <div>
                                    <label className="block text-xs font-bold text-gray-700 mb-1">Devotee Name *</label>
                                    <input
                                        type="text"
                                        required
                                        value={devoteeName}
                                        onChange={e => setDevoteeName(e.target.value)}
                                        placeholder="Full name for Sankalp"
                                        className="w-full text-sm px-3 py-2 bg-white rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-amber-500"
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-gray-700 mb-1">Contact Phone</label>
                                    <input
                                        type="tel"
                                        value={devoteePhone}
                                        onChange={e => setDevoteePhone(e.target.value)}
                                        placeholder="+91 98765 43210"
                                        className="w-full text-sm px-3 py-2 bg-white rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-amber-500"
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-gray-700 mb-1">Gotra</label>
                                    <input
                                        type="text"
                                        value={devoteeGotra}
                                        onChange={e => setDevoteeGotra(e.target.value)}
                                        placeholder="e.g. Kashyap, Bharadwaj"
                                        className="w-full text-sm px-3 py-2 bg-white rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-amber-500"
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-gray-700 mb-1">Special Sankalp / Note</label>
                                    <textarea
                                        rows="2"
                                        value={specialInstructions}
                                        onChange={e => setSpecialInstructions(e.target.value)}
                                        placeholder="Names of family members, specific prayer..."
                                        className="w-full text-sm px-3 py-2 bg-white rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-amber-500"
                                    ></textarea>
                                </div>

                                <button
                                    type="submit"
                                    disabled={bookingLoading}
                                    className="w-full py-3 rounded-xl font-bold text-sm transition shadow-md bg-amber-600 hover:bg-amber-700 text-white"
                                >
                                    {bookingLoading ? 'Submitting...' : 'Book Puja Now'}
                                </button>
                            </form>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default EventDetail;
