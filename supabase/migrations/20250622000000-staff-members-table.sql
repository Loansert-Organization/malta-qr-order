-- Create staff_members table
CREATE TABLE IF NOT EXISTS public.staff_members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    vendor_id UUID NOT NULL REFERENCES vendors(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT,
    role TEXT NOT NULL CHECK (role IN ('manager', 'waiter', 'chef', 'cashier')),
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('active', 'inactive', 'pending')),
    hire_date DATE NOT NULL DEFAULT CURRENT_DATE,
    last_login TIMESTAMPTZ,
    permissions JSONB DEFAULT '[]'::jsonb,
    shift_schedule JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create unique index on email per vendor
CREATE UNIQUE INDEX staff_members_vendor_email_idx ON public.staff_members (vendor_id, email);

-- Enable RLS
ALTER TABLE public.staff_members ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Vendors can view their own staff" ON public.staff_members
    FOR SELECT USING (
        vendor_id IN (
            SELECT id FROM vendors WHERE owner_id = auth.uid()
        ) OR
        EXISTS (
            SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'
        )
    );

CREATE POLICY "Vendors can insert their own staff" ON public.staff_members
    FOR INSERT WITH CHECK (
        vendor_id IN (
            SELECT id FROM vendors WHERE owner_id = auth.uid()
        ) OR
        EXISTS (
            SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'
        )
    );

CREATE POLICY "Vendors can update their own staff" ON public.staff_members
    FOR UPDATE USING (
        vendor_id IN (
            SELECT id FROM vendors WHERE owner_id = auth.uid()
        ) OR
        EXISTS (
            SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'
        )
    );

CREATE POLICY "Vendors can delete their own staff" ON public.staff_members
    FOR DELETE USING (
        vendor_id IN (
            SELECT id FROM vendors WHERE owner_id = auth.uid()
        ) OR
        EXISTS (
            SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_staff_members_updated_at BEFORE UPDATE ON public.staff_members
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column(); 