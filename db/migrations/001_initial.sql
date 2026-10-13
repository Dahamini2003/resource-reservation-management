CREATE EXTENSION IF NOT EXISTS btree_gist;

CREATE TABLE resources (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(120) NOT NULL CHECK (length(trim(name)) > 0),
  description TEXT NOT NULL DEFAULT '',
  location VARCHAR(200) NOT NULL CHECK (length(trim(location)) > 0),
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE reservations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  resource_id UUID NOT NULL REFERENCES resources(id) ON DELETE RESTRICT,
  requester_name VARCHAR(120) NOT NULL CHECK (length(trim(requester_name)) > 0),
  requester_email VARCHAR(254) NOT NULL CHECK (length(trim(requester_email)) > 0),
  purpose VARCHAR(500) NOT NULL CHECK (length(trim(purpose)) > 0),
  starts_at TIMESTAMPTZ NOT NULL,
  ends_at TIMESTAMPTZ NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'confirmed'
    CHECK (status IN ('confirmed', 'cancelled')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT reservation_valid_times CHECK (ends_at > starts_at),
  -- [) includes the start and excludes the end, allowing adjacent bookings.
  CONSTRAINT reservation_no_overlap EXCLUDE USING gist (
    resource_id WITH =,
    tstzrange(starts_at, ends_at, '[)') WITH &&
  ) WHERE (status = 'confirmed')
);

CREATE INDEX reservations_resource_start_idx ON reservations (resource_id, starts_at);
CREATE INDEX reservations_upcoming_idx ON reservations (starts_at) WHERE status = 'confirmed';
