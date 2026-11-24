import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import api from '../utils/axios';
import { Link, useNavigate } from 'react-router-dom';
import { FaTicketAlt, FaTimesCircle, FaEye, FaTimes, FaCalendarAlt, FaOm } from 'react-icons/fa';

const UserDashboard = () => {
    const { user } = useContext(AuthContext);
    const navigate = useNavigate();
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedBooking, setSelectedBooking] = useState(null);

    useEffect(() => {
        if (!user) {
            navigate('/login');
            return;
        }
        fetchBookings();
    }, [user, navigate]);

    const fetchBookings = async () => {
        try {
            const { data } = await api.get('/bookings/my');
            setBookings(data);
        } catch (error) {
            console.error('Error fetching bookings', error);
        } finally {
            setLoading(false);
        }
    };

    const cancelBooking = async (id) => {
        if (window.confirm('Are you sure you want to cancel this Puja booking request?')) {
            try {
                await api.delete(`/bookings/${id}`);
                fetchBookings();
            } catch (error) {
                alert(error.response?.data?.message || 'Error cancelling booking');
            }
        }
    };

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

    if (loading) return <div className="text-center py-20 text-xl font-semibold text-amber-800">Loading your Puja dashboard...</div>;

    return (
        <div className="max-w-6xl mx-auto pb-16">
            <div className="bg-white rounded-2xl shadow-sm p-6 sm:p-8 mb-8 border border-amber-100 flex flex-col sm:flex-row items-center sm:items-start text-center sm:text-left gap-4 sm:gap-6">
                <div className="w-20 h-20 bg-amber-100 text-amber-900 rounded-full flex items-center justify-center text-3xl font-bold uppercase tracking-widest shrink-0">
                    {user?.name.charAt(0)}
                </div>
                <div className="flex flex-col items-center sm:items-start">
                    <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 mb-2">Welcome, {user?.name}!</h1>
                    <p className="text-amber-800 text-sm flex items-center justify-center sm:justify-start gap-2">
                        <span className="w-2 h-2 rounded-full bg-emerald-500"></span> Devotee Dashboard
                    </p>
                </div>
            </div>

            <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl sm:text-2xl font-bold text-gray-800 flex items-center gap-2 sm:gap-3">
                    <FaOm className="text-amber-600" /> My Puja Bookings ({bookings.length})
                </h2>
            </div>

            {bookings.length === 0 ? (
                <div className="bg-white rounded-2xl shadow-sm p-12 text-center border border-gray-100">
                    <div className="w-20 h-20 bg-amber-50 rounded-full flex items-center justify-center mx-auto mb-4">
                        <FaOm className="text-amber-600 text-3xl" />
                    </div>
                    <p className="text-xl text-gray-600 mb-6 mt-4 font-medium">You haven't booked any Puja ceremonies yet.</p>
                    <Link to="/" className="inline-block bg-amber-600 hover:bg-amber-700 text-white font-bold py-3 px-8 rounded-xl transition shadow-md">
                        Explore Puja Ceremonies
                    </Link>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {bookings.map((booking) => (
                        <div key={booking._id} className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition border border-gray-200 flex flex-col">
                            <div className="p-6 border-b border-gray-100 flex-grow">
                                <div className="flex justify-between items-start mb-3">
                                    <span className="text-[11px] font-mono font-bold bg-gray-100 text-gray-700 px-2 py-0.5 rounded">
                                        ID: {booking.bookingId || booking._id.substring(booking._id.length - 8).toUpperCase()}
                                    </span>
                                    <span className={`px-2.5 py-0.5 text-xs font-bold rounded-lg border ${getStatusBadge(booking.status)}`}>
                                        {booking.status}
                                    </span>
                                </div>

                                <h3 className="text-lg font-bold text-gray-900 leading-tight mb-2">
                                    {booking.pujaName || booking.eventId?.title || 'Puja Ceremony'}
                                </h3>

                                <div className="text-xs text-gray-500 space-y-1.5 mb-4">
                                    <p>
                                        <strong className="text-gray-700">Devotee:</strong> {booking.devoteeName || user.name}
                                    </p>
                                    {booking.devoteeGotra && (
                                        <p>
                                            <strong className="text-gray-700">Gotra:</strong> {booking.devoteeGotra}
                                        </p>
                                    )}
                                    <p>
                                        <strong className="text-gray-700">Puja Date:</strong>{' '}
                                        {new Date(booking.pujaDate || booking.eventId?.date || booking.createdAt).toLocaleDateString()}
                                    </p>
                                    <p>
                                        <strong className="text-gray-700">Dakshina:</strong>{' '}
                                        <span className="font-bold text-gray-900">
                                            {booking.amount === 0 ? 'Free (Seva)' : `₹${booking.amount}`}
                                        </span>
                                    </p>
                                </div>
                            </div>

                            <div className="p-4 bg-gray-50 border-t border-gray-100 flex items-center justify-between text-xs">
                                <button
                                    onClick={() => setSelectedBooking(booking)}
                                    className="font-bold text-amber-700 hover:text-amber-900 flex items-center gap-1"
                                >
                                    <FaEye /> View Details
                                </button>

                                {booking.status !== 'Cancelled' && booking.status !== 'Completed' && (
                                    <button
                                        onClick={() => cancelBooking(booking._id)}
                                        className="font-semibold text-rose-600 hover:text-rose-800 flex items-center gap-1"
                                    >
                                        <FaTimesCircle /> Cancel
                                    </button>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Devotee Booking Details Modal */}
            {selectedBooking && (
                <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
                    <div className="bg-white w-full max-w-xl rounded-3xl shadow-2xl overflow-hidden border border-gray-100">
                        <div className="bg-amber-900 text-white p-6 flex justify-between items-start">
                            <div>
                                <span className="text-xs font-mono font-bold uppercase tracking-wider text-amber-300">
                                    Booking Ref: {selectedBooking.bookingId || selectedBooking._id}
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

                        <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto text-sm">
                            <div className="flex justify-between items-center py-2 border-b border-gray-100">
                                <span className="text-gray-500">Status</span>
                                <span className={`px-3 py-1 text-xs font-bold rounded-lg border ${getStatusBadge(selectedBooking.status)}`}>
                                    {selectedBooking.status}
                                </span>
                            </div>
                            <div className="flex justify-between items-center py-2 border-b border-gray-100">
                                <span className="text-gray-500">Puja Ceremony</span>
                                <span className="font-bold text-gray-900">{selectedBooking.pujaName || selectedBooking.eventId?.title}</span>
                            </div>
                            <div className="flex justify-between items-center py-2 border-b border-gray-100">
                                <span className="text-gray-500">Devotee Name</span>
                                <span className="font-semibold text-gray-800">{selectedBooking.devoteeName || user.name}</span>
                            </div>
                            <div className="flex justify-between items-center py-2 border-b border-gray-100">
                                <span className="text-gray-500">Devotee Gotra</span>
                                <span className="font-semibold text-gray-800">{selectedBooking.devoteeGotra || 'Not provided'}</span>
                            </div>
                            <div className="flex justify-between items-center py-2 border-b border-gray-100">
                                <span className="text-gray-500">Contact Number</span>
                                <span className="font-semibold text-gray-800">{selectedBooking.devoteePhone || 'Not provided'}</span>
                            </div>
                            <div className="flex justify-between items-center py-2 border-b border-gray-100">
                                <span className="text-gray-500">Puja Date</span>
                                <span className="font-semibold text-gray-800">
                                    {new Date(selectedBooking.pujaDate || selectedBooking.eventId?.date || selectedBooking.createdAt).toLocaleString()}
                                </span>
                            </div>
                            <div className="flex justify-between items-center py-2 border-b border-gray-100">
                                <span className="text-gray-500">Dakshina</span>
                                <span className="font-bold text-emerald-700">
                                    {selectedBooking.amount === 0 ? 'Free (Seva)' : `₹${selectedBooking.amount}`}
                                </span>
                            </div>
                            {selectedBooking.specialInstructions && (
                                <div className="py-2">
                                    <span className="text-gray-500 block mb-1">Special Sankalp:</span>
                                    <p className="bg-amber-50/50 p-3 rounded-xl border border-amber-200 text-gray-800 italic">
                                        "{selectedBooking.specialInstructions}"
                                    </p>
                                </div>
                            )}
                        </div>

                        <div className="bg-gray-50 p-4 border-t border-gray-200 flex justify-end">
                            <button
                                onClick={() => setSelectedBooking(null)}
                                className="px-5 py-2 bg-gray-900 text-white font-bold rounded-xl text-sm hover:bg-black transition"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default UserDashboard;
