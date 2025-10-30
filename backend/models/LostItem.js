// models/LostItem.js
export const createLostItemTable = `
CREATE TABLE IF NOT EXISTS lost_items (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100),
  description TEXT,
  location VARCHAR(100),
  date_lost DATE,
  user_email VARCHAR(100)
);
`;
