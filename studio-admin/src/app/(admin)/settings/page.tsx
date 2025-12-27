"use client";

import { useEffect, useState } from "react";

interface Settings {
  _id?: string;
  heroStoryId?: string;
  studioExperience: number;
  weddingsCovered: number;
  citiesServed: number;
}

interface Story {
  _id: string;
  title: string;
}

export default function SettingsPage() {
  const [settings, setSettings] = useState<Settings>({
    studioExperience: 0,
    weddingsCovered: 0,
    citiesServed: 0,
  });
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
      const [settingsRes, storiesRes] = await Promise.all([
        fetch("/api/settings"),
        fetch("/api/stories"),
      ]);
      const settingsData = await settingsRes.json();
      const storiesData = await storiesRes.json();
      setSettings(settingsData || { studioExperience: 0, weddingsCovered: 0, citiesServed: 0 });
      setStories(Array.isArray(storiesData) ? storiesData : []);
    } catch (error) {
      console.error("Failed to load:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setMessage("");
    try {
      const res = await fetch("/api/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      });
      if (!res.ok) throw new Error("Save failed");
      setMessage("✓ Settings saved");
      loadData();
    } catch (error: any) {
      setMessage(`✗ ${error.message}`);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm uppercase tracking-[0.2em] text-[var(--muted)]">Settings</p>
        <h1 className="text-3xl font-[var(--font-heading)] mt-1">Studio settings</h1>
        <p className="text-sm text-[var(--muted)]">Manage studio stats and hero spotlight.</p>
      </div>

      {loading ? (
        <p className="text-sm text-[var(--muted)]">Loading...</p>
      ) : (
        <div className="card p-6 space-y-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Hero story (featured on homepage)</label>
              <select
                className="input"
                value={settings.heroStoryId || ""}
                onChange={(e) => setSettings({ ...settings, heroStoryId: e.target.value })}
              >
                <option value="">None</option>
                {stories.map((story) => (
                  <option key={story._id} value={story._id}>
                    {story.title}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              <div className="space-y-2">
                <label className="text-sm font-medium">Years of experience</label>
                <input
                  type="number"
                  className="input"
                  value={settings.studioExperience}
                  onChange={(e) =>
                    setSettings({ ...settings, studioExperience: parseInt(e.target.value) || 0 })
                  }
                  min="0"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Weddings covered</label>
                <input
                  type="number"
                  className="input"
                  value={settings.weddingsCovered}
                  onChange={(e) =>
                    setSettings({ ...settings, weddingsCovered: parseInt(e.target.value) || 0 })
                  }
                  min="0"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Cities served</label>
                <input
                  type="number"
                  className="input"
                  value={settings.citiesServed}
                  onChange={(e) =>
                    setSettings({ ...settings, citiesServed: parseInt(e.target.value) || 0 })
                  }
                  min="0"
                />
              </div>
            </div>
          </div>

          {message && (
            <p
              className={`text-sm p-2 rounded ${
                message.startsWith("✓") ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"
              }`}
            >
              {message}
            </p>
          )}

          <button
            onClick={handleSave}
            disabled={saving}
            className="px-4 py-2 bg-[var(--primary)] text-white rounded-lg font-medium hover:bg-[#5a1922] disabled:opacity-60"
          >
            {saving ? "Saving..." : "Save settings"}
          </button>
        </div>
      )}
    </div>
  );
}
