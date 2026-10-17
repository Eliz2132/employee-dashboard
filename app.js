// app.js
// Backend for Employee App - single-file implementation
// Requirements:
// - Exposes CRUD REST API under /api/employees
// - Serves the front-end from dist/build (do not modify)
// - Connects to MongoDB Atlas using MONGODB_URI env var

require('dotenv').config();

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');

const app = express();

// Middleware
app.use(cors());
app.use(express.json()); // for parsing application/json
app.use(express.urlencoded({ extended: true }));

// MongoDB connection
const mongoUri = process.env.MONGODB_URI;
if (!mongoUri) {
  console.error('ERROR: MONGODB_URI environment variable is not set.');
  console.error('Set MONGODB_URI to your MongoDB Atlas connection string.');
  process.exit(1);
}

mongoose
  .connect(mongoUri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log('Connected to MongoDB Atlas'))
  .catch((err) => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  });

// Employee schema and model
const employeeSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, trim: true },
    position: { type: String, trim: true },
    department: { type: String, trim: true },
    salary: { type: Number },
  },
  { timestamps: true }
);

const Employee = mongoose.model('Employee', employeeSchema);

// Helpers
const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);

// API routes - base: /api/employees

// GET all employees
app.get('/api/employees', async (req, res) => {
  try {
    const employees = await Employee.find().sort({ createdAt: -1 }).exec();
    res.json(employees);
  } catch (err) {
    console.error('GET /api/employees error:', err);
    res.status(500).json({ error: 'Failed to fetch employees' });
  }
});

// GET single employee by id
app.get('/api/employees/:id', async (req, res) => {
  const { id } = req.params;
  if (!isValidObjectId(id)) return res.status(400).json({ error: 'Invalid employee id' });

  try {
    const employee = await Employee.findById(id).exec();
    if (!employee) return res.status(404).json({ error: 'Employee not found' });
    res.json(employee);
  } catch (err) {
    console.error(`GET /api/employees/${id} error:`, err);
    res.status(500).json({ error: 'Failed to fetch employee' });
  }
});

// POST create new employee
app.post('/api/employees', async (req, res) => {
  try {
    const payload = req.body;
    if (!payload || !payload.name) {
      return res.status(400).json({ error: 'Employee name is required' });
    }

    const newEmployee = new Employee(payload);
    const saved = await newEmployee.save();
    res.status(201).json(saved);
  } catch (err) {
    console.error('POST /api/employees error:', err);
    res.status(500).json({ error: 'Failed to create employee' });
  }
});

// PUT update an employee
app.put('/api/employees/:id', async (req, res) => {
  const { id } = req.params;
  if (!isValidObjectId(id)) return res.status(400).json({ error: 'Invalid employee id' });

  try {
    const updates = req.body;
    const updated = await Employee.findByIdAndUpdate(id, updates, {
      new: true,
      runValidators: true,
    }).exec();

    if (!updated) return res.status(404).json({ error: 'Employee not found' });
    res.json(updated);
  } catch (err) {
    console.error(`PUT /api/employees/${id} error:`, err);
    res.status(500).json({ error: 'Failed to update employee' });
  }
});

// DELETE a single employee
app.delete('/api/employees/:id', async (req, res) => {
  const { id } = req.params;
  if (!isValidObjectId(id)) return res.status(400).json({ error: 'Invalid employee id' });

  try {
    const deleted = await Employee.findByIdAndDelete(id).exec();
    if (!deleted) return res.status(404).json({ error: 'Employee not found' });
    res.json({ message: 'Employee deleted' });
  } catch (err) {
    console.error(`DELETE /api/employees/${id} error:`, err);
    res.status(500).json({ error: 'Failed to delete employee' });
  }
});

// Serve frontend (dist/build) - do not change dist files
const staticPath = path.join(__dirname, 'dist', 'build');
app.use(express.static(staticPath));

// For any other route (not starting with /api/), serve index.html to support SPA routing
app.get('*', (req, res) => {
  res.sendFile(path.join(staticPath, 'index.html'));
});

// Start server
const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server started on port ${port}`);
});

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('SIGINT received. Closing MongoDB connection.');
  await mongoose.disconnect();
  process.exit(0);
});
