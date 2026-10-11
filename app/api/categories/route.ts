import { NextRequest, NextResponse } from "next/server";
import { getCurrentStaff } from "@/lib/session";
import { createAdminClient } from "@/lib/supabaseAdmin";

export async function POST(request: NextRequest) {
  const staff = await getCurrentStaff();
  if (!staff) {
    return NextResponse.json({ error: "Not logged in." }, { status: 401 });
  }

  const body = await request.json();
  if (!body.slug || !body.name) {
    return NextResponse.json({ error: "Slug and name are required." }, { status: 400 });
  }

  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("categories")
    .insert({
      slug: body.slug,
      name: body.name,
      description: body.description ?? null,
      sort_order: body.sort_order ?? 0,
    })
    .select("id")
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ id: data.id }, { status: 201 });
}

export async function GET() {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("categories")
    .select("id, slug, name, description, sort_order")
    .order("sort_order", { ascending: true });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ categories: data }, { status: 200 });
}