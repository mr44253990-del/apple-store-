export interface ReviewItem {
  id: string;
  app_id: string;
  author: string;
  rating: number; // 1 to 5
  title: string;
  comment: string;
  date: string;
  helpful_count?: number;
}

export interface AppItem {
  id: string;
  name: string;
  subtitle: string;
  description: string;
  icon_url: string;
  download_url: string; // Direct download file link or URL
  file_size: string; // e.g. "84.2 MB"
  version: string; // e.g. "2.4.0"
  developer: string;
  developer_email?: string;
  category: string; // "Games" | "Productivity" | "Photo & Video" | "Social" | "Entertainment" | "Utilities" | "Finance" | "Arcade"
  rating: number; // e.g. 4.8
  rating_count: number; // e.g. 24500
  price: number; // 0 for Free
  age_rating: string; // "4+", "9+", "12+", "17+"
  screenshots: string[];
  video_url?: string; // YouTube / Vimeo / direct MP4 video link or uploaded video data
  tags: string[];
  whats_new?: string;
  in_app_purchases?: boolean;
  is_editors_choice?: boolean;
  is_featured?: boolean;
  is_app_of_the_day?: boolean;
  downloads_count: number;
  created_at: string;
  compatibility?: string;
  languages?: string[];
}

export interface UserProfile {
  id: string;
  email: string;
  name: string;
  avatar_url?: string;
  is_admin: boolean;
  created_at?: string;
}

export interface AppSettings {
  google_search_console_token: string;
  auto_google_index: boolean;
  site_title: string;
  site_description: string;
  accent_color: 'blue' | 'purple' | 'emerald' | 'orange' | 'rose' | 'slate';
  theme_mode: 'dark' | 'light' | 'system';
  custom_download_message?: string;
}
