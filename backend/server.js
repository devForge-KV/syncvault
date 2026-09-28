require('dotenv').config();

const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const authRoutes = require('./routes/authRoutes');
const projectRoutes = require('./routes/projectRoutes');
const milestoneRoutes = require('./routes/milestoneRoutes');
const adminRoutes = require('./routes/adminRoutes');

const app = express();

const connectDB = async () => {
  try {
    const mongoUri = process.env.MONGO_URI;

    if (!mongoUri) {
      throw new Error('MONGO_URI is not configured');
    }

	await mongoose.connect(mongoUri);
	console.log('MongoDB connected');
  } catch (error) {
    console.error('MongoDB connection error:', error.message);
    process.exit(1);
  }
};

app.use(cors());
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/milestones', milestoneRoutes);
app.use('/api/admin', adminRoutes);

app.use((req, res) => {
	res.status(404).json({ message: 'Route not found' });
});

app.use((error, req, res, next) => {
	console.error(error);

	const statusCode = res.statusCode >= 400 ? res.statusCode : 500;
	res.status(statusCode).json({
		message: process.env.NODE_ENV === 'production'
			? 'Internal server error'
			: error.message,
	});
});

const port = process.env.PORT || 5000;

const startServer = async () => {
	await connectDB();
	app.listen(port, () => {
		console.log(`SyncVault API listening on port ${port}`);
	});
};

if (require.main === module) {
	startServer();
}

module.exports = app;
