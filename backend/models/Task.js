const mongoose = require('mongoose');

const PRIORITIES = ['Low', 'Medium', 'High'];
const STATUSES = ['Pending', 'In Progress', 'Completed'];

const taskSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Task title is required'],
      trim: true,
      minlength: [2, 'Title must be at least 2 characters'],
      maxlength: [120, 'Title cannot exceed 120 characters'],
    },
    description: {
      type: String,
      trim: true,
      maxlength: [2000, 'Description cannot exceed 2000 characters'],
      default: '',
    },
    priority: {
      type: String,
      enum: { values: PRIORITIES, message: 'Priority must be Low, Medium or High' },
      default: 'Medium',
    },
    status: {
      type: String,
      enum: { values: STATUSES, message: 'Status must be Pending, In Progress or Completed' },
      default: 'Pending',
    },
    dueDate: {
      type: Date,
      default: null,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'A task must belong to a user'],
      index: true,
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform(doc, ret) {
        delete ret.__v;
        return ret;
      },
    },
  }
);

// Every list/filter query scopes by user then narrows by status and sorts by due date.
taskSchema.index({ user: 1, status: 1, dueDate: 1 });
taskSchema.index({ user: 1, createdAt: -1 });

const Task = mongoose.model('Task', taskSchema);

module.exports = Task;
module.exports.PRIORITIES = PRIORITIES;
module.exports.STATUSES = STATUSES;
