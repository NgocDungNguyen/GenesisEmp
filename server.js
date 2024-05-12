const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const path = require('path');
const apiRoutes = require('./src/routes/api.routes');
const bangiaoRoutes = require('./src/routes/bangiao.routes');
const backupRoutes = require('./src/routes/backup.routes');

console.log('api.routes.js and bangiao.routes.js file imported successfully!');

const app = express();
app.use(cors());


const port = process.env.PORT || 3000;

// Kết nối với MongoDB
mongoose.connect('mongodb+srv://s3978535:RedPoint2905@cluster1.vqvlwni.mongodb.net/', {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log('Connected to MongoDB'))
.catch(err => console.error('Failed to connect to MongoDB', err));

// Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

app.get('/script.js', (req, res) => {
  res.setHeader('Content-Type', 'application/javascript');
  res.sendFile(path.join(__dirname, './public/script.js'));
});

app.use('/api', bangiaoRoutes);

app.get('/bangiao.js', (req, res) => {
  res.setHeader('Content-Type', 'application/javascript');
  res.sendFile(path.join(__dirname, './public/bangiao.js'));
});

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, './public/index.html'));
});

app.use('/api/backup', require('./src/routes/backup.routes')); // Đảm bảo đường dẫn này chính xác


app.use('/api', apiRoutes);

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
