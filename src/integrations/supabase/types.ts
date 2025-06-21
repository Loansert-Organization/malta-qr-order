export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      ai_waiter_logs: {
        Row: {
          content: string
          created_at: string
          guest_session_id: string
          id: string
          message_type: string
          suggestions: Json | null
          vendor_id: string
        }
        Insert: {
          content: string
          created_at?: string
          guest_session_id: string
          id?: string
          message_type: string
          suggestions?: Json | null
          vendor_id: string
        }
        Update: {
          content?: string
          created_at?: string
          guest_session_id?: string
          id?: string
          message_type?: string
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
      menu_items: {
        Row: {
          available: boolean | null
          category: string | null
          created_at: string
          description: string | null
          id: string
          image_url: string | null
          menu_id: string
          name: string
          popular: boolean | null
          prep_time: string | null
          price: number
          updated_at: string
        }
        Insert: {
          available?: boolean | null
          category?: string | null
          created_at?: string
          description?: string | null
          id?: string
          image_url?: string | null
          menu_id: string
          name: string
          popular?: boolean | null
          prep_time?: string | null
          price: number
          updated_at?: string
        }
        Update: {
          available?: boolean | null
          category?: string | null
          created_at?: string
          description?: string | null
          id?: string
          image_url?: string | null
          menu_id?: string
          name?: string
          popular?: boolean | null
          prep_time?: string | null
          price?: number
          updated_at?: string
        }
        Relationships: [
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
      order_items: {
        Row: {
          created_at: string
          id: string
          menu_item_id: string
          order_id: string
          quantity: number
          total_price: number
          unit_price: number
        }
        Insert: {
          created_at?: string
          id?: string
          menu_item_id: string
          order_id: string
          quantity?: number
          total_price: number
          unit_price: number
        }
        Update: {
          created_at?: string
          id?: string
          menu_item_id?: string
          order_id?: string
          quantity?: number
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
      orders: {
        Row: {
          created_at: string
          guest_session_id: string
          id: string
          payment_method: string | null
          payment_status: string | null
          status: string | null
          total_amount: number
          updated_at: string
          vendor_id: string
        }
        Insert: {
          created_at?: string
          guest_session_id: string
          id?: string
          payment_method?: string | null
          payment_status?: string | null
          status?: string | null
          total_amount: number
          updated_at?: string
          vendor_id: string
        }
        Update: {
          created_at?: string
          guest_session_id?: string
          id?: string
          payment_method?: string | null
          payment_status?: string | null
          status?: string | null
          total_amount?: number
          updated_at?: string
          vendor_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "orders_vendor_id_fkey"
            columns: ["vendor_id"]
            isOneToOne: false
            referencedRelation: "vendors"
            referencedColumns: ["id"]
          },
        ]
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
      vendors: {
        Row: {
          active: boolean | null
          created_at: string
          description: string | null
          id: string
          location: string | null
          logo_url: string | null
          name: string
          revolut_link: string | null
          slug: string
          stripe_link: string | null
          updated_at: string
        }
        Insert: {
          active?: boolean | null
          created_at?: string
          description?: string | null
          id?: string
          location?: string | null
          logo_url?: string | null
          name: string
          revolut_link?: string | null
          slug: string
          stripe_link?: string | null
          updated_at?: string
        }
        Update: {
          active?: boolean | null
          created_at?: string
          description?: string | null
          id?: string
          location?: string | null
          logo_url?: string | null
          name?: string
          revolut_link?: string | null
          slug?: string
          stripe_link?: string | null
          updated_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
