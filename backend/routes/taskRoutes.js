const express = require('express');

const {
  createTask,
  getTasks,
  getTaskById,
  updateTask,
  updateTaskStatus,
  deleteTask,
  getTaskStats,
} = require('../controllers/taskController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.use(protect);

router.route('/').post(createTask).get(getTasks);
router.get('/stats', getTaskStats);
router.route('/:id').get(getTaskById).put(updateTask).delete(deleteTask);
router.patch('/:id/status', updateTaskStatus);

module.exports = router;
