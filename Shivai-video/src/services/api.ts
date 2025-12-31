const API_BASE_URL = 'https://shivay-video-admin.vercel.app/api';

export interface HeroData {
  studioName: string;
  tagline: string;
  location: string;
  heroImage: string;
}

export interface Service {
  _id: string;
  title: string;
  description: string;
  icon: string;
  image: string;
}

export interface GalleryImage {
  _id: string;
  src: string;
  alt: string;
  span?: string;
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
}

class ApiService {
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
      const data = await this.fetchData<HeroData>('/hero');
      console.log('Hero data:', data);
      return data;
    } catch (error) {
      console.error('Error fetching hero data:', error);
      return null;
    }
  }

  async getServices(): Promise<Service[]> {
    try {
      const data = await this.fetchData<Service[]>('/services');
      console.log('Services data:', data);
      return data;
    } catch (error) {
      console.error('Error fetching services:', error);
      return [];
    }
  }

  async getGallery(): Promise<GalleryImage[]> {
    try {
      const data = await this.fetchData<GalleryImage[]>('/gallery');
      console.log('Gallery data:', data);
      return data;
    } catch (error) {
      console.error('Error fetching gallery:', error);
      return [];
    }
  }

  async getStories(): Promise<WeddingStory[]> {
    try {
      const data = await this.fetchData<WeddingStory[]>('/stories');
      console.log('API Response for stories:', data);
      console.log('Number of stories:', Array.isArray(data) ? data.length : 0);
      return data;
    } catch (error) {
      console.error('Error fetching stories:', error);
      return [];
    }
  }

  async getFilms(): Promise<Film[]> {
    try {
      const data = await this.fetchData<Film[]>('/films');
      console.log('Films data:', data);
      return data;
    } catch (error) {
      console.error('Error fetching films:', error);
      return [];
    }
  }

  async getTestimonials(): Promise<Testimonial[]> {
    try {
      const data = await this.fetchData<Testimonial[]>('/testimonials');
      console.log('Testimonials data:', data);
      return data;
    } catch (error) {
      console.error('Error fetching testimonials:', error);
      return [];
    }
  }
}

export const apiService = new ApiService();
