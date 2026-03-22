import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

/**
 * Create an authenticated Supabase client using the user's JWT token.
 * This ensures auth.uid() works correctly in RLS policies.
 */
export function getAuthenticatedSupabase(token: string) {
    return createClient(supabaseUrl, supabaseAnonKey, {
        global: { headers: { Authorization: `Bearer ${token}` } },
    })
}

/**
 * Create an unauthenticated Supabase client (anon key only).
 * Use for public routes that don't need RLS user context.
 */
export function getPublicSupabase() {
    return createClient(supabaseUrl, supabaseAnonKey)
}

/**
 * Extract the Bearer token from a request, validate the user,
 * look up the broker profile, and return both.
 * Returns null if auth fails at any step.
 */
export async function getBrokerFromRequest(request: Request) {
    const authHeader = request.headers.get('authorization')
    if (!authHeader?.startsWith('Bearer ')) return null

    const token = authHeader.split(' ')[1]
    const sb = getAuthenticatedSupabase(token)

    const { data: { user }, error } = await sb.auth.getUser(token)
    if (error || !user) return null

    const { data: broker } = await sb
        .from('brokers')
        .select('*')
        .eq('user_id', user.id)
        .single()

    if (!broker) return null

    return { broker, supabase: sb, token }
}
