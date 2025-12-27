"use client";

import { useEffect, useRef, useState } from "react";

interface Service {
  _id: string;
  serviceName: string;
  serviceType: string;
  description: string;
  imageUrl: string;
  imagePublicId: string;
  isActive: boolean;
  createdAt: string;
}

const SERVICE_TYPES = ["Wedding", "Corporate", "Party", "Other"];

// Description suggestions based on service type and name
const DESCRIPTION_SUGGESTIONS: Record<string, string[]> = {
  "Wedding": [
    "Capture your special day with professional wedding photography",
    "Complete wedding coverage from ceremony to reception",
    "Beautiful moments of your wedding day preserved forever",
    "Professional wedding photography and videography",
    "Candid moments and posed portraits of your wedding"
  ],
  "Corporate": [
    "Professional corporate event photography",
    "Business conference and meeting coverage",
    "Corporate team building and company event photography",
    "Professional headshots and corporate portraits",
    "Brand and product photography for your business"
  ],
  "Party": [
    "Fun and vibrant party event photography",
    "Birthday celebration and party coverage",
    "Engagement party and celebration photography",
    "Live event and party moments captured",
    "Social gathering and celebration photography"
  ],
  "default": [
    "Professional photography services",
    "Customized photography packages",
    "High-quality photo and video coverage",
    "Professional event documentation",
    "Creative and artistic photography services"
  ]
};

export default function ServicesPage() {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState("");
  const [serviceName, setServiceName] = useState("");
  const [serviceType, setServiceType] = useState("Wedding");
  const [customServiceType, setCustomServiceType] = useState("");
  const [description, setDescription] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [imageUrl, setImageUrl] = useState("");
  const [imagePublicId, setImagePublicId] = useState("");
  const [isActive, setIsActive] = useState(true);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dragRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadServices();
  }, []);

  const loadServices = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/services");
      const data = await res.json();
      setServices(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Failed to load services:", error);
      setServices([]);
    } finally {
      setLoading(false);
    }
  };

  const handleUploadImage = async (file: File) => {
    if (!file.type.startsWith("image/")) {
      setMessage("✗ Please select an image file");
      return;
    }

    setUploading(true);

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("folder", "shivay-studio/services");

      const uploadRes = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (!uploadRes.ok) {
        const error = await uploadRes.json();
        throw new Error(error.error || "Upload failed");
      }

      const uploadData = await uploadRes.json();
      setImageUrl(uploadData.secure_url);
      setImagePublicId(uploadData.public_id);
      setMessage("✓ Image uploaded successfully");
    } catch (error: any) {
      setMessage(`✗ Error: ${error.message}`);
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const finalServiceType = serviceType === "Other" && customServiceType.trim()
      ? customServiceType.trim()
      : serviceType;

    if (!serviceName.trim() || !finalServiceType || !imageUrl || !imagePublicId) {
      setMessage("✗ Please fill in all fields and upload an image");
      return;
    }

    if (serviceType === "Other" && !customServiceType.trim()) {
      setMessage("✗ Please enter a custom service type");
      return;
    }

    setLoading(true);
    setMessage("");

    try {
      const res = await fetch("/api/services", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          serviceName,
          serviceType: finalServiceType,
          description,
          imageUrl,
          imagePublicId,
          isActive,
        }),
      });

      if (!res.ok) {
        throw new Error("Failed to create service");
      }

      setMessage("✓ Service created successfully!");
      setServiceName("");
      setServiceType("Wedding");
      setCustomServiceType("");
      setDescription("");
      setImageUrl("");
      setImagePublicId("");
      setIsActive(true);
      setShowSuggestions(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
      await loadServices();
    } catch (error: any) {
      setMessage(`✗ Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    if (dragRef.current) {
      dragRef.current.classList.add("border-[var(--accent)]", "bg-[var(--primary)]/5");
    }
  };

  const handleDragLeave = () => {
    if (dragRef.current) {
      dragRef.current.classList.remove("border-[var(--accent)]", "bg-[var(--primary)]/5");
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (dragRef.current) {
      dragRef.current.classList.remove("border-[var(--accent)]", "bg-[var(--primary)]/5");
    }

    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleUploadImage(files[0]);
    }
  };

  const getSuggestions = () => {
    const type = serviceType === "Other" ? "default" : serviceType;
    return DESCRIPTION_SUGGESTIONS[type] || DESCRIPTION_SUGGESTIONS["default"];
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this service? This action cannot be undone.")) return;

    try {
      const res = await fetch(`/api/services/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Delete failed");

      setServices(services.filter((s) => s._id !== id));
      setMessage("✓ Service deleted successfully");
    } catch (error) {
      setMessage("✗ Failed to delete service");
      console.error(error);
    }
  };

  const toggleActive = async (service: Service) => {
    try {
      const res = await fetch(`/api/services/${service._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !service.isActive }),
      });

      if (!res.ok) throw new Error("Update failed");

      setServices(
        services.map((s) =>
          s._id === service._id ? { ...s, isActive: !s.isActive } : s
        )
      );
      setMessage("✓ Service status updated");
    } catch (error) {
      setMessage("✗ Failed to update service");
    }
  };

  const activeServices = services.filter((s) => s.isActive);
  const inactiveServices = services.filter((s) => !s.isActive);

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm uppercase tracking-[0.2em] text-[var(--muted)]">Services</p>
        <h1 className="text-3xl font-[var(--font-heading)] mt-1">Types of Shoots / Services</h1>
        <p className="text-sm text-[var(--muted)]">
          Showcase the different types of photography services you offer.
        </p>
      </div>

      {/* Create Form */}
      <form onSubmit={handleSubmit} className="card p-6 space-y-6 fade-in">
        <h2 className="text-lg font-semibold">Add New Service</h2>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <label className="text-sm font-medium">Service Name</label>
            <input
              type="text"
              value={serviceName}
              onChange={(e) => setServiceName(e.target.value)}
              required
              className="input"
              placeholder="Wedding Photography"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Service Type (Recommended)</label>
            <select
              value={serviceType}
              onChange={(e) => setServiceType(e.target.value)}
              required
              className="input"
            >
              {SERVICE_TYPES.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Custom Service Type */}
        {serviceType === "Other" && (
          <div className="space-y-2 fade-in">
            <label className="text-sm font-medium">Custom Service Type</label>
            <input
              type="text"
              value={customServiceType}
              onChange={(e) => setCustomServiceType(e.target.value)}
              required
              className="input"
              placeholder="e.g., Product Photography, Fashion Shoot, etc."
            />
            <p className="text-xs text-[var(--muted)]">
              Define your own service type when "Other" is selected
            </p>
          </div>
        )}

        {/* Description with Suggestions */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium">Description</label>
            <button
              type="button"
              onClick={() => setShowSuggestions(!showSuggestions)}
              className="text-xs text-[var(--accent)] hover:underline"
            >
              {showSuggestions ? "Hide suggestions" : "Show suggestions"}
            </button>
          </div>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="input resize-none"
            placeholder="Enter a description for this service..."
            rows={3}
          />
          <p className="text-xs text-[var(--muted)]">
            Brief description shown on the service card
          </p>

          {/* Suggestions Dropdown */}
          {showSuggestions && (
            <div className="mt-3 p-3 bg-[var(--primary)]/5 rounded-lg border border-[var(--border)] space-y-2">
              <p className="text-xs font-medium text-[var(--muted)]">Suggested descriptions:</p>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {getSuggestions().map((suggestion, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      setDescription(suggestion);
                      setShowSuggestions(false);
                    }}
                    className="w-full text-left p-2 text-sm hover:bg-[var(--primary)]/10 rounded transition-colors"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Image Upload */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Service Image</label>
          <div
            ref={dragRef}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className="border-2 border-dashed border-[var(--border)] rounded-xl p-8 text-center cursor-pointer transition-all hover:border-[var(--accent)] hover:bg-[var(--primary)]/5"
            onClick={() => fileInputRef.current?.click()}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={(e) => e.target.files && handleUploadImage(e.target.files[0])}
              className="hidden"
              disabled={uploading}
            />
            {imageUrl ? (
              <div className="space-y-2">
                <img
                  src={imageUrl}
                  alt="Service"
                  className="w-48 h-32 object-cover rounded-lg mx-auto"
                />
                <p className="text-xs text-green-600">✓ Image selected</p>
                <p className="text-xs text-[var(--muted)]">Click to change</p>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="text-4xl">🎯</div>
                <p className="text-sm font-medium">Drag & drop service image here</p>
                <p className="text-xs text-[var(--muted)]">or click to browse</p>
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={isActive}
            onChange={(e) => setIsActive(e.target.checked)}
            className="w-4 h-4"
            id="isActive"
          />
          <label htmlFor="isActive" className="text-sm">
            Active (Show on website)
          </label>
        </div>

        {message && (
          <p
            className={`text-sm p-3 rounded-lg ${
              message.startsWith("✓")
                ? "bg-green-50 text-green-700 border border-green-200"
                : "bg-red-50 text-red-700 border border-red-200"
            }`}
          >
            {message}
          </p>
        )}

        <button
          type="submit"
          disabled={loading || uploading}
          className="w-full px-4 py-3 bg-[var(--primary)] text-white rounded-xl font-medium hover:bg-[#5a1922] disabled:opacity-60 transition-colors"
        >
          {loading ? "Creating..." : "Add Service"}
        </button>
      </form>

      {/* Active Services */}
      {activeServices.length > 0 && (
        <div className="card p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Active Services</h2>
            <span className="text-sm text-[var(--muted)]">{activeServices.length} services</span>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {activeServices.map((service) => (
              <div
                key={service._id}
                className="border border-[var(--border)] rounded-xl overflow-hidden hover:shadow-lg transition-shadow"
              >
                <div className="relative aspect-video bg-[var(--border)]">
                  <img
                    src={service.imageUrl}
                    alt={service.serviceName}
                    className="w-full h-full object-cover"
                  />
                  <span className="absolute top-2 right-2 bg-green-500 text-white text-xs px-2 py-1 rounded">
                    Active
                  </span>
                </div>
                <div className="p-4 space-y-2">
                  <h3 className="font-semibold text-[var(--foreground)]">{service.serviceName}</h3>
                  <p className="text-sm text-[var(--muted)]">
                    📂 {service.serviceType}
                  </p>
                  {service.description && (
                    <p className="text-xs text-[var(--muted)] line-clamp-2">
                      {service.description}
                    </p>
                  )}
                  <p className="text-xs text-[var(--muted)]">
                    {new Date(service.createdAt).toLocaleDateString()}
                  </p>
                  <div className="flex gap-2 mt-3">
                    <button
                      onClick={() => toggleActive(service)}
                      className="flex-1 text-xs text-yellow-600 hover:bg-yellow-50 py-2 rounded-lg transition-colors"
                    >
                      Deactivate
                    </button>
                    <button
                      onClick={() => handleDelete(service._id)}
                      className="flex-1 text-xs text-red-600 hover:bg-red-50 py-2 rounded-lg transition-colors"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Inactive Services */}
      {inactiveServices.length > 0 && (
        <div className="card p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-[var(--muted)]">Inactive Services</h2>
            <span className="text-sm text-[var(--muted)]">{inactiveServices.length} services</span>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {inactiveServices.map((service) => (
              <div
                key={service._id}
                className="border border-[var(--border)] rounded-xl overflow-hidden opacity-60"
              >
                <div className="relative aspect-video bg-[var(--border)]">
                  <img
                    src={service.imageUrl}
                    alt={service.serviceName}
                    className="w-full h-full object-cover grayscale"
                  />
                  <span className="absolute top-2 right-2 bg-gray-500 text-white text-xs px-2 py-1 rounded">
                    Inactive
                  </span>
                </div>
                <div className="p-4 space-y-2">
                  <h3 className="font-semibold text-[var(--foreground)]">{service.serviceName}</h3>
                  <p className="text-sm text-[var(--muted)]">
                    📂 {service.serviceType}
                  </p>
                  {service.description && (
                    <p className="text-xs text-[var(--muted)] line-clamp-2">
                      {service.description}
                    </p>
                  )}
                  <div className="flex gap-2 mt-3">
                    <button
                      onClick={() => toggleActive(service)}
                      className="flex-1 text-xs text-green-600 hover:bg-green-50 py-2 rounded-lg transition-colors"
                    >
                      Activate
                    </button>
                    <button
                      onClick={() => handleDelete(service._id)}
                      className="flex-1 text-xs text-red-600 hover:bg-red-50 py-2 rounded-lg transition-colors"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {loading && services.length === 0 && (
        <div className="card p-6 text-center">
          <p className="text-sm text-[var(--muted)]">Loading services...</p>
        </div>
      )}

      {!loading && services.length === 0 && (
        <div className="card p-6 text-center">
          <p className="text-sm text-[var(--muted)]">No services yet. Add your first service!</p>
        </div>
      )}
    </div>
  );
}
