-- Stable IDs make this safe to run repeatedly without duplicating sample data.
INSERT INTO resources (id, name, description, location) VALUES
  ('00000000-0000-4000-8000-000000000001', 'Meeting Room A', 'A quiet room for team meetings, with seating for 8.', 'First floor'),
  ('00000000-0000-4000-8000-000000000002', 'Meeting Room B', 'A small meeting room with seating for 4.', 'Second floor'),
  ('00000000-0000-4000-8000-000000000003', 'Portable Projector', 'A shared projector for presentations and workshops.', 'Equipment cupboard')
ON CONFLICT (id) DO NOTHING;
