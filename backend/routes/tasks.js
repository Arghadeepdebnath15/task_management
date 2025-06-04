const express = require('express');
const router = express.Router();
const Task = require('../models/Task');
const multer = require('multer');
const cloudinary = require('cloudinary').v2;
const auth = require('../middleware/auth');

// Multer configuration
const upload = multer({ storage: multer.memoryStorage() });

// Create new task
router.post('/', auth, upload.array('attachments', 5), async (req, res) => {
  try {
    const { title, description, priority, dueDate, progress, status } = req.body;
    
    if (!title || !description) {
      return res.status(400).json({ message: 'Title and description are required' });
    }

    let attachments = [];
    if (req.files && req.files.length > 0) {
      // Check if Cloudinary is configured
      if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
        return res.status(500).json({ message: 'File upload is not configured' });
      }

      for (const file of req.files) {
        try {
          const b64 = Buffer.from(file.buffer).toString('base64');
          const dataURI = `data:${file.mimetype};base64,${b64}`;
          
          const result = await cloudinary.uploader.upload(dataURI, {
            folder: 'task_attachments'
          });
          
          attachments.push({
            public_id: result.public_id,
            url: result.secure_url
          });
        } catch (uploadError) {
          console.error('File upload error:', uploadError);
          return res.status(500).json({ message: 'Error uploading file', error: uploadError.message });
        }
      }
    }

    const task = new Task({
      title,
      description,
      priority: priority || 'medium',
      dueDate: dueDate || new Date(),
      progress: progress || 0,
      status: status || 'pending',
      attachments,
      user: req.user._id
    });

    await task.save();
    res.status(201).json(task);
  } catch (error) {
    console.error('Task creation error:', error);
    res.status(500).json({ message: 'Error creating task', error: error.message });
  }
});

// Get all tasks for a user
router.get('/', auth, async (req, res) => {
  try {
    const tasks = await Task.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.json(tasks);
  } catch (error) {
    console.error('Task fetch error:', error);
    res.status(500).json({ message: 'Error fetching tasks', error: error.message });
  }
});

// Update task
router.patch('/:id', auth, upload.array('attachments', 5), async (req, res) => {
  try {
    const updates = req.body;
    
    // Handle progress and status updates
    if (updates.progress !== undefined) {
      updates.progress = Number(updates.progress);
      if (updates.progress === 100) {
        updates.status = 'completed';
      } else if (updates.progress > 0) {
        updates.status = 'in-progress';
      } else {
        updates.status = 'pending';
      }
    }
    
    if (req.files && req.files.length > 0) {
      // Check if Cloudinary is configured
      if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
        return res.status(500).json({ message: 'File upload is not configured' });
      }

      const attachments = [];
      for (const file of req.files) {
        try {
          const b64 = Buffer.from(file.buffer).toString('base64');
          const dataURI = `data:${file.mimetype};base64,${b64}`;
          
          const result = await cloudinary.uploader.upload(dataURI, {
            folder: 'task_attachments'
          });
          
          attachments.push({
            public_id: result.public_id,
            url: result.secure_url
          });
        } catch (uploadError) {
          console.error('File upload error:', uploadError);
          return res.status(500).json({ message: 'Error uploading file', error: uploadError.message });
        }
      }
      updates.attachments = attachments;
    }

    const task = await Task.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id },
      updates,
      { new: true }
    );

    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    res.json(task);
  } catch (error) {
    console.error('Task update error:', error);
    res.status(500).json({ message: 'Error updating task', error: error.message });
  }
});

// Delete task
router.delete('/:id', auth, async (req, res) => {
  try {
    const task = await Task.findOneAndDelete({ _id: req.params.id, user: req.user._id });
    
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    // Delete attachments from cloudinary
    if (task.attachments && task.attachments.length > 0) {
      for (const attachment of task.attachments) {
        await cloudinary.uploader.destroy(attachment.public_id);
      }
    }

    res.json({ message: 'Task deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting task', error: error.message });
  }
});

module.exports = router; 