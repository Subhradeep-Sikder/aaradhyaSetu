import express from 'express';
import {
    bookEvent,
    confirmBooking,
    updateBookingStatus,
    getBookingById,
    getMyBookings,
    cancelBooking
} from '../controllers/bookingController.js';
import { protect, admin } from '../middleware/auth.js';

const router = express.Router();

router.post('/', protect, bookEvent);
router.get('/my', protect, getMyBookings);
router.get('/:id', protect, getBookingById);
router.put('/:id/status', protect, admin, updateBookingStatus);
router.put('/:id/confirm', protect, admin, confirmBooking);
router.delete('/:id', protect, cancelBooking);

export default router;
