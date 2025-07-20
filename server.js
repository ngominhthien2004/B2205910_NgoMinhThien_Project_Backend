const app = require('./app');
const congfig = require('./app/config');

const PORT = congfig.app.port;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});