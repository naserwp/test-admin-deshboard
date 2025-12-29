"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

type LeadResultFormProps = {
  jobId: string;
};

export default function LeadResultForm({ jobId }: LeadResultFormProps) {
  const [saving, setSaving] = useState(false);
  const router = useRouter();
  const [formData, setFormData] = useState({
    businessName: "",
    industry: "",
    website: "",
    phone: "",
    email: "",
    addressLine1: "",
    addressLine2: "",
    city: "",
    state: "",
    postalCode: "",
    country: "",
    source: "",
    sourceUrl: "",
    confidence: "",
    notes: "",
  });

  const handleChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!formData.businessName.trim()) {
      toast.error("Business name is required.");
      return;
    }

    setSaving(true);
    try {
      const payload = {
        ...formData,
        confidence: formData.confidence ? Number(formData.confidence) : null,
      };

      const response = await fetch(`/api/admin/leads/jobs/${jobId}/results`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await response.json().catch(() => null);
      if (!response.ok) {
        throw new Error(data?.error || "Failed to add result.");
      }
      toast.success("Lead result added.");
      router.refresh();
      setFormData({
        businessName: "",
        industry: "",
        website: "",
        phone: "",
        email: "",
        addressLine1: "",
        addressLine2: "",
        city: "",
        state: "",
        postalCode: "",
        country: "",
        source: "",
        sourceUrl: "",
        confidence: "",
        notes: "",
      });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to add result.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid gap-4 md:grid-cols-2">
        <label className="space-y-2 text-sm text-slate-600">
          <span className="font-medium text-slate-800">Business name</span>
          <input
            name="businessName"
            value={formData.businessName}
            onChange={handleChange}
            className="w-full rounded-xl border border-slate-200 px-3 py-2"
            required
          />
        </label>
        <label className="space-y-2 text-sm text-slate-600">
          <span className="font-medium text-slate-800">Industry</span>
          <input
            name="industry"
            value={formData.industry}
            onChange={handleChange}
            className="w-full rounded-xl border border-slate-200 px-3 py-2"
          />
        </label>
        <label className="space-y-2 text-sm text-slate-600">
          <span className="font-medium text-slate-800">Website</span>
          <input
            name="website"
            value={formData.website}
            onChange={handleChange}
            className="w-full rounded-xl border border-slate-200 px-3 py-2"
          />
        </label>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <label className="space-y-2 text-sm text-slate-600">
          <span className="font-medium text-slate-800">Email</span>
          <input
            name="email"
            value={formData.email}
            onChange={handleChange}
            className="w-full rounded-xl border border-slate-200 px-3 py-2"
          />
        </label>
        <label className="space-y-2 text-sm text-slate-600">
          <span className="font-medium text-slate-800">Phone</span>
          <input
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            className="w-full rounded-xl border border-slate-200 px-3 py-2"
          />
        </label>
        <label className="space-y-2 text-sm text-slate-600">
          <span className="font-medium text-slate-800">Confidence</span>
          <input
            name="confidence"
            type="number"
            min={0}
            max={100}
            value={formData.confidence}
            onChange={handleChange}
            className="w-full rounded-xl border border-slate-200 px-3 py-2"
          />
        </label>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <label className="space-y-2 text-sm text-slate-600">
          <span className="font-medium text-slate-800">Address line 1</span>
          <input
            name="addressLine1"
            value={formData.addressLine1}
            onChange={handleChange}
            className="w-full rounded-xl border border-slate-200 px-3 py-2"
          />
        </label>
        <label className="space-y-2 text-sm text-slate-600">
          <span className="font-medium text-slate-800">Address line 2</span>
          <input
            name="addressLine2"
            value={formData.addressLine2}
            onChange={handleChange}
            className="w-full rounded-xl border border-slate-200 px-3 py-2"
          />
        </label>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <label className="space-y-2 text-sm text-slate-600">
          <span className="font-medium text-slate-800">City</span>
          <input
            name="city"
            value={formData.city}
            onChange={handleChange}
            className="w-full rounded-xl border border-slate-200 px-3 py-2"
          />
        </label>
        <label className="space-y-2 text-sm text-slate-600">
          <span className="font-medium text-slate-800">State</span>
          <input
            name="state"
            value={formData.state}
            onChange={handleChange}
            className="w-full rounded-xl border border-slate-200 px-3 py-2"
          />
        </label>
        <label className="space-y-2 text-sm text-slate-600">
          <span className="font-medium text-slate-800">Postal code</span>
          <input
            name="postalCode"
            value={formData.postalCode}
            onChange={handleChange}
            className="w-full rounded-xl border border-slate-200 px-3 py-2"
          />
        </label>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <label className="space-y-2 text-sm text-slate-600">
          <span className="font-medium text-slate-800">Country</span>
          <input
            name="country"
            value={formData.country}
            onChange={handleChange}
            className="w-full rounded-xl border border-slate-200 px-3 py-2"
          />
        </label>
        <label className="space-y-2 text-sm text-slate-600">
          <span className="font-medium text-slate-800">Source</span>
          <input
            name="source"
            value={formData.source}
            onChange={handleChange}
            className="w-full rounded-xl border border-slate-200 px-3 py-2"
            required
          />
        </label>
        <label className="space-y-2 text-sm text-slate-600">
          <span className="font-medium text-slate-800">Source URL</span>
          <input
            name="sourceUrl"
            value={formData.sourceUrl}
            onChange={handleChange}
            className="w-full rounded-xl border border-slate-200 px-3 py-2"
          />
        </label>
      </div>

      <label className="space-y-2 text-sm text-slate-600">
        <span className="font-medium text-slate-800">Notes</span>
        <textarea
          name="notes"
          value={formData.notes}
          onChange={handleChange}
          className="w-full rounded-xl border border-slate-200 px-3 py-2"
          rows={3}
        />
      </label>

      <button
        type="submit"
        disabled={saving}
        className="inline-flex items-center justify-center rounded-full bg-slate-900 px-5 py-2 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:bg-slate-400"
      >
        {saving ? "Adding..." : "Add lead result"}
      </button>
    </form>
  );
}
