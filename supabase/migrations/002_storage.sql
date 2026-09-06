-- Supabase Storage bucket for voice recordings (Phase 2)
-- Run after 001_init.sql

INSERT INTO storage.buckets (id, name, public)
VALUES ('voice-audio', 'voice-audio', false)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Users upload own voice audio"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'voice-audio'
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users read own voice audio"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'voice-audio'
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users update own voice audio"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'voice-audio'
  AND auth.uid()::text = (storage.foldername(name))[1]
);
