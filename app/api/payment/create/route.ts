import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { orderId, amount, eventTitle } = body;

    if (!orderId || !amount) {
      return NextResponse.json(
        { error: "Missing orderId or amount" },
        { status: 400 }
      );
    }

    const slug = process.env.NEXT_PUBLIC_PAKASIR_SLUG;

    if (!slug) {
      return NextResponse.json(
        { error: "Pakasir not configured" },
        { status: 500 }
      );
    }

    // Buat redirect URL (halaman sukses setelah bayar)
    const baseUrl = request.headers.get("origin") || "http://localhost:3000";
    const redirectUrl = `${baseUrl}/checkout/success?orderId=${orderId}`;

    // Buat Pakasir payment URL
    const paymentUrl = `https://app.pakasir.com/pay/${slug}/${amount}?order_id=${orderId}&redirect=${encodeURIComponent(redirectUrl)}`;

    return NextResponse.json({ paymentUrl }, { status: 200 });
  } catch (error) {
    console.error("Create payment error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
