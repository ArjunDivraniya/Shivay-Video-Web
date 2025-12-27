import dbConnect from "@/lib/mongodb";
import Service from "@/models/Service";
import WeddingStory from "@/models/WeddingStory";
import Gallery from "@/models/Gallery";
import Film from "@/models/Film";
import Review from "@/models/Review";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  await dbConnect();
  
  const [
    servicesCount,
    weddingsCount,
    galleryCount,
    filmsCount,
    reviewsCount,
    activeServicesCount,
    latestWeddings,
    latestReviews
  ] = await Promise.all([
    Service.countDocuments(),
    WeddingStory.countDocuments(),
    Gallery.countDocuments(),
    Film.countDocuments(),
    Review.countDocuments(),
    Service.countDocuments({ isActive: true }),
    WeddingStory.find().sort({ createdAt: -1 }).limit(5).lean(),
    Review.find().sort({ createdAt: -1 }).limit(5).lean(),
  ]);

  const cards = [
    { title: "Total Services", value: servicesCount, icon: "🎯", color: "primary" },
    { title: "Wedding Stories", value: weddingsCount, icon: "💒", color: "accent" },
    { title: "Gallery Photos", value: galleryCount, icon: "📸", color: "blue" },
    { title: "Films & Videos", value: filmsCount, icon: "🎬", color: "purple" },
    { title: "Client Reviews", value: reviewsCount, icon: "⭐", color: "green" },
    { title: "Active Services", value: activeServicesCount, icon: "✓", color: "orange" },
  ];

  const colorClasses: Record<string, string> = {
    primary: "bg-[var(--primary)]/10 text-[var(--primary)] border-[var(--primary)]/20",
    accent: "bg-[var(--accent)]/10 text-[var(--accent)] border-[var(--accent)]/20",
    blue: "bg-blue-50 text-blue-600 border-blue-200",
    purple: "bg-purple-50 text-purple-600 border-purple-200",
    green: "bg-green-50 text-green-600 border-green-200",
    orange: "bg-orange-50 text-orange-600 border-orange-200",
  };

  return (
    <div className="space-y-8">
      <div>
        <p className="text-sm uppercase tracking-[0.25em] text-[var(--muted)]">Dashboard</p>
        <h1 className="text-3xl font-[var(--font-heading)] mt-1">Studio Overview</h1>
        <p className="text-sm text-[var(--muted)] mt-1">Welcome to Shivay Video Studio Admin Panel</p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        {cards.map((card) => (
          <div key={card.title} className={`card p-5 fade-in border ${colorClasses[card.color]}`}>
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-medium opacity-70">{card.title}</p>
                <p className="text-3xl font-bold mt-2">{card.value}</p>
              </div>
              <span className="text-2xl">{card.icon}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Latest Weddings */}
        <div className="card p-6 fade-in">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-sm text-[var(--muted)]">Recent Additions</p>
              <h2 className="text-xl font-[var(--font-heading)]">Latest Wedding Stories</h2>
            </div>
          </div>
          <div className="space-y-3">
            {latestWeddings.length > 0 ? (
              latestWeddings.map((wedding) => (
                <div key={(wedding._id as any).toString()} className="border border-[var(--border)] rounded-lg p-3 hover:shadow-md transition-shadow">
                  <div className="flex items-start gap-3">
                    {wedding.coverPhoto?.url && (
                      <img 
                        src={wedding.coverPhoto.url} 
                        alt={wedding.title}
                        className="w-16 h-16 object-cover rounded-lg"
                      />
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-[var(--foreground)] truncate">{wedding.title}</p>
                      <p className="text-sm text-[var(--muted)]">{wedding.coupleName}</p>
                      <p className="text-xs text-[var(--muted)] mt-1">
                        📍 {wedding.place} • {new Date(wedding.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-sm text-[var(--muted)] text-center py-8">No wedding stories yet.</p>
            )}
          </div>
        </div>

        {/* Latest Reviews */}
        <div className="card p-6 fade-in">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-sm text-[var(--muted)]">Client Feedback</p>
              <h2 className="text-xl font-[var(--font-heading)]">Latest Reviews</h2>
            </div>
          </div>
          <div className="space-y-3">
            {latestReviews.length > 0 ? (
              latestReviews.map((review) => (
                <div key={(review._id as any).toString()} className="border border-[var(--border)] rounded-lg p-3 hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <p className="font-semibold text-[var(--foreground)]">{review.coupleName}</p>
                    <span className="text-xs px-2 py-1 bg-[var(--primary)]/10 text-[var(--primary)] rounded-full flex-shrink-0">
                      {review.serviceType}
                    </span>
                  </div>
                  <p className="text-sm text-[var(--foreground)] line-clamp-2 italic">"{review.review}"</p>
                  <p className="text-xs text-[var(--muted)] mt-2">
                    📍 {review.place} • {new Date(review.createdAt).toLocaleDateString()}
                  </p>
                </div>
              ))
            ) : (
              <p className="text-sm text-[var(--muted)] text-center py-8">No reviews yet.</p>
            )}
          </div>
        </div>
      </div>

      {/* Quick Stats Summary */}
      <div className="card p-6 fade-in bg-gradient-to-r from-[var(--primary)]/5 to-[var(--accent)]/5 border-[var(--primary)]/20">
        <h3 className="text-lg font-semibold mb-4">📊 Quick Summary</h3>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 text-sm">
          <div>
            <p className="text-[var(--muted)]">Total Content</p>
            <p className="text-2xl font-bold text-[var(--foreground)]">{servicesCount + weddingsCount + galleryCount + filmsCount}</p>
          </div>
          <div>
            <p className="text-[var(--muted)]">Client Feedback</p>
            <p className="text-2xl font-bold text-[var(--foreground)]">{reviewsCount}</p>
          </div>
          <div>
            <p className="text-[var(--muted)]">Active Services</p>
            <p className="text-2xl font-bold text-green-600">{activeServicesCount}/{servicesCount}</p>
          </div>
          <div>
            <p className="text-[var(--muted)]">Latest Activity</p>
            <p className="text-2xl font-bold text-[var(--foreground)]">
              {latestWeddings.length > 0 ? new Date(latestWeddings[0].createdAt).toLocaleDateString() : 'N/A'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
