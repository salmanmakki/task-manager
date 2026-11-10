import api from './api';

const cleanParams = (params) =>
  Object.fromEntries(
    Object.entries(params || {}).filter(([, value]) => value !== '' && value !== undefined && value !== null)
  );

export const fetchTasks = async (params = {}) => {
  const { data } = await api.get('/tasks', { params: cleanParams(params) });
  return data.data;
};

export const fetchTaskById = async (id) => {
  const { data } = await api.get(`/tasks/${id}`);
  return data.data.task;
};

export const fetchTaskStats = async () => {
  const { data } = await api.get('/tasks/stats');
  return data.data;
};

export const createTaskRequest = async (payload) => {
  const { data } = await api.post('/tasks', payload);
  return data.data.task;
};

export const updateTaskRequest = async (id, payload) => {
  const { data } = await api.put(`/tasks/${id}`, payload);
  return data.data.task;
};

export const updateTaskStatusRequest = async (id, status) => {
  const { data } = await api.patch(`/tasks/${id}/status`, { status });
  return data.data.task;
};

export const deleteTaskRequest = async (id) => {
  await api.delete(`/tasks/${id}`);
};
