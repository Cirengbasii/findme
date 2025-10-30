// models/FoundItem.js
export const createFoundItemTable = `
CREATE TABLE IF NOT EXISTS found_items (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100),
  description TEXT,
  location VARCHAR(100),
  date_found DATE,
  user_email VARCHAR(100)
);
`;
