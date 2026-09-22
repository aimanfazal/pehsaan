require('dotenv').config();
const express = require('express');
const cors = require('cors');

const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const schoolRoutes = require('./routes/schools');
const companyRoutes = require('./routes/companies');
const educationRoutes = require('./routes/education');
const employmentRoutes = require('./routes/employment');
const skillRoutes = require('./routes/skills');
const connectionRoutes = require('./routes/connections');
const postRoutes = require('./routes/posts');

const app = express();
app.use(cors());
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/schools', schoolRoutes);
app.use('/api/companies', companyRoutes);
app.use('/api/education', educationRoutes);
app.use('/api/employment', employmentRoutes);
app.use('/api/skills', skillRoutes);
app.use('/api/connections', connectionRoutes);
app.use('/api/posts', postRoutes);

app.get('/api/health', (req, res) => res.json({ status: 'ok' }));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Pehsaan API running on http://localhost:${PORT}`));
