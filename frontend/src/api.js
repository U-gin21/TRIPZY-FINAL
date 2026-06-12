import defaultProfilePhoto from './assets/profile_photo.png';

const isLocalDev = ['localhost', '127.0.0.1'].includes(window.location.hostname);
const localHost = window.location.hostname;
const API_BASE = isLocalDev
  ? `http://${localHost}/TRIPZY%20FINAL/backend`
  : window.location.origin + '/TRIPZY%20FINAL/backend';

export const getUploadUrl = (path) => {
  if (!path) return '';
  const root = isLocalDev
    ? `http://${localHost}/TRIPZY%20FINAL`
    : window.location.origin + '/TRIPZY%20FINAL';
  return `${root}/backend/uploads/${path}`;
};

export const getProfilePhoto = (profilePhoto) => {
  if (profilePhoto && profilePhoto !== 'default_profile.jpg') {
    return getUploadUrl(profilePhoto);
  }
  return defaultProfilePhoto;
};

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
    cache: 'no-cache'
  };

  if (method !== 'GET' && data) {
    if (data instanceof FormData) {
      // Let browser set the boundaries automatically for form-data uploads
      options.body = data;
    } else {
      options.headers = {
        'Content-Type': 'application/json',
      };
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

    if (!response.ok || json.success === false) {
      throw new Error(json.error || json.message || `Request failed with status ${response.status}.`);
    }
    return json;
  } catch (error) {
    console.error(`API Error on ${controller}/${action}:`, error);
    throw error;
  }
}
