-- Add approval system fields to opportunities table
ALTER TABLE opportunities 
ADD COLUMN is_approved BOOLEAN DEFAULT FALSE NOT NULL,
ADD COLUMN approval_status VARCHAR(50) DEFAULT 'PENDING' NOT NULL,
ADD COLUMN approved_by VARCHAR(255),
ADD COLUMN approved_at TIMESTAMP,
ADD COLUMN rejection_reason TEXT;
