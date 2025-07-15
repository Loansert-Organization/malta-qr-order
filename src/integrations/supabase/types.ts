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
        Relationships: []
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
        Relationships: []
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
        Relationships: []
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
        Relationships: []
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
        Relationships: []
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
          available: boolean | null
          bar_id: string | null
          category: string | null
          created_at: string
          id: string
          image_url: string | null
          is_vegetarian: boolean | null
          menu_id: string
          name: string
          popular: boolean | null
          price: number
          subcategory: string | null
          updated_at: string
        }
        Insert: {
          available?: boolean | null
          bar_id?: string | null
          category?: string | null
          created_at?: string
          id?: string
          image_url?: string | null
          is_vegetarian?: boolean | null
          menu_id: string
          name: string
          popular?: boolean | null
          price: number
          subcategory?: string | null
          updated_at?: string
        }
        Update: {
          available?: boolean | null
          bar_id?: string | null
          category?: string | null
          created_at?: string
          id?: string
          image_url?: string | null
          is_vegetarian?: boolean | null
          menu_id?: string
          name?: string
          popular?: boolean | null
          price?: number
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
            foreignKeyName: "menu_items_menu_id_fkey"
            columns: ["menu_id"]
            isOneToOne: false
            referencedRelation: "menus"
            referencedColumns: ["id"]
          },
        ]
      }
      menus: {
        Row: {
          active: boolean | null
          bar_id: string | null
          created_at: string
          id: string
          name: string
          updated_at: string
        }
        Insert: {
          active?: boolean | null
          bar_id?: string | null
          created_at?: string
          id?: string
          name?: string
          updated_at?: string
        }
        Update: {
          active?: boolean | null
          bar_id?: string | null
          created_at?: string
          id?: string
          name?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "menus_bar_id_fkey"
            columns: ["bar_id"]
            isOneToOne: false
            referencedRelation: "users"
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
        Relationships: []
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
        Relationships: []
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
        Relationships: []
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
        Relationships: []
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
        Relationships: []
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
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
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
      order_status: "new" | "preparing" | "completed" | "served" | "cancelled"
      order_status_enum:
        | "pending"
        | "confirmed"
        | "preparing"
        | "ready"
        | "completed"
        | "cancelled"
      user_role: "client" | "bar" | "admin"
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
      order_status: ["new", "preparing", "completed", "served", "cancelled"],
      order_status_enum: [
        "pending",
        "confirmed",
        "preparing",
        "ready",
        "completed",
        "cancelled",
      ],
      user_role: ["client", "bar", "admin"],
    },
  },
} as const
