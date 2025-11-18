export const API_URL = 'http://127.0.0.1:5000';

fetch(`${API_URL}/devices`)
  .then(res => res.json())
  .then(data => console.log(data))
  .catch(err => console.error("API error", err));
