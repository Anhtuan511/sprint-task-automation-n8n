import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://pmewjwuiiyrnupiitada.supabase.co'
const supabaseKey = 'sb_publishable_2LAwYkRvu9pFYRbb7OeFoA_gkaq2qfQ'

export const supabase = createClient(supabaseUrl, supabaseKey)

