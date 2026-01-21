// --- API Configuration ---

/**
 * FIXED: This logic now strictly uses the relative '/api' path during local development.
 * This ensures the Vite Proxy in vite.config.ts is triggered, preventing CORS errors.
 */
// Prefer relative proxy in dev; allow override via env; fallback to production URL
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

export interface HeroData {
  studioName?: string;
  tagline?: string;
  location?: string;
  heroImage?: string;
  imageUrl?: string;
  mobileImageUrl?: string | null;
  title?: string;
  subtitle?: string;
  styles?: {
    textColor: string;
    studioNameColor?: string;
    locationColor?: string;
    taglineColor?: string;
    overlayOpacity: number;
    justifyContent: "flex-start" | "flex-center" | "flex-end";
    alignItems: "flex-start" | "flex-center" | "flex-end";
    verticalSpacing: number;
  };
}

export interface Service {
  _id: string;
  title: string;
  description: string;
  icon: string;
  image: string;
  serviceType?: string;
  isActive?: boolean;
}

export interface GalleryImage {
  _id: string;
  src: string;
  alt: string;
  span?: string;
  category?: string;
  serviceType?: string;
  isHighlight?: boolean;
}

export interface WeddingGalleryImage {
  _id: string;
  imageUrl: string;
  photoType: "wedding" | "prewedding";
  order: number;
  createdAt: string;
}

export interface AboutData {
  _id?: string;
  experienceYears: number;
  weddingsCompleted: number;
  destinations: number;
  happyCouples: number;
  images?: string[];
}

export interface OurStoryData {
  _id?: string;
  imageUrl: string;
  imagePublicId: string;
  startedYear: number;
  description: string;
}

export interface WeddingStory {
  _id: string;
  couple: string;
  event: string;
  location: string;
  image: string;
}

export interface Film {
  _id: string;
  title: string;
  category: string;
  thumbnail: string;
  videoUrl?: string;
}

export interface Testimonial {
  _id: string;
  quote: string;
  couple: string;
  event: string;
  place?: string;
  imageUrl?: string;
}

class ApiService {
  private unwrapPayload = (payload: any) => {
    if (payload && typeof payload === 'object') {
      if ('value' in payload) return payload.value;
      if ('data' in payload) return payload.data;
      if ('results' in payload) return payload.results;
      if ('items' in payload) return payload.items;
    }
    return payload;
  };

  private asArray = (payload: any): any[] => {
    const unwrapped = this.unwrapPayload(payload);
    if (Array.isArray(unwrapped)) return unwrapped;
    return [];
  };

  private asObject = (payload: any): any => {
    const unwrapped = this.unwrapPayload(payload);
    if (Array.isArray(unwrapped)) return unwrapped[0] ?? null;
    return unwrapped ?? null;
  };

  private makeId = (prefix: string) =>
    typeof crypto !== 'undefined' && 'randomUUID' in crypto
      ? crypto.randomUUID()
      : `${prefix}-${Date.now()}-${Math.random().toString(16).slice(2)}`;

  private normalizeHero = (data: any): HeroData => ({
    studioName: data?.studioName || data?.title,
    tagline: data?.tagline || data?.subtitle,
    location: data?.location || data?.city || 'Junagadh • Gujarat',
    heroImage: data?.imageUrl || data?.heroImage,
    imageUrl: data?.imageUrl,
    mobileImageUrl: data?.mobileImageUrl || null,
    title: data?.title,
    subtitle: data?.subtitle,
    styles: {
      textColor: data?.styles?.textColor || '#ffffff',
      studioNameColor: data?.styles?.studioNameColor || data?.styles?.textColor || '#ffffff',
      locationColor: data?.styles?.locationColor || data?.styles?.textColor || '#ffffff',
      taglineColor: data?.styles?.taglineColor || data?.styles?.textColor || '#ffffff',
      overlayOpacity: data?.styles?.overlayOpacity || 0.5,
      justifyContent: data?.styles?.justifyContent || 'flex-center',
      alignItems: data?.styles?.alignItems || 'flex-center',
      verticalSpacing: data?.styles?.verticalSpacing || 0,
    },
  });

  private normalizeService = (service: any): Service => ({
    _id: service?._id || service?.id || this.makeId('service'),
    title: service?.serviceName || service?.title || 'Service',
    description: service?.description || service?.serviceType || 'Capture your moments with us.',
    icon: service?.icon || 'Camera',
    image: service?.imageUrl || service?.image || '',
    serviceType: service?.serviceType,
    isActive: service?.isActive,
  });

  private normalizeGalleryImage = (image: any, index: number): GalleryImage => ({
    _id: image?._id || image?.id || `gallery-${index}`,
    src: image?.imageUrl || image?.url || image?.src || '',
    alt: image?.category || image?.serviceType || image?.alt || 'Gallery image',
    span: image?.span,
    category: image?.category,
    serviceType: image?.serviceType,
    isHighlight: image?.isHighlight ?? image?.highlight ?? image?.galleryHighlight ?? false,
  });

  private normalizeAbout = (about: any): AboutData => ({
    _id: about?._id,
    experienceYears: Number(about?.experienceYears ?? 0),
    weddingsCompleted: Number(about?.weddingsCompleted ?? 0),
    destinations: Number(about?.destinations ?? 0),
    happyCouples: Number(about?.happyCouples ?? 0),
    images: Array.isArray(about?.images) ? about.images : [],
  });

  private normalizeOurStory = (story: any): OurStoryData => ({
    _id: story?._id,
    imageUrl: story?.imageUrl || '',
    imagePublicId: story?.imagePublicId || '',
    startedYear: Number(story?.startedYear ?? new Date().getFullYear() - 8),
    description: story?.description || '',
  });

  private normalizeWeddingStory = (story: any): WeddingStory => ({
    _id: story?._id || story?.id || story?.publicId || this.makeId('wedding-story'),
    couple: story?.coupleName || story?.title || story?.couple || 'Wedding Story',
    event: story?.serviceType || story?.eventType || story?.event || 'Wedding',
    location: story?.place || story?.location || 'Unknown location',
    image: story?.coverPhoto?.url || story?.coverImage?.url || story?.imageUrl || story?.image || '',
  });

  private normalizeFilm = (film: any): Film => ({
    _id: film?._id || film?.id || film?.videoPublicId || this.makeId('film'),
    title: film?.title || 'Wedding Film',
    category: film?.category || film?.serviceType || 'Wedding',
    thumbnail: film?.thumbnail || film?.poster || film?.imageUrl || '',
    videoUrl: film?.videoUrl,
  });

  private normalizeTestimonial = (testimonial: any): Testimonial => ({
    _id: testimonial?._id || testimonial?.id || `testimonial-${this.makeId('testimonial')}`,
    quote: testimonial?.quote || testimonial?.review || testimonial?.message || testimonial?.text || '',
    couple: testimonial?.clientName || testimonial?.couple || testimonial?.coupleName || testimonial?.name || testimonial?.author || 'Happy Couple',
    event: testimonial?.event || testimonial?.serviceType || testimonial?.eventType || 'Wedding',
    place: testimonial?.place || testimonial?.location || testimonial?.city || '',
    imageUrl: testimonial?.image?.url || testimonial?.imageUrl || testimonial?.clientImage || testimonial?.profileImage,
  });

  private async fetchData<T>(endpoint: string): Promise<T> {
    try {
      const url = `${API_BASE_URL}${endpoint}`;
      console.log(`[ApiService] Requesting: ${url}`);
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error(`[ApiService] Error fetching ${endpoint}:`, error);
      throw error;
    }
  }

  async getHeroData(): Promise<HeroData | null> {
    try {
      const data = await this.fetchData<any>('/hero');
      const hero = this.asObject(data);
      return hero ? this.normalizeHero(hero) : null;
    } catch (error) {
      return null;
    }
  }

  async getServices(): Promise<Service[]> {
    try {
      const raw = await this.fetchData<any>('/services');
      const data = this.asArray(raw);
      return data.map(this.normalizeService);
    } catch (error) {
      return [];
    }
  }

  async getGallery(): Promise<GalleryImage[]> {
    try {
      const raw = await this.fetchData<any>('/gallery');
      const data = this.asArray(raw);
      return data.map((img, index) => this.normalizeGalleryImage(img, index));
    } catch (error) {
      return [];
    }
  }

  async getHighlightGallery(): Promise<GalleryImage[]> {
    try {
      const raw = await this.fetchData<any>('/gallery/highlight');
      const data = this.asArray(raw);
      return data.map(this.normalizeGalleryImage);
    } catch (error) {
      try {
        const allGallery = await this.getGallery();
        return allGallery.filter(img => img.isHighlight);
      } catch (fallbackError) {
        return [];
      }
    }
  }

  async getAbout(): Promise<AboutData | null> {
    try {
      const raw = await this.fetchData<any>('/about');
      const data = this.asObject(raw);
      return data ? this.normalizeAbout(data) : null;
    } catch (error) {
      return null;
    }
  }

  async getOurStory(): Promise<OurStoryData | null> {
    try {
      const raw = await this.fetchData<any>('/our-story');
      console.log('[ApiService] Our Story raw data:', raw);
      const data = this.asObject(raw);
      console.log('[ApiService] Our Story after asObject:', data);
      
      // Check if data has actual content (not just an empty object)
      if (data && Object.keys(data).length > 0 && data.imageUrl && data.description) {
        const normalized = this.normalizeOurStory(data);
        console.log('[ApiService] Our Story normalized:', normalized);
        return normalized;
      }
      console.warn('[ApiService] Our Story data is empty or invalid');
      return null;
    } catch (error) {
      console.error('[ApiService] Error fetching our story:', error);
      return null;
    }
  }

  async getWeddingStories(): Promise<WeddingStory[]> {
    try {
      const raw = await this.fetchData<any>('/weddings');
      const data = this.asArray(raw);
      console.log('[ApiService] Wedding stories raw data:', data);
      const normalized = data.map(this.normalizeWeddingStory);
      console.log('[ApiService] Wedding stories normalized:', normalized);
      return normalized;
    } catch (error) {
      console.error('[ApiService] Error fetching wedding stories:', error);
      return [];
    }
  }

  async getStories(): Promise<WeddingStory[]> {
    return this.getWeddingStories();
  }

  async getFilms(): Promise<Film[]> {
    try {
      const raw = await this.fetchData<any>('/films');
      const data = this.asArray(raw);
      return data.map(this.normalizeFilm);
    } catch (error) {
      return [];
    }
  }

  async getTestimonials(): Promise<Testimonial[]> {
    try {
      const raw = await this.fetchData<any>('/reviews');
      const data = this.asArray(raw);
      const approved = Array.isArray(data)
        ? data.filter((item) => item.approved !== false)
        : [];
      return approved.map(this.normalizeTestimonial);
    } catch (error) {
      try {
        const fallbackRaw = await this.fetchData<any>('/testimonials');
        const fallbackData = this.asArray(fallbackRaw);
        const approved = Array.isArray(fallbackData)
          ? fallbackData.filter((item) => item.approved !== false)
          : [];
        return approved.map(this.normalizeTestimonial);
      } catch (fallbackError) {
        return [];
      }
    }
  }

  async getWeddingGallery(): Promise<WeddingGalleryImage[]> {
    try {
      const raw = await this.fetchData<any>('/wedding-gallery');
      const data = this.asArray(raw);
      return Array.isArray(data) ? data : [];
    } catch (error) {
      console.error('Error fetching wedding gallery:', error);
      return [];
    }
  }
}

export const apiService = new ApiService();