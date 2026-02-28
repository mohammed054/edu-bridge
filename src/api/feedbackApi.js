const API_BASE = 'http://localhost:5000/api/feedback';

const request = async (path, options = {}) => {
  const response = await fetch(`${API_BASE}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    },
    ...options,
  });

  let payload = {};
  try {
    payload = await response.json();
  } catch {
    payload = {};
  }

  if (!response.ok) {
    throw new Error(payload.message || 'تعذر إتمام الطلب');
  }

  return payload;
};

export const fetchFeedbackOptions = () => request('/options');

export const generateFeedbackMessage = (body) =>
  request('/generate', {
    method: 'POST',
    body: JSON.stringify(body),
  });

export const fetchFeedbackList = ({ studentName, studentId, className } = {}) => {
  const params = new URLSearchParams();
  if (studentName) {
    params.append('studentName', studentName);
  }
  if (studentId) {
    params.append('studentId', studentId);
  }
  if (className) {
    params.append('className', className);
  }
  const query = params.toString();
  return request(`/list${query ? `?${query}` : ''}`);
};

export const sendFeedbackReply = (body) =>
  request('/reply', {
    method: 'POST',
    body: JSON.stringify(body),
  });
