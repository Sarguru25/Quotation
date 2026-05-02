"use client";

import { useSession } from "next-auth/react";
import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import QuotationForm from "@/app/components/QuotationForm";
import Loading from "@/app/components/Loading";
import ErrorMessage from "@/app/components/ErrorMessage";

export default function QuotationDetailPage() {
  const { data: session } = useSession();
  const { id } = useParams();
  const router = useRouter();
  const [quotation, setQuotation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [syncing, setSyncing] = useState(false);

  const fetchQuotation = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/quotations/${id}`);
      if (!res.ok) throw new Error("Failed to load");
      const data = await res.json();
      setQuotation(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    if (session) fetchQuotation();
  }, [session, fetchQuotation]);

  const handleUpdate = async (formData) => {
    setSaving(true);
    try {
      const res = await fetch(`/api/quotations/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Update failed");
      }
      const updated = await res.json();
      setQuotation(updated);
      setEditing(false);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm("Are you sure?")) return;
    try {
      const res = await fetch(`/api/quotations/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Delete failed");
      router.push("/quotations");
    } catch (err) {
      setError(err.message);
    }
  };

  const handleSync = async () => {
    setSyncing(true);
    setError("");
    try {
      const res = await fetch(`/api/quotations/${id}/sync`, { method: "POST" });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Sync failed");
      }
      const result = await res.json();
      setQuotation(result.quotation);
    } catch (err) {
      setError(err.message);
    } finally {
      setSyncing(false);
    }
  };

  if (loading) return <Loading />;
  if (error) return <ErrorMessage message={error} />;
  if (!quotation) return <div>Not found</div>;

  // Check if user can edit (owner or Admin)
  const canEdit =
    session.user.role === "Admin" || quotation.userId === session.user.id;

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">
          Quotation {quotation._id.toString().slice(-6)}
        </h1>
        <div className="space-x-2">
          {canEdit && (
            <>
              <button
                onClick={() => setEditing(!editing)}
                className="bg-gray-200 px-4 py-2 rounded hover:bg-gray-300"
              >
                {editing ? "Cancel" : "Edit"}
              </button>
              <button
                onClick={handleDelete}
                className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
              >
                Delete
              </button>
              <button
                onClick={handleSync}
                disabled={syncing}
                className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 disabled:opacity-50"
              >
                {syncing ? "Syncing..." : "Sync to Zoho"}
              </button>
            </>
          )}
        </div>
      </div>

      {editing ? (
        <QuotationForm
          initialData={quotation}
          onSubmit={handleUpdate}
          saving={saving}
        />
      ) : (
        <div className="bg-white rounded shadow p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <span className="font-medium">Customer:</span>{" "}
              {quotation.customerName}
            </div>
            <div>
              <span className="font-medium">Status:</span> {quotation.status}
            </div>
            {quotation.zohoQuoteId && (
              <div>
                <span className="font-medium">Zoho ID:</span>{" "}
                {quotation.zohoQuoteId}
              </div>
            )}
            <div>
              <span className="font-medium">Created:</span>{" "}
              {new Date(quotation.createdAt).toLocaleString()}
            </div>
          </div>

          <div>
            <h3 className="font-medium mb-2">Items</h3>
            <table className="w-full border">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left p-2">Item</th>
                  <th className="text-right p-2">Qty</th>
                  <th className="text-right p-2">Rate</th>
                  <th className="text-right p-2">Total</th>
                </tr>
              </thead>
              <tbody>
                {quotation.items.map((item, idx) => (
                  <tr key={idx} className="border-t">
                    <td className="p-2">{item.name}</td>
                    <td className="text-right p-2">{item.quantity}</td>
                    <td className="text-right p-2">${item.rate.toFixed(2)}</td>
                    <td className="text-right p-2">
                      ${item.total.toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="border-t font-bold">
                  <td colSpan={3} className="text-right p-2">
                    Total:
                  </td>
                  <td className="text-right p-2">
                    ${quotation.totalAmount.toFixed(2)}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>

          {quotation.notes && (
            <div>
              <h3 className="font-medium">Notes</h3>
              <p className="text-gray-600">{quotation.notes}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}