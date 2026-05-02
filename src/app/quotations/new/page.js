"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import QuotationForm from "@/app/components/QuotationForm";

export default function NewQuotationPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (formData) => {
    setSaving(true);
    setError("");
    try {
      const res = await fetch("/api/quotations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to create");
      }
      const quotation = await res.json();
      router.push(`/quotations/${quotation._id}`);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  if (!session) return null;

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">New Quotation</h1>
      {error && (
        <div className="bg-red-100 text-red-700 p-3 rounded mb-4">{error}</div>
      )}
      <QuotationForm
        onSubmit={handleSubmit}
        saving={saving}
        initialData={{ customerName: "", items: [{ name: "", quantity: 1, rate: 0 }], notes: "", status: "Draft" }}
      />
    </div>
  );
}