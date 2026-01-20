"use client";

import { useEffect, useRef, useState } from "react";
import { useUpload } from "@/hooks/useUpload";

interface Wedding {
  _id: string;
  title: string;
  coupleName: string;
  place: string;
  serviceType: string;
  coverPhoto: {
    url: string;
    publicId: string;
  };
  gallery: string[];
  createdAt: string;
}

interface WeddingGalleryImage {
  _id: string;
  imageUrl: string;
  imagePublicId: string;
  photoType: "wedding" | "prewedding";
  order: number;
  createdAt: string;
}

const SERVICE_TYPES = ["Wedding", "Corporate", "Party", "Other"];

export default function WeddingsPage() {
  const [weddings, setWeddings] = useState<Wedding[]>([]);
  const [galleryShowcase, setGalleryShowcase] = useState<WeddingGalleryImage[]>([]);
  const [services, setServices] = useState<{ serviceType: string }[]>([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [title, setTitle] = useState("");
  const [coupleName, setCoupleName] = useState("");
  const [place, setPlace] = useState("");
  const [serviceType, setServiceType] = useState("");
  const [coverPhotoUrl, setCoverPhotoUrl] = useState("");
  const [coverPhotoId, setCoverPhotoId] = useState("");
  const [galleryUrls, setGalleryUrls] = useState<string[]>([]);
  const [showcasePhotoType, setShowcasePhotoType] = useState<"wedding" | "prewedding">("wedding");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);
  const dragRef = useRef<HTMLDivElement>(null);
  const showcaseDragRef = useRef<HTMLDivElement>(null);
  const showcaseFileInputRef = useRef<HTMLInputElement>(null);
  const { uploading, progress, uploadFile, uploadMultipleFiles } = useUpload();

  useEffect(() => {
    loadWeddings();
    loadServices();
    loadGalleryShowcase();
  }, []);

  const loadServices = async () => {
    try {
      const res = await fetch("/api/services");
      const data = await res.json();
      setServices(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Failed to load services:", error);
    }
  };

  const loadGalleryShowcase = async () => {
    try {
      const response = await fetch("/api/wedding-gallery");
      const result = await response.json();
      if (result.success) {
        setGalleryShowcase(result.data);
      }
    } catch (error) {
      console.error("Failed to fetch wedding gallery showcase");
    }
  };

  const loadWeddings = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/weddings");
      const data = await res.json();
      setWeddings(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Failed to load weddings:", error);
      setWeddings([]);
    } finally {
      setLoading(false);
    }
  };

  const handleUploadCover = async (file: File) => {
    if (!file.type.startsWith("image/")) {
      setMessage("✗ Please select an image file");
      return;
    }

    try {
      setMessage("Uploading cover photo...");
      
      const uploadData: any = await uploadFile(file, {
        folder: "shivay-studio/weddings",
        onProgress: (p) => {
          setMessage(`Uploading cover photo... ${p.percentage}%`);
        },
        onError: (error) => {
          setMessage(`✗ Error: ${error}`);
        },
        onSuccess: () => {
          setMessage("✓ Cover photo uploaded");
        },
      });

      setCoverPhotoUrl(uploadData.secure_url);
      setCoverPhotoId(uploadData.public_id);
    } catch (error: any) {
      setMessage(`✗ Error: ${error.message}`);
    }
  };

  const handleUploadGallery = async (files: FileList) => {
    if (files.length === 0) return;

    try {
      setMessage(`Uploading ${files.length} gallery image(s)...`);
      
      const uploadedFiles = await uploadMultipleFiles(Array.from(files), {
        folder: "shivay-studio/weddings/gallery",
        onProgress: (p) => {
          setMessage(
            `Uploading ${p.loaded} of ${p.total} files... ${p.percentage}%`
          );
        },
        onError: (error) => {
          setMessage(`✗ Error: ${error}`);
        },
      });

      const urls = uploadedFiles.map((data: any) => data.secure_url);
      setGalleryUrls([...galleryUrls, ...urls]);
      setMessage(`✓ ${urls.length} images uploaded to gallery`);
    } catch (error: any) {
      setMessage(`✗ Error: ${error.message}`);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim() || !coupleName.trim() || !place.trim() || !serviceType.trim() || !coverPhotoUrl || !coverPhotoId) {
      setMessage("✗ Please fill in all fields and upload a cover photo");
      return;
    }

    setLoading(true);
    setMessage("");

    try {
      const res = await fetch("/api/weddings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          coupleName,
          place,
          serviceType,
          coverPhoto: {
            url: coverPhotoUrl,
            publicId: coverPhotoId,
          },
          gallery: galleryUrls,
        }),
      });

      if (!res.ok) {
        throw new Error("Failed to create wedding");
      }

      setMessage("✓ Wedding story created successfully!");
      setTitle("");
      setCoupleName("");
      setPlace("");
      setServiceType("");
      setCoverPhotoUrl("");
      setCoverPhotoId("");
      setGalleryUrls([]);
      await loadWeddings();
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
      handleUploadCover(files[0]);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this wedding story? This action cannot be undone.")) return;

    try {
      const res = await fetch(`/api/weddings/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Delete failed");

      setWeddings(weddings.filter((w) => w._id !== id));
      setMessage("✓ Wedding deleted successfully");
    } catch (error) {
      setMessage("✗ Failed to delete wedding");
      console.error(error);
    }
  };

  const removeGalleryImage = (index: number) => {
    setGalleryUrls(galleryUrls.filter((_, i) => i !== index));
  };

  // Gallery Showcase Handlers
  const handleUploadShowcaseImages = async (files: FileList) => {
    if (files.length === 0) return;

    setMessage(`Uploading ${files.length} image(s) to showcase...`);

    try {
      const fileArray = Array.from(files).filter((file) => {
        if (!file.type.startsWith("image/")) {
          setMessage(`✗ ${file.name} is not an image`);
          return false;
        }
        return true;
      });

      if (fileArray.length === 0) return;

      const uploadedFiles = await uploadMultipleFiles(fileArray, {
        folder: "shivay-studio/wedding-gallery",
        onProgress: (p) => {
          setMessage(
            `Uploading ${p.loaded} of ${p.total} files... ${p.percentage}%`
          );
        },
        onError: (error) => {
          setMessage(`✗ Error: ${error}`);
        },
      });

      // Save all uploaded files to database
      const savePromises = uploadedFiles.map(async (uploadData: any) => {
        const dbRes = await fetch("/api/wedding-gallery", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            imageUrl: uploadData.secure_url,
            imagePublicId: uploadData.public_id,
            photoType: showcasePhotoType,
            order: galleryShowcase.length,
          }),
        });

        if (!dbRes.ok) throw new Error("Failed to save to database");
        return await dbRes.json();
      });

      const savedImages = await Promise.all(savePromises);
      setGalleryShowcase([...galleryShowcase, ...savedImages.map(r => r.data)]);
      setMessage(`✓ ${uploadedFiles.length} image(s) uploaded to showcase!`);
      if (showcaseFileInputRef.current) showcaseFileInputRef.current.value = "";
      setTimeout(() => setMessage(""), 3000);
    } catch (error: any) {
      setMessage(`✗ Error: ${error.message}`);
    }
  };

  const handleShowcaseDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    if (showcaseDragRef.current) {
      showcaseDragRef.current.classList.add("border-blue-500", "bg-blue-50");
    }
  };

  const handleShowcaseDragLeave = () => {
    if (showcaseDragRef.current) {
      showcaseDragRef.current.classList.remove("border-blue-500", "bg-blue-50");
    }
  };

  const handleShowcaseDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (showcaseDragRef.current) {
      showcaseDragRef.current.classList.remove("border-blue-500", "bg-blue-50");
    }

    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleUploadShowcaseImages(files);
    }
  };

  const handleDeleteShowcaseImage = async (image: WeddingGalleryImage) => {
    if (!confirm("Are you sure you want to delete this image?")) return;

    try {
      const response = await fetch("/api/wedding-gallery", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: image._id,
          imagePublicId: image.imagePublicId,
        }),
      });

      if (response.ok) {
        setGalleryShowcase(galleryShowcase.filter((img) => img._id !== image._id));
        setMessage("✓ Image deleted successfully");
        setTimeout(() => setMessage(""), 3000);
      }
    } catch (error) {
      setMessage("Failed to delete image");
    }
  };

  const handleReorderShowcase = async (fromIndex: number, toIndex: number) => {
    const newImages = [...galleryShowcase];
    const [movedImage] = newImages.splice(fromIndex, 1);
    newImages.splice(toIndex, 0, movedImage);

    // Update order in database
    for (let i = 0; i < newImages.length; i++) {
      try {
        await fetch("/api/wedding-gallery", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            id: newImages[i]._id,
            order: i,
          }),
        });
      } catch (error) {
        console.error("Failed to update order:", error);
      }
    }

    setGalleryShowcase(newImages);
    setMessage("✓ Images reordered successfully");
    setTimeout(() => setMessage(""), 3000);
  };

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm uppercase tracking-[0.2em] text-[var(--muted)]">Wedding Stories</p>
        <h1 className="text-3xl font-[var(--font-heading)] mt-1">Wedding Stories</h1>
        <p className="text-sm text-[var(--muted)]">
          Showcase beautiful wedding moments with cover photos and galleries.
        </p>
      </div>

      {/* Create Form */}
      <form onSubmit={handleSubmit} className="card p-6 space-y-6 fade-in">
        <h2 className="text-lg font-semibold">Create New Wedding Story</h2>

        <div className="grid gap-4 sm:grid-cols-3">
          <div className="space-y-2">
            <label className="text-sm font-medium">Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              className="input"
              placeholder="Summer Wedding 2024"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Couple Name</label>
            <input
              type="text"
              value={coupleName}
              onChange={(e) => setCoupleName(e.target.value)}
              required
              className="input"
              placeholder="John & Jane"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Place</label>
            <input
              type="text"
              value={place}
              onChange={(e) => setPlace(e.target.value)}
              required
              className="input"
              placeholder="Mumbai, India"
            />
          </div>
        </div>

        {/* Service Type */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Service Type</label>
          <select
            value={serviceType}
            onChange={(e) => setServiceType(e.target.value)}
            required
            className="input"
          >
            <option value="">Select service type</option>
            {Array.from(new Set([
              ...SERVICE_TYPES,
              ...services.map(s => s.serviceType)
            ])).map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
          <p className="text-xs text-gray-500">Select the service type for this wedding</p>
        </div>

        {/* Cover Photo */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Cover Photo</label>
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
              onChange={(e) => e.target.files && handleUploadCover(e.target.files[0])}
              className="hidden"
              disabled={uploading}
            />
            {coverPhotoUrl ? (
              <div className="space-y-2">
                <img
                  src={coverPhotoUrl}
                  alt="Cover"
                  className="w-48 h-32 object-cover rounded-lg mx-auto"
                />
                <p className="text-xs text-green-600">✓ Cover photo selected</p>
                <p className="text-xs text-[var(--muted)]">Click to change</p>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="text-4xl">📷</div>
                <p className="text-sm font-medium">Drag & drop cover photo here</p>
                <p className="text-xs text-[var(--muted)]">or click to browse</p>
              </div>
            )}
          </div>
        </div>

        {/* Gallery Upload */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Gallery Images (Optional)</label>
          <button
            type="button"
            onClick={() => galleryInputRef.current?.click()}
            disabled={uploading}
            className="w-full px-4 py-3 border-2 border-dashed border-[var(--border)] rounded-xl hover:border-[var(--accent)] transition-colors text-sm text-[var(--muted)] hover:text-[var(--foreground)]"
          >
            + Add Gallery Images
          </button>
          <input
            ref={galleryInputRef}
            type="file"
            accept="image/*"
            multiple
            onChange={(e) => e.target.files && handleUploadGallery(e.target.files)}
            className="hidden"
            disabled={uploading}
          />
          {galleryUrls.length > 0 && (
            <div className="grid grid-cols-3 sm:grid-cols-5 gap-2 mt-3">
              {galleryUrls.map((url, index) => (
                <div key={index} className="relative group">
                  <img
                    src={url}
                    alt={`Gallery ${index + 1}`}
                    className="w-full h-20 object-cover rounded-lg"
                  />
                  <button
                    type="button"
                    onClick={() => removeGalleryImage(index)}
                    className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-5 h-5 text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          )}
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

        {uploading && (
          <div className="space-y-3">
            <div className="flex items-center gap-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="animate-spin h-5 w-5 border-2 border-blue-600 border-t-transparent rounded-full" />
              <p className="text-sm text-blue-700">
                Uploading {progress?.loaded || 0} of {progress?.total || 0} file(s)...
              </p>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
              <div
                className="bg-blue-600 h-full transition-all duration-300 ease-out flex items-center justify-center text-[10px] text-white font-semibold"
                style={{ width: `${progress?.percentage || 0}%` }}
              >
                {(progress?.percentage || 0) > 10 && `${progress?.percentage}%`}
              </div>
            </div>
          </div>
        )}

        <button
          type="submit"
          disabled={loading || uploading}
          className="w-full px-4 py-3 bg-[var(--primary)] text-white rounded-xl font-medium hover:bg-[#5a1922] disabled:opacity-60 transition-colors"
        >
          {loading ? "Creating..." : "Create Wedding Story"}
        </button>
      </form>

      {/* Gallery Showcase Section */}
      <div className="card p-6 space-y-6 fade-in">
        <h2 className="text-lg font-semibold">Wedding Gallery Showcase</h2>
        <p className="text-sm text-[var(--muted)]">
          Upload photos to display in the wedding gallery section on your website (for the gallery showcase slider)
        </p>

        <div className="space-y-2">
          <label className="text-sm font-medium">Photo Type</label>
          <select
            value={showcasePhotoType}
            onChange={(e) => setShowcasePhotoType(e.target.value as "wedding" | "prewedding")}
            disabled={uploading}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="wedding">Wedding Photos</option>
            <option value="prewedding">Prewedding Photos</option>
          </select>
        </div>

        <div
          ref={showcaseDragRef}
          onDragOver={handleShowcaseDragOver}
          onDragLeave={handleShowcaseDragLeave}
          onDrop={handleShowcaseDrop}
          className="border-2 border-dashed border-gray-300 rounded-xl p-12 text-center cursor-pointer transition-all hover:border-blue-500 hover:bg-blue-50"
          onClick={() => showcaseFileInputRef.current?.click()}
        >
          <input
            ref={showcaseFileInputRef}
            type="file"
            accept="image/*"
            multiple
            onChange={(e) => e.target.files && handleUploadShowcaseImages(e.target.files)}
            className="hidden"
            disabled={uploading}
          />
          <div className="space-y-3">
            <div className="text-5xl">📸</div>
            <p className="text-lg font-medium text-gray-900">
              Drag & drop photos here
            </p>
            <p className="text-sm text-gray-600">
              or click to browse • Multiple images supported
            </p>
          </div>
        </div>

        {uploading && (
          <div className="space-y-3">
            <div className="flex items-center gap-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="animate-spin h-5 w-5 border-2 border-blue-600 border-t-transparent rounded-full" />
              <p className="text-sm text-blue-700">
                Uploading {progress.loaded} of {progress.total} files...
              </p>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
              <div
                className="bg-blue-600 h-full transition-all duration-300 ease-out flex items-center justify-center text-[10px] text-white font-semibold"
                style={{ width: `${progress.percentage}%` }}
              >
                {progress.percentage > 10 && `${progress.percentage}%`}
              </div>
            </div>
          </div>
        )}

        {/* Gallery Showcase Stats */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
            <p className="text-sm text-gray-600">Wedding Photos</p>
            <p className="text-2xl font-bold text-blue-600">
              {galleryShowcase.filter((img) => img.photoType === "wedding").length}
            </p>
          </div>
          <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
            <p className="text-sm text-gray-600">Prewedding Photos</p>
            <p className="text-2xl font-bold text-purple-600">
              {galleryShowcase.filter((img) => img.photoType === "prewedding").length}
            </p>
          </div>
        </div>

        {/* Showcase Images Grid */}
        <div className="bg-gray-50 rounded-lg border border-gray-200 overflow-hidden">
          <div className="p-4 border-b border-gray-200">
            <h3 className="font-semibold text-gray-900">Showcase Gallery ({galleryShowcase.length} photos)</h3>
          </div>
          
          {galleryShowcase.length === 0 ? (
            <div className="p-12 text-center text-gray-500">
              <p className="text-lg">No showcase photos yet</p>
              <p className="text-sm mt-1">Upload photos using the drag & drop area above</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 p-4">
              {galleryShowcase.map((image, index) => (
                <div key={image._id} className="group relative aspect-square rounded-lg overflow-hidden bg-gray-100 hover:shadow-lg transition-shadow">
                  <img
                    src={image.imageUrl}
                    alt={`Gallery ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="absolute bottom-0 left-0 right-0 p-3 space-y-2 flex items-end justify-between">
                      <span className={`text-xs font-bold text-white px-2 py-1 rounded ${
                        image.photoType === "wedding" ? "bg-blue-600" : "bg-purple-600"
                      }`}>
                        {image.photoType === "wedding" ? "WEDDING" : "PREWEDDING"}
                      </span>
                      <div className="flex gap-1">
                        {index > 0 && (
                          <button
                            onClick={() => handleReorderShowcase(index, index - 1)}
                            className="bg-green-600 hover:bg-green-700 text-white p-1.5 rounded text-xs transition"
                            title="Move up"
                          >
                            ↑
                          </button>
                        )}
                        {index < galleryShowcase.length - 1 && (
                          <button
                            onClick={() => handleReorderShowcase(index, index + 1)}
                            className="bg-green-600 hover:bg-green-700 text-white p-1.5 rounded text-xs transition"
                            title="Move down"
                          >
                            ↓
                          </button>
                        )}
                        <button
                          onClick={() => handleDeleteShowcaseImage(image)}
                          className="bg-red-600 hover:bg-red-700 text-white p-1.5 rounded text-xs transition"
                          title="Delete"
                        >
                          ✕
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-sm text-blue-800">
            <strong>💡 Tip:</strong> Upload at least 14 images for optimal display. Use the reorder buttons (↑/↓) to arrange your gallery.
          </p>
        </div>
      </div>

      {/* Wedding List */}
      <div className="card p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">All Wedding Stories</h2>
          <span className="text-sm text-[var(--muted)]">{weddings.length} weddings</span>
        </div>

        {loading ? (
          <p className="text-sm text-[var(--muted)]">Loading weddings...</p>
        ) : weddings.length === 0 ? (
          <p className="text-sm text-[var(--muted)]">No wedding stories yet. Create your first one!</p>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {weddings.map((wedding) => (
              <div key={wedding._id} className="border border-[var(--border)] rounded-xl overflow-hidden hover:shadow-lg transition-shadow">
                <div className="relative aspect-video bg-[var(--border)]">
                  <img
                    src={wedding.coverPhoto.url}
                    alt={wedding.title}
                    className="w-full h-full object-cover"
                  />
                  {wedding.gallery.length > 0 && (
                    <span className="absolute top-2 left-2 bg-black/60 text-white text-xs px-2 py-1 rounded">
                      📸 {wedding.gallery.length} photos
                    </span>
                  )}
                </div>
                <div className="p-4 space-y-2">
                  <h3 className="font-semibold text-[var(--foreground)]">{wedding.title}</h3>
                  <p className="text-sm text-[var(--muted)]">
                    💑 {wedding.coupleName}
                  </p>
                  <p className="text-sm text-[var(--muted)]">
                    📍 {wedding.place}
                  </p>
                  <p className="text-xs text-[var(--muted)]">
                    {new Date(wedding.createdAt).toLocaleDateString()}
                  </p>
                  <button
                    onClick={() => handleDelete(wedding._id)}
                    className="w-full mt-3 text-xs text-red-600 hover:bg-red-50 py-2 rounded-lg transition-colors"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
