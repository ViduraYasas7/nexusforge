const mongoose = require('mongoose');

const checklistItemSchema = new mongoose.Schema(
  {
    id: { type: String, required: true },
    title: { type: String, required: true },
    completed: { type: Boolean, default: false }
  },
  { _id: false }
);

const commentSchema = new mongoose.Schema(
  {
    id: { type: String, required: true },
    author: { type: String, default: 'Vidura (Lead)' },
    text: { type: String, required: true },
    createdAt: { type: String, default: () => new Date().toISOString() }
  },
  { _id: false }
);

const attachmentSchema = new mongoose.Schema(
  {
    id: { type: String, required: true },
    name: { type: String, required: true },
    url: { type: String, required: true }
  },
  { _id: false }
);

const taskSchema = new mongoose.Schema(
  {
    id: {
      type: String,
      required: true,
      unique: true,
      trim: true
    },
    projectId: {
      type: String,
      required: true,
      ref: 'Project',
      trim: true
    },
    title: {
      type: String,
      required: true,
      trim: true
    },
    result: {
      type: String,
      default: ''
    },
    status: {
      type: String,
      enum: ['To Do', 'In Progress', 'Done'],
      default: 'Done'
    },
    priority: {
      type: String,
      default: 'High'
    },
    category: {
      type: String,
      default: 'Feature'
    },
    bucketId: {
      type: String,
      default: 'bucket-sprint'
    },
    startDate: {
      type: String,
      default: ''
    },
    dueDate: {
      type: String,
      default: ''
    },
    checklist: {
      type: [checklistItemSchema],
      default: []
    },
    showChecklistOnCard: {
      type: Boolean,
      default: true
    },
    labels: {
      type: [String],
      default: []
    },
    assignees: {
      type: [String],
      default: []
    },
    notes: {
      type: String,
      default: ''
    },
    showNotesOnCard: {
      type: Boolean,
      default: false
    },
    comments: {
      type: [commentSchema],
      default: []
    },
    attachments: {
      type: [attachmentSchema],
      default: []
    },
    isMyDay: {
      type: Boolean,
      default: false
    },
    estimatedHours: {
      type: Number,
      default: 4
    },
    loggedMinutes: {
      type: Number,
      default: 0
    },
    blockedBy: {
      type: String,
      default: ''
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('Task', taskSchema);
