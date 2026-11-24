import mongoose from 'mongoose';

const bookingSchema = new mongoose.Schema({
    bookingId: {
        type: String,
        unique: true,
        required: true,
        default: () => 'PB-' + Math.random().toString(36).substring(2, 8).toUpperCase()
    },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    devoteeName: { type: String, required: true },
    devoteePhone: { type: String, default: '' },
    devoteeGotra: { type: String, default: '' },
    specialInstructions: { type: String, default: '' },
    eventId: { type: mongoose.Schema.Types.ObjectId, ref: 'Event', required: true },
    pujaName: { type: String },
    pujaDate: { type: Date },
    status: {
        type: String,
        enum: ['Pending', 'Confirmed', 'In Progress', 'Completed', 'Cancelled'],
        default: 'Pending'
    },
    amount: { type: Number, required: true, default: 0 },
    bookedAt: { type: Date, default: Date.now }
}, { timestamps: true });

export default mongoose.model('Booking', bookingSchema);
