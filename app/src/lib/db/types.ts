export type ListingStatus = "pending" | "published" | "hidden" | "rejected";
export type UserRole = "visitor" | "contributor" | "admin";
export type ReportStatus = "pending" | "reviewed";

export interface ProfileRow {
  id: string;
  display_name: string;
  role: UserRole;
  is_suspended: 0 | 1;
  created_at: string;
  updated_at: string;
}

export interface GenreRow {
  id: string;
  slug: string;
  name: string;
  sort_order: number;
  created_at: string;
}

export interface CategoryRow {
  id: string;
  genre_id: string;
  slug: string;
  name: string;
  sort_order: number;
  created_at: string;
}

export interface ListingRow {
  id: string;
  user_id: string | null;
  genre_id: string | null;
  title: string;
  description: string;
  address: string | null;
  website_url: string;
  prefecture: string | null;
  ward: string | null;
  service_areas: string | null;
  provider_ages: string | null;
  status: ListingStatus;
  click_count: number;
  created_by: string | null;
  updated_by: string | null;
  created_at: string;
  updated_at: string;
  published_at: string | null;
}

export interface ListingCategoryRow {
  listing_id: string;
  category_id: string;
}

export interface ReportRow {
  id: string;
  listing_id: string;
  reporter_user_id: string | null;
  reason: string;
  status: ReportStatus;
  created_at: string;
}

export interface AnnouncementRow {
  id: string;
  title: string;
  body: string;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface FaqRow {
  id: string;
  question: string;
  answer: string;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface FeedbackRow {
  id: string;
  user_id: string | null;
  body: string;
  created_at: string;
}

export interface BlockedEmailRow {
  email: string;
  blocked_by: string | null;
  reason: string | null;
  created_at: string;
}

export interface BannerRow {
  id: string;
  storage_key: string;
  image_url: string;
  link_url: string;
  placement: string;
  alt: string | null;
  sort_order: number;
  enabled: 0 | 1;
  created_at: string;
  updated_at: string;
}
