export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      assets: {
        Row: {
          alt_text: string
          captions_url: string | null
          created_at: string
          created_by: string | null
          id: string
          kind: string
          storage_path: string
          tenant_id: string
          title: string
          url: string | null
        }
        Insert: {
          alt_text?: string
          captions_url?: string | null
          created_at?: string
          created_by?: string | null
          id?: string
          kind: string
          storage_path: string
          tenant_id: string
          title?: string
          url?: string | null
        }
        Update: {
          alt_text?: string
          captions_url?: string | null
          created_at?: string
          created_by?: string | null
          id?: string
          kind?: string
          storage_path?: string
          tenant_id?: string
          title?: string
          url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "assets_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "assets_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      invitations: {
        Row: {
          accepted_at: string | null
          created_at: string
          email: string
          expires_at: string
          id: string
          invited_by: string | null
          invited_by_name: string | null
          role: string
          status: string
          tenant_id: string
          token_hash: string
        }
        Insert: {
          accepted_at?: string | null
          created_at?: string
          email: string
          expires_at: string
          id?: string
          invited_by?: string | null
          invited_by_name?: string | null
          role: string
          status?: string
          tenant_id: string
          token_hash: string
        }
        Update: {
          accepted_at?: string | null
          created_at?: string
          email?: string
          expires_at?: string
          id?: string
          invited_by?: string | null
          invited_by_name?: string | null
          role?: string
          status?: string
          tenant_id?: string
          token_hash?: string
        }
        Relationships: [
          {
            foreignKeyName: "invitations_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      learning_path_tags: {
        Row: {
          path_id: string
          tag_id: string
        }
        Insert: {
          path_id: string
          tag_id: string
        }
        Update: {
          path_id?: string
          tag_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "learning_path_tags_path_id_fkey"
            columns: ["path_id"]
            isOneToOne: false
            referencedRelation: "learning_paths"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "learning_path_tags_tag_id_fkey"
            columns: ["tag_id"]
            isOneToOne: false
            referencedRelation: "tags"
            referencedColumns: ["id"]
          },
        ]
      }
      learning_paths: {
        Row: {
          created_at: string
          created_by: string | null
          description: string
          duration_amount: number | null
          duration_unit: string | null
          id: string
          language: string
          position: number
          schema_version: number
          sequencing: string
          status: string
          tenant_id: string
          thumbnail_asset_id: string | null
          thumbnail_kind: string | null
          thumbnail_value: string | null
          title: string
          trainer_id: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          description?: string
          duration_amount?: number | null
          duration_unit?: string | null
          id?: string
          language?: string
          position?: number
          schema_version?: number
          sequencing?: string
          status?: string
          tenant_id: string
          thumbnail_asset_id?: string | null
          thumbnail_kind?: string | null
          thumbnail_value?: string | null
          title: string
          trainer_id?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          description?: string
          duration_amount?: number | null
          duration_unit?: string | null
          id?: string
          language?: string
          position?: number
          schema_version?: number
          sequencing?: string
          status?: string
          tenant_id?: string
          thumbnail_asset_id?: string | null
          thumbnail_kind?: string | null
          thumbnail_value?: string | null
          title?: string
          trainer_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "learning_paths_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "learning_paths_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "learning_paths_thumbnail_asset_id_fkey"
            columns: ["thumbnail_asset_id"]
            isOneToOne: false
            referencedRelation: "assets"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "learning_paths_trainer_id_fkey"
            columns: ["trainer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      lesson_progress: {
        Row: {
          completed_at: string | null
          id: string
          lesson_id: string
          status: string
          tenant_id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          completed_at?: string | null
          id?: string
          lesson_id: string
          status?: string
          tenant_id: string
          updated_at?: string
          user_id: string
        }
        Update: {
          completed_at?: string | null
          id?: string
          lesson_id?: string
          status?: string
          tenant_id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "lesson_progress_lesson_id_fkey"
            columns: ["lesson_id"]
            isOneToOne: false
            referencedRelation: "lessons"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lesson_progress_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lesson_progress_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      lesson_versions: {
        Row: {
          blocks: Json
          created_at: string
          created_by: string | null
          id: string
          label: string | null
          learning_objectives: Json
          lesson_id: string
          schema_version: number
          tenant_id: string
          title: string
        }
        Insert: {
          blocks?: Json
          created_at?: string
          created_by?: string | null
          id?: string
          label?: string | null
          learning_objectives?: Json
          lesson_id: string
          schema_version?: number
          tenant_id: string
          title?: string
        }
        Update: {
          blocks?: Json
          created_at?: string
          created_by?: string | null
          id?: string
          label?: string | null
          learning_objectives?: Json
          lesson_id?: string
          schema_version?: number
          tenant_id?: string
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "lesson_versions_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lesson_versions_lesson_id_fkey"
            columns: ["lesson_id"]
            isOneToOne: false
            referencedRelation: "lessons"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lesson_versions_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      lessons: {
        Row: {
          blocks: Json
          created_at: string
          created_by: string | null
          id: string
          is_template: boolean
          kind: string
          learning_objectives: Json
          module_id: string | null
          position: number
          requires_lesson_id: string | null
          schema_version: number
          status: string
          tenant_id: string
          title: string
          updated_at: string
        }
        Insert: {
          blocks?: Json
          created_at?: string
          created_by?: string | null
          id?: string
          is_template?: boolean
          kind?: string
          learning_objectives?: Json
          module_id?: string | null
          position?: number
          requires_lesson_id?: string | null
          schema_version?: number
          status?: string
          tenant_id: string
          title?: string
          updated_at?: string
        }
        Update: {
          blocks?: Json
          created_at?: string
          created_by?: string | null
          id?: string
          is_template?: boolean
          kind?: string
          learning_objectives?: Json
          module_id?: string | null
          position?: number
          requires_lesson_id?: string | null
          schema_version?: number
          status?: string
          tenant_id?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "lessons_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lessons_module_id_fkey"
            columns: ["module_id"]
            isOneToOne: false
            referencedRelation: "modules"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lessons_requires_lesson_id_fkey"
            columns: ["requires_lesson_id"]
            isOneToOne: false
            referencedRelation: "lessons"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lessons_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      modules: {
        Row: {
          category: string
          cover_url: string | null
          course_id: string | null
          created_at: string
          created_by: string | null
          id: string
          position: number
          summary: string
          tenant_id: string
          title: string
          updated_at: string
        }
        Insert: {
          category?: string
          cover_url?: string | null
          course_id?: string | null
          created_at?: string
          created_by?: string | null
          id?: string
          position?: number
          summary?: string
          tenant_id: string
          title: string
          updated_at?: string
        }
        Update: {
          category?: string
          cover_url?: string | null
          course_id?: string | null
          created_at?: string
          created_by?: string | null
          id?: string
          position?: number
          summary?: string
          tenant_id?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "modules_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "modules_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      path_assignments: {
        Row: {
          assigned_at: string
          assigned_by: string | null
          audience_kind: string
          due_at: string | null
          group_id: string | null
          id: string
          path_id: string
          tenant_id: string
          user_id: string | null
        }
        Insert: {
          assigned_at?: string
          assigned_by?: string | null
          audience_kind: string
          due_at?: string | null
          group_id?: string | null
          id?: string
          path_id: string
          tenant_id: string
          user_id?: string | null
        }
        Update: {
          assigned_at?: string
          assigned_by?: string | null
          audience_kind?: string
          due_at?: string | null
          group_id?: string | null
          id?: string
          path_id?: string
          tenant_id?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "path_assignments_assigned_by_fkey"
            columns: ["assigned_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "path_assignments_path_id_fkey"
            columns: ["path_id"]
            isOneToOne: false
            referencedRelation: "learning_paths"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "path_assignments_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "path_assignments_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      path_items: {
        Row: {
          id: string
          item_kind: string
          lesson_id: string | null
          module_id: string | null
          path_id: string
          position: number
          stage_id: string | null
          tenant_id: string
        }
        Insert: {
          id?: string
          item_kind: string
          lesson_id?: string | null
          module_id?: string | null
          path_id: string
          position?: number
          stage_id?: string | null
          tenant_id: string
        }
        Update: {
          id?: string
          item_kind?: string
          lesson_id?: string | null
          module_id?: string | null
          path_id?: string
          position?: number
          stage_id?: string | null
          tenant_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "path_items_lesson_id_fkey"
            columns: ["lesson_id"]
            isOneToOne: false
            referencedRelation: "lessons"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "path_items_module_id_fkey"
            columns: ["module_id"]
            isOneToOne: false
            referencedRelation: "modules"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "path_items_path_id_fkey"
            columns: ["path_id"]
            isOneToOne: false
            referencedRelation: "learning_paths"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "path_items_stage_id_fkey"
            columns: ["stage_id"]
            isOneToOne: false
            referencedRelation: "stages"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "path_items_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string
          email: string
          full_name: string | null
          id: string
          role: string
          tenant_id: string | null
        }
        Insert: {
          created_at?: string
          email: string
          full_name?: string | null
          id: string
          role: string
          tenant_id?: string | null
        }
        Update: {
          created_at?: string
          email?: string
          full_name?: string | null
          id?: string
          role?: string
          tenant_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "profiles_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      stages: {
        Row: {
          id: string
          path_id: string
          position: number
          tenant_id: string
          title: string
        }
        Insert: {
          id?: string
          path_id: string
          position?: number
          tenant_id: string
          title?: string
        }
        Update: {
          id?: string
          path_id?: string
          position?: number
          tenant_id?: string
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "stages_path_id_fkey"
            columns: ["path_id"]
            isOneToOne: false
            referencedRelation: "learning_paths"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "stages_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      tags: {
        Row: {
          color: string | null
          created_at: string
          id: string
          label: string
          tenant_id: string
        }
        Insert: {
          color?: string | null
          created_at?: string
          id?: string
          label: string
          tenant_id: string
        }
        Update: {
          color?: string | null
          created_at?: string
          id?: string
          label?: string
          tenant_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "tags_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      tenants: {
        Row: {
          created_at: string
          id: string
          learner_count: number
          name: string
          region: string
          status: string
        }
        Insert: {
          created_at?: string
          id: string
          learner_count?: number
          name: string
          region: string
          status?: string
        }
        Update: {
          created_at?: string
          id?: string
          learner_count?: number
          name?: string
          region?: string
          status?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      current_tenant_id: { Args: never; Returns: string }
    }
    Enums: {
      [_ in never]: never
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
    Enums: {},
  },
} as const
