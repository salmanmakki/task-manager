export const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
export const PASSWORD_PATTERN = /^(?=.*[A-Za-z])(?=.*\d).{8,}$/;
export const PASSWORD_MESSAGE =
  'Use at least 8 characters, including a letter and a number';

export const validateAuth = ({ name, email, password, confirmPassword }, isRegister) => {
  const errors = {};

  if (isRegister && (!name || name.trim().length < 2)) {
    errors.name = 'Enter your full name (at least 2 characters)';
  }

  if (!email || !EMAIL_PATTERN.test(email.trim())) {
    errors.email = 'Enter a valid email address';
  }

  if (!password) {
    errors.password = 'Password is required';
  } else if (isRegister && !PASSWORD_PATTERN.test(password)) {
    errors.password = PASSWORD_MESSAGE;
  }

  if (isRegister && password !== confirmPassword) {
    errors.confirmPassword = 'Passwords do not match';
  }

  return errors;
};

export const validateTask = ({ title, description }) => {
  const errors = {};

  if (!title || title.trim().length < 2) {
    errors.title = 'Title must be at least 2 characters';
  } else if (title.trim().length > 120) {
    errors.title = 'Title cannot exceed 120 characters';
  }

  if (description && description.length > 2000) {
    errors.description = 'Description cannot exceed 2000 characters';
  }

  return errors;
};

export const validateProfile = ({ name, email }) => {
  const errors = {};

  if (!name || name.trim().length < 2) {
    errors.name = 'Name must be at least 2 characters';
  }

  if (!email || !EMAIL_PATTERN.test(email.trim())) {
    errors.email = 'Enter a valid email address';
  }

  return errors;
};

export const validatePasswordChange = ({ currentPassword, newPassword, confirmPassword }) => {
  const errors = {};

  if (!currentPassword) {
    errors.currentPassword = 'Enter your current password';
  }

  if (!newPassword) {
    errors.newPassword = 'Enter a new password';
  } else if (!PASSWORD_PATTERN.test(newPassword)) {
    errors.newPassword = PASSWORD_MESSAGE;
  } else if (newPassword === currentPassword) {
    errors.newPassword = 'New password must be different from the current one';
  }

  if (newPassword !== confirmPassword) {
    errors.confirmPassword = 'Passwords do not match';
  }

  return errors;
};
