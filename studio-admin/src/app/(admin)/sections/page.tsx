"use client";

import { useEffect, useState } from "react";

interface Section {
  _id?: string;
  key: "hero" | "editor_pick" | "latest";
  contentIds: string[];
  enabled: boolean;
  order: number;
}

interface Story {
  _id: string;
  title: string;
}

export default function SectionsPage() {
  const [sections, setSections] = useState<Section[]>([]);
  const [stories, setStories] = useState<Story[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [sectionsRes, storiesRes] = await Promise.all([
        fetch("/api/sections"),
        fetch("/api/stories"),
      ]);
      const sectionsData = await sectionsRes.json();
      const storiesData = await storiesRes.json();
      setSections(Array.isArray(sectionsData) ? sectionsData : []);
      setStories(Array.isArray(storiesData) ? storiesData : []);
    } catch (error) {
      console.error("Failed to load data:", error);
    } finally {
      setLoading(false);
    }
  };

  const updateSection = async (section: Section) => {
    setSaving(true);
    setMessage("");
    try {
      const res = await fetch("/api/sections", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(section),
      });
      if (!res.ok) throw new Error("Save failed");
      setMessage("✓ Section updated");
      loadData();
    } catch (error: any) {
      setMessage(`✗ ${error.message}`);
    } finally {
      setSaving(false);
    }
  };

  const toggleStoryInSection = (section: Section, storyId: string) => {
    const newIds = section.contentIds.includes(storyId)
      ? section.contentIds.filter((id) => id !== storyId)
      : [...section.contentIds, storyId];
    updateSection({ ...section, contentIds: newIds });
  };

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm uppercase tracking-[0.2em] text-[var(--muted)]">Sections</p>
        <h1 className="text-3xl font-[var(--font-heading)] mt-1">Section control</h1>
        <p className="text-sm text-[var(--muted)]">Configure what appears in each portfolio section.</p>
      </div>

      {message && (
        <p
          className={`text-sm p-3 rounded ${
            message.startsWith("✓") ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"
          }`}
        >
          {message}
        </p>
      )}

      {loading ? (
        <p className="text-sm text-[var(--muted)]">Loading...</p>
      ) : (
        <div className="space-y-4">
          {["hero", "editor_pick", "latest"].map((sectionKey) => {
            const section = sections.find((s) => s.key === sectionKey) || {
              key: sectionKey as "hero" | "editor_pick" | "latest",
              contentIds: [],
              enabled: true,
              order: 0,
            };

            return (
              <div key={sectionKey} className="card p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-lg font-semibold capitalize">{sectionKey.replace("_", " ")} Section</h2>
                    <p className="text-sm text-[var(--muted)]">{section.contentIds.length} stories selected</p>
                  </div>
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={section.enabled}
                      onChange={(e) => updateSection({ ...section, enabled: e.target.checked })}
                      className="w-4 h-4"
                    />
                    <span className="text-sm">Enabled</span>
                  </label>
                </div>

                <div className="space-y-2">
                  <p className="text-sm font-medium">Select stories to show:</p>
                  {stories.length === 0 ? (
                    <p className="text-sm text-[var(--muted)]">No stories available.</p>
                  ) : (
                    <div className="space-y-2 max-h-96 overflow-y-auto">
                      {stories.map((story) => (
                        <label key={story._id} className="flex items-center gap-2 p-2 rounded hover:bg-[var(--border)]">
                          <input
                            type="checkbox"
                            checked={section.contentIds.includes(story._id)}
                            onChange={() => toggleStoryInSection(section, story._id)}
                            className="w-4 h-4"
                          />
                          <span className="text-sm">{story.title}</span>
                        </label>
                      ))}
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Order</label>
                  <input
                    type="number"
                    value={section.order}
                    onChange={(e) => updateSection({ ...section, order: parseInt(e.target.value) })}
                    className="input w-20"
                  />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
