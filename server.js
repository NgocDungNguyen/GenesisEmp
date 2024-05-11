const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const path = require('path');
const apiRoutes = require('./src/routes/api.routes');
const bangiaoRoutes = require('./src/routes/bangiao.routes');

console.log('api.routes.js và bangiao.routes.js đã được nhập thành công!');

const app = express();
app.use(cors());

const port = process.env.PORT || 3000;

// Kết nối với MongoDB
mongoose.connect('mongodb+srv://s3978535:RedPoint2905@cluster1.vqvlwni.mongodb.net/', {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log('Đã kết nối với MongoDB'))
.catch(err => console.error('Kết nối MongoDB thất bại', err));

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

app.use('/api', apiRoutes);

app.listen(port, () => {
  console.log(`Máy chủ đang chạy trên cổng ${port}`);
});