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
