import { NextResponse } from "next/server";
import axios from "axios";
import { getZohoAccessToken } from "@/lib/zoho";
import dbConnect from "@/lib/db";
import Item from "@/models/Item";

const ZOHO_ORGANIZATION_ID = process.env.ZOHO_ORGANIZATION_ID;

// Default account IDs for quotation (Zoho Books)
const DEFAULT_SALES_ACCOUNT_ID = "5941994000000090251"; // Sales
const DEFAULT_PURCHASE_ACCOUNT_ID = "5941994000000034003"; // Cost of Goods Sold

export async function POST(req) {
  try {
    const body = await req.json();
    const accessToken = await getZohoAccessToken();

    // Determine sales and purchase eligibility
    const isSales =
      body.is_sales !== undefined
        ? Boolean(body.is_sales)
        : body.can_be_sold !== undefined
        ? Boolean(body.can_be_sold)
        : true;

    const isPurchase =
      body.is_purchase !== undefined
        ? Boolean(body.is_purchase)
        : body.can_be_purchased !== undefined
        ? Boolean(body.can_be_purchased)
        : true; // In quotation, purchase info is enabled by default

    // Zoho Books requires item_type to be "sales_and_purchases" for items with purchase information enabled
    let itemType = "sales_and_purchases";
    if (isSales && isPurchase) {
      itemType = "sales_and_purchases";
    } else if (isPurchase && !isSales) {
      itemType = "purchases";
    } else if (isSales && !isPurchase) {
      itemType = "sales";
    }

    const itemPayload = {
      name: body.name,
      rate: Number(body.rate) || 0,
      description: body.description || "",
      sku: body.sku || "",
      product_type: body.product_type || "goods",
      unit: body.unit || "",
      item_type: itemType,
      can_be_sold: isSales,
      can_be_purchased: isPurchase,
    };

    if (isPurchase) {
      itemPayload.purchase_rate = Number(body.purchase_rate) || 0;
      itemPayload.purchase_description = body.purchase_description || "";
      itemPayload.purchase_account_id =
        body.purchase_account_id || DEFAULT_PURCHASE_ACCOUNT_ID;
      if (body.purchase_tax_id) itemPayload.purchase_tax_id = body.purchase_tax_id;
      if (body.vendor_id) itemPayload.vendor_id = body.vendor_id;
    }

    if (isSales) {
      itemPayload.account_id = body.account_id || DEFAULT_SALES_ACCOUNT_ID;
      if (body.tax_id) itemPayload.tax_id = body.tax_id;
    }

    if (body.custom_fields && body.custom_fields.length > 0) {
      itemPayload.custom_fields = body.custom_fields;
    }

    const response = await axios.post(
      `https://www.zohoapis.com/books/v3/items`,
      itemPayload,
      {
        headers: {
          Authorization: `Zoho-oauthtoken ${accessToken}`,
        },
        params: {
          organization_id: ZOHO_ORGANIZATION_ID,
        },
      }
    );

    const createdItem = response.data?.item;
    if (createdItem && createdItem.item_id) {
      try {
        await dbConnect();
        await Item.findOneAndUpdate(
          { zoho_item_id: createdItem.item_id },
          {
            $set: {
              name: createdItem.name,
              sku: createdItem.sku,
              description: createdItem.description,
              rate: createdItem.rate,
              purchase_rate: createdItem.purchase_rate,
              tax_id: createdItem.tax_id,
              tax_name: createdItem.tax_name,
              tax_percentage: createdItem.tax_percentage,
              item_type: createdItem.item_type,
              unit: createdItem.unit,
              status: createdItem.status,
              stock_on_hand: createdItem.stock_on_hand,
              available_stock: createdItem.available_stock,
              created_time: createdItem.created_time
                ? new Date(createdItem.created_time)
                : new Date(),
              last_modified_time: createdItem.last_modified_time
                ? new Date(createdItem.last_modified_time)
                : new Date(),
              syncedAt: new Date(),
              rawZohoData: createdItem,
            },
          },
          { upsert: true, new: true }
        );
      } catch (dbErr) {
        console.warn("Failed to update local Item collection after create:", dbErr.message);
      }
    }

    return NextResponse.json({
      success: true,
      data: response.data,
    });
  } catch (error) {
    console.error("CREATE ITEM ERROR:", error.response?.data || error.message);
    return NextResponse.json(
      { success: false, error: error.response?.data || error.message },
      { status: 500 }
    );
  }
}
