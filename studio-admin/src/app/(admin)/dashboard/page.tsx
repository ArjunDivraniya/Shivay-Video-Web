import dbConnect from "@/lib/mongodb";
import Story from "@/models/Story";
import Media from "@/models/Media";
import Reel from "@/models/Reel";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  await dbConnect();
  const [storiesCount, photosCount, videosCount, featuredCount, latestStories] = await Promise.all([
    Story.countDocuments(),
    Media.countDocuments({ type: "image" }),
    Media.countDocuments({ type: "video" }),
    Story.countDocuments({ isFeatured: true }),
    Story.find().sort({ createdAt: -1 }).limit(3).lean(),
  ]);

  const cards = [
    { title: "Total Stories", value: storiesCount },
    { title: "Total Photos", value: photosCount },
    { title: "Total Videos", value: videosCount },
    { title: "Featured Items", value: featuredCount },
  ];

  return (
    <div className="space-y-8">
      <div>
        <p className="text-sm uppercase tracking-[0.25em] text-[var(--muted)]">Dashboard</p>
        <h1 className="text-3xl font-[var(--font-heading)] mt-1">Studio overview</h1>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {cards.map((card) => (
          <div key={card.title} className="card p-5 fade-in">
            <p className="text-sm text-[var(--muted)]">{card.title}</p>
            <p className="text-3xl font-semibold text-[var(--foreground)] mt-2">{card.value}</p>
          </div>
        ))}
      </div>
      <div className="card p-6 fade-in">
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-sm text-[var(--muted)]">Latest uploads</p>
            <h2 className="text-xl font-[var(--font-heading)]">Recent stories</h2>
          </div>
        </div>
        <div className="divide-y divide-[var(--border)]">
          {latestStories.map((story) => (
            <div key={(story._id as any).toString()} className="py-3 flex items-center justify-between">
              <div>
                <p className="font-medium">{story.title}</p>
                <p className="text-sm text-[var(--muted)]">
                  {story.eventType} • {new Date(story.createdAt).toLocaleDateString()}
                </p>
              </div>
              {story.isFeatured && (
                <span className="rounded-full bg-[var(--primary)]/10 text-[var(--primary)] text-xs px-3 py-1">
                  Featured
                </span>
              )}
            </div>
          ))}
          {latestStories.length === 0 && (
            <p className="text-sm text-[var(--muted)]">No stories yet.</p>
          )}
        </div>
      </div>
    </div>
  );
}
