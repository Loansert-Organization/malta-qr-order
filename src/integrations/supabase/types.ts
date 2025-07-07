export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instanciate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.3 (519615d)"
  }
  public: {
    Tables: {
      agent_logs: {
        Row: {
          agent_response: Json | null
          created_at: string
          id: number
          satisfaction_score: number | null
          session_id: string
          user_query: string | null
          vendor_id: string | null
        }
        Insert: {
          agent_response?: Json | null
          created_at?: string
          id?: number
          satisfaction_score?: number | null
          session_id: string
          user_query?: string | null
          vendor_id?: string | null
        }
        Update: {
          agent_response?: Json | null
          created_at?: string
          id?: number
          satisfaction_score?: number | null
          session_id?: string
          user_query?: string | null
          vendor_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "agent_logs_vendor_id_fkey"
            columns: ["vendor_id"]
            isOneToOne: false
            referencedRelation: "vendors"
            referencedColumns: ["id"]
          },
        ]
      }
      ai_assistant_messages: {
        Row: {
          content: string
          created_at: string | null
          id: string
          role: string
          session_id: string | null
        }
        Insert: {
          content: string
          created_at?: string | null
          id?: string
          role: string
          session_id?: string | null
        }
        Update: {
          content?: string
          created_at?: string | null
          id?: string
          role?: string
          session_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "ai_assistant_messages_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "ai_assistant_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      ai_assistant_sessions: {
        Row: {
          created_at: string | null
          id: string
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      ai_conversations: {
        Row: {
          context_data: Json | null
          created_at: string | null
          id: string
          messages: Json
          satisfaction_rating: number | null
          session_id: string
          updated_at: string | null
          vendor_id: string | null
        }
        Insert: {
          context_data?: Json | null
          created_at?: string | null
          id?: string
          messages?: Json
          satisfaction_rating?: number | null
          session_id: string
          updated_at?: string | null
          vendor_id?: string | null
        }
        Update: {
          context_data?: Json | null
          created_at?: string | null
          id?: string
          messages?: Json
          satisfaction_rating?: number | null
          session_id?: string
          updated_at?: string | null
          vendor_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "ai_conversations_vendor_id_fkey"
            columns: ["vendor_id"]
            isOneToOne: false
            referencedRelation: "vendors"
            referencedColumns: ["id"]
          },
        ]
      }
      ai_layout_cache: {
        Row: {
          context_hash: string
          created_at: string | null
          effectiveness_score: number | null
          expires_at: string | null
          id: string
          layout_data: Json
          vendor_id: string | null
        }
        Insert: {
          context_hash: string
          created_at?: string | null
          effectiveness_score?: number | null
          expires_at?: string | null
          id?: string
          layout_data: Json
          vendor_id?: string | null
        }
        Update: {
          context_hash?: string
          created_at?: string | null
          effectiveness_score?: number | null
          expires_at?: string | null
          id?: string
          layout_data?: Json
          vendor_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "ai_layout_cache_vendor_id_fkey"
            columns: ["vendor_id"]
            isOneToOne: false
            referencedRelation: "vendors"
            referencedColumns: ["id"]
          },
        ]
      }
      ai_suggestions: {
        Row: {
          created_at: string
          id: number
          is_applied: boolean | null
          session_id: string
          suggestion_payload: Json
          suggestion_type: string
          vendor_id: string | null
        }
        Insert: {
          created_at?: string
          id?: number
          is_applied?: boolean | null
          session_id: string
          suggestion_payload: Json
          suggestion_type: string
          vendor_id?: string | null
        }
        Update: {
          created_at?: string
          id?: number
          is_applied?: boolean | null
          session_id?: string
          suggestion_payload?: Json
          suggestion_type?: string
          vendor_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "ai_suggestions_vendor_id_fkey"
            columns: ["vendor_id"]
            isOneToOne: false
            referencedRelation: "vendors"
            referencedColumns: ["id"]
          },
        ]
      }
      ai_usage: {
        Row: {
          cost_usd: number | null
          created_at: string | null
          function_name: string
          id: string
          tokens_used: number | null
          user_id: string
        }
        Insert: {
          cost_usd?: number | null
          created_at?: string | null
          function_name: string
          id?: string
          tokens_used?: number | null
          user_id: string
        }
        Update: {
          cost_usd?: number | null
          created_at?: string | null
          function_name?: string
          id?: string
          tokens_used?: number | null
          user_id?: string
        }
        Relationships: []
      }
      ai_waiter_logs: {
        Row: {
          ai_model_used: string | null
          content: string
          created_at: string
          guest_session_id: string
          id: string
          message_type: string
          processing_metadata: Json | null
          satisfaction_score: number | null
          suggestions: Json | null
          vendor_id: string
        }
        Insert: {
          ai_model_used?: string | null
          content: string
          created_at?: string
          guest_session_id: string
          id?: string
          message_type: string
          processing_metadata?: Json | null
          satisfaction_score?: number | null
          suggestions?: Json | null
          vendor_id: string
        }
        Update: {
          ai_model_used?: string | null
          content?: string
          created_at?: string
          guest_session_id?: string
          id?: string
          message_type?: string
          processing_metadata?: Json | null
          satisfaction_score?: number | null
          suggestions?: Json | null
          vendor_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "ai_waiter_logs_vendor_id_fkey"
            columns: ["vendor_id"]
            isOneToOne: false
            referencedRelation: "vendors"
            referencedColumns: ["id"]
          },
        ]
      }
      analytics: {
        Row: {
          created_at: string
          date: string
          id: string
          metadata: Json | null
          metric_type: string
          metric_value: number
          vendor_id: string
        }
        Insert: {
          created_at?: string
          date: string
          id?: string
          metadata?: Json | null
          metric_type: string
          metric_value: number
          vendor_id: string
        }
        Update: {
          created_at?: string
          date?: string
          id?: string
          metadata?: Json | null
          metric_type?: string
          metric_value?: number
          vendor_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "analytics_vendor_id_fkey"
            columns: ["vendor_id"]
            isOneToOne: false
            referencedRelation: "vendors"
            referencedColumns: ["id"]
          },
        ]
      }
      analytics_events: {
        Row: {
          created_at: string | null
          event_name: string
          id: string
          properties: Json | null
          session_id: string | null
          timestamp: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          event_name: string
          id?: string
          properties?: Json | null
          session_id?: string | null
          timestamp?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          event_name?: string
          id?: string
          properties?: Json | null
          session_id?: string | null
          timestamp?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      analytics_metrics: {
        Row: {
          created_at: string | null
          date: string | null
          dimensions: Json | null
          hour: number | null
          id: string
          metric_name: string
          metric_value: number
        }
        Insert: {
          created_at?: string | null
          date?: string | null
          dimensions?: Json | null
          hour?: number | null
          id?: string
          metric_name: string
          metric_value: number
        }
        Update: {
          created_at?: string | null
          date?: string | null
          dimensions?: Json | null
          hour?: number | null
          id?: string
          metric_name?: string
          metric_value?: number
        }
        Relationships: []
      }
      automation_jobs: {
        Row: {
          bar_id: string | null
          completed_at: string | null
          created_at: string | null
          error_message: string | null
          id: string
          job_type: string
          progress_data: Json | null
          started_at: string | null
          status: string | null
          target_url: string | null
        }
        Insert: {
          bar_id?: string | null
          completed_at?: string | null
          created_at?: string | null
          error_message?: string | null
          id?: string
          job_type: string
          progress_data?: Json | null
          started_at?: string | null
          status?: string | null
          target_url?: string | null
        }
        Update: {
          bar_id?: string | null
          completed_at?: string | null
          created_at?: string | null
          error_message?: string | null
          id?: string
          job_type?: string
          progress_data?: Json | null
          started_at?: string | null
          status?: string | null
          target_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "automation_jobs_bar_id_fkey"
            columns: ["bar_id"]
            isOneToOne: false
            referencedRelation: "bars"
            referencedColumns: ["id"]
          },
        ]
      }
      bar_photos: {
        Row: {
          bar_id: string
          created_at: string | null
          enhanced_url: string | null
          height: number | null
          id: string
          is_enhanced: boolean | null
          metadata: Json | null
          original_url: string
          photo_reference: string | null
          processing_status: string | null
          supabase_url: string | null
          updated_at: string | null
          width: number | null
        }
        Insert: {
          bar_id: string
          created_at?: string | null
          enhanced_url?: string | null
          height?: number | null
          id?: string
          is_enhanced?: boolean | null
          metadata?: Json | null
          original_url: string
          photo_reference?: string | null
          processing_status?: string | null
          supabase_url?: string | null
          updated_at?: string | null
          width?: number | null
        }
        Update: {
          bar_id?: string
          created_at?: string | null
          enhanced_url?: string | null
          height?: number | null
          id?: string
          is_enhanced?: boolean | null
          metadata?: Json | null
          original_url?: string
          photo_reference?: string | null
          processing_status?: string | null
          supabase_url?: string | null
          updated_at?: string | null
          width?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "bar_photos_bar_id_fkey"
            columns: ["bar_id"]
            isOneToOne: false
            referencedRelation: "bars"
            referencedColumns: ["id"]
          },
        ]
      }
      bars: {
        Row: {
          address: string | null
          categories: string[] | null
          city: string | null
          contact_number: string | null
          country: string | null
          created_at: string | null
          features: string[] | null
          google_place_id: string | null
          has_menu: boolean
          id: string
          is_active: boolean | null
          is_onboarded: boolean | null
          location_gps: unknown | null
          momo_code: string | null
          name: string
          rating: number | null
          review_count: number | null
          revolut_link: string | null
          updated_at: string | null
          website_url: string | null
        }
        Insert: {
          address?: string | null
          categories?: string[] | null
          city?: string | null
          contact_number?: string | null
          country?: string | null
          created_at?: string | null
          features?: string[] | null
          google_place_id?: string | null
          has_menu?: boolean
          id?: string
          is_active?: boolean | null
          is_onboarded?: boolean | null
          location_gps?: unknown | null
          momo_code?: string | null
          name: string
          rating?: number | null
          review_count?: number | null
          revolut_link?: string | null
          updated_at?: string | null
          website_url?: string | null
        }
        Update: {
          address?: string | null
          categories?: string[] | null
          city?: string | null
          contact_number?: string | null
          country?: string | null
          created_at?: string | null
          features?: string[] | null
          google_place_id?: string | null
          has_menu?: boolean
          id?: string
          is_active?: boolean | null
          is_onboarded?: boolean | null
          location_gps?: unknown | null
          momo_code?: string | null
          name?: string
          rating?: number | null
          review_count?: number | null
          revolut_link?: string | null
          updated_at?: string | null
          website_url?: string | null
        }
        Relationships: []
      }
      conversation_messages: {
        Row: {
          content: string
          conversation_id: string
          created_at: string | null
          id: string
          is_read: boolean | null
          sender_id: string
        }
        Insert: {
          content: string
          conversation_id: string
          created_at?: string | null
          id?: string
          is_read?: boolean | null
          sender_id: string
        }
        Update: {
          content?: string
          conversation_id?: string
          created_at?: string | null
          id?: string
          is_read?: boolean | null
          sender_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "conversation_messages_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "conversations"
            referencedColumns: ["id"]
          },
        ]
      }
      conversations: {
        Row: {
          created_at: string | null
          id: string
          match_id: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          match_id: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          match_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "conversations_match_id_fkey"
            columns: ["match_id"]
            isOneToOne: false
            referencedRelation: "trip_matches_wizard"
            referencedColumns: ["id"]
          },
        ]
      }
      driver_details: {
        Row: {
          bio: string | null
          created_at: string | null
          driver_id: string
          id: string
          license_expiry: string
          license_number: string
          preferred_radius_km: number | null
          rating: number | null
          total_trips: number | null
          updated_at: string | null
          verified: boolean | null
          years_driving: number | null
        }
        Insert: {
          bio?: string | null
          created_at?: string | null
          driver_id: string
          id?: string
          license_expiry: string
          license_number: string
          preferred_radius_km?: number | null
          rating?: number | null
          total_trips?: number | null
          updated_at?: string | null
          verified?: boolean | null
          years_driving?: number | null
        }
        Update: {
          bio?: string | null
          created_at?: string | null
          driver_id?: string
          id?: string
          license_expiry?: string
          license_number?: string
          preferred_radius_km?: number | null
          rating?: number | null
          total_trips?: number | null
          updated_at?: string | null
          verified?: boolean | null
          years_driving?: number | null
        }
        Relationships: []
      }
      driver_vehicles: {
        Row: {
          color: string
          created_at: string | null
          driver_id: string
          id: string
          is_primary: boolean | null
          license_plate: string
          make: string
          model: string
          total_seats: number | null
          updated_at: string | null
          vehicle_type: string | null
          year: number | null
        }
        Insert: {
          color: string
          created_at?: string | null
          driver_id: string
          id?: string
          is_primary?: boolean | null
          license_plate: string
          make: string
          model: string
          total_seats?: number | null
          updated_at?: string | null
          vehicle_type?: string | null
          year?: number | null
        }
        Update: {
          color?: string
          created_at?: string | null
          driver_id?: string
          id?: string
          is_primary?: boolean | null
          license_plate?: string
          make?: string
          model?: string
          total_seats?: number | null
          updated_at?: string | null
          vehicle_type?: string | null
          year?: number | null
        }
        Relationships: []
      }
      error_logs: {
        Row: {
          context: Json | null
          created_at: string | null
          error_message: string
          error_type: string
          id: string
          resolved: boolean | null
          resolved_at: string | null
          severity: string | null
          stack_trace: string | null
          user_id: string | null
        }
        Insert: {
          context?: Json | null
          created_at?: string | null
          error_message: string
          error_type: string
          id?: string
          resolved?: boolean | null
          resolved_at?: string | null
          severity?: string | null
          stack_trace?: string | null
          user_id?: string | null
        }
        Update: {
          context?: Json | null
          created_at?: string | null
          error_message?: string
          error_type?: string
          id?: string
          resolved?: boolean | null
          resolved_at?: string | null
          severity?: string | null
          stack_trace?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      guest_preferences: {
        Row: {
          ai_memory: Json | null
          created_at: string | null
          dietary_restrictions: string[] | null
          favorite_categories: string[] | null
          id: string
          previous_orders: Json | null
          session_id: string
          updated_at: string | null
          vendor_id: string | null
        }
        Insert: {
          ai_memory?: Json | null
          created_at?: string | null
          dietary_restrictions?: string[] | null
          favorite_categories?: string[] | null
          id?: string
          previous_orders?: Json | null
          session_id: string
          updated_at?: string | null
          vendor_id?: string | null
        }
        Update: {
          ai_memory?: Json | null
          created_at?: string | null
          dietary_restrictions?: string[] | null
          favorite_categories?: string[] | null
          id?: string
          previous_orders?: Json | null
          session_id?: string
          updated_at?: string | null
          vendor_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "guest_preferences_vendor_id_fkey"
            columns: ["vendor_id"]
            isOneToOne: false
            referencedRelation: "vendors"
            referencedColumns: ["id"]
          },
        ]
      }
      guest_sessions: {
        Row: {
          created_at: string | null
          id: string
          last_activity: string | null
          metadata: Json | null
          session_token: string
          vendor_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          last_activity?: string | null
          metadata?: Json | null
          session_token: string
          vendor_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          last_activity?: string | null
          metadata?: Json | null
          session_token?: string
          vendor_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "guest_sessions_vendor_id_fkey"
            columns: ["vendor_id"]
            isOneToOne: false
            referencedRelation: "vendors"
            referencedColumns: ["id"]
          },
        ]
      }
      guest_ui_sessions: {
        Row: {
          created_at: string
          device_fingerprint: string | null
          id: string
          interaction_history: Json | null
          location_context: Json | null
          preferences: Json | null
          session_id: string
          updated_at: string
          vendor_id: string
        }
        Insert: {
          created_at?: string
          device_fingerprint?: string | null
          id?: string
          interaction_history?: Json | null
          location_context?: Json | null
          preferences?: Json | null
          session_id: string
          updated_at?: string
          vendor_id: string
        }
        Update: {
          created_at?: string
          device_fingerprint?: string | null
          id?: string
          interaction_history?: Json | null
          location_context?: Json | null
          preferences?: Json | null
          session_id?: string
          updated_at?: string
          vendor_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "guest_ui_sessions_vendor_id_fkey"
            columns: ["vendor_id"]
            isOneToOne: false
            referencedRelation: "vendors"
            referencedColumns: ["id"]
          },
        ]
      }
      image_errors: {
        Row: {
          id: string
          item_id: string | null
          reason: string | null
          timestamp: string | null
        }
        Insert: {
          id?: string
          item_id?: string | null
          reason?: string | null
          timestamp?: string | null
        }
        Update: {
          id?: string
          item_id?: string | null
          reason?: string | null
          timestamp?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "image_errors_item_id_fkey"
            columns: ["item_id"]
            isOneToOne: false
            referencedRelation: "menu_items"
            referencedColumns: ["id"]
          },
        ]
      }
      layout_suggestions: {
        Row: {
          ai_model_used: string | null
          context_data: Json
          created_at: string
          effectiveness_score: number | null
          id: string
          layout_config: Json
          vendor_id: string
        }
        Insert: {
          ai_model_used?: string | null
          context_data: Json
          created_at?: string
          effectiveness_score?: number | null
          id?: string
          layout_config: Json
          vendor_id: string
        }
        Update: {
          ai_model_used?: string | null
          context_data?: Json
          created_at?: string
          effectiveness_score?: number | null
          id?: string
          layout_config?: Json
          vendor_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "layout_suggestions_vendor_id_fkey"
            columns: ["vendor_id"]
            isOneToOne: false
            referencedRelation: "vendors"
            referencedColumns: ["id"]
          },
        ]
      }
      locations_cache: {
        Row: {
          address: string
          country: string | null
          created_at: string | null
          id: string
          location: unknown
          name: string
          place_id: string
        }
        Insert: {
          address: string
          country?: string | null
          created_at?: string | null
          id?: string
          location: unknown
          name: string
          place_id: string
        }
        Update: {
          address?: string
          country?: string | null
          created_at?: string | null
          id?: string
          location?: unknown
          name?: string
          place_id?: string
        }
        Relationships: []
      }
      menu_analytics: {
        Row: {
          avg_rating: number | null
          created_at: string | null
          id: string
          last_ordered_at: string | null
          menu_item_id: string | null
          page_views: number | null
          revenue_trend: string | null
          total_orders: number | null
          total_revenue: number | null
          updated_at: string | null
          vendor_id: string | null
        }
        Insert: {
          avg_rating?: number | null
          created_at?: string | null
          id?: string
          last_ordered_at?: string | null
          menu_item_id?: string | null
          page_views?: number | null
          revenue_trend?: string | null
          total_orders?: number | null
          total_revenue?: number | null
          updated_at?: string | null
          vendor_id?: string | null
        }
        Update: {
          avg_rating?: number | null
          created_at?: string | null
          id?: string
          last_ordered_at?: string | null
          menu_item_id?: string | null
          page_views?: number | null
          revenue_trend?: string | null
          total_orders?: number | null
          total_revenue?: number | null
          updated_at?: string | null
          vendor_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "menu_analytics_menu_item_id_fkey"
            columns: ["menu_item_id"]
            isOneToOne: false
            referencedRelation: "menu_items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "menu_analytics_vendor_id_fkey"
            columns: ["vendor_id"]
            isOneToOne: false
            referencedRelation: "vendors"
            referencedColumns: ["id"]
          },
        ]
      }
      menu_categories: {
        Row: {
          display_order: number
          id: string
          is_smart_category: boolean | null
          name: string
          smart_rules: Json | null
          vendor_id: string
        }
        Insert: {
          display_order?: number
          id?: string
          is_smart_category?: boolean | null
          name: string
          smart_rules?: Json | null
          vendor_id: string
        }
        Update: {
          display_order?: number
          id?: string
          is_smart_category?: boolean | null
          name?: string
          smart_rules?: Json | null
          vendor_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "menu_categories_vendor_id_fkey"
            columns: ["vendor_id"]
            isOneToOne: false
            referencedRelation: "vendors"
            referencedColumns: ["id"]
          },
        ]
      }
      menu_item_modifiers: {
        Row: {
          additional_price: number
          id: string
          menu_item_id: string
          name: string
        }
        Insert: {
          additional_price?: number
          id?: string
          menu_item_id: string
          name: string
        }
        Update: {
          additional_price?: number
          id?: string
          menu_item_id?: string
          name?: string
        }
        Relationships: [
          {
            foreignKeyName: "menu_item_modifiers_menu_item_id_fkey"
            columns: ["menu_item_id"]
            isOneToOne: false
            referencedRelation: "menu_items"
            referencedColumns: ["id"]
          },
        ]
      }
      menu_items: {
        Row: {
          allergens: Json | null
          available: boolean | null
          bar_id: string | null
          category: string | null
          category_id: string | null
          created_at: string
          description: string | null
          dietary_tags: string[] | null
          id: string
          image_url: string | null
          is_vegetarian: boolean | null
          menu_id: string
          name: string
          popular: boolean | null
          prep_time: string | null
          price: number
          source_url: string | null
          subcategory: string | null
          updated_at: string
        }
        Insert: {
          allergens?: Json | null
          available?: boolean | null
          bar_id?: string | null
          category?: string | null
          category_id?: string | null
          created_at?: string
          description?: string | null
          dietary_tags?: string[] | null
          id?: string
          image_url?: string | null
          is_vegetarian?: boolean | null
          menu_id: string
          name: string
          popular?: boolean | null
          prep_time?: string | null
          price: number
          source_url?: string | null
          subcategory?: string | null
          updated_at?: string
        }
        Update: {
          allergens?: Json | null
          available?: boolean | null
          bar_id?: string | null
          category?: string | null
          category_id?: string | null
          created_at?: string
          description?: string | null
          dietary_tags?: string[] | null
          id?: string
          image_url?: string | null
          is_vegetarian?: boolean | null
          menu_id?: string
          name?: string
          popular?: boolean | null
          prep_time?: string | null
          price?: number
          source_url?: string | null
          subcategory?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "menu_items_bar_id_fkey"
            columns: ["bar_id"]
            isOneToOne: false
            referencedRelation: "bars"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "menu_items_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "menu_categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "menu_items_menu_id_fkey"
            columns: ["menu_id"]
            isOneToOne: false
            referencedRelation: "menus"
            referencedColumns: ["id"]
          },
        ]
      }
      menu_qa_issues: {
        Row: {
          created_at: string
          details: string | null
          id: number
          is_resolved: boolean | null
          issue_type: string
          menu_item_id: string
          resolved_by: string | null
        }
        Insert: {
          created_at?: string
          details?: string | null
          id?: number
          is_resolved?: boolean | null
          issue_type: string
          menu_item_id: string
          resolved_by?: string | null
        }
        Update: {
          created_at?: string
          details?: string | null
          id?: number
          is_resolved?: boolean | null
          issue_type?: string
          menu_item_id?: string
          resolved_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "menu_qa_issues_menu_item_id_fkey"
            columns: ["menu_item_id"]
            isOneToOne: false
            referencedRelation: "menu_items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "menu_qa_issues_resolved_by_fkey"
            columns: ["resolved_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      menu_scraping_logs: {
        Row: {
          ai_models_used: Json | null
          automation_job_id: string | null
          bar_id: string | null
          created_at: string | null
          id: string
          images_generated: number | null
          items_extracted: number | null
          menu_links_found: Json | null
          processing_time_ms: number | null
          success_rate: number | null
          website_url: string
        }
        Insert: {
          ai_models_used?: Json | null
          automation_job_id?: string | null
          bar_id?: string | null
          created_at?: string | null
          id?: string
          images_generated?: number | null
          items_extracted?: number | null
          menu_links_found?: Json | null
          processing_time_ms?: number | null
          success_rate?: number | null
          website_url: string
        }
        Update: {
          ai_models_used?: Json | null
          automation_job_id?: string | null
          bar_id?: string | null
          created_at?: string | null
          id?: string
          images_generated?: number | null
          items_extracted?: number | null
          menu_links_found?: Json | null
          processing_time_ms?: number | null
          success_rate?: number | null
          website_url?: string
        }
        Relationships: [
          {
            foreignKeyName: "menu_scraping_logs_automation_job_id_fkey"
            columns: ["automation_job_id"]
            isOneToOne: false
            referencedRelation: "automation_jobs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "menu_scraping_logs_bar_id_fkey"
            columns: ["bar_id"]
            isOneToOne: false
            referencedRelation: "bars"
            referencedColumns: ["id"]
          },
        ]
      }
      menus: {
        Row: {
          active: boolean | null
          created_at: string
          id: string
          name: string
          updated_at: string
          vendor_id: string
        }
        Insert: {
          active?: boolean | null
          created_at?: string
          id?: string
          name?: string
          updated_at?: string
          vendor_id: string
        }
        Update: {
          active?: boolean | null
          created_at?: string
          id?: string
          name?: string
          updated_at?: string
          vendor_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "menus_vendor_id_fkey"
            columns: ["vendor_id"]
            isOneToOne: false
            referencedRelation: "vendors"
            referencedColumns: ["id"]
          },
        ]
      }
      messages: {
        Row: {
          content: string
          created_at: string | null
          id: string
          is_read: boolean | null
          receiver_id: string | null
          sender_id: string | null
          trip_id: string | null
        }
        Insert: {
          content: string
          created_at?: string | null
          id?: string
          is_read?: boolean | null
          receiver_id?: string | null
          sender_id?: string | null
          trip_id?: string | null
        }
        Update: {
          content?: string
          created_at?: string | null
          id?: string
          is_read?: boolean | null
          receiver_id?: string | null
          sender_id?: string | null
          trip_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "messages_trip_id_fkey"
            columns: ["trip_id"]
            isOneToOne: false
            referencedRelation: "trips_wizard"
            referencedColumns: ["id"]
          },
        ]
      }
      notification_templates: {
        Row: {
          active: boolean | null
          body: string
          created_at: string | null
          id: string
          name: string
          title: string
          type: string
          updated_at: string | null
          variables: Json | null
        }
        Insert: {
          active?: boolean | null
          body: string
          created_at?: string | null
          id?: string
          name: string
          title: string
          type: string
          updated_at?: string | null
          variables?: Json | null
        }
        Update: {
          active?: boolean | null
          body?: string
          created_at?: string | null
          id?: string
          name?: string
          title?: string
          type?: string
          updated_at?: string | null
          variables?: Json | null
        }
        Relationships: []
      }
      notifications: {
        Row: {
          body: string
          created_at: string | null
          data: Json | null
          id: string
          read_at: string | null
          sent_at: string | null
          status: string | null
          template_id: string | null
          title: string
          type: string
          user_id: string
        }
        Insert: {
          body: string
          created_at?: string | null
          data?: Json | null
          id?: string
          read_at?: string | null
          sent_at?: string | null
          status?: string | null
          template_id?: string | null
          title: string
          type: string
          user_id: string
        }
        Update: {
          body?: string
          created_at?: string | null
          data?: Json | null
          id?: string
          read_at?: string | null
          sent_at?: string | null
          status?: string | null
          template_id?: string | null
          title?: string
          type?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "notifications_template_id_fkey"
            columns: ["template_id"]
            isOneToOne: false
            referencedRelation: "notification_templates"
            referencedColumns: ["id"]
          },
        ]
      }
      order_feedback: {
        Row: {
          ai_service_rating: number | null
          created_at: string | null
          feedback_text: string | null
          id: string
          order_id: string | null
          rating: number | null
        }
        Insert: {
          ai_service_rating?: number | null
          created_at?: string | null
          feedback_text?: string | null
          id?: string
          order_id?: string | null
          rating?: number | null
        }
        Update: {
          ai_service_rating?: number | null
          created_at?: string | null
          feedback_text?: string | null
          id?: string
          order_id?: string | null
          rating?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "order_feedback_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      order_heatmap_data: {
        Row: {
          created_at: string
          id: number
          location: unknown
          order_id: string
        }
        Insert: {
          created_at?: string
          id?: number
          location: unknown
          order_id: string
        }
        Update: {
          created_at?: string
          id?: number
          location?: unknown
          order_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "order_heatmap_data_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      order_items: {
        Row: {
          created_at: string
          id: string
          menu_item_id: string
          order_id: string
          quantity: number
          selected_modifiers: Json | null
          total_price: number
          unit_price: number
        }
        Insert: {
          created_at?: string
          id?: string
          menu_item_id: string
          order_id: string
          quantity?: number
          selected_modifiers?: Json | null
          total_price: number
          unit_price: number
        }
        Update: {
          created_at?: string
          id?: string
          menu_item_id?: string
          order_id?: string
          quantity?: number
          selected_modifiers?: Json | null
          total_price?: number
          unit_price?: number
        }
        Relationships: [
          {
            foreignKeyName: "order_items_menu_item_id_fkey"
            columns: ["menu_item_id"]
            isOneToOne: false
            referencedRelation: "menu_items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_items_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      order_status_history: {
        Row: {
          changed_at: string
          changed_by: string | null
          id: string
          notes: string | null
          order_id: string
          status: string
        }
        Insert: {
          changed_at?: string
          changed_by?: string | null
          id?: string
          notes?: string | null
          order_id: string
          status: string
        }
        Update: {
          changed_at?: string
          changed_by?: string | null
          id?: string
          notes?: string | null
          order_id?: string
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "order_status_history_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      orders: {
        Row: {
          actual_ready_time: string | null
          agreed_to_terms: boolean
          client_id: string | null
          created_at: string
          customer_email: string | null
          customer_name: string | null
          customer_phone: string | null
          estimated_ready_time: string | null
          guest_session_id: string
          id: string
          notes: string | null
          notification_sent: boolean | null
          payment_method: string | null
          payment_status: string | null
          special_instructions: string | null
          status: string | null
          table_identifier: string | null
          table_number: string | null
          total_amount: number
          updated_at: string
          vendor_id: string
          whatsapp_consent: boolean
        }
        Insert: {
          actual_ready_time?: string | null
          agreed_to_terms?: boolean
          client_id?: string | null
          created_at?: string
          customer_email?: string | null
          customer_name?: string | null
          customer_phone?: string | null
          estimated_ready_time?: string | null
          guest_session_id: string
          id?: string
          notes?: string | null
          notification_sent?: boolean | null
          payment_method?: string | null
          payment_status?: string | null
          special_instructions?: string | null
          status?: string | null
          table_identifier?: string | null
          table_number?: string | null
          total_amount: number
          updated_at?: string
          vendor_id: string
          whatsapp_consent?: boolean
        }
        Update: {
          actual_ready_time?: string | null
          agreed_to_terms?: boolean
          client_id?: string | null
          created_at?: string
          customer_email?: string | null
          customer_name?: string | null
          customer_phone?: string | null
          estimated_ready_time?: string | null
          guest_session_id?: string
          id?: string
          notes?: string | null
          notification_sent?: boolean | null
          payment_method?: string | null
          payment_status?: string | null
          special_instructions?: string | null
          status?: string | null
          table_identifier?: string | null
          table_number?: string | null
          total_amount?: number
          updated_at?: string
          vendor_id?: string
          whatsapp_consent?: boolean
        }
        Relationships: [
          {
            foreignKeyName: "orders_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "orders_vendor_id_fkey"
            columns: ["vendor_id"]
            isOneToOne: false
            referencedRelation: "vendors"
            referencedColumns: ["id"]
          },
        ]
      }
      payments: {
        Row: {
          amount: number
          created_at: string
          currency: string | null
          id: string
          order_id: string
          payment_method: string
          processed_at: string | null
          revolut_transaction_id: string | null
          status: string | null
          stripe_session_id: string | null
        }
        Insert: {
          amount: number
          created_at?: string
          currency?: string | null
          id?: string
          order_id: string
          payment_method: string
          processed_at?: string | null
          revolut_transaction_id?: string | null
          status?: string | null
          stripe_session_id?: string | null
        }
        Update: {
          amount?: number
          created_at?: string
          currency?: string | null
          id?: string
          order_id?: string
          payment_method?: string
          processed_at?: string | null
          revolut_transaction_id?: string | null
          status?: string | null
          stripe_session_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "payments_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      performance_logs: {
        Row: {
          created_at: string | null
          endpoint: string
          id: string
          metadata: Json | null
          method: string
          response_time: number
          status_code: number | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          endpoint: string
          id?: string
          metadata?: Json | null
          method: string
          response_time: number
          status_code?: number | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          endpoint?: string
          id?: string
          metadata?: Json | null
          method?: string
          response_time?: number
          status_code?: number | null
          user_id?: string | null
        }
        Relationships: []
      }
      pinecone_embeddings: {
        Row: {
          created_at: string
          embedding_content: string
          id: string
          menu_item_id: string
          vector_id: string
        }
        Insert: {
          created_at?: string
          embedding_content: string
          id?: string
          menu_item_id: string
          vector_id: string
        }
        Update: {
          created_at?: string
          embedding_content?: string
          id?: string
          menu_item_id?: string
          vector_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "pinecone_embeddings_menu_item_id_fkey"
            columns: ["menu_item_id"]
            isOneToOne: false
            referencedRelation: "menu_items"
            referencedColumns: ["id"]
          },
        ]
      }
      points_transactions: {
        Row: {
          created_at: string | null
          description: string
          id: string
          points: number
          reference_id: string | null
          reference_type: string | null
          transaction_type: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          description: string
          id?: string
          points: number
          reference_id?: string | null
          reference_type?: string | null
          transaction_type: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          description?: string
          id?: string
          points?: number
          reference_id?: string | null
          reference_type?: string | null
          transaction_type?: string
          user_id?: string
        }
        Relationships: []
      }
      posters: {
        Row: {
          created_at: string
          file_type: string | null
          file_url: string | null
          id: string
          poster_data: Json
          template_name: string
          vendor_id: string
        }
        Insert: {
          created_at?: string
          file_type?: string | null
          file_url?: string | null
          id?: string
          poster_data: Json
          template_name: string
          vendor_id: string
        }
        Update: {
          created_at?: string
          file_type?: string | null
          file_url?: string | null
          id?: string
          poster_data?: Json
          template_name?: string
          vendor_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "posters_vendor_id_fkey"
            columns: ["vendor_id"]
            isOneToOne: false
            referencedRelation: "vendors"
            referencedColumns: ["id"]
          },
        ]
      }
      privacy_policy: {
        Row: {
          active: boolean | null
          content: string
          created_at: string
          effective_date: string
          id: string
          version: string
        }
        Insert: {
          active?: boolean | null
          content: string
          created_at?: string
          effective_date: string
          id?: string
          version: string
        }
        Update: {
          active?: boolean | null
          content?: string
          created_at?: string
          effective_date?: string
          id?: string
          version?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string
          full_name: string | null
          id: string
          role: string | null
          updated_at: string
          user_id: string
          vendor_id: string | null
        }
        Insert: {
          created_at?: string
          full_name?: string | null
          id?: string
          role?: string | null
          updated_at?: string
          user_id: string
          vendor_id?: string | null
        }
        Update: {
          created_at?: string
          full_name?: string | null
          id?: string
          role?: string | null
          updated_at?: string
          user_id?: string
          vendor_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "profiles_vendor_id_fkey"
            columns: ["vendor_id"]
            isOneToOne: false
            referencedRelation: "vendors"
            referencedColumns: ["id"]
          },
        ]
      }
      promotions: {
        Row: {
          active: boolean | null
          conditions: Json | null
          created_at: string | null
          description: string | null
          discount_type: string | null
          discount_value: number | null
          end_time: string | null
          id: string
          start_time: string | null
          title: string
          vendor_id: string | null
        }
        Insert: {
          active?: boolean | null
          conditions?: Json | null
          created_at?: string | null
          description?: string | null
          discount_type?: string | null
          discount_value?: number | null
          end_time?: string | null
          id?: string
          start_time?: string | null
          title: string
          vendor_id?: string | null
        }
        Update: {
          active?: boolean | null
          conditions?: Json | null
          created_at?: string | null
          description?: string | null
          discount_type?: string | null
          discount_value?: number | null
          end_time?: string | null
          id?: string
          start_time?: string | null
          title?: string
          vendor_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "promotions_vendor_id_fkey"
            columns: ["vendor_id"]
            isOneToOne: false
            referencedRelation: "vendors"
            referencedColumns: ["id"]
          },
        ]
      }
      push_registrations: {
        Row: {
          created_at: string | null
          id: string
          platform: string | null
          token: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          platform?: string | null
          token: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          platform?: string | null
          token?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      qr_analytics: {
        Row: {
          id: number
          ip_address: string | null
          qr_code_id: string
          scanned_at: string
          user_agent: string | null
        }
        Insert: {
          id?: number
          ip_address?: string | null
          qr_code_id: string
          scanned_at?: string
          user_agent?: string | null
        }
        Update: {
          id?: number
          ip_address?: string | null
          qr_code_id?: string
          scanned_at?: string
          user_agent?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "qr_analytics_qr_code_id_fkey"
            columns: ["qr_code_id"]
            isOneToOne: false
            referencedRelation: "qr_codes"
            referencedColumns: ["id"]
          },
        ]
      }
      qr_codes: {
        Row: {
          active: boolean | null
          code_type: string | null
          created_at: string
          generated_url: string
          id: string
          qr_data: string
          scan_count: number | null
          table_number: string | null
          updated_at: string
          vendor_id: string
        }
        Insert: {
          active?: boolean | null
          code_type?: string | null
          created_at?: string
          generated_url: string
          id?: string
          qr_data: string
          scan_count?: number | null
          table_number?: string | null
          updated_at?: string
          vendor_id: string
        }
        Update: {
          active?: boolean | null
          code_type?: string | null
          created_at?: string
          generated_url?: string
          id?: string
          qr_data?: string
          scan_count?: number | null
          table_number?: string | null
          updated_at?: string
          vendor_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "qr_codes_vendor_id_fkey"
            columns: ["vendor_id"]
            isOneToOne: false
            referencedRelation: "vendors"
            referencedColumns: ["id"]
          },
        ]
      }
      qr_scan_logs: {
        Row: {
          created_at: string | null
          id: string
          is_online: boolean | null
          scanned_at: string | null
          table_id: string | null
          user_agent: string | null
          vendor_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          is_online?: boolean | null
          scanned_at?: string | null
          table_id?: string | null
          user_agent?: string | null
          vendor_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          is_online?: boolean | null
          scanned_at?: string | null
          table_id?: string | null
          user_agent?: string | null
          vendor_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "qr_scan_logs_vendor_id_fkey"
            columns: ["vendor_id"]
            isOneToOne: false
            referencedRelation: "vendors"
            referencedColumns: ["id"]
          },
        ]
      }
      rate_limits: {
        Row: {
          blocked_until: string | null
          created_at: string | null
          endpoint: string
          id: string
          requests_count: number | null
          updated_at: string | null
          user_id: string | null
          window_start: string | null
        }
        Insert: {
          blocked_until?: string | null
          created_at?: string | null
          endpoint: string
          id?: string
          requests_count?: number | null
          updated_at?: string | null
          user_id?: string | null
          window_start?: string | null
        }
        Update: {
          blocked_until?: string | null
          created_at?: string | null
          endpoint?: string
          id?: string
          requests_count?: number | null
          updated_at?: string | null
          user_id?: string | null
          window_start?: string | null
        }
        Relationships: []
      }
      referral_tracking: {
        Row: {
          completed_at: string | null
          created_at: string | null
          id: string
          referral_code: string
          referred_id: string
          referred_points_earned: number | null
          referrer_id: string
          referrer_points_earned: number | null
          status: string | null
        }
        Insert: {
          completed_at?: string | null
          created_at?: string | null
          id?: string
          referral_code: string
          referred_id: string
          referred_points_earned?: number | null
          referrer_id: string
          referrer_points_earned?: number | null
          status?: string | null
        }
        Update: {
          completed_at?: string | null
          created_at?: string | null
          id?: string
          referral_code?: string
          referred_id?: string
          referred_points_earned?: number | null
          referrer_id?: string
          referrer_points_earned?: number | null
          status?: string | null
        }
        Relationships: []
      }
      referrals: {
        Row: {
          code: string
          completed_at: string | null
          created_at: string | null
          id: string
          referred_id: string | null
          referrer_id: string | null
          status: string | null
        }
        Insert: {
          code: string
          completed_at?: string | null
          created_at?: string | null
          id?: string
          referred_id?: string | null
          referrer_id?: string | null
          status?: string | null
        }
        Update: {
          code?: string
          completed_at?: string | null
          created_at?: string | null
          id?: string
          referred_id?: string | null
          referrer_id?: string | null
          status?: string | null
        }
        Relationships: []
      }
      rewards_catalog: {
        Row: {
          category: string | null
          created_at: string | null
          description: string | null
          id: string
          is_active: boolean | null
          name: string
          points_cost: number
          stock_quantity: number | null
          updated_at: string | null
          valid_from: string | null
          valid_until: string | null
          value_amount: number | null
        }
        Insert: {
          category?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          points_cost: number
          stock_quantity?: number | null
          updated_at?: string | null
          valid_from?: string | null
          valid_until?: string | null
          value_amount?: number | null
        }
        Update: {
          category?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          points_cost?: number
          stock_quantity?: number | null
          updated_at?: string | null
          valid_from?: string | null
          valid_until?: string | null
          value_amount?: number | null
        }
        Relationships: []
      }
      security_audits: {
        Row: {
          audit_score: number
          audit_type: string
          created_at: string
          id: string
          issues_found: Json | null
          performed_at: string
          recommendations: Json | null
        }
        Insert: {
          audit_score?: number
          audit_type?: string
          created_at?: string
          id?: string
          issues_found?: Json | null
          performed_at?: string
          recommendations?: Json | null
        }
        Update: {
          audit_score?: number
          audit_type?: string
          created_at?: string
          id?: string
          issues_found?: Json | null
          performed_at?: string
          recommendations?: Json | null
        }
        Relationships: []
      }
      smart_categories: {
        Row: {
          created_at: string | null
          display_order: number | null
          id: string
          is_ai_managed: boolean | null
          name: string
          popularity_score: number | null
          time_based_rules: Json | null
          vendor_id: string | null
        }
        Insert: {
          created_at?: string | null
          display_order?: number | null
          id?: string
          is_ai_managed?: boolean | null
          name: string
          popularity_score?: number | null
          time_based_rules?: Json | null
          vendor_id?: string | null
        }
        Update: {
          created_at?: string | null
          display_order?: number | null
          id?: string
          is_ai_managed?: boolean | null
          name?: string
          popularity_score?: number | null
          time_based_rules?: Json | null
          vendor_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "smart_categories_vendor_id_fkey"
            columns: ["vendor_id"]
            isOneToOne: false
            referencedRelation: "vendors"
            referencedColumns: ["id"]
          },
        ]
      }
      support_tickets: {
        Row: {
          assigned_to: string | null
          category: string
          created_at: string
          customer_id: string
          description: string
          id: string
          priority: string
          status: string
          subject: string
          updated_at: string
          vendor_id: string | null
        }
        Insert: {
          assigned_to?: string | null
          category?: string
          created_at?: string
          customer_id: string
          description: string
          id?: string
          priority?: string
          status?: string
          subject: string
          updated_at?: string
          vendor_id?: string | null
        }
        Update: {
          assigned_to?: string | null
          category?: string
          created_at?: string
          customer_id?: string
          description?: string
          id?: string
          priority?: string
          status?: string
          subject?: string
          updated_at?: string
          vendor_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "support_tickets_vendor_id_fkey"
            columns: ["vendor_id"]
            isOneToOne: false
            referencedRelation: "vendors"
            referencedColumns: ["id"]
          },
        ]
      }
      system_logs: {
        Row: {
          component: string
          created_at: string | null
          id: string
          log_type: string
          message: string
          metadata: Json | null
          severity: string | null
        }
        Insert: {
          component: string
          created_at?: string | null
          id?: string
          log_type: string
          message: string
          metadata?: Json | null
          severity?: string | null
        }
        Update: {
          component?: string
          created_at?: string | null
          id?: string
          log_type?: string
          message?: string
          metadata?: Json | null
          severity?: string | null
        }
        Relationships: []
      }
      system_metrics: {
        Row: {
          created_at: string
          id: string
          name: string
          tags: Json | null
          timestamp: string
          value: number
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          tags?: Json | null
          timestamp?: string
          value: number
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          tags?: Json | null
          timestamp?: string
          value?: number
        }
        Relationships: []
      }
      terms_and_conditions: {
        Row: {
          active: boolean | null
          content: string
          created_at: string
          effective_date: string
          id: string
          version: string
        }
        Insert: {
          active?: boolean | null
          content: string
          created_at?: string
          effective_date: string
          id?: string
          version: string
        }
        Update: {
          active?: boolean | null
          content?: string
          created_at?: string
          effective_date?: string
          id?: string
          version?: string
        }
        Relationships: []
      }
      trip_matches_wizard: {
        Row: {
          created_at: string | null
          driver_trip_id: string | null
          id: string
          match_score: number | null
          passenger_trip_id: string | null
          status: string | null
        }
        Insert: {
          created_at?: string | null
          driver_trip_id?: string | null
          id?: string
          match_score?: number | null
          passenger_trip_id?: string | null
          status?: string | null
        }
        Update: {
          created_at?: string | null
          driver_trip_id?: string | null
          id?: string
          match_score?: number | null
          passenger_trip_id?: string | null
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "trip_matches_wizard_driver_trip_id_fkey"
            columns: ["driver_trip_id"]
            isOneToOne: false
            referencedRelation: "trips_wizard"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "trip_matches_wizard_passenger_trip_id_fkey"
            columns: ["passenger_trip_id"]
            isOneToOne: false
            referencedRelation: "trips_wizard"
            referencedColumns: ["id"]
          },
        ]
      }
      trips_wizard: {
        Row: {
          created_at: string | null
          departure_time: string
          destination_location: unknown
          destination_text: string
          distance_km: number | null
          duration_minutes: number | null
          id: string
          origin_location: unknown
          origin_text: string
          price: number | null
          role: string
          seats: number | null
          status: string | null
          updated_at: string | null
          user_id: string | null
          vehicle_type: string | null
        }
        Insert: {
          created_at?: string | null
          departure_time: string
          destination_location: unknown
          destination_text: string
          distance_km?: number | null
          duration_minutes?: number | null
          id?: string
          origin_location: unknown
          origin_text: string
          price?: number | null
          role: string
          seats?: number | null
          status?: string | null
          updated_at?: string | null
          user_id?: string | null
          vehicle_type?: string | null
        }
        Update: {
          created_at?: string | null
          departure_time?: string
          destination_location?: unknown
          destination_text?: string
          distance_km?: number | null
          duration_minutes?: number | null
          id?: string
          origin_location?: unknown
          origin_text?: string
          price?: number | null
          role?: string
          seats?: number | null
          status?: string | null
          updated_at?: string | null
          user_id?: string | null
          vehicle_type?: string | null
        }
        Relationships: []
      }
      user_points: {
        Row: {
          available_points: number | null
          created_at: string | null
          id: string
          total_points: number | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          available_points?: number | null
          created_at?: string | null
          id?: string
          total_points?: number | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          available_points?: number | null
          created_at?: string | null
          id?: string
          total_points?: number | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      user_rewards: {
        Row: {
          code: string | null
          created_at: string | null
          expires_at: string | null
          id: string
          points_spent: number
          reward_id: string
          status: string | null
          used_at: string | null
          user_id: string
        }
        Insert: {
          code?: string | null
          created_at?: string | null
          expires_at?: string | null
          id?: string
          points_spent: number
          reward_id: string
          status?: string | null
          used_at?: string | null
          user_id: string
        }
        Update: {
          code?: string | null
          created_at?: string | null
          expires_at?: string | null
          id?: string
          points_spent?: number
          reward_id?: string
          status?: string | null
          used_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_rewards_reward_id_fkey"
            columns: ["reward_id"]
            isOneToOne: false
            referencedRelation: "rewards_catalog"
            referencedColumns: ["id"]
          },
        ]
      }
      users: {
        Row: {
          auth_user_id: string | null
          country: string | null
          created_at: string | null
          id: string
          language: string | null
          name: string | null
          onboarding_completed: boolean | null
          phone: string | null
          promo_code: string | null
          role: string | null
          updated_at: string | null
        }
        Insert: {
          auth_user_id?: string | null
          country?: string | null
          created_at?: string | null
          id?: string
          language?: string | null
          name?: string | null
          onboarding_completed?: boolean | null
          phone?: string | null
          promo_code?: string | null
          role?: string | null
          updated_at?: string | null
        }
        Update: {
          auth_user_id?: string | null
          country?: string | null
          created_at?: string | null
          id?: string
          language?: string | null
          name?: string | null
          onboarding_completed?: boolean | null
          phone?: string | null
          promo_code?: string | null
          role?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      vendor_alerts: {
        Row: {
          action_required: boolean | null
          alert_type: string
          created_at: string | null
          id: string
          message: string
          metadata: Json | null
          read: boolean | null
          severity: string | null
          title: string
          vendor_id: string | null
        }
        Insert: {
          action_required?: boolean | null
          alert_type: string
          created_at?: string | null
          id?: string
          message: string
          metadata?: Json | null
          read?: boolean | null
          severity?: string | null
          title: string
          vendor_id?: string | null
        }
        Update: {
          action_required?: boolean | null
          alert_type?: string
          created_at?: string | null
          id?: string
          message?: string
          metadata?: Json | null
          read?: boolean | null
          severity?: string | null
          title?: string
          vendor_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "vendor_alerts_vendor_id_fkey"
            columns: ["vendor_id"]
            isOneToOne: false
            referencedRelation: "vendors"
            referencedColumns: ["id"]
          },
        ]
      }
      vendor_applications: {
        Row: {
          applied_at: string | null
          business_email: string
          business_name: string
          business_phone: string | null
          business_type: string | null
          created_at: string | null
          description: string | null
          id: string
          instagram_handle: string | null
          location: string | null
          owner_email: string
          owner_name: string
          owner_phone: string | null
          reviewed_at: string | null
          reviewer_notes: string | null
          status: string | null
          updated_at: string | null
          website_url: string | null
        }
        Insert: {
          applied_at?: string | null
          business_email: string
          business_name: string
          business_phone?: string | null
          business_type?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          instagram_handle?: string | null
          location?: string | null
          owner_email: string
          owner_name: string
          owner_phone?: string | null
          reviewed_at?: string | null
          reviewer_notes?: string | null
          status?: string | null
          updated_at?: string | null
          website_url?: string | null
        }
        Update: {
          applied_at?: string | null
          business_email?: string
          business_name?: string
          business_phone?: string | null
          business_type?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          instagram_handle?: string | null
          location?: string | null
          owner_email?: string
          owner_name?: string
          owner_phone?: string | null
          reviewed_at?: string | null
          reviewer_notes?: string | null
          status?: string | null
          updated_at?: string | null
          website_url?: string | null
        }
        Relationships: []
      }
      vendor_approvals: {
        Row: {
          approved_at: string | null
          approved_by: string | null
          created_at: string | null
          documents: Json | null
          id: string
          notes: string | null
          status: string | null
          updated_at: string | null
          vendor_id: string
        }
        Insert: {
          approved_at?: string | null
          approved_by?: string | null
          created_at?: string | null
          documents?: Json | null
          id?: string
          notes?: string | null
          status?: string | null
          updated_at?: string | null
          vendor_id: string
        }
        Update: {
          approved_at?: string | null
          approved_by?: string | null
          created_at?: string | null
          documents?: Json | null
          id?: string
          notes?: string | null
          status?: string | null
          updated_at?: string | null
          vendor_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "vendor_approvals_vendor_id_fkey"
            columns: ["vendor_id"]
            isOneToOne: false
            referencedRelation: "vendors"
            referencedColumns: ["id"]
          },
        ]
      }
      vendor_bulk_operations: {
        Row: {
          completed_at: string | null
          created_at: string | null
          id: string
          operation_type: string
          parameters: Json | null
          performed_by: string
          results: Json | null
          status: string | null
          vendor_ids: string[]
        }
        Insert: {
          completed_at?: string | null
          created_at?: string | null
          id?: string
          operation_type: string
          parameters?: Json | null
          performed_by: string
          results?: Json | null
          status?: string | null
          vendor_ids: string[]
        }
        Update: {
          completed_at?: string | null
          created_at?: string | null
          id?: string
          operation_type?: string
          parameters?: Json | null
          performed_by?: string
          results?: Json | null
          status?: string | null
          vendor_ids?: string[]
        }
        Relationships: []
      }
      vendor_config: {
        Row: {
          ai_waiter_enabled: boolean | null
          config_data: Json | null
          created_at: string
          dynamic_ui_enabled: boolean | null
          happy_hour_enabled: boolean | null
          happy_hour_end: string | null
          happy_hour_start: string | null
          id: string
          updated_at: string
          vendor_id: string
          voice_search_enabled: boolean | null
          weather_suggestions_enabled: boolean | null
        }
        Insert: {
          ai_waiter_enabled?: boolean | null
          config_data?: Json | null
          created_at?: string
          dynamic_ui_enabled?: boolean | null
          happy_hour_enabled?: boolean | null
          happy_hour_end?: string | null
          happy_hour_start?: string | null
          id?: string
          updated_at?: string
          vendor_id: string
          voice_search_enabled?: boolean | null
          weather_suggestions_enabled?: boolean | null
        }
        Update: {
          ai_waiter_enabled?: boolean | null
          config_data?: Json | null
          created_at?: string
          dynamic_ui_enabled?: boolean | null
          happy_hour_enabled?: boolean | null
          happy_hour_end?: string | null
          happy_hour_start?: string | null
          id?: string
          updated_at?: string
          vendor_id?: string
          voice_search_enabled?: boolean | null
          weather_suggestions_enabled?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "vendor_config_vendor_id_fkey"
            columns: ["vendor_id"]
            isOneToOne: true
            referencedRelation: "vendors"
            referencedColumns: ["id"]
          },
        ]
      }
      vendor_documents: {
        Row: {
          application_id: string | null
          file_url: string
          id: string
          type: string
          uploaded_at: string | null
        }
        Insert: {
          application_id?: string | null
          file_url: string
          id?: string
          type: string
          uploaded_at?: string | null
        }
        Update: {
          application_id?: string | null
          file_url?: string
          id?: string
          type?: string
          uploaded_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "vendor_documents_application_id_fkey"
            columns: ["application_id"]
            isOneToOne: false
            referencedRelation: "vendor_applications"
            referencedColumns: ["id"]
          },
        ]
      }
      vendor_notifications: {
        Row: {
          created_at: string
          id: string
          message: string
          notification_type: string
          order_id: string
          read_at: string | null
          vendor_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          message: string
          notification_type: string
          order_id: string
          read_at?: string | null
          vendor_id: string
        }
        Update: {
          created_at?: string
          id?: string
          message?: string
          notification_type?: string
          order_id?: string
          read_at?: string | null
          vendor_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "vendor_notifications_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "vendor_notifications_vendor_id_fkey"
            columns: ["vendor_id"]
            isOneToOne: false
            referencedRelation: "vendors"
            referencedColumns: ["id"]
          },
        ]
      }
      vendors: {
        Row: {
          active: boolean | null
          business_name: string
          category: string | null
          contact_person: string | null
          created_at: string
          current_wait_time: number | null
          description: string | null
          email: string | null
          id: string
          is_active: boolean
          is_open: boolean | null
          location: string | null
          location_geo: unknown | null
          location_text: string | null
          logo_url: string | null
          name: string
          opening_hours: Json | null
          owner_id: string | null
          phone_number: string | null
          revolut_link: string | null
          revolut_payment_link: string | null
          slug: string
          stripe_account_id: string | null
          stripe_link: string | null
          updated_at: string
          user_id: string | null
          website: string | null
        }
        Insert: {
          active?: boolean | null
          business_name: string
          category?: string | null
          contact_person?: string | null
          created_at?: string
          current_wait_time?: number | null
          description?: string | null
          email?: string | null
          id?: string
          is_active?: boolean
          is_open?: boolean | null
          location?: string | null
          location_geo?: unknown | null
          location_text?: string | null
          logo_url?: string | null
          name: string
          opening_hours?: Json | null
          owner_id?: string | null
          phone_number?: string | null
          revolut_link?: string | null
          revolut_payment_link?: string | null
          slug: string
          stripe_account_id?: string | null
          stripe_link?: string | null
          updated_at?: string
          user_id?: string | null
          website?: string | null
        }
        Update: {
          active?: boolean | null
          business_name?: string
          category?: string | null
          contact_person?: string | null
          created_at?: string
          current_wait_time?: number | null
          description?: string | null
          email?: string | null
          id?: string
          is_active?: boolean
          is_open?: boolean | null
          location?: string | null
          location_geo?: unknown | null
          location_text?: string | null
          logo_url?: string | null
          name?: string
          opening_hours?: Json | null
          owner_id?: string | null
          phone_number?: string | null
          revolut_link?: string | null
          revolut_payment_link?: string | null
          slug?: string
          stripe_account_id?: string | null
          stripe_link?: string | null
          updated_at?: string
          user_id?: string | null
          website?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "vendors_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      verification_checklist: {
        Row: {
          application_id: string | null
          bank_details: boolean | null
          business_license: boolean | null
          created_at: string | null
          food_safety_cert: boolean | null
          id: string
          identity_verified: boolean | null
          insurance_docs: boolean | null
          updated_at: string | null
        }
        Insert: {
          application_id?: string | null
          bank_details?: boolean | null
          business_license?: boolean | null
          created_at?: string | null
          food_safety_cert?: boolean | null
          id?: string
          identity_verified?: boolean | null
          insurance_docs?: boolean | null
          updated_at?: string | null
        }
        Update: {
          application_id?: string | null
          bank_details?: boolean | null
          business_license?: boolean | null
          created_at?: string | null
          food_safety_cert?: boolean | null
          id?: string
          identity_verified?: boolean | null
          insurance_docs?: boolean | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "verification_checklist_application_id_fkey"
            columns: ["application_id"]
            isOneToOne: false
            referencedRelation: "vendor_applications"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      mv_top_locations: {
        Row: {
          location: string | null
          uses: number | null
        }
        Relationships: []
      }
      v_daily_trip_counts: {
        Row: {
          day: string | null
          driver_trips: number | null
          passenger_requests: number | null
          total_trips: number | null
        }
        Relationships: []
      }
      v_driver_ratings: {
        Row: {
          avg_rating: number | null
          driver_id: string | null
          name: string | null
          trips_count: number | null
        }
        Relationships: []
      }
    }
    Functions: {
      calculate_trip_price: {
        Args: { distance_km: number; country_code?: string }
        Returns: number
      }
      cleanup_old_logs: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      expire_old_passenger_requests: {
        Args: { hours?: number }
        Returns: number
      }
      generate_promo_code: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      get_anonymous_uuid: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      get_system_uuid: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      gtrgm_compress: {
        Args: { "": unknown }
        Returns: unknown
      }
      gtrgm_decompress: {
        Args: { "": unknown }
        Returns: unknown
      }
      gtrgm_in: {
        Args: { "": unknown }
        Returns: unknown
      }
      gtrgm_options: {
        Args: { "": unknown }
        Returns: undefined
      }
      gtrgm_out: {
        Args: { "": unknown }
        Returns: unknown
      }
      refresh_all_materialized_views: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      refresh_mv_top_locations: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      set_limit: {
        Args: { "": number }
        Returns: number
      }
      show_limit: {
        Args: Record<PropertyKey, never>
        Returns: number
      }
      show_trgm: {
        Args: { "": string }
        Returns: string[]
      }
    }
    Enums: {
      order_status: "new" | "preparing" | "completed" | "cancelled"
      order_status_enum:
        | "pending"
        | "confirmed"
        | "preparing"
        | "ready"
        | "completed"
        | "cancelled"
      user_role: "client" | "vendor" | "admin"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      order_status: ["new", "preparing", "completed", "cancelled"],
      order_status_enum: [
        "pending",
        "confirmed",
        "preparing",
        "ready",
        "completed",
        "cancelled",
      ],
      user_role: ["client", "vendor", "admin"],
    },
  },
} as const
