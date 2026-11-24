import Booking from '../models/Booking.js';
import Event from '../models/Event.js';

// Create a Puja booking
export const bookEvent = async (req, res) => {
    try {
        const { eventId, devoteeName, devoteePhone, devoteeGotra, specialInstructions, pujaDate } = req.body;

        const event = await Event.findById(eventId);
        if (!event) return res.status(404).json({ message: 'Puja event not found' });

        const bookingId = 'PB-' + Math.floor(100000 + Math.random() * 900000);

        const booking = await Booking.create({
            bookingId,
            userId: req.user.id,
            eventId,
            pujaName: event.title,
            pujaDate: pujaDate || event.date,
            devoteeName: devoteeName || req.user.name || 'Devotee',
            devoteePhone: devoteePhone || '',
            devoteeGotra: devoteeGotra || '',
            specialInstructions: specialInstructions || '',
            status: 'Pending',
            amount: event.ticketPrice
        });

        res.status(201).json({ message: 'Puja booked successfully', booking });
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

// Update booking status (Admin: Pending, Confirmed, In Progress, Completed, Cancelled)
export const updateBookingStatus = async (req, res) => {
    try {
        const { status } = req.body;
        const validStatuses = ['Pending', 'Confirmed', 'In Progress', 'Completed', 'Cancelled'];

        if (status && !validStatuses.includes(status)) {
            return res.status(400).json({ message: `Invalid status. Must be one of: ${validStatuses.join(', ')}` });
        }

        const booking = await Booking.findById(req.params.id).populate('userId', 'name email').populate('eventId');
        if (!booking) return res.status(404).json({ message: 'Booking not found' });

        if (status) booking.status = status;
        await booking.save();

        res.json({ message: 'Booking status updated successfully', booking });
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

export const confirmBooking = async (req, res) => {
    req.body.status = 'Confirmed';
    return updateBookingStatus(req, res);
};

export const getBookingById = async (req, res) => {
    try {
        const booking = await Booking.findById(req.params.id)
            .populate('userId', 'name email')
            .populate('eventId');
        if (!booking) return res.status(404).json({ message: 'Booking not found' });

        if (req.user.role !== 'admin' && booking.userId._id.toString() !== req.user.id) {
            return res.status(403).json({ message: 'Not authorized to view this booking' });
        }

        res.json(booking);
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

export const getMyBookings = async (req, res) => {
    try {
        const { search, status, sortBy = 'createdAt', sortOrder = 'desc' } = req.query;

        let query = {};
        if (req.user.role !== 'admin') {
            query.userId = req.user.id;
        }

        if (status && status !== 'All') {
            query.status = status;
        }

        let bookings = await Booking.find(query)
            .populate('eventId')
            .populate('userId', 'name email')
            .sort({ [sortBy]: sortOrder === 'asc' ? 1 : -1 });

        if (search && search.trim() !== '') {
            const term = search.trim().toLowerCase();
            bookings = bookings.filter(b => {
                const bId = (b.bookingId || '').toLowerCase();
                const dName = (b.devoteeName || b.userId?.name || '').toLowerCase();
                const pTitle = (b.pujaName || b.eventId?.title || '').toLowerCase();
                return bId.includes(term) || dName.includes(term) || pTitle.includes(term);
            });
        }

        res.json(bookings);
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

export const cancelBooking = async (req, res) => {
    try {
        const booking = await Booking.findById(req.params.id);
        if (!booking) return res.status(404).json({ message: 'Booking not found' });
        if (booking.userId.toString() !== req.user.id && req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Not authorized' });
        }
        if (booking.status === 'Cancelled') return res.status(400).json({ message: 'Already cancelled' });

        booking.status = 'Cancelled';
        await booking.save();

        res.json({ message: 'Booking cancelled successfully', booking });
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};
