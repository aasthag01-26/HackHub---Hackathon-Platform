import { useState, useEffect, useCallback, useMemo } from "react";
import Layout from "../components/Layout";
import { useAppContext } from "../context/AppContext";
import { useRouter } from "next/router";
import {
  ExternalLink,
  Plus,
  Search,
  BookOpen,
  Trash2,
  Edit2,
  Copy,
  Check,
  Tag,
  Link as LinkIcon,
  Filter,
  Upload,
  FileText,
  Paperclip,
} from "lucide-react";

interface ResourceItem {
  _id: string;
  title: string;
  url: string;
  category:
    | "Documentation"
    | "Dataset"
    | "Tutorial"
    | "API Reference"
    | "Design"
    | "Other";
  description?: string;
  addedByName?: string;
  createdAt?: string;
}

const CATEGORIES = [
  "All",
  "Documentation",
  "Dataset",
  "Tutorial",
  "API Reference",
  "Design",
  "Other",
] as const;

export default function Resources() {
  const router = useRouter();
  const { isAuthenticated, isInitialized, currentUser } = useAppContext();

  const [resources, setResources] = useState<ResourceItem[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Modals
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  // Form State
  const [formTitle, setFormTitle] = useState("");
  const [formUrl, setFormUrl] = useState("");
  const [formCategory, setFormCategory] = useState<ResourceItem["category"]>("Documentation");
  const [formDescription, setFormDescription] = useState("");
  const [activeResourceId, setActiveResourceId] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [resourceType, setResourceType] = useState<"url" | "file">("url");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploadingFile, setIsUploadingFile] = useState(false);

  const API_URL =
    process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

  // Redirect if unauthenticated
  useEffect(() => {
    if (isInitialized && !isAuthenticated && typeof window !== "undefined") {
      router.replace("/auth");
    }
  }, [isAuthenticated, isInitialized, router]);

  // Fetch resources from backend
  const fetchResources = useCallback(async () => {
    const token =
      typeof window !== "undefined" ? localStorage.getItem("token") : null;
    if (!token) return;

    try {
      setIsLoading(true);
      const res = await fetch(`${API_URL}/resources`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.ok) {
        const data = await res.json();
        setResources(data);
      }
    } catch (err) {
      console.error("Failed to fetch team resources:", err);
    } finally {
      setIsLoading(false);
    }
  }, [API_URL]);

  useEffect(() => {
    if (isAuthenticated) {
      fetchResources();
    }
  }, [isAuthenticated, fetchResources]);

  // Filtered resources
  const filteredResources = useMemo(() => {
    return resources.filter((item) => {
      const matchesCategory =
        selectedCategory === "All" || item.category === selectedCategory;
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        item.title.toLowerCase().includes(q) ||
        (item.description && item.description.toLowerCase().includes(q)) ||
        item.url.toLowerCase().includes(q);

      return matchesCategory && matchesSearch;
    });
  }, [resources, selectedCategory, searchQuery]);

  // Open Add Modal
  const openAddModal = () => {
    setFormTitle("");
    setFormUrl("");
    setFormCategory("Documentation");
    setFormDescription("");
    setResourceType("url");
    setSelectedFile(null);
    setFormError(null);
    setShowAddModal(true);
  };

  // Open Edit Modal
  const openEditModal = (item: ResourceItem) => {
    setActiveResourceId(item._id);
    setFormTitle(item.title);
    setFormUrl(item.url);
    setFormCategory(item.category);
    setFormDescription(item.description || "");
    setFormError(null);
    setShowEditModal(true);
  };

  // Open Delete Modal
  const openDeleteModal = (id: string) => {
    setActiveResourceId(id);
    setShowDeleteModal(true);
  };

  // Add Resource Handler
  const handleAddResource = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim()) {
      setFormError("Please enter a title for the resource.");
      return;
    }

    let targetUrl = formUrl.trim();

    if (resourceType === "file") {
      if (!selectedFile && !targetUrl) {
        setFormError("Please select a document or PDF file to upload.");
        return;
      }

      if (selectedFile) {
        setIsUploadingFile(true);
        setIsSubmitting(true);
        const token =
          typeof window !== "undefined" ? localStorage.getItem("token") : null;

        try {
          const formData = new FormData();
          formData.append("file", selectedFile);

          const uploadRes = await fetch(`${API_URL}/files/upload`, {
            method: "POST",
            headers: token ? { Authorization: `Bearer ${token}` } : {},
            body: formData,
          });

          if (uploadRes.ok) {
            const uploadData = await uploadRes.json();
            const filename = uploadData.file?.filename || selectedFile.name;
            targetUrl = `${API_URL}/files/file/${filename}`;
          } else {
            targetUrl = `${API_URL}/files/file/${encodeURIComponent(selectedFile.name)}`;
          }
        } catch (uploadErr) {
          console.warn("Upload error, using resource link fallback:", uploadErr);
          targetUrl = `${API_URL}/files/file/${encodeURIComponent(selectedFile.name)}`;
        } finally {
          setIsUploadingFile(false);
        }
      }
    } else {
      if (!targetUrl) {
        setFormError("Please enter a valid URL.");
        return;
      }
      if (!targetUrl.startsWith("http://") && !targetUrl.startsWith("https://")) {
        targetUrl = `https://${targetUrl}`;
      }
    }

    setIsSubmitting(true);
    setFormError(null);

    const token =
      typeof window !== "undefined" ? localStorage.getItem("token") : null;

    try {
      const res = await fetch(`${API_URL}/resources`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          title: formTitle.trim(),
          url: targetUrl,
          category: formCategory,
          description: formDescription.trim(),
        }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || "Failed to add resource");
      }

      const created = await res.json();
      setResources((prev) => [created, ...prev]);
      setShowAddModal(false);
    } catch (err: any) {
      setFormError(err.message || "Failed to create resource");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Edit Resource Handler
  const handleEditResource = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeResourceId || !formTitle.trim() || !formUrl.trim()) return;

    let targetUrl = formUrl.trim();
    if (!targetUrl.startsWith("http://") && !targetUrl.startsWith("https://")) {
      targetUrl = `https://${targetUrl}`;
    }

    setIsSubmitting(true);
    setFormError(null);

    const token =
      typeof window !== "undefined" ? localStorage.getItem("token") : null;

    try {
      const res = await fetch(`${API_URL}/resources/${activeResourceId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          title: formTitle.trim(),
          url: targetUrl,
          category: formCategory,
          description: formDescription.trim(),
        }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || "Failed to update resource");
      }

      const updated = await res.json();
      setResources((prev) =>
        prev.map((r) => (r._id === activeResourceId ? updated : r))
      );
      setShowEditModal(false);
    } catch (err: any) {
      setFormError(err.message || "Failed to update resource");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Delete Resource Handler
  const handleDeleteResource = async () => {
    if (!activeResourceId) return;

    setIsSubmitting(true);
    const token =
      typeof window !== "undefined" ? localStorage.getItem("token") : null;

    try {
      const res = await fetch(`${API_URL}/resources/${activeResourceId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || "Failed to delete resource");
      }

      setResources((prev) => prev.filter((r) => r._id !== activeResourceId));
      setShowDeleteModal(false);
    } catch (err: any) {
      alert(err.message || "Error deleting resource");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Copy Link Handler
  const handleCopyLink = (id: string, url: string) => {
    navigator.clipboard.writeText(url);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Category Badge Colors
  const getCategoryBadgeClass = (category: ResourceItem["category"]) => {
    switch (category) {
      case "Documentation":
        return "bg-cyan-500/10 text-cyan-300 border-cyan-500/30";
      case "Dataset":
        return "bg-emerald-500/10 text-emerald-300 border-emerald-500/30";
      case "Tutorial":
        return "bg-purple-500/10 text-purple-300 border-purple-500/30";
      case "API Reference":
        return "bg-amber-500/10 text-amber-300 border-amber-500/30";
      case "Design":
        return "bg-pink-500/10 text-pink-300 border-pink-500/30";
      default:
        return "bg-slate-500/10 text-slate-300 border-slate-500/30";
    }
  };

  return (
    <Layout>
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h2 className="text-display-md font-display text-gradient-primary text-glow flex items-center gap-3">
            <BookOpen className="w-8 h-8 text-cyan-400" />
            Team Resource Hub
          </h2>
          <p className="text-body-sm font-body text-zinc-400 mt-1">
            Centralized learning materials, documentation, datasets, and API references for your team.
          </p>
        </div>
        <button
          onClick={openAddModal}
          className="btn-primary flex items-center gap-2 whitespace-nowrap"
        >
          <Plus className="w-4 h-4" />
          Add Resource
        </button>
      </div>

      {/* Search and Category Filters */}
      <div className="card mb-8 p-4">
        <div className="flex flex-col md:flex-row gap-4 items-stretch md:items-center justify-between">
          {/* Search bar */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search resources by title, description, or domain..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="input-enhanced pl-9 w-full text-sm"
            />
          </div>

          {/* Quick Stats Pill */}
          <div className="text-body-xs font-body text-zinc-400 flex items-center gap-2 px-3 py-1.5 bg-slate-800/40 rounded-lg border border-zinc-700/50">
            <Filter className="w-3.5 h-3.5 text-cyan-400" />
            <span>Showing {filteredResources.length} of {resources.length} resources</span>
          </div>
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-2 mt-4 overflow-x-auto pb-1 scrollbar-thin">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1 rounded-full text-xs font-medium transition-all duration-200 whitespace-nowrap ${
                selectedCategory === cat
                  ? "bg-gradient-to-r from-cyan-600 to-purple-600 text-white shadow-md shadow-cyan-500/20"
                  : "bg-slate-800/60 text-zinc-300 hover:bg-slate-700/60 hover:text-white border border-zinc-700/40"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Resource Cards Grid */}
      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-8 h-8 border-3 border-cyan-400 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : filteredResources.length === 0 ? (
        <div className="card p-12 text-center flex flex-col items-center justify-center">
          <div className="w-16 h-16 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center mb-4 text-cyan-400">
            <BookOpen className="w-8 h-8" />
          </div>
          <h3 className="text-heading-lg font-heading text-zinc-200 mb-2">
            No resources found
          </h3>
          <p className="text-body-sm font-body text-zinc-400 max-w-md mb-6">
            {searchQuery
              ? `No resources match your search "${searchQuery}". Try a different keyword.`
              : selectedCategory !== "All"
              ? `No resources found under the "${selectedCategory}" category.`
              : "No shared learning materials have been added to your team hub yet."}
          </p>
          <button onClick={openAddModal} className="btn-primary text-sm flex items-center gap-2">
            <Plus className="w-4 h-4" />
            Add First Resource
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredResources.map((item) => (
            <div
              key={item._id}
              className="card flex flex-col justify-between hover:border-cyan-500/40 transition-all duration-300 group"
            >
              <div>
                {/* Card Top: Category Badge & Actions */}
                <div className="flex items-center justify-between gap-2 mb-3">
                  <span
                    className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${getCategoryBadgeClass(
                      item.category
                    )}`}
                  >
                    <Tag className="w-3 h-3" />
                    {item.category}
                  </span>

                  <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => handleCopyLink(item._id, item.url)}
                      className="p-1.5 rounded-lg hover:bg-slate-700/60 text-zinc-400 hover:text-white transition-colors"
                      title="Copy Link"
                      aria-label="Copy link"
                    >
                      {copiedId === item._id ? (
                        <Check className="w-4 h-4 text-emerald-400" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                    </button>
                    <button
                      onClick={() => openEditModal(item)}
                      className="p-1.5 rounded-lg hover:bg-slate-700/60 text-zinc-400 hover:text-cyan-300 transition-colors"
                      title="Edit Resource"
                      aria-label="Edit resource"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => openDeleteModal(item._id)}
                      className="p-1.5 rounded-lg hover:bg-red-950/40 text-zinc-400 hover:text-rose-400 transition-colors"
                      title="Delete Resource"
                      aria-label="Delete resource"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Title */}
                <h3 className="text-heading-md font-heading text-white line-clamp-1 group-hover:text-cyan-300 transition-colors">
                  {item.title}
                </h3>

                {/* Description */}
                <p className="text-body-xs font-body text-zinc-400 mt-2 line-clamp-3 min-h-[40px]">
                  {item.description || "No description provided."}
                </p>
              </div>

              {/* Card Bottom: Metadata & Open Link Button */}
              <div className="mt-6 pt-4 border-t border-zinc-700/50 flex items-center justify-between gap-3">
                <span className="text-caption text-zinc-500 truncate">
                  Added by {item.addedByName || "Teammate"}
                </span>

                <a
                  href={item.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gradient-to-r from-cyan-600/20 to-purple-600/20 border border-cyan-500/30 text-cyan-300 hover:text-white hover:border-cyan-400 text-xs font-medium transition-all duration-200"
                >
                  Visit Link
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Resource Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 modal-backdrop">
          <div className="card w-full max-w-lg">
            <h2 className="text-heading-xl font-heading mb-4 flex items-center gap-2">
              <Plus className="w-6 h-6 text-cyan-400" />
              Add Learning Resource
            </h2>

            {formError && (
              <div className="mb-4 p-3 bg-red-900/30 border border-red-500/50 rounded-lg text-red-300 text-body-sm">
                {formError}
              </div>
            )}

            {/* Segmented Selector: URL vs File Upload */}
            <div className="flex rounded-lg bg-gray-800/80 p-1 border border-gray-700 mb-4">
              <button
                type="button"
                onClick={() => setResourceType("url")}
                className={`flex-1 py-1.5 px-3 rounded-md text-sm font-medium transition-all flex items-center justify-center gap-2 ${
                  resourceType === "url"
                    ? "bg-cyan-500 text-white shadow-sm"
                    : "text-gray-400 hover:text-white"
                }`}
              >
                <LinkIcon className="w-4 h-4" />
                Web Link / URL
              </button>
              <button
                type="button"
                onClick={() => setResourceType("file")}
                className={`flex-1 py-1.5 px-3 rounded-md text-sm font-medium transition-all flex items-center justify-center gap-2 ${
                  resourceType === "file"
                    ? "bg-cyan-500 text-white shadow-sm"
                    : "text-gray-400 hover:text-white"
                }`}
              >
                <Upload className="w-4 h-4" />
                Upload Document / PDF
              </button>
            </div>

            <form onSubmit={handleAddResource} className="space-y-4">
              <div>
                <label className="label-enhanced">Title</label>
                <input
                  type="text"
                  placeholder="e.g. Next.js App Router Documentation"
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  className="input-enhanced w-full"
                  required
                />
              </div>

              {resourceType === "url" ? (
                <div>
                  <label className="label-enhanced">Resource URL</label>
                  <input
                    type="text"
                    placeholder="https://nextjs.org/docs"
                    value={formUrl}
                    onChange={(e) => setFormUrl(e.target.value)}
                    className="input-enhanced w-full"
                    required={resourceType === "url"}
                  />
                </div>
              ) : (
                <div>
                  <label className="label-enhanced">Select Document or PDF</label>
                  <div className="border-2 border-dashed border-gray-700 hover:border-cyan-500/50 rounded-xl p-4 text-center bg-gray-900/40 transition-colors">
                    <input
                      type="file"
                      id="resource-file-upload"
                      className="hidden"
                      accept=".pdf,.doc,.docx,.ppt,.pptx,.txt,.csv,.json,.zip"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          setSelectedFile(file);
                          if (!formTitle) {
                            setFormTitle(file.name.replace(/\.[^/.]+$/, ""));
                          }
                        }
                      }}
                    />
                    <label
                      htmlFor="resource-file-upload"
                      className="cursor-pointer flex flex-col items-center justify-center gap-2"
                    >
                      {selectedFile ? (
                        <div className="flex items-center gap-3 text-cyan-400">
                          <FileText className="w-6 h-6" />
                          <div className="text-left">
                            <p className="text-body-sm font-semibold text-white">
                              {selectedFile.name}
                            </p>
                            <p className="text-caption text-gray-400">
                              {(selectedFile.size / 1024).toFixed(1)} KB • Click to replace
                            </p>
                          </div>
                        </div>
                      ) : (
                        <>
                          <Paperclip className="w-8 h-8 text-gray-400" />
                          <span className="text-body-sm text-gray-300 font-medium">
                            Choose a PDF, DOCX, presentation, or dataset
                          </span>
                          <span className="text-caption text-gray-500">
                            Supports PDF, DOC, DOCX, PPT, PPTX, TXT, CSV, JSON, ZIP
                          </span>
                        </>
                      )}
                    </label>
                  </div>
                </div>
              )}

              <div>
                <label className="label-enhanced">Category</label>
                <select
                  value={formCategory}
                  onChange={(e) =>
                    setFormCategory(e.target.value as ResourceItem["category"])
                  }
                  className="input-enhanced w-full"
                >
                  <option value="Documentation">Documentation</option>
                  <option value="Dataset">Dataset</option>
                  <option value="Tutorial">Tutorial</option>
                  <option value="API Reference">API Reference</option>
                  <option value="Design">Design</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div>
                <label className="label-enhanced">Description (Optional)</label>
                <textarea
                  placeholder="Summary or key notes about this resource..."
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  className="input-enhanced w-full"
                  rows={3}
                />
              </div>

              <div className="flex gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  disabled={isSubmitting}
                  className="w-full btn-secondary"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={
                    isSubmitting ||
                    !formTitle.trim() ||
                    (resourceType === "url" && !formUrl.trim()) ||
                    (resourceType === "file" && !selectedFile && !formUrl.trim())
                  }
                  className="w-full btn-primary flex items-center justify-center gap-2"
                >
                  {isSubmitting
                    ? isUploadingFile
                      ? "Uploading File..."
                      : "Adding..."
                    : "Add Resource"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Resource Modal */}
      {showEditModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 modal-backdrop">
          <div className="card w-full max-w-lg">
            <h2 className="text-heading-xl font-heading mb-4 flex items-center gap-2">
              <Edit2 className="w-5 h-5 text-cyan-400" />
              Edit Resource
            </h2>

            {formError && (
              <div className="mb-4 p-3 bg-red-900/30 border border-red-500/50 rounded-lg text-red-300 text-body-sm">
                {formError}
              </div>
            )}

            <form onSubmit={handleEditResource} className="space-y-4">
              <div>
                <label className="label-enhanced">Title</label>
                <input
                  type="text"
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  className="input-enhanced w-full"
                  required
                />
              </div>

              <div>
                <label className="label-enhanced">Resource URL</label>
                <input
                  type="text"
                  value={formUrl}
                  onChange={(e) => setFormUrl(e.target.value)}
                  className="input-enhanced w-full"
                  required
                />
              </div>

              <div>
                <label className="label-enhanced">Category</label>
                <select
                  value={formCategory}
                  onChange={(e) =>
                    setFormCategory(e.target.value as ResourceItem["category"])
                  }
                  className="input-enhanced w-full"
                >
                  <option value="Documentation">Documentation</option>
                  <option value="Dataset">Dataset</option>
                  <option value="Tutorial">Tutorial</option>
                  <option value="API Reference">API Reference</option>
                  <option value="Design">Design</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div>
                <label className="label-enhanced">Description</label>
                <textarea
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  className="input-enhanced w-full"
                  rows={3}
                />
              </div>

              <div className="flex gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  disabled={isSubmitting}
                  className="w-full btn-secondary"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || !formTitle.trim() || !formUrl.trim()}
                  className="w-full btn-primary flex items-center justify-center gap-2"
                >
                  {isSubmitting ? "Updating..." : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 modal-backdrop">
          <div className="card w-full max-w-md">
            <h2 className="text-heading-xl font-heading mb-3 flex items-center gap-2 text-rose-400">
              <Trash2 className="w-5 h-5" />
              Remove Resource?
            </h2>
            <p className="text-body-sm font-body text-zinc-300 mb-6">
              Are you sure you want to remove this learning resource from your team hub? This action cannot be undone.
            </p>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setShowDeleteModal(false)}
                disabled={isSubmitting}
                className="w-full btn-secondary"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteResource}
                disabled={isSubmitting}
                className="w-full rounded-xl bg-red-600 px-4 py-3 font-semibold text-white transition-colors hover:bg-red-500"
              >
                {isSubmitting ? "Deleting..." : "Confirm Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
}
