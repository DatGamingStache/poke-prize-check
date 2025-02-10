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
      binder_sets: {
        Row: {
          cards: Json
          created_at: string
          id: string
          name: string
          user_id: string | null
        }
        Insert: {
          cards: Json
          created_at?: string
          id?: string
          name: string
          user_id?: string | null
        }
        Update: {
          cards?: Json
          created_at?: string
          id?: string
          name?: string
          user_id?: string | null
        }
        Relationships: []
      }
      card_images: {
        Row: {
          card_name: string
          card_number: string | null
          created_at: string
          id: string
          image_url: string
          set_code: string | null
        }
        Insert: {
          card_name: string
          card_number?: string | null
          created_at?: string
          id?: string
          image_url: string
          set_code?: string | null
        }
        Update: {
          card_name?: string
          card_number?: string | null
          created_at?: string
          id?: string
          image_url?: string
          set_code?: string | null
        }
        Relationships: []
      }
      card_market_data: {
        Row: {
          card_name: string
          collector_number: string | null
          created_at: string
          id: string
          rarity: string | null
          set_name: string | null
          updated_at: string
        }
        Insert: {
          card_name: string
          collector_number?: string | null
          created_at?: string
          id?: string
          rarity?: string | null
          set_name?: string | null
          updated_at?: string
        }
        Update: {
          card_name?: string
          collector_number?: string | null
          created_at?: string
          id?: string
          rarity?: string | null
          set_name?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      card_prices: {
        Row: {
          card_market_data_id: string | null
          condition: Database["public"]["Enums"]["card_condition"]
          created_at: string
          id: string
          is_foil: boolean | null
          price: number
          source: string
        }
        Insert: {
          card_market_data_id?: string | null
          condition?: Database["public"]["Enums"]["card_condition"]
          created_at?: string
          id?: string
          is_foil?: boolean | null
          price: number
          source: string
        }
        Update: {
          card_market_data_id?: string | null
          condition?: Database["public"]["Enums"]["card_condition"]
          created_at?: string
          id?: string
          is_foil?: boolean | null
          price?: number
          source?: string
        }
        Relationships: [
          {
            foreignKeyName: "card_prices_card_market_data_id_fkey"
            columns: ["card_market_data_id"]
            isOneToOne: false
            referencedRelation: "card_market_data"
            referencedColumns: ["id"]
          },
        ]
      }
      decklists: {
        Row: {
          cards: string
          created_at: string
          id: string
          name: string
          user_id: string
        }
        Insert: {
          cards: string
          created_at?: string
          id?: string
          name: string
          user_id: string
        }
        Update: {
          cards?: string
          created_at?: string
          id?: string
          name?: string
          user_id?: string
        }
        Relationships: []
      }
      game_sessions: {
        Row: {
          actual_prizes: string[]
          correct_guesses: number
          created_at: string
          decklist_id: string
          guessed_cards: string[]
          id: string
          time_spent: number
          total_prizes: number
          user_id: string
        }
        Insert: {
          actual_prizes: string[]
          correct_guesses: number
          created_at?: string
          decklist_id: string
          guessed_cards: string[]
          id?: string
          time_spent: number
          total_prizes?: number
          user_id: string
        }
        Update: {
          actual_prizes?: string[]
          correct_guesses?: number
          created_at?: string
          decklist_id?: string
          guessed_cards?: string[]
          id?: string
          time_spent?: number
          total_prizes?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "game_sessions_decklist_id_fkey"
            columns: ["decklist_id"]
            isOneToOne: false
            referencedRelation: "decklists"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "game_sessions_decklist_id_fkey"
            columns: ["decklist_id"]
            isOneToOne: false
            referencedRelation: "game_session_analytics"
            referencedColumns: ["deck_id"]
          },
        ]
      }
      price_data_uploads: {
        Row: {
          created_at: string
          error_message: string | null
          filename: string
          id: string
          processed_count: number | null
          status: string
          updated_at: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          error_message?: string | null
          filename: string
          id?: string
          processed_count?: number | null
          status?: string
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          error_message?: string | null
          filename?: string
          id?: string
          processed_count?: number | null
          status?: string
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      static_card_prices: {
        Row: {
          card_name: string
          collector_number: string | null
          foil_price: number | null
          id: string
          normal_price: number | null
          price_change: number | null
          price_change_percentage: number | null
          price_date: string | null
          set_name: string | null
          status: string | null
          upload_id: string | null
        }
        Insert: {
          card_name: string
          collector_number?: string | null
          foil_price?: number | null
          id?: string
          normal_price?: number | null
          price_change?: number | null
          price_change_percentage?: number | null
          price_date?: string | null
          set_name?: string | null
          status?: string | null
          upload_id?: string | null
        }
        Update: {
          card_name?: string
          collector_number?: string | null
          foil_price?: number | null
          id?: string
          normal_price?: number | null
          price_change?: number | null
          price_change_percentage?: number | null
          price_date?: string | null
          set_name?: string | null
          status?: string | null
          upload_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "static_card_prices_upload_id_fkey"
            columns: ["upload_id"]
            isOneToOne: false
            referencedRelation: "price_data_uploads"
            referencedColumns: ["id"]
          },
        ]
      }
      user_preferences: {
        Row: {
          birthdate: string | null
          created_at: string
          display_name: string
          division: string | null
          player_id: string | null
          player_name: string | null
          profile_picture_url: string | null
          share_game_history: boolean
          updated_at: string
          user_id: string
        }
        Insert: {
          birthdate?: string | null
          created_at?: string
          display_name: string
          division?: string | null
          player_id?: string | null
          player_name?: string | null
          profile_picture_url?: string | null
          share_game_history?: boolean
          updated_at?: string
          user_id: string
        }
        Update: {
          birthdate?: string | null
          created_at?: string
          display_name?: string
          division?: string | null
          player_id?: string | null
          player_name?: string | null
          profile_picture_url?: string | null
          share_game_history?: boolean
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      card_guess_analytics: {
        Row: {
          actual_card: string | null
          correct_guess: boolean | null
          created_at: string | null
          deck_name: string | null
          decklist_id: string | null
          game_date: string | null
          guessed_card: string | null
          session_id: string | null
          user_id: string | null
        }
        Relationships: [
          {
            foreignKeyName: "game_sessions_decklist_id_fkey"
            columns: ["decklist_id"]
            isOneToOne: false
            referencedRelation: "decklists"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "game_sessions_decklist_id_fkey"
            columns: ["decklist_id"]
            isOneToOne: false
            referencedRelation: "game_session_analytics"
            referencedColumns: ["deck_id"]
          },
        ]
      }
      game_session_analytics: {
        Row: {
          accuracy: number | null
          correct_guesses: number | null
          created_at: string | null
          deck_id: string | null
          deck_name: string | null
          id: string | null
          time_spent: number | null
          total_prizes: number | null
          user_id: string | null
        }
        Relationships: []
      }
      leaderboard_view: {
        Row: {
          average_accuracy: number | null
          total_correct_guesses: number | null
          total_games: number | null
          user_id: string | null
        }
        Relationships: []
      }
      price_comparisons: {
        Row: {
          card_name: string | null
          collector_number: string | null
          local_price: number | null
          price_change: number | null
          price_change_percentage: number | null
          price_date: string | null
          set_name: string | null
          status: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      card_condition: "NM" | "LP" | "MP" | "HP" | "DMG"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type PublicSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
        PublicSchema["Views"])
    ? (PublicSchema["Tables"] &
        PublicSchema["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof PublicSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
    ? PublicSchema["Enums"][PublicEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof PublicSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof PublicSchema["CompositeTypes"]
    ? PublicSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never
