const express = require('express');
const cors = require('cors');

const ApiError = require('./app/api-error');

const app = express();

const bookRoutes = require('./app/routes/book.route');

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
    res.json({ message: 'Welcome to library book application' });
});

app.use('/api/books', bookRoutes);

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