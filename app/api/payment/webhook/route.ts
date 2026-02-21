import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";

// Gunakan service role atau server-side supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Pakasir mengirim: project, order_id, amount, api_key
    const { order_id, amount } = body;

    if (!order_id || !amount) {
      return NextResponse.json(
        { error: "Missing order_id or amount" },
        { status: 400 }
      );
    }

    // Cari order di database
    const { data: order, error: fetchError } = await supabase
      .from("orders")
      .select("*")
      .eq("id", order_id)
      .single();

    if (fetchError || !order) {
      return NextResponse.json(
        { error: "Order not found" },
        { status: 404 }
      );
    }

    // Validasi: amount harus sesuai dengan total_price
    if (Number(amount) !== Number(order.total_price)) {
      return NextResponse.json(
        { error: "Amount mismatch" },
        { status: 400 }
      );
    }

    // Validasi: order harus masih pending
    if (order.status !== "pending") {
      return NextResponse.json(
        { message: "Order already processed", status: order.status },
        { status: 200 }
      );
    }

    // Update status order menjadi "paid"
    const { error: updateError } = await supabase
      .from("orders")
      .update({ status: "paid" })
      .eq("id", order_id);

    if (updateError) {
      return NextResponse.json(
        { error: "Failed to update order: " + updateError.message },
        { status: 500 }
      );
    }

    // Update jumlah tiket terjual
    if (order.ticket_tier_id) {
      const { data: tier } = await supabase
        .from("ticket_tiers")
        .select("sold")
        .eq("id", order.ticket_tier_id)
        .single();

      if (tier) {
        await supabase
          .from("ticket_tiers")
          .update({ sold: tier.sold + order.quantity })
          .eq("id", order.ticket_tier_id);
      }
    }

    // Update voucher usage jika ada
    if (order.voucher_id) {
      const { data: voucher } = await supabase
        .from("vouchers")
        .select("used_count")
        .eq("id", order.voucher_id)
        .single();

      if (voucher) {
        await supabase
          .from("vouchers")
          .update({ used_count: voucher.used_count + 1 })
          .eq("id", order.voucher_id);
      }
    }

    return NextResponse.json(
      { message: "Payment confirmed, order updated to paid" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Webhook error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
