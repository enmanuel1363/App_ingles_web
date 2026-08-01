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
      ad_reward_log: {
        Row: {
          created_at: string
          id: string
          id_student_profile: string
          reward_type: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          id_student_profile: string
          reward_type?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          id_student_profile?: string
          reward_type?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "ad_reward_log_id_student_profile_fkey"
            columns: ["id_student_profile"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      class: {
        Row: {
          created_at: string
          id: string
          id_unit: string
          name: string
          order_index: number
          type: Database["public"]["Enums"]["class_type"]
          updated_at: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          id_unit: string
          name: string
          order_index: number
          type?: Database["public"]["Enums"]["class_type"]
          updated_at?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          id_unit?: string
          name?: string
          order_index?: number
          type?: Database["public"]["Enums"]["class_type"]
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "class_id_unit_fkey"
            columns: ["id_unit"]
            isOneToOne: false
            referencedRelation: "unit"
            referencedColumns: ["id"]
          },
        ]
      }
      class_student: {
        Row: {
          created_at: string
          id: string
          id_class: string
          id_student_profile: string
          is_completed: boolean | null
          stars: number
          updated_at: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          id_class: string
          id_student_profile: string
          is_completed?: boolean | null
          stars: number
          updated_at?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          id_class?: string
          id_student_profile?: string
          is_completed?: boolean | null
          stars?: number
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "class_student_id_class_fkey"
            columns: ["id_class"]
            isOneToOne: false
            referencedRelation: "class"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "class_student_id_student_profile_fkey"
            columns: ["id_student_profile"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      course: {
        Row: {
          created_at: string
          description: string | null
          id: string
          id_grade: string
          name: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          id_grade: string
          name: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          id_grade?: string
          name?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "course_id_grade_fkey"
            columns: ["id_grade"]
            isOneToOne: false
            referencedRelation: "grade"
            referencedColumns: ["id"]
          },
        ]
      }
      course_student: {
        Row: {
          created_at: string
          has_complete: boolean | null
          id: string
          id_course: string
          id_student_profile: string
          overall_progress_percentage: number | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string
          has_complete?: boolean | null
          id?: string
          id_course: string
          id_student_profile: string
          overall_progress_percentage?: number | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string
          has_complete?: boolean | null
          id?: string
          id_course?: string
          id_student_profile?: string
          overall_progress_percentage?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "course_student_id_course_fkey"
            columns: ["id_course"]
            isOneToOne: false
            referencedRelation: "course"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "course_student_id_student_profile_fkey"
            columns: ["id_student_profile"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      daily_activity: {
        Row: {
          activity_date: string | null
          id: string
          id_student_profile: string
          xp_earned: number
        }
        Insert: {
          activity_date?: string | null
          id?: string
          id_student_profile: string
          xp_earned: number
        }
        Update: {
          activity_date?: string | null
          id?: string
          id_student_profile?: string
          xp_earned?: number
        }
        Relationships: [
          {
            foreignKeyName: "daily_activity_id_student_profile_fkey"
            columns: ["id_student_profile"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      exercise: {
        Row: {
          content: Json
          created_at: string
          description: string
          id: string
          id_class: string
          name: string
          order_index: number
          points_reward: number | null
          type: Database["public"]["Enums"]["lesson_type"]
          updated_at: string | null
        }
        Insert: {
          content: Json
          created_at?: string
          description?: string
          id?: string
          id_class: string
          name: string
          order_index: number
          points_reward?: number | null
          type?: Database["public"]["Enums"]["lesson_type"]
          updated_at?: string | null
        }
        Update: {
          content?: Json
          created_at?: string
          description?: string
          id?: string
          id_class?: string
          name?: string
          order_index?: number
          points_reward?: number | null
          type?: Database["public"]["Enums"]["lesson_type"]
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "exercise_id_class_fkey"
            columns: ["id_class"]
            isOneToOne: false
            referencedRelation: "class"
            referencedColumns: ["id"]
          },
        ]
      }
      exercise_student: {
        Row: {
          attempts: number | null
          created_at: string
          id: string
          id_exercise: string
          id_student_profile: string
          is_complete: boolean | null
          score: number
          updated_at: string | null
        }
        Insert: {
          attempts?: number | null
          created_at?: string
          id?: string
          id_exercise: string
          id_student_profile: string
          is_complete?: boolean | null
          score: number
          updated_at?: string | null
        }
        Update: {
          attempts?: number | null
          created_at?: string
          id?: string
          id_exercise?: string
          id_student_profile?: string
          is_complete?: boolean | null
          score?: number
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "exercise_student_id_exercise_fkey"
            columns: ["id_exercise"]
            isOneToOne: false
            referencedRelation: "exercise"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "exercise_student_id_student_profile_fkey"
            columns: ["id_student_profile"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      goal_student: {
        Row: {
          created_at: string
          id: string
          id_goal: string
          id_student_profile: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          id_goal: string
          id_student_profile: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          id_goal?: string
          id_student_profile?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "goal_student_id_goal_fkey"
            columns: ["id_goal"]
            isOneToOne: false
            referencedRelation: "goals"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "goal_student_id_student_profile_fkey"
            columns: ["id_student_profile"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      goals: {
        Row: {
          created_at: string
          description: string | null
          id: string
          name: string
          type: Database["public"]["Enums"]["goal_type"]
          updated_at: string
          validation: Json
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          name: string
          type: Database["public"]["Enums"]["goal_type"]
          updated_at?: string
          validation: Json
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          name?: string
          type?: Database["public"]["Enums"]["goal_type"]
          updated_at?: string
          validation?: Json
        }
        Relationships: []
      }
      grade: {
        Row: {
          abbreviation: string
          created_at: string
          id: string
          name: string
          updated_at: string
        }
        Insert: {
          abbreviation: string
          created_at?: string
          id?: string
          name: string
          updated_at?: string
        }
        Update: {
          abbreviation?: string
          created_at?: string
          id?: string
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
      grade_student: {
        Row: {
          created_at: string
          enrollment_date: string | null
          id: string
          id_grade: string
          id_student_profile: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string
          enrollment_date?: string | null
          id?: string
          id_grade: string
          id_student_profile: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string
          enrollment_date?: string | null
          id?: string
          id_grade?: string
          id_student_profile?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "grade_student_id_grade_fkey"
            columns: ["id_grade"]
            isOneToOne: false
            referencedRelation: "grade"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "grade_student_id_student_profile_fkey"
            columns: ["id_student_profile"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      plan_student: {
        Row: {
          created_at: string
          current_period_end: string
          external_suscription_id: string
          id: string
          id_plan: string
          id_student_profile: string
          status: Database["public"]["Enums"]["plan_status"] | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string
          current_period_end: string
          external_suscription_id: string
          id?: string
          id_plan: string
          id_student_profile: string
          status?: Database["public"]["Enums"]["plan_status"] | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string
          current_period_end?: string
          external_suscription_id?: string
          id?: string
          id_plan?: string
          id_student_profile?: string
          status?: Database["public"]["Enums"]["plan_status"] | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "plan_student_id_plan_fkey"
            columns: ["id_plan"]
            isOneToOne: false
            referencedRelation: "plans"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "plan_student_id_student_profile_fkey"
            columns: ["id_student_profile"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      plans: {
        Row: {
          created_at: string
          description: string
          features: Json
          id: string
          name: string
          price: number
          updated_at: string | null
        }
        Insert: {
          created_at?: string
          description: string
          features: Json
          id?: string
          name: string
          price: number
          updated_at?: string | null
        }
        Update: {
          created_at?: string
          description?: string
          features?: Json
          id?: string
          name?: string
          price?: number
          updated_at?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          current_hearts: number
          edad: number | null
          email: string
          full_name: string
          id: string
          is_premium: boolean
          last_heart_loss: string | null
          last_name: string
          max_hearts: number
          name: string
          role: Database["public"]["Enums"]["roles"] | null
          total_exp: number
          updated_at: string | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          current_hearts?: number
          edad?: number | null
          email: string
          full_name: string
          id: string
          is_premium?: boolean
          last_heart_loss?: string | null
          last_name: string
          max_hearts?: number
          name: string
          role?: Database["public"]["Enums"]["roles"] | null
          total_exp?: number
          updated_at?: string | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          current_hearts?: number
          edad?: number | null
          email?: string
          full_name?: string
          id?: string
          is_premium?: boolean
          last_heart_loss?: string | null
          last_name?: string
          max_hearts?: number
          name?: string
          role?: Database["public"]["Enums"]["roles"] | null
          total_exp?: number
          updated_at?: string | null
        }
        Relationships: []
      }
      resource: {
        Row: {
          created_at: string
          id: string
          id_exercise: string
          type: Database["public"]["Enums"]["resource_type"] | null
          updated_at: string | null
          url: string
        }
        Insert: {
          created_at?: string
          id?: string
          id_exercise: string
          type?: Database["public"]["Enums"]["resource_type"] | null
          updated_at?: string | null
          url: string
        }
        Update: {
          created_at?: string
          id?: string
          id_exercise?: string
          type?: Database["public"]["Enums"]["resource_type"] | null
          updated_at?: string | null
          url?: string
        }
        Relationships: [
          {
            foreignKeyName: "resource_id_exercise_fkey"
            columns: ["id_exercise"]
            isOneToOne: false
            referencedRelation: "exercise"
            referencedColumns: ["id"]
          },
        ]
      }
      reward: {
        Row: {
          created_at: string
          id: string
          id_goal: string | null
          name: string
          type: Database["public"]["Enums"]["reward_type"]
          updated_at: string | null
          url: string
        }
        Insert: {
          created_at?: string
          id?: string
          id_goal?: string | null
          name: string
          type?: Database["public"]["Enums"]["reward_type"]
          updated_at?: string | null
          url: string
        }
        Update: {
          created_at?: string
          id?: string
          id_goal?: string | null
          name?: string
          type?: Database["public"]["Enums"]["reward_type"]
          updated_at?: string | null
          url?: string
        }
        Relationships: [
          {
            foreignKeyName: "reward_id_goal_fkey"
            columns: ["id_goal"]
            isOneToOne: true
            referencedRelation: "goals"
            referencedColumns: ["id"]
          },
        ]
      }
      reward_student: {
        Row: {
          created_at: string
          id: string
          id_reward: string
          id_student_profile: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          id_reward: string
          id_student_profile: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          id_reward?: string
          id_student_profile?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "reward_student_id_reward_fkey"
            columns: ["id_reward"]
            isOneToOne: false
            referencedRelation: "reward"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reward_student_id_student_profile_fkey"
            columns: ["id_student_profile"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      streak_student: {
        Row: {
          created_at: string
          current_streak: number | null
          id: string
          id_student_profile: string
          last_activity_date: string | null
          longest_streak: number | null
        }
        Insert: {
          created_at?: string
          current_streak?: number | null
          id?: string
          id_student_profile: string
          last_activity_date?: string | null
          longest_streak?: number | null
        }
        Update: {
          created_at?: string
          current_streak?: number | null
          id?: string
          id_student_profile?: string
          last_activity_date?: string | null
          longest_streak?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "streak_student_id_student_profile_fkey"
            columns: ["id_student_profile"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      unit: {
        Row: {
          created_at: string
          difficulty: Database["public"]["Enums"]["difficulty_levels"]
          id: string
          id_course: string
          name: string
          order_index: number
          updated_at: string | null
        }
        Insert: {
          created_at?: string
          difficulty?: Database["public"]["Enums"]["difficulty_levels"]
          id?: string
          id_course: string
          name: string
          order_index: number
          updated_at?: string | null
        }
        Update: {
          created_at?: string
          difficulty?: Database["public"]["Enums"]["difficulty_levels"]
          id?: string
          id_course?: string
          name?: string
          order_index?: number
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "section_id_course_fkey"
            columns: ["id_course"]
            isOneToOne: false
            referencedRelation: "course"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      delete_class: {
        Args: { class_id: string; unit_id: string }
        Returns: undefined
      }
      update_class_and_order: {
        Args: {
          p_class_id: string
          p_name: string
          p_type: string
          p_new_order_index: number
        }
        Returns: undefined
      }
    }
    Enums: {
      class_type: "mix" | "write" | "read" | "speak"
      difficulty_levels: "low" | "medium" | "hard"
      goal_type:
        | "points"
        | "lesson"
        | "time"
        | "classes"
        | "collection"
        | "streak"
        | "approvals"
        | "ranking"
        | "hearts"
      lesson_type:
        | "speak"
        | "write_word"
        | "image_gallery"
        | "reading_quiz"
        | "video_session"
        | "type_answer"
        | "complete_word"
        | "say_word"
        | "audio_session"
        | "match_names"
        | "overview_session"
      plan_status: "active" | "canceled" | "past_due"
      resource_type: "video" | "audio"
      reward_type: "gif" | "sticker"
      roles: "student" | "admin"
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
      class_type: ["mix", "write", "read", "speak"],
      difficulty_levels: ["low", "medium", "hard"],
      goal_type: [
        "points",
        "lesson",
        "time",
        "classes",
        "collection",
        "streak",
        "approvals",
        "ranking",
        "hearts",
      ],
      lesson_type: [
        "speak",
        "write_word",
        "image_gallery",
        "reading_quiz",
        "video_session",
        "type_answer",
        "complete_word",
        "say_word",
        "audio_session",
        "match_names",
        "overview_session",
      ],
      plan_status: ["active", "canceled", "past_due"],
      resource_type: ["video", "audio"],
      reward_type: ["gif", "sticker"],
      roles: ["student", "admin"],
    },
  },
} as const
