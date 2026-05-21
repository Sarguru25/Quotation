import { NextResponse } from "next/server";
import { requirePermission } from "@/lib/rbac/auth";
import { PERMISSIONS } from "@/lib/rbac/permissions";
import { getCustomers, createCustomer } from "@/lib/zoho/customers";

export async function GET() {
  try {
    await requirePermission(PERMISSIONS.CUSTOMER.VIEW);
    
    const contacts = await getCustomers();
    return NextResponse.json(contacts);
  } catch (error) {
    if (error.message?.includes("Forbidden") || error.message?.includes("Unauthorized")) {
      return NextResponse.json({ error: error.message }, { status: 403 });
    }
    console.error("[API] GET Customers Error:", error.message || error);
    return NextResponse.json([], { status: 500 });
  }
}

export async function POST(req) {
  try {
    await requirePermission(PERMISSIONS.CUSTOMER.CREATE);
    
    const body = await req.json();

    const customerPayload = {
      contact_name: body.contact_name,
      company_name: body.company_name,
      customer_sub_type: body.customer_sub_type || "business",
      contact_type: "customer",
      email: body.email,
      phone: body.phone,
      mobile: body.mobile,
      salutation: body.salutation,
      first_name: body.first_name,
      last_name: body.last_name,
      pan_no: body.pan_no,
      language_code: body.language_code || "en",
      currency_code: body.currency_code || "INR",
      payment_terms: parseInt(body.payment_terms) || 15,
      payment_terms_label: body.payment_terms == "15" ? "Due on Receipt" : `Net ${body.payment_terms}`,
      billing_address: body.billing_address,
      shipping_address: body.shipping_address,
    };

    const data = await createCustomer(customerPayload);

    return NextResponse.json({
      success: true,
      data: data.contact,
    });
  } catch (error) {
    if (error.message?.includes("Forbidden") || error.message?.includes("Unauthorized")) {
      return NextResponse.json({ success: false, error: error.message }, { status: 403 });
    }
    console.error("[API] POST Customer Error:", error.message || error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to create customer" },
      { status: error.status || 500 }
    );
  }
}
