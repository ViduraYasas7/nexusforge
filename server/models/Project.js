const mongoose = require('mongoose');

const bucketSchema = new mongoose.Schema(
  {
    id: { type: String, required: true },
    name: { type: String, required: true },
    color: { type: String, default: '#3b82f6' }
  },
  { _id: false }
);

const memberSchema = new mongoose.Schema(
  {
    id: { type: String, required: true },
    name: { type: String, required: true },
    role: { type: String, default: 'Engineer' },
    initials: { type: String, default: 'EN' },
    color: { type: String, default: '#6366f1' }
  },
  { _id: false }
);

const projectSchema = new mongoose.Schema(
  {
    id: {
      type: String,
      required: true,
      unique: true,
      trim: true
    },
    name: {
      type: String,
      required: true,
      trim: true
    },
    summary: {
      type: String,
      default: ''
    },
    problemSolved: {
      type: String,
      default: ''
    },
    keyResult: {
      type: String,
      default: ''
    },
    status: {
      type: String,
      default: 'In Progress'
    },
    techStack: {
      type: [String],
      default: []
    },
    howItWorks: {
      frontend: { type: String, default: '' },
      backend: { type: String, default: '' },
      database: { type: String, default: '' }
    },
    githubUrl: {
      type: String,
      default: ''
    },
    liveUrl: {
      type: String,
      default: ''
    },
    role: {
      type: String,
      default: ''
    },
    buckets: {
      type: [bucketSchema],
      default: [
        { id: 'bucket-backlog', name: 'Backlog & Ideas', color: '#64748b' },
        { id: 'bucket-sprint', name: 'Current Sprint', color: '#3b82f6' },
        { id: 'bucket-qa', name: 'Review & QA', color: '#f59e0b' },
        { id: 'bucket-shipped', name: 'Shipped & Live', color: '#10b981' }
      ]
    },
    members: {
      type: [memberSchema],
      default: [
        { id: 'mem-1', name: 'Vidura (Lead)', role: 'Lead Architect', initials: 'VL', color: '#6366f1' },
        { id: 'mem-2', name: 'Alex Chen', role: 'Frontend Dev', initials: 'AC', color: '#0ea5e9' },
        { id: 'mem-3', name: 'Sarah Miller', role: 'Backend & DevOps', initials: 'SM', color: '#10b981' },
        { id: 'mem-4', name: 'Elena Rostova', role: 'QA & Product', initials: 'ER', color: '#f43f5e' }
      ]
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

module.exports = mongoose.model('Project', projectSchema);
