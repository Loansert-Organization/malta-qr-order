
-- 1. Fix AI Logging Constraint
ALTER TABLE ai_waiter_logs DROP CONSTRAINT IF EXISTS ai_waiter_logs_message_type_check;
ALTER TABLE ai_waiter_logs ADD CONSTRAINT ai_waiter_logs_message_type_check 
CHECK (message_type IN ('user_message', 'ai_response', 'system_notification', 'error_handler', 'ai_error_fix', 'task_review_request', 'ux_recommendation_request', 'system_hook'));

-- 2. Create Error Tracking Table
CREATE TABLE IF NOT EXISTS error_logs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    error_type TEXT NOT NULL,
    error_message TEXT NOT NULL,
    stack_trace TEXT,
    user_id UUID REFERENCES auth.users(id),
    context JSONB,
    severity TEXT CHECK (severity IN ('low', 'medium', 'high', 'critical')) DEFAULT 'medium',
    resolved BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    resolved_at TIMESTAMPTZ
);

-- 3. Create Performance Monitoring Table
CREATE TABLE IF NOT EXISTS performance_logs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    endpoint TEXT NOT NULL,
    method TEXT NOT NULL,
    response_time INTEGER NOT NULL, -- milliseconds
    status_code INTEGER,
    user_id UUID REFERENCES auth.users(id),
    metadata JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Create Rate Limiting Table
CREATE TABLE IF NOT EXISTS rate_limits (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id),
    endpoint TEXT NOT NULL,
    requests_count INTEGER DEFAULT 1,
    window_start TIMESTAMPTZ DEFAULT NOW(),
    blocked_until TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Create Notification System Tables
CREATE TABLE IF NOT EXISTS notification_templates (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT UNIQUE NOT NULL,
    title TEXT NOT NULL,
    body TEXT NOT NULL,
    type TEXT CHECK (type IN ('email', 'push', 'sms', 'in_app')) NOT NULL,
    variables JSONB DEFAULT '{}',
    active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS notifications (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) NOT NULL,
    template_id UUID REFERENCES notification_templates(id),
    title TEXT NOT NULL,
    body TEXT NOT NULL,
    type TEXT CHECK (type IN ('email', 'push', 'sms', 'in_app')) NOT NULL,
    status TEXT CHECK (status IN ('pending', 'sent', 'delivered', 'failed', 'read')) DEFAULT 'pending',
    data JSONB DEFAULT '{}',
    sent_at TIMESTAMPTZ,
    read_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Add user_id to vendors table first
ALTER TABLE vendors ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id);

-- 7. Enhanced Vendor Management Tables
CREATE TABLE IF NOT EXISTS vendor_approvals (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    vendor_id UUID REFERENCES vendors(id) NOT NULL,
    approved_by UUID REFERENCES auth.users(id),
    status TEXT CHECK (status IN ('pending', 'approved', 'rejected', 'suspended')) DEFAULT 'pending',
    notes TEXT,
    documents JSONB DEFAULT '[]',
    approved_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS vendor_bulk_operations (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    operation_type TEXT CHECK (operation_type IN ('bulk_approve', 'bulk_reject', 'bulk_suspend', 'bulk_update')) NOT NULL,
    vendor_ids UUID[] NOT NULL,
    performed_by UUID REFERENCES auth.users(id) NOT NULL,
    parameters JSONB DEFAULT '{}',
    status TEXT CHECK (status IN ('pending', 'processing', 'completed', 'failed')) DEFAULT 'pending',
    results JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    completed_at TIMESTAMPTZ
);

-- 8. Analytics Tables
CREATE TABLE IF NOT EXISTS analytics_events (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    event_name TEXT NOT NULL,
    user_id UUID REFERENCES auth.users(id),
    session_id TEXT,
    properties JSONB DEFAULT '{}',
    timestamp TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS analytics_metrics (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    metric_name TEXT NOT NULL,
    metric_value NUMERIC NOT NULL,
    dimensions JSONB DEFAULT '{}',
    date DATE DEFAULT CURRENT_DATE,
    hour INTEGER DEFAULT EXTRACT(hour FROM NOW()),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 9. Create Indexes for Performance
CREATE INDEX IF NOT EXISTS idx_error_logs_created_at ON error_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_error_logs_severity ON error_logs(severity);
CREATE INDEX IF NOT EXISTS idx_performance_logs_endpoint ON performance_logs(endpoint);
CREATE INDEX IF NOT EXISTS idx_performance_logs_created_at ON performance_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_rate_limits_user_endpoint ON rate_limits(user_id, endpoint);
CREATE INDEX IF NOT EXISTS idx_notifications_user_status ON notifications(user_id, status);
CREATE INDEX IF NOT EXISTS idx_analytics_events_name_timestamp ON analytics_events(event_name, timestamp DESC);

-- 10. RLS Policies
ALTER TABLE error_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE performance_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE rate_limits ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE notification_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE vendor_approvals ENABLE ROW LEVEL SECURITY;
ALTER TABLE vendor_bulk_operations ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics_metrics ENABLE ROW LEVEL SECURITY;

-- Admin-only policies for monitoring tables
CREATE POLICY "Admin access to error_logs" ON error_logs
    FOR ALL USING (auth.jwt()->>'role' = 'admin');

CREATE POLICY "Admin access to performance_logs" ON performance_logs
    FOR ALL USING (auth.jwt()->>'role' = 'admin');

-- User can see their own notifications
CREATE POLICY "Users can view own notifications" ON notifications
    FOR SELECT USING (auth.uid() = user_id);

-- Admin can manage all notifications
CREATE POLICY "Admin can manage notifications" ON notifications
    FOR ALL USING (auth.jwt()->>'role' = 'admin');

-- Admin can manage notification templates
CREATE POLICY "Admin can manage notification templates" ON notification_templates
    FOR ALL USING (auth.jwt()->>'role' = 'admin');

-- Vendor approval policies
CREATE POLICY "Admin can manage vendor approvals" ON vendor_approvals
    FOR ALL USING (auth.jwt()->>'role' = 'admin');

CREATE POLICY "Vendors can view own approval status" ON vendor_approvals
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM vendors 
            WHERE id = vendor_id AND user_id = auth.uid()
        )
    );

-- Analytics policies
CREATE POLICY "Admin access to analytics" ON analytics_events
    FOR ALL USING (auth.jwt()->>'role' = 'admin');

CREATE POLICY "Admin access to metrics" ON analytics_metrics
    FOR ALL USING (auth.jwt()->>'role' = 'admin');

-- 11. Functions for automatic cleanup
CREATE OR REPLACE FUNCTION cleanup_old_logs()
RETURNS void AS $$
BEGIN
    -- Delete error logs older than 90 days
    DELETE FROM error_logs WHERE created_at < NOW() - INTERVAL '90 days';
    
    -- Delete performance logs older than 30 days
    DELETE FROM performance_logs WHERE created_at < NOW() - INTERVAL '30 days';
    
    -- Delete old rate limit records
    DELETE FROM rate_limits WHERE created_at < NOW() - INTERVAL '7 days';
    
    -- Delete old analytics events (keep 1 year)
    DELETE FROM analytics_events WHERE created_at < NOW() - INTERVAL '1 year';
END;
$$ LANGUAGE plpgsql;
