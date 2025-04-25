BEGIN;

ALTER TABLE patients ADD COLUMN user_id INTEGER REFERENCES users(id);

-- Example data migration (adjust IDs based on your actual data)
UPDATE patients SET user_id = (SELECT id FROM users WHERE role = 'patient' LIMIT 1) WHERE id = 1;
UPDATE patients SET user_id = (SELECT id FROM users WHERE role = 'patient' LIMIT 1 OFFSET 1) WHERE id = 2;

COMMIT;