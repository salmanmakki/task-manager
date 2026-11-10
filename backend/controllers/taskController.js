const Task = require('../models/Task');
const { validate } = require('../utils/validate');

const { PRIORITIES, STATUSES } = Task;

const SORT_OPTIONS = {
  createdAt_desc: { createdAt: -1 },
  createdAt_asc: { createdAt: 1 },
};

const escapeRegex = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const createRules = {
  title: { required: true, min: 2, max: 120, label: 'Title' },
  description: { max: 2000, default: '', label: 'Description' },
  priority: {
    enum: PRIORITIES,
    default: 'Medium',
    label: 'Priority',
  },
  status: {
    enum: STATUSES,
    default: 'Pending',
    label: 'Status',
  },
  dueDate: { type: 'date', nullable: true, default: null, label: 'Due date' },
};

const updateRules = {
  title: { required: true, min: 2, max: 120, label: 'Title' },
  description: { max: 2000, label: 'Description' },
  priority: { enum: PRIORITIES, label: 'Priority' },
  status: { enum: STATUSES, label: 'Status' },
  dueDate: { type: 'date', nullable: true, label: 'Due date' },
};

const statusRules = {
  status: { required: true, enum: STATUSES, label: 'Status' },
};

const createTask = async (req, res) => {
  const { errors, values } = validate(req.body, createRules);

  if (errors.length > 0) {
    return res.status(400).json({ success: false, message: errors[0], errors });
  }

  const task = await Task.create({ ...values, user: req.user._id });

  return res.status(201).json({
    success: true,
    message: 'Task created',
    data: { task },
  });
};

const getTasks = async (req, res) => {
  const search = typeof req.query.search === 'string' ? req.query.search.trim() : '';
  const status = typeof req.query.status === 'string' ? req.query.status : '';
  const priority = typeof req.query.priority === 'string' ? req.query.priority : '';
  const sort = typeof req.query.sort === 'string' ? req.query.sort : 'createdAt_desc';

  if (search.length > 100) {
    return res
      .status(400)
      .json({ success: false, message: 'Search term cannot exceed 100 characters' });
  }

  if (status && !STATUSES.includes(status)) {
    return res.status(400).json({ success: false, message: 'Invalid status filter' });
  }

  if (priority && !PRIORITIES.includes(priority)) {
    return res.status(400).json({ success: false, message: 'Invalid priority filter' });
  }

  const validSorts = [
    'createdAt_desc',
    'createdAt_asc',
    'dueDate_asc',
    'dueDate_desc',
  ];

  if (!validSorts.includes(sort)) {
    return res.status(400).json({ success: false, message: 'Invalid sort option' });
  }

  const query = { user: req.user._id };

  if (status) query.status = status;
  if (priority) query.priority = priority;

  if (search) {
    const pattern = new RegExp(escapeRegex(search), 'i');
    query.$or = [{ title: pattern }, { description: pattern }];
  }

  if (sort === 'dueDate_asc' || sort === 'dueDate_desc') {
    const direction = sort === 'dueDate_asc' ? 1 : -1;

    // Tasks without a due date are pushed to the end instead of sorting as if
    // they were the oldest date.
    const tasks = await Task.aggregate([
      { $match: query },
      {
        $addFields: {
          _hasNoDueDate: { $cond: [{ $eq: ['$dueDate', null] }, 1, 0] },
        },
      },
      { $sort: { _hasNoDueDate: 1, dueDate: direction, createdAt: -1 } },
      { $unset: '_hasNoDueDate' },
    ]);

    return res.status(200).json({
      success: true,
      data: { tasks, total: tasks.length },
    });
  }

  const tasks = await Task.find(query).sort(SORT_OPTIONS[sort]);

  return res.status(200).json({
    success: true,
    data: { tasks, total: tasks.length },
  });
};

const getTaskById = async (req, res) => {
  const task = await Task.findOne({ _id: req.params.id, user: req.user._id });

  if (!task) {
    return res.status(404).json({ success: false, message: 'Task not found' });
  }

  return res.status(200).json({ success: true, data: { task } });
};

const updateTask = async (req, res) => {
  const { errors, values } = validate(req.body, updateRules);

  if (errors.length > 0) {
    return res.status(400).json({ success: false, message: errors[0], errors });
  }

  const task = await Task.findOneAndUpdate(
    { _id: req.params.id, user: req.user._id },
    values,
    { new: true, runValidators: true }
  );

  if (!task) {
    return res.status(404).json({ success: false, message: 'Task not found' });
  }

  return res.status(200).json({
    success: true,
    message: 'Task updated',
    data: { task },
  });
};

const updateTaskStatus = async (req, res) => {
  const { errors, values } = validate(req.body, statusRules);

  if (errors.length > 0) {
    return res.status(400).json({ success: false, message: errors[0], errors });
  }

  const task = await Task.findOneAndUpdate(
    { _id: req.params.id, user: req.user._id },
    { status: values.status },
    { new: true, runValidators: true }
  );

  if (!task) {
    return res.status(404).json({ success: false, message: 'Task not found' });
  }

  return res.status(200).json({
    success: true,
    message: `Task moved to ${values.status}`,
    data: { task },
  });
};

const deleteTask = async (req, res) => {
  const task = await Task.findOneAndDelete({
    _id: req.params.id,
    user: req.user._id,
  });

  if (!task) {
    return res.status(404).json({ success: false, message: 'Task not found' });
  }

  return res.status(200).json({ success: true, message: 'Task deleted' });
};

const getTaskStats = async (req, res) => {
  const now = new Date();
  const startOfToday = new Date(now);
  startOfToday.setHours(0, 0, 0, 0);

  const [result] = await Task.aggregate([
    { $match: { user: req.user._id } },
    {
      $facet: {
        statusCounts: [{ $group: { _id: '$status', count: { $sum: 1 } } }],
        priorityCounts: [{ $group: { _id: '$priority', count: { $sum: 1 } } }],
        overdue: [
          {
            $match: {
              status: { $ne: 'Completed' },
              dueDate: { $ne: null, $lt: now },
            },
          },
          { $count: 'count' },
        ],
        upcoming: [
          {
            $match: {
              status: { $ne: 'Completed' },
              dueDate: { $ne: null, $gte: startOfToday },
            },
          },
          { $sort: { dueDate: 1 } },
          { $limit: 5 },
        ],
        recent: [{ $sort: { createdAt: -1 } }, { $limit: 5 }],
      },
    },
  ]);

  const byStatus = Object.fromEntries(
    (result.statusCounts || []).map((entry) => [entry._id, entry.count])
  );
  const byPriority = Object.fromEntries(
    (result.priorityCounts || []).map((entry) => [entry._id, entry.count])
  );

  const pending = byStatus.Pending || 0;
  const inProgress = byStatus['In Progress'] || 0;
  const completed = byStatus.Completed || 0;
  const total = pending + inProgress + completed;

  return res.status(200).json({
    success: true,
    data: {
      total,
      pending,
      inProgress,
      completed,
      overdue: result.overdue?.[0]?.count || 0,
      completionRate: total === 0 ? 0 : Math.round((completed / total) * 100),
      priority: {
        Low: byPriority.Low || 0,
        Medium: byPriority.Medium || 0,
        High: byPriority.High || 0,
      },
      recentTasks: result.recent || [],
      upcomingTasks: result.upcoming || [],
    },
  });
};

module.exports = {
  createTask,
  getTasks,
  getTaskById,
  updateTask,
  updateTaskStatus,
  deleteTask,
  getTaskStats,
};
