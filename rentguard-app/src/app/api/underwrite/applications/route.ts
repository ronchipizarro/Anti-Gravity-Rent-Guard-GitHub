import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET() {
    if (!supabase) {
        return NextResponse.json({ error: 'Database not configured.' }, { status: 500 });
    }

    const { data, error } = await supabase
        .from('applications')
        .select('id, created_at, status, decision, tenant_data, owner_data')
        .order('created_at', { ascending: false });

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ applications: data || [] });
}
