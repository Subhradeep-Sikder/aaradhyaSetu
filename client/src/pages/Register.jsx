import React, { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { FaUser, FaUserShield } from 'react-icons/fa';

const Register = () => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [role, setRole] = useState('user');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const { register } = useContext(AuthContext);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            const data = await register(name, email, password, role);
            if (data?.role === 'admin' || role === 'admin') {
                navigate('/admin');
            } else {
                navigate('/dashboard');
            }
        } catch (err) {
            setError(typeof err === 'string' ? err : (err?.message || 'Registration failed'));
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-md mx-auto mt-16 bg-white p-8 rounded-xl shadow-lg border border-gray-100">
            <div className="text-center mb-8">
                <h2 className="text-3xl font-extrabold text-gray-900 mb-2">Create an Account</h2>
                <p className="text-gray-500">Join AARADHYA SETU today</p>
            </div>

            {error && <div className="bg-red-50 text-red-600 p-3 rounded-lg mb-6 text-center shadow-inner border border-red-100">{error}</div>}

            <form onSubmit={handleSubmit} className="space-y-5">
                {/* Side by Side Role Selector */}
                <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">I want to join as</label>
                    <div className="grid grid-cols-2 gap-3">
                        <button
                            type="button"
                            onClick={() => setRole('user')}
                            className={`flex items-center justify-center gap-2 py-3 px-4 rounded-lg font-medium border text-sm transition-all duration-200 cursor-pointer ${
                                role === 'user'
                                    ? 'bg-gray-900 text-white border-gray-900 shadow-md ring-2 ring-gray-900/10'
                                    : 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100 hover:border-gray-300'
                            }`}
                        >
                            <FaUser className={role === 'user' ? 'text-white' : 'text-gray-500'} />
                            <span>User</span>
                        </button>
                        <button
                            type="button"
                            onClick={() => setRole('admin')}
                            className={`flex items-center justify-center gap-2 py-3 px-4 rounded-lg font-medium border text-sm transition-all duration-200 cursor-pointer ${
                                role === 'admin'
                                    ? 'bg-gray-900 text-white border-gray-900 shadow-md ring-2 ring-gray-900/10'
                                    : 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100 hover:border-gray-300'
                            }`}
                        >
                            <FaUserShield className={role === 'admin' ? 'text-white' : 'text-gray-500'} />
                            <span>Admin</span>
                        </button>
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Full Name</label>
                    <input
                        type="text"
                        required
                        className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-gray-700 transition shadow-sm"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                    />
                </div>
                <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Email Address</label>
                    <input
                        type="email"
                        required
                        className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-gray-700 transition shadow-sm"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                    />
                </div>
                <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Password</label>
                    <input
                        type="password"
                        required
                        className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-gray-700 transition shadow-sm"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                    />
                </div>

                <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-gray-900 text-white font-bold py-3 rounded-lg hover:bg-black focus:ring-4 focus:ring-gray-200 transition shadow-md mt-4 cursor-pointer"
                >
                    {loading ? 'Processing...' : 'Sign Up'}
                </button>
            </form>

            <p className="text-center mt-6 text-gray-600">
                Already have an account? <Link to="/login" className="text-gray-900 font-bold hover:underline">Sign in</Link>
            </p>
        </div>
    );
};

export default Register;
