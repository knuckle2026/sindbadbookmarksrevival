export type ListingType = "shop" | "organization" | "media";
export type FriendlinessLevel = "Dedicated" | "Friendly" | "Ally";
export type ListingStatus = "published" | "hidden";
export type CategoryGroup = "purpose" | "industry";
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
      listings: {
        Row: {
          id: string;
          user_id: string;
          type: ListingType;
          title: string;
          description: string | null;
          address: string | null;
          latitude: number | null;
          longitude: number | null;
          website_url: string | null;
          friendliness: FriendlinessLevel | null;
          status: ListingStatus;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          type: ListingType;
          title: string;
          description?: string | null;
          address?: string | null;
          latitude?: number | null;
          longitude?: number | null;
          website_url?: string | null;
          friendliness?: FriendlinessLevel | null;
          status?: ListingStatus;
        };
        Update: {
          type?: ListingType;
          title?: string;
          description?: string | null;
          address?: string | null;
          latitude?: number | null;
          longitude?: number | null;
          website_url?: string | null;
          friendliness?: FriendlinessLevel | null;
          status?: ListingStatus;
        };
      };
      categories: {
        Row: {
          id: string;
          group_type: CategoryGroup;
          name: string;
          slug: string;
          sort_order: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          group_type: CategoryGroup;
          name: string;
          slug: string;
          sort_order?: number;
        };
        Update: {
          group_type?: CategoryGroup;
          name?: string;
          slug?: string;
          sort_order?: number;
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
          reason: string;
          status: ReportStatus;
          created_at: string;
        };
        Insert: {
          id?: string;
          listing_id: string;
          reason: string;
          status?: ReportStatus;
        };
        Update: {
          reason?: string;
          status?: ReportStatus;
        };
      };
    };
    Views: {
      dashboard_counts: {
        Row: {
          total_published: number;
          shop_count: number;
          org_count: number;
          media_count: number;
        };
      };
      dashboard_category_counts: {
        Row: {
          category_id: string;
          group_type: CategoryGroup;
          name: string;
          slug: string;
          sort_order: number;
          listing_count: number;
        };
      };
      dashboard_friendliness_counts: {
        Row: {
          friendliness: FriendlinessLevel;
          listing_count: number;
        };
      };
    };
    Functions: Record<string, never>;
    Enums: {
      listing_type: ListingType;
      friendliness_level: FriendlinessLevel;
      listing_status: ListingStatus;
      category_group: CategoryGroup;
      user_role: UserRole;
      report_status: ReportStatus;
    };
  };
}
