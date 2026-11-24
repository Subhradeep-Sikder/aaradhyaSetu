import React, { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const Navbar = () => {
    const { user, logout } = useContext(AuthContext);
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <nav className="bg-gradient-to-r from-amber-950 via-amber-900 to-orange-950 shadow-md border-b border-amber-800/40">
            <div className="container mx-auto px-4">
                <div className="flex flex-col md:flex-row justify-between items-center py-3 sm:py-4 gap-4">
                    <Link to="/" className="flex items-center gap-3 tracking-wide">
                        <img
                            src="https://s3.ap-south-1.amazonaws.com/internal.aaradhya-setu/logo/navbar.png"
                            alt="AARADHYA SETU Logo"
                            className="h-10 sm:h-12 w-auto object-contain"
                        />
                        <span className="text-amber-100 text-xl sm:text-2xl font-black">
                            AARADHYA <span className="text-amber-400">SETU</span>
                        </span>
                    </Link>
                    <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6">
                        <Link to="/" className="text-amber-200 hover:text-white transition font-medium text-sm">Puja Offerings</Link>
                        {user ? (
                            <>
                                <Link
                                    to={user.role === 'admin' ? '/admin' : '/dashboard'}
                                    className="text-amber-200 hover:text-white transition font-semibold text-sm"
                                >
                                    {user.role === 'admin' ? 'Admin Dashboard' : 'My Bookings'}
                                </Link>
                                <span className="text-xs text-amber-300/80 bg-amber-900/80 px-2.5 py-1 rounded-full border border-amber-700/50">
                                    {user.name} ({user.role})
                                </span>
                                <button
                                    onClick={handleLogout}
                                    className="bg-amber-800 hover:bg-black text-white text-xs px-3.5 py-1.5 rounded-lg transition font-medium"
                                >
                                    Logout
                                </button>
                            </>
                        ) : (
                            <>
                                <Link to="/login" className="text-amber-200 hover:text-white transition text-sm font-medium">Login</Link>
                                <Link to="/register" className="bg-amber-400 text-amber-950 hover:bg-amber-300 px-4 py-2 rounded-lg font-bold text-sm transition shadow">Devotee Sign Up</Link>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
