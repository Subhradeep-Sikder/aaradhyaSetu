import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../utils/axios';
import { FaCalendarAlt, FaMapMarkerAlt, FaSearch, FaRegClock, FaOm, FaShieldAlt, FaPrayingHands } from 'react-icons/fa';

const Home = () => {
    const [events, setEvents] = useState([]);
    const [search, setSearch] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const timeoutId = setTimeout(() => {
            fetchEvents();
        }, 400); // 400ms debounce
        return () => clearTimeout(timeoutId);
    }, [search]);

    const fetchEvents = async () => {
        try {
            const { data } = await api.get(`/events?search=${search}`);
            setEvents(data);
        } catch (error) {
            console.error('Error fetching events:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex flex-col min-h-screen">
            {/* Hero Section */}
            <div className="relative bg-gradient-to-r from-amber-950 via-amber-900 to-orange-950 text-white rounded-3xl overflow-hidden mb-12 shadow-2xl">
                <div className="absolute inset-0 opacity-20 bg-[url('https://images.unsplash.com/photo-1609342122563-a43ac8917a3a?q=80&w=2000&auto=format&fit=crop')] bg-cover bg-center"></div>
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/30"></div>
                <div className="relative p-8 md:p-16 text-center flex flex-col items-center z-10">
                    <span className="bg-amber-500/20 text-amber-300 backdrop-blur-md px-4 py-1.5 rounded-full text-xs font-bold tracking-widest uppercase mb-6 border border-amber-400/30 flex items-center gap-1.5">
                        <FaOm className="text-amber-400" /> Sacred Devotion & Vedic Rituals
                    </span>
                    <h1 className="text-4xl md:text-6xl font-black mb-6 leading-tight tracking-tight drop-shadow-lg">
                        Puja Booking & <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-300 to-orange-400">
                            Devotee Dashboard
                        </span>
                    </h1>
                    <p className="text-amber-100/90 text-base md:text-lg mb-8 max-w-2xl mx-auto font-normal leading-relaxed">
                        Book sacred Vedic Pujas, Havans, and Temple Abhishekam online. Monitor your booking status from Pending, Confirmed, In Progress to Completed in real-time.
                    </p>

                    <div className="w-full max-w-xl mx-auto relative flex items-center shadow-2xl group">
                        <FaSearch className="absolute left-6 text-amber-700 text-lg group-focus-within:text-amber-900 transition-colors" />
                        <input
                            type="text"
                            placeholder="Search Pujas by name, ritual, or temple..."
                            className="w-full pl-14 pr-6 py-4 rounded-full text-base text-gray-900 bg-white/95 backdrop-blur-sm border-2 border-transparent focus:border-amber-500 focus:outline-none transition-all placeholder-gray-400 font-medium"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>
                </div>
            </div>

            {/* Highlight Features */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12 px-2">
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-amber-100 flex flex-col items-center text-center">
                    <div className="w-14 h-14 bg-amber-100 text-amber-800 rounded-2xl flex items-center justify-center text-2xl mb-4">
                        <FaPrayingHands />
                    </div>
                    <h3 className="text-lg font-bold text-gray-900 mb-2">Sacred Sankalpam</h3>
                    <p className="text-gray-500 text-xs sm:text-sm leading-relaxed">Personalized puja rituals performed by qualified Vedic priests with devotee name and gotra.</p>
                </div>
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-amber-100 flex flex-col items-center text-center">
                    <div className="w-14 h-14 bg-amber-100 text-amber-800 rounded-2xl flex items-center justify-center text-2xl mb-4">
                        <FaRegClock />
                    </div>
                    <h3 className="text-lg font-bold text-gray-900 mb-2">Live Status Tracking</h3>
                    <p className="text-gray-500 text-xs sm:text-sm leading-relaxed">Transparent status changes: Pending review, Confirmed, In Progress ritual, and Completed prasad.</p>
                </div>
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-amber-100 flex flex-col items-center text-center">
                    <div className="w-14 h-14 bg-amber-100 text-amber-800 rounded-2xl flex items-center justify-center text-2xl mb-4">
                        <FaShieldAlt />
                    </div>
                    <h3 className="text-lg font-bold text-gray-900 mb-2">Devotee Dashboard</h3>
                    <p className="text-gray-500 text-xs sm:text-sm leading-relaxed">Manage and inspect all your devotional requests, dates, and dakshina receipts seamlessly.</p>
                </div>
            </div>

            <div className="flex items-center justify-between mb-8 px-2 border-b border-gray-200 pb-4">
                <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900">Auspicious Puja Ceremonies</h2>
                <div className="text-gray-500 text-sm font-medium">{events.length} rituals available</div>
            </div>

            {loading ? (
                <div className="text-center py-20 text-xl font-semibold text-amber-800">Loading rituals...</div>
            ) : events.length === 0 ? (
                <div className="text-center py-20 text-xl text-gray-500">No Puja ceremonies found matching your search.</div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 pb-12">
                    {events.map(event => (
                        <div key={event._id} className="bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition flex flex-col border border-gray-100">
                            <div className="h-48 bg-amber-50 overflow-hidden relative">
                                {event.image ? (
                                    <img src={event.image} alt={event.title} className="w-full h-full object-cover" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center bg-amber-100 text-amber-800 font-bold text-2xl">
                                        {event.category || 'Puja'}
                                    </div>
                                )}
                                <span className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm text-amber-900 text-xs font-black px-3 py-1 rounded-full uppercase tracking-wider">
                                    {event.category || 'Vedic Ritual'}
                                </span>
                            </div>
                            <div className="p-6 flex-grow flex flex-col justify-between">
                                <div>
                                    <h3 className="text-xl font-bold text-gray-900 mb-2 leading-tight">{event.title}</h3>
                                    <p className="text-gray-600 text-sm line-clamp-2 mb-4">{event.description}</p>
                                </div>
                                <div className="space-y-3">
                                    <div className="flex items-center text-xs text-gray-500 gap-2">
                                        <FaCalendarAlt className="text-amber-700 shrink-0" />
                                        <span>{new Date(event.date).toLocaleDateString()}</span>
                                    </div>
                                    <div className="flex items-center text-xs text-gray-500 gap-2">
                                        <FaMapMarkerAlt className="text-amber-700 shrink-0" />
                                        <span className="truncate">{event.location}</span>
                                    </div>
                                    <div className="pt-4 border-t border-gray-100 flex items-center justify-between">
                                        <div>
                                            <p className="text-[10px] uppercase font-bold text-gray-400">Dakshina</p>
                                            <p className="text-lg font-black text-amber-950">
                                                {event.ticketPrice === 0 ? <span className="text-emerald-600">Free</span> : `₹${event.ticketPrice}`}
                                            </p>
                                        </div>
                                        <Link
                                            to={`/events/${event._id}`}
                                            className="bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs py-2 px-4 rounded-xl transition shadow-sm"
                                        >
                                            Book Puja
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default Home;
