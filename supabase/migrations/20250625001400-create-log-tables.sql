CREATE TABLE IF NOT EXISTS error_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    error_type TEXT,
    severity TEXT,
    message TEXT,
    stack_trace TEXT,
    user_id UUID,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS performance_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    endpoint TEXT,
    response_time INT,
    user_id UUID,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS security_audits (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    performed_at TIMESTAMPTZ DEFAULT NOW(),
    auditor_name TEXT,
    summary TEXT,
    issues_found INT
);

-- Apply RLS to all new tables for security
ALTER TABLE error_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins can see error logs" ON error_logs FOR SELECT USING (is_admin());

ALTER TABLE performance_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins can see performance logs" ON performance_logs FOR SELECT USING (is_admin());

ALTER TABLE security_audits ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins can see security audits" ON security_audits FOR SELECT USING (is_admin()); 