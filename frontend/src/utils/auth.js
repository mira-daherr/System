// Authentication utilities

// Store token in localStorage
export const setAuthToken = (token) => {
  if (token) {
    localStorage.setItem('token', token);
  } else {
    localStorage.removeItem('token');
  }
};

// Get token from localStorage
export const getAuthToken = () => {
  return localStorage.getItem('token');
};

// Store user data in localStorage
export const setUserData = (user) => {
  if (user) {
    localStorage.setItem('user', JSON.stringify(user));
  } else {
    localStorage.removeItem('user');
  }
};

// Get user data from localStorage
export const getUserData = () => {
  const userStr = localStorage.getItem('user');
  return userStr ? JSON.parse(userStr) : null;
};

// Clear all auth data
export const clearAuthData = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
};

// Check if user is authenticated
export const isAuthenticated = () => {
  const token = getAuthToken();
  const user = getUserData();
  return !!(token && user);
};

// Get user role
export const getUserRole = () => {
  const user = getUserData();
  return user ? user.role : null;
};

// Check if user is admin
export const isAdmin = () => {
  return getUserRole() === 'admin';
};

// Check if user is staff
export const isStaff = () => {
  const role = getUserRole();
  return role === 'admin' || role === 'staff';
};
