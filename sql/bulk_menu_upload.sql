-- Bulk menu upload sample script
INSERT INTO menu_items (bar_id, name, description, price, category)
VALUES
  ('BAR_UUID_1', 'Burger', 'Juicy beef burger', 9.99, 'Main'),
  ('BAR_UUID_1', 'Fries', 'Crispy fries', 3.99, 'Sides'),
  ('BAR_UUID_1', 'Soda', 'Cola 330ml', 2.50, 'Drinks');
