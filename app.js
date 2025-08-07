const express = require('express');
const cors = require('cors');

const ApiError = require('./app/api-error');

const app = express();

const bookRoutes = require('./app/routes/book.route');
const publisherRouter = require('./app/routes/publisher.route');
const readerRouter = require('./app/routes/reader.route');
const staffRouter = require('./app/routes/staff.route');
const muonsachRouter = require('./app/routes/muonsach.route'); 
const readerController = require('./app/controllers/reader.controller');
const staffController = require('./app/controllers/staff.controller');
const StaffService = require('./app/services/staff.service');
const ReaderService = require('./app/services/reader.service');
const MongoDB = require('./app/utils/mongodb.util');

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
    res.json({ message: 'Welcome to library book application' });
});

app.use('/api/books', bookRoutes);
app.use('/api/publishers', publisherRouter);
app.use('/api/readers', readerRouter);
app.use('/api/staffs', staffRouter);
app.use('/api/muonsachs', muonsachRouter); // add this

app.post('/api/login', async (req, res, next) => {
    const { username, password } = req.body;
    if (!username || !password) {
        return next(new ApiError(400, "Username and password are required"));
    }
    // Thử đăng nhập staff trước
    const staffService = new StaffService(MongoDB.client);
    const staff = await staffService.findByUsername(username);
    if (staff && await staffService.comparePassword(staff, password)) {
        const { password: _, passwordStaff, ...staffWithoutPassword } = staff;
        return res.send({
            message: "Login successfully",
            staff: staffWithoutPassword,
            role: "staff"
        });
    }
    // Nếu không phải staff, thử reader
    const readerService = new ReaderService(MongoDB.client);
    const reader = await readerService.findByUsername(username);
    if (reader && await readerService.comparePassword(reader, password)) {
        const { password: _, ...readerWithoutPassword } = reader;
        return res.send({
            message: "Login successfully",
            reader: readerWithoutPassword,
            role: "reader"
        });
    }
    return next(new ApiError(401, "Invalid username or password"));
});

app.post('/api/logout', (req, res) => {
    return res.send({ message: "Logged out successfully" });
});

// Handle 404 errors
app.use((req, res, next) => {
    return next(new ApiError(404, 'Resource not found'));
});

//define error handling middleware
app.use((err, req, res, next) => {
    return res.status(err.statusCode || 500).json({
        message: err.message || 'Internal Server Error',
    });
});

module.exports = app;