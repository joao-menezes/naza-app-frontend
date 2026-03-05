import { supabase } from './supabase'

export async function getAppUser() {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { data } = await supabase
    .from('app_users')
    .select('*')
    .eq('id', user.id)
    .single()

  return data
}