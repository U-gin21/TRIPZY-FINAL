import defaultProfilePhoto from './assets/profile_photo.png';

const isLocalDev = ['localhost', '127.0.0.1'].includes(window.location.hostname);
const localHost = window.location.hostname;

// Dynamically determine the project directory name to avoid hardcoded paths if the repo is cloned with a different folder name
const getFolderName = () => {
  const pathParts = window.location.pathname.split('/');
  // If running in production (on Apache), extract folder name from the URL path.
  // Ignore standard client-side router pathnames if they appear at the start of the path
  if (pathParts[1] && pathParts[1] !== 'index.html' && !['explore', 'companions', 'about', 'faqs', 'contact', 'auth', 'dashboard'].includes(pathParts[1])) {
    return pathParts[1];
  }
  // In development, fallback to the folder name injected at build time
  return typeof __PROJECT_FOLDER_NAME__ !== 'undefined' ? __PROJECT_FOLDER_NAME__ : 'TRIPZY FINAL';
};

const folderName = getFolderName();
const encodedFolder = encodeURIComponent(folderName);

const API_BASE = isLocalDev
  ? `http://${localHost}/${encodedFolder}/backend`
  : window.location.origin + `/${encodedFolder}/backend`;

export const getUploadUrl = (path) => {
  if (!path) return '';
  const root = isLocalDev
    ? `http://${localHost}/${encodedFolder}`
    : window.location.origin + `/${encodedFolder}`;
  return `${root}/backend/uploads/${path}`;
};

export const getProfilePhoto = (profilePhoto) => {
  if (profilePhoto && profilePhoto !== 'default_profile.jpg') {
    return getUploadUrl(profilePhoto);
  }
  return defaultProfilePhoto;
};

function getCookie(name) {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop().split(';').shift();
  return null;
}

export async function apiRequest(controller, action, method = 'GET', data = null) {
  let url = `${API_BASE}/index.php?controller=${controller}&action=${action}`;
  
  if (method === 'GET' && data) {
    const params = new URLSearchParams(data).toString();
    url += `&${params}`;
  }

  const options = {
    method,
    credentials: 'include', // Crucial for PHP Session support
    mode: 'cors',
    cache: 'no-cache',
    headers: {}
  };

  if (method !== 'GET') {
    const csrfToken = getCookie('XSRF-TOKEN');
    if (csrfToken) {
      options.headers['X-XSRF-TOKEN'] = csrfToken;
    }
  }

  if (method !== 'GET' && data) {
    if (data instanceof FormData) {
      // Let browser set the boundaries automatically for form-data uploads
      options.body = data;
    } else {
      options.headers['Content-Type'] = 'application/json';
      options.body = JSON.stringify(data);
    }
  }

  try {
    const response = await fetch(url, options);
    const text = await response.text();
    if (!text) {
      throw new Error(`Empty response from server for ${controller}/${action}.`);
    }

    let json;
    try {
      json = JSON.parse(text);
    } catch (parseError) {
      throw new Error(`Invalid JSON response from ${controller}/${action}: ${parseError.message}\n${text}`, { cause: parseError });
    }

    if (json && json.success === false) {
      const appErr = new Error(json.error || json.message || `Request failed with status ${response.status}.`);
      appErr.isAppError = true;
      throw appErr;
    }

    if (!response.ok) {
      throw new Error(json?.error || json?.message || `Request failed with status ${response.status}.`);
    }
    return json;
  } catch (error) {
    if (!error.isAppError) {
      console.error(`API Error on ${controller}/${action}:`, error);
    }
    throw error;
  }
}
