import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://njjxapxjcohsmljlxrlv.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5qanhhcHhqY29oc21samx4cmx2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODQ2NTQ4MjEsImV4cCI6MjEwMDIzMDgyMX0.2I1VcyEorTTGg93WyVwNHfuBlQQiIdV3DLtagve12Mo'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
