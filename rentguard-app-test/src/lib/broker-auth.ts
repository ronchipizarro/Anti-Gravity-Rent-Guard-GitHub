import { supabase } from './supabase'

export type BrokerRole = 'broker' | 'realtor' | 'owner'

export interface BrokerProfile {
    id: string
    user_id: string
    role: BrokerRole
    full_name: string
    email: string
    phone: string | null
    license_id: string | null
    brokerage_name: string | null
    brokerage_license: string | null
    parent_broker_id: string | null
    created_at: string
    updated_at: string
}

export interface SignUpData {
    role: BrokerRole
    full_name: string
    email: string
    phone?: string
    license_id?: string
    brokerage_name?: string
    brokerage_license?: string
    parent_broker_id?: string
}

export async function signUpBroker(email: string, password: string, data: SignUpData) {
    if (!supabase) throw new Error('Supabase not configured')

    const appUrl = typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3001'

    // Store profile data in user metadata so we can create the broker row
    // after email confirmation (RLS blocks INSERT without an authenticated session)
    const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
            emailRedirectTo: `${appUrl}/broker/confirm`,
            data: {
                broker_role: data.role,
                full_name: data.full_name,
                phone: data.phone || null,
                license_id: data.license_id || null,
                brokerage_name: data.brokerage_name || null,
                brokerage_license: data.brokerage_license || null,
                parent_broker_id: data.parent_broker_id || null,
            },
        },
    })

    if (authError) throw authError
    if (!authData.user) throw new Error('Sign up failed — no user returned')

    // Try to insert broker profile now (works if session is returned, e.g. email confirm disabled)
    // If it fails due to RLS (no session), the profile will be created on first login instead
    if (authData.session) {
        const { error: brokerError } = await supabase
            .from('brokers')
            .insert({
                user_id: authData.user.id,
                role: data.role,
                full_name: data.full_name,
                email: data.email,
                phone: data.phone || null,
                license_id: data.license_id || null,
                brokerage_name: data.brokerage_name || null,
                brokerage_license: data.brokerage_license || null,
                parent_broker_id: data.parent_broker_id || null,
            })
            .select()
            .single()

        if (brokerError) {
            console.warn('Broker profile insert deferred to first login:', brokerError.message)
        }
    }

    return { user: authData.user, session: authData.session }
}

export async function signInBroker(email: string, password: string) {
    if (!supabase) throw new Error('Supabase not configured')

    const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
    })

    if (error) throw error

    // Check if broker profile exists — if not, create it from user metadata
    // This handles the case where signup happened with email confirmation
    // and the broker INSERT was deferred because there was no session
    const user = data.user
    if (user) {
        const { data: existingBroker } = await supabase
            .from('brokers')
            .select('id')
            .eq('user_id', user.id)
            .single()

        if (!existingBroker) {
            const meta = user.user_metadata || {}
            const role = meta.broker_role || 'owner'
            const fullName = meta.full_name || user.email?.split('@')[0] || 'User'

            const { error: insertError } = await supabase
                .from('brokers')
                .insert({
                    user_id: user.id,
                    role,
                    full_name: fullName,
                    email: user.email || email,
                    phone: meta.phone || null,
                    license_id: meta.license_id || null,
                    brokerage_name: meta.brokerage_name || null,
                    brokerage_license: meta.brokerage_license || null,
                    parent_broker_id: meta.parent_broker_id || null,
                })

            if (insertError) {
                console.error('Failed to create broker profile on login:', insertError)
                throw new Error('Account verified but profile creation failed. Please try again or contact support.')
            }
        }
    }

    return data
}

export async function signOutBroker() {
    if (!supabase) throw new Error('Supabase not configured')
    const { error } = await supabase.auth.signOut()
    if (error) throw error
}

export async function getBrokerSession(): Promise<{ session: any; broker: BrokerProfile } | null> { // eslint-disable-line @typescript-eslint/no-explicit-any
    if (!supabase) return null

    const { data: { session } } = await supabase.auth.getSession()
    if (!session) return null

    const broker = await getBrokerProfile(session.user.id)
    if (!broker) return null

    return { session, broker }
}

export async function getBrokerProfile(userId: string): Promise<BrokerProfile | null> {
    if (!supabase) return null

    const { data, error } = await supabase
        .from('brokers')
        .select('*')
        .eq('user_id', userId)
        .single()

    if (error || !data) return null
    return data as BrokerProfile
}

export async function updateBrokerProfile(brokerId: string, updates: Partial<Pick<BrokerProfile, 'full_name' | 'phone' | 'license_id' | 'brokerage_name' | 'brokerage_license'>>) {
    if (!supabase) throw new Error('Supabase not configured')

    const { data, error } = await supabase
        .from('brokers')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', brokerId)
        .select()
        .single()

    if (error) throw error
    return data as BrokerProfile
}
