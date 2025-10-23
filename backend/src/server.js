const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();


app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));


app.use('/uploads', express.static(path.join(__dirname, 'uploads')));


app.use('/api/auth', require('./routes/auth.routes'));
app.use('/api/jobs', require('./routes/jobs.routes'));
app.use('/api/companies', require('./routes/companies.routes'));
app.use('/api/applications', require('./routes/applications.routes'));


app.get('/api/health', (req, res) => {
  res.json({ message: 'Job Board API is running!' });
});


app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!' });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
