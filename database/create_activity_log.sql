-- Activity Log Table for tracking all changes to brands and perfumes
-- This table stores audit trail of all create, update, and delete operations

CREATE TABLE IF NOT EXISTS activity_log (
    id SERIAL PRIMARY KEY,
    entity_type VARCHAR(20) NOT NULL CHECK (entity_type IN ('brand', 'perfume')),
    entity_id INTEGER NOT NULL,
    entity_name VARCHAR(255) NOT NULL,
    action_type VARCHAR(20) NOT NULL CHECK (action_type IN ('create', 'update', 'delete')),
    details JSONB,
    user_info JSONB,
    ip_address VARCHAR(45),
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_activity_log_entity_type ON activity_log(entity_type);
CREATE INDEX IF NOT EXISTS idx_activity_log_entity_id ON activity_log(entity_id);
CREATE INDEX IF NOT EXISTS idx_activity_log_action_type ON activity_log(action_type);
CREATE INDEX IF NOT EXISTS idx_activity_log_created_at ON activity_log(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_activity_log_entity_composite ON activity_log(entity_type, entity_id);

-- Add comments for documentation
COMMENT ON TABLE activity_log IS 'Tracks all create, update, and delete operations on brands and perfumes';
COMMENT ON COLUMN activity_log.entity_type IS 'Type of entity: brand or perfume';
COMMENT ON COLUMN activity_log.entity_id IS 'ID of the entity that was modified';
COMMENT ON COLUMN activity_log.entity_name IS 'Name of the entity for easy reference';
COMMENT ON COLUMN activity_log.action_type IS 'Type of action: create, update, or delete';
COMMENT ON COLUMN activity_log.details IS 'JSON object containing details about the change (old values, new values, etc)';
COMMENT ON COLUMN activity_log.user_info IS 'JSON object containing user information if available';
COMMENT ON COLUMN activity_log.ip_address IS 'IP address of the request';
COMMENT ON COLUMN activity_log.user_agent IS 'Browser/client user agent string';

-- Enable Row Level Security (RLS)
ALTER TABLE activity_log ENABLE ROW LEVEL SECURITY;

-- Create policy to allow service role to do everything
CREATE POLICY "Service role can do everything on activity_log"
    ON activity_log
    FOR ALL
    TO service_role
    USING (true)
    WITH CHECK (true);

-- Create policy to allow authenticated users to read activity logs
CREATE POLICY "Authenticated users can read activity_log"
    ON activity_log
    FOR SELECT
    TO authenticated
    USING (true);

-- Create policy to allow anon users to read activity logs (for admin dashboard)
CREATE POLICY "Anon users can read activity_log"
    ON activity_log
    FOR SELECT
    TO anon
    USING (true);
