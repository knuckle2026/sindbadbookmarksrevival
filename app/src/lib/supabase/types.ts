export type ListingStatus = "published" | "hidden";
export type UserRole = "visitor" | "contributor" | "admin";
export type ReportStatus = "pending" | "reviewed";

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          display_name: string;
          role: UserRole;
          is_suspended: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          display_name: string;
          role?: UserRole;
          is_suspended?: boolean;
        };
        Update: {
          display_name?: string;
          role?: UserRole;
          is_suspended?: boolean;
        };
      };
      genres: {
        Row: {
          id: string;
          slug: string;
          name: string;
          sort_order: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          slug: string;
          name: string;
          sort_order?: number;
        };
        Update: {
          slug?: string;
          name?: string;
          sort_order?: number;
        };
      };
      categories: {
        Row: {
          id: string;
          genre_id: string;
          name: string;
          slug: string;
          sort_order: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          genre_id: string;
          name: string;
          slug: string;
          sort_order?: number;
        };
        Update: {
          genre_id?: string;
          name?: string;
          slug?: string;
          sort_order?: number;
        };
      };
      listings: {
        Row: {
          id: string;
          user_id: string;
          genre_id: string | null;
          title: string;
          description: string;
          website_url: string;
          prefecture: string | null;
          ward: string | null;
          address: string | null;
          service_areas: string[] | null;
          status: ListingStatus;
          created_by: string | null;
          updated_by: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          genre_id?: string | null;
          title: string;
          description: string;
          website_url: string;
          prefecture?: string | null;
          ward?: string | null;
          address?: string | null;
          service_areas?: string[] | null;
          status?: ListingStatus;
          created_by?: string | null;
          updated_by?: string | null;
        };
        Update: {
          genre_id?: string | null;
          title?: string;
          description?: string;
          website_url?: string;
          prefecture?: string | null;
          ward?: string | null;
          address?: string | null;
          service_areas?: string[] | null;
          status?: ListingStatus;
          updated_by?: string | null;
        };
      };
      listing_categories: {
        Row: {
          listing_id: string;
          category_id: string;
        };
        Insert: {
          listing_id: string;
          category_id: string;
        };
        Update: {
          listing_id?: string;
          category_id?: string;
        };
      };
      reports: {
        Row: {
          id: string;
          listing_id: string;
          reporter_user_id: string | null;
          reason: string;
          status: ReportStatus;
          created_at: string;
        };
        Insert: {
          id?: string;
          listing_id: string;
          reporter_user_id?: string | null;
          reason: string;
          status?: ReportStatus;
        };
        Update: {
          reason?: string;
          status?: ReportStatus;
        };
      };
    };
    Views: Record<string, never>;
    Functions: {
      get_genre_counts: {
        Args: Record<string, never>;
        Returns: {
          genre_slug: string;
          genre_name: string;
          sort_order: number;
          listing_count: number;
        }[];
      };
      get_category_counts_all: {
        Args: Record<string, never>;
        Returns: {
          genre_slug: string;
          genre_name: string;
          genre_sort: number;
          category_slug: string;
          category_name: string;
          category_sort: number;
          listing_count: number;
        }[];
      };
      get_prefecture_counts_by_genre: {
        Args: { p_genre_slug: string };
        Returns: {
          prefecture: string;
          listing_count: number;
        }[];
      };
    };
    Enums: {
      listing_status: ListingStatus;
      user_role: UserRole;
      report_status: ReportStatus;
    };
  };
}
