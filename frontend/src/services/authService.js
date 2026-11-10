import api from './api';

export const registerUser = async (payload) => {
  const { data } = await api.post('/auth/register', payload);
  return data.data.user;
};

export const loginUser = async (payload) => {
  const { data } = await api.post('/auth/login', payload);
  return data.data.user;
};

export const logoutUser = async () => {
  await api.post('/auth/logout');
};

export const getCurrentUser = async () => {
  const { data } = await api.get('/auth/me');
  return data.data.user;
};

export const updateProfileRequest = async (payload) => {
  const { data } = await api.put('/users/profile', payload);
  return data.data.user;
};

export const changePasswordRequest = async (payload) => {
  const { data } = await api.put('/users/change-password', payload);
  return data;
};
