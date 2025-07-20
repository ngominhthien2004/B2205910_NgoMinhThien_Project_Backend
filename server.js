const app = require('./app');
const congfig = require('./app/config');
const MongoDB = require('./app/utils/mongodb.util');

async function startServer() {
    try {
        await MongoDB.connect(congfig.db.uri);
        console.log('Connected to the database!');

        const PORT = congfig.app.port;
        app.listen(PORT, () => {
            console.log(`Server is running on port ${PORT}`);
        });
    } catch (error) {
        console.log('Cannot connect to the database!', error);
        process.exit();
    }
}

startServer();