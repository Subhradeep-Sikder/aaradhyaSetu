import Event from '../models/Event.js';
import Booking from '../models/Booking.js';

export const getEvents = async (req, res) => {
    try {
        const { category, search } = req.query;
        let filters = {};

        if (category) filters.category = category;
        if (search) {
            filters.title = { $regex: search, $options: 'i' };
        }

        const events = await Event.find(filters).populate('createdBy', 'name');
        res.json(events);
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

export const getEventById = async (req, res) => {
    try {
        const event = await Event.findById(req.params.id).populate('createdBy', 'name');
        if (!event) return res.status(404).json({ message: 'Event not found' });
        res.json(event);
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

export const createEvent = async (req, res) => {
    try {
        const { title, description, date, location, category, ticketPrice, image } = req.body;
        const event = await Event.create({
            title,
            description,
            date,
            location,
            category,
            ticketPrice: ticketPrice || 0,
            image: image || '',
            createdBy: req.user.id
        });
        res.status(201).json(event);
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

export const updateEvent = async (req, res) => {
    try {
        const event = await Event.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!event) return res.status(404).json({ message: 'Event not found' });
        res.json(event);
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

// Delete event: allowed for Admin or the user who created it.
// Cascades to remove all associated user booking details.
export const deleteEvent = async (req, res) => {
    try {
        const event = await Event.findById(req.params.id);
        if (!event) return res.status(404).json({ message: 'Event not found' });

        // Allow if user is admin or the creator of the event
        if (req.user.role !== 'admin' && (!event.createdBy || event.createdBy.toString() !== req.user.id)) {
            return res.status(403).json({ message: 'Not authorized to delete this Puja event' });
        }

        // Delete all bookings associated with this event
        await Booking.deleteMany({ eventId: event._id });

        // Delete the event itself
        await event.deleteOne();

        res.json({ message: 'Puja event and all associated bookings deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};
