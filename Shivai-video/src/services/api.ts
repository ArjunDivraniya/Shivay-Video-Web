// Use relative path in dev (proxied by Vite), absolute in production
const API_BASE_URL = import.meta.env.DEV ? '/api' : 'https://shivay-video-admin.vercel.app/api';

export interface HeroData {
  studioName?: string;
  tagline?: string;
  location?: string;
  heroImage?: string;
  imageUrl?: string;
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

export interface AboutData {
  _id?: string;
  experienceYears: number;
  weddingsCompleted: number;
  destinations: number;
  happyCouples: number;
  images?: string[];
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
  private makeId = (prefix: string) =>
    typeof crypto !== 'undefined' && 'randomUUID' in crypto
      ? crypto.randomUUID()
      : `${prefix}-${Date.now()}-${Math.random().toString(16).slice(2)}`;

  // --- Normalizers keep component types consistent regardless of backend field names ---
  private normalizeHero = (data: any): HeroData => ({
    studioName: data?.studioName || data?.title,
    tagline: data?.tagline || data?.subtitle,
    location: data?.location || data?.city || 'Junagadh • Gujarat',
    heroImage: data?.imageUrl || data?.heroImage,
    imageUrl: data?.imageUrl,
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
      const response = await fetch(`${API_BASE_URL}${endpoint}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      return data;
    } catch (error) {
      console.error(`Error fetching ${endpoint}:`, error);
      throw error;
    }
  }

  async getHeroData(): Promise<HeroData | null> {
    try {
      const data = await this.fetchData<any>('/hero');
      return this.normalizeHero(data);
    } catch (error) {
      console.error('Error fetching hero data:', error);
      return null;
    }
  }

  async getServices(): Promise<Service[]> {
    try {
      const data = await this.fetchData<any[]>('/services');
      return data.map(this.normalizeService);
    } catch (error) {
      console.error('Error fetching services:', error);
      return [];
    }
  }

  async getGallery(): Promise<GalleryImage[]> {
    try {
      const data = await this.fetchData<any[]>('/gallery');
      return data.map((img, index) => this.normalizeGalleryImage(img, index));
    } catch (error) {
      console.error('Error fetching gallery:', error);
      return [];
    }
  }

  async getHighlightGallery(): Promise<GalleryImage[]> {
    try {
      // Try highlight endpoint first
      const data = await this.fetchData<any[]>('/gallery/highlight');
      return data.map(this.normalizeGalleryImage);
    } catch (error) {
      // Fallback to regular gallery and filter highlights on client side
      try {
        const allGallery = await this.getGallery();
        return allGallery.filter(img => img.isHighlight);
      } catch (fallbackError) {
        console.error('Error fetching gallery for highlights:', fallbackError);
        return [];
      }
    }
  }

  async getAbout(): Promise<AboutData | null> {
    try {
      const data = await this.fetchData<any>('/about');
      return this.normalizeAbout(data);
    } catch (error) {
      console.error('Error fetching about stats:', error);
      return null;
    }
  }

  async getWeddingStories(): Promise<WeddingStory[]> {
    try {
      const data = await this.fetchData<any[]>('/weddings');
      return data.map(this.normalizeWeddingStory);
    } catch (primaryError) {
      console.error('Error fetching weddings, falling back to /stories:', primaryError);
      try {
        const fallback = await this.fetchData<any[]>('/stories');
        console.log('API Response for stories:', fallback);
        console.log('Number of stories:', Array.isArray(fallback) ? fallback.length : 0);
        return fallback.map(this.normalizeWeddingStory);
      } catch (fallbackError) {
        console.error('Error fetching stories fallback:', fallbackError);
        return [];
      }
    }
  }

  async getStories(): Promise<WeddingStory[]> {
    return this.getWeddingStories();
  }

  async getFilms(): Promise<Film[]> {
    try {
      const data = await this.fetchData<any[]>('/films');
      return data.map(this.normalizeFilm);
    } catch (error) {
      console.error('Error fetching films:', error);
      return [];
    }
  }

  async getTestimonials(): Promise<Testimonial[]> {
    try {
      console.log('Fetching testimonials from /reviews endpoint...');
      const data = await this.fetchData<any[]>('/reviews');
      console.log('Raw testimonials data:', data);
      
      const approved = Array.isArray(data)
        ? data.filter((item) => item.approved !== false)
        : [];
      
      console.log('Filtered testimonials count:', approved.length);
      const normalized = approved.map(this.normalizeTestimonial);
      console.log('Normalized testimonials:', normalized);
      
      return normalized;
    } catch (error) {
      console.error('Error fetching testimonials from /reviews:', error);
      // Fallback to /testimonials endpoint if /reviews fails
      try {
        console.log('Falling back to /testimonials endpoint...');
        const fallbackData = await this.fetchData<any[]>('/testimonials');
        const approved = Array.isArray(fallbackData)
          ? fallbackData.filter((item) => item.approved !== false)
          : [];
        return approved.map(this.normalizeTestimonial);
      } catch (fallbackError) {
        console.error('Error fetching testimonials from /testimonials fallback:', fallbackError);
        return [];
      }
    }
  }
}

export const apiService = new ApiService();
