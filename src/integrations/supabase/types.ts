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
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      action_logs: {
        Row: {
          action_type: string
          admin_id: string
          created_at: string
          details: Json | null
          entity_id: string | null
          entity_type: string
          id: string
        }
        Insert: {
          action_type: string
          admin_id: string
          created_at?: string
          details?: Json | null
          entity_id?: string | null
          entity_type: string
          id?: string
        }
        Update: {
          action_type?: string
          admin_id?: string
          created_at?: string
          details?: Json | null
          entity_id?: string | null
          entity_type?: string
          id?: string
        }
        Relationships: []
      }
      admin_notifications: {
        Row: {
          admin_id: string
          created_at: string
          email: string
          id: string
          notify_bookings: boolean | null
          notify_cancellations: boolean | null
          notify_coach_applications: boolean | null
          notify_new_members: boolean | null
          notify_payments: boolean | null
          updated_at: string
        }
        Insert: {
          admin_id: string
          created_at?: string
          email: string
          id?: string
          notify_bookings?: boolean | null
          notify_cancellations?: boolean | null
          notify_coach_applications?: boolean | null
          notify_new_members?: boolean | null
          notify_payments?: boolean | null
          updated_at?: string
        }
        Update: {
          admin_id?: string
          created_at?: string
          email?: string
          id?: string
          notify_bookings?: boolean | null
          notify_cancellations?: boolean | null
          notify_coach_applications?: boolean | null
          notify_new_members?: boolean | null
          notify_payments?: boolean | null
          updated_at?: string
        }
        Relationships: []
      }
      ai_conversations: {
        Row: {
          created_at: string
          id: string
          is_booking_mode: boolean | null
          title: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_booking_mode?: boolean | null
          title?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          is_booking_mode?: boolean | null
          title?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      ai_messages: {
        Row: {
          content: string
          conversation_id: string
          created_at: string
          id: string
          role: string
        }
        Insert: {
          content: string
          conversation_id: string
          created_at?: string
          id?: string
          role: string
        }
        Update: {
          content?: string
          conversation_id?: string
          created_at?: string
          id?: string
          role?: string
        }
        Relationships: [
          {
            foreignKeyName: "ai_messages_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "ai_conversations"
            referencedColumns: ["id"]
          },
        ]
      }
      bookings: {
        Row: {
          amount: number | null
          booking_date: string
          booking_type: Database["public"]["Enums"]["booking_type"]
          cancellation_reason: string | null
          cancelled_at: string | null
          coach_id: string | null
          court_id: string
          created_at: string
          duration_minutes: number | null
          end_time: string
          id: string
          is_prime_time: boolean | null
          notes: string | null
          opponent_name: string | null
          payment_status: Database["public"]["Enums"]["payment_status"] | null
          start_time: string
          status: Database["public"]["Enums"]["booking_status"] | null
          updated_at: string
          user_id: string
        }
        Insert: {
          amount?: number | null
          booking_date: string
          booking_type: Database["public"]["Enums"]["booking_type"]
          cancellation_reason?: string | null
          cancelled_at?: string | null
          coach_id?: string | null
          court_id: string
          created_at?: string
          duration_minutes?: number | null
          end_time: string
          id?: string
          is_prime_time?: boolean | null
          notes?: string | null
          opponent_name?: string | null
          payment_status?: Database["public"]["Enums"]["payment_status"] | null
          start_time: string
          status?: Database["public"]["Enums"]["booking_status"] | null
          updated_at?: string
          user_id: string
        }
        Update: {
          amount?: number | null
          booking_date?: string
          booking_type?: Database["public"]["Enums"]["booking_type"]
          cancellation_reason?: string | null
          cancelled_at?: string | null
          coach_id?: string | null
          court_id?: string
          created_at?: string
          duration_minutes?: number | null
          end_time?: string
          id?: string
          is_prime_time?: boolean | null
          notes?: string | null
          opponent_name?: string | null
          payment_status?: Database["public"]["Enums"]["payment_status"] | null
          start_time?: string
          status?: Database["public"]["Enums"]["booking_status"] | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "bookings_court_id_fkey"
            columns: ["court_id"]
            isOneToOne: false
            referencedRelation: "courts"
            referencedColumns: ["id"]
          },
        ]
      }
      campaigns: {
        Row: {
          created_at: string
          created_by: string | null
          description: string | null
          end_date: string | null
          goal_amount: number
          id: string
          raised_amount: number
          start_date: string
          status: string
          title: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          description?: string | null
          end_date?: string | null
          goal_amount?: number
          id?: string
          raised_amount?: number
          start_date?: string
          status?: string
          title: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          description?: string | null
          end_date?: string | null
          goal_amount?: number
          id?: string
          raised_amount?: number
          start_date?: string
          status?: string
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      coach_availability: {
        Row: {
          coach_id: string
          created_at: string
          date: string | null
          day_of_week: number | null
          end_time: string
          id: string
          is_available: boolean | null
          notes: string | null
          recurring:
            | Database["public"]["Enums"]["availability_recurring"]
            | null
          recurring_until: string | null
          start_time: string
          updated_at: string
        }
        Insert: {
          coach_id: string
          created_at?: string
          date?: string | null
          day_of_week?: number | null
          end_time: string
          id?: string
          is_available?: boolean | null
          notes?: string | null
          recurring?:
            | Database["public"]["Enums"]["availability_recurring"]
            | null
          recurring_until?: string | null
          start_time: string
          updated_at?: string
        }
        Update: {
          coach_id?: string
          created_at?: string
          date?: string | null
          day_of_week?: number | null
          end_time?: string
          id?: string
          is_available?: boolean | null
          notes?: string | null
          recurring?:
            | Database["public"]["Enums"]["availability_recurring"]
            | null
          recurring_until?: string | null
          start_time?: string
          updated_at?: string
        }
        Relationships: []
      }
      coaching_sessions: {
        Row: {
          amount: number | null
          coach_id: string
          court_id: string | null
          created_at: string
          current_students: number | null
          end_time: string
          id: string
          max_students: number | null
          notes: string | null
          payment_status: Database["public"]["Enums"]["payment_status"] | null
          rejection_reason: string | null
          session_date: string
          session_type: Database["public"]["Enums"]["session_type"] | null
          start_time: string
          status: Database["public"]["Enums"]["session_status"] | null
          student_id: string | null
          student_name: string
          student_phone: string
          updated_at: string
        }
        Insert: {
          amount?: number | null
          coach_id: string
          court_id?: string | null
          created_at?: string
          current_students?: number | null
          end_time: string
          id?: string
          max_students?: number | null
          notes?: string | null
          payment_status?: Database["public"]["Enums"]["payment_status"] | null
          rejection_reason?: string | null
          session_date: string
          session_type?: Database["public"]["Enums"]["session_type"] | null
          start_time: string
          status?: Database["public"]["Enums"]["session_status"] | null
          student_id?: string | null
          student_name: string
          student_phone: string
          updated_at?: string
        }
        Update: {
          amount?: number | null
          coach_id?: string
          court_id?: string | null
          created_at?: string
          current_students?: number | null
          end_time?: string
          id?: string
          max_students?: number | null
          notes?: string | null
          payment_status?: Database["public"]["Enums"]["payment_status"] | null
          rejection_reason?: string | null
          session_date?: string
          session_type?: Database["public"]["Enums"]["session_type"] | null
          start_time?: string
          status?: Database["public"]["Enums"]["session_status"] | null
          student_id?: string | null
          student_name?: string
          student_phone?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "coaching_sessions_court_id_fkey"
            columns: ["court_id"]
            isOneToOne: false
            referencedRelation: "courts"
            referencedColumns: ["id"]
          },
        ]
      }
      courts: {
        Row: {
          created_at: string
          description: string | null
          has_floodlights: boolean | null
          id: string
          name: string
          notes: string | null
          status: Database["public"]["Enums"]["court_status"] | null
          surface: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          has_floodlights?: boolean | null
          id?: string
          name: string
          notes?: string | null
          status?: Database["public"]["Enums"]["court_status"] | null
          surface?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          has_floodlights?: boolean | null
          id?: string
          name?: string
          notes?: string | null
          status?: Database["public"]["Enums"]["court_status"] | null
          surface?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      dependents: {
        Row: {
          created_at: string
          date_of_birth: string | null
          id: string
          is_active: boolean | null
          member_id: string
          name: string
          notes: string | null
          relationship: Database["public"]["Enums"]["dependent_relationship"]
          updated_at: string
        }
        Insert: {
          created_at?: string
          date_of_birth?: string | null
          id?: string
          is_active?: boolean | null
          member_id: string
          name: string
          notes?: string | null
          relationship: Database["public"]["Enums"]["dependent_relationship"]
          updated_at?: string
        }
        Update: {
          created_at?: string
          date_of_birth?: string | null
          id?: string
          is_active?: boolean | null
          member_id?: string
          name?: string
          notes?: string | null
          relationship?: Database["public"]["Enums"]["dependent_relationship"]
          updated_at?: string
        }
        Relationships: []
      }
      expense_entries: {
        Row: {
          amount: number
          approved_by: string | null
          category: Database["public"]["Enums"]["expense_category"]
          created_at: string
          description: string
          entry_date: string
          id: string
          notes: string | null
          receipt_url: string | null
          recorded_by: string | null
          updated_at: string
          vendor: string | null
        }
        Insert: {
          amount: number
          approved_by?: string | null
          category: Database["public"]["Enums"]["expense_category"]
          created_at?: string
          description: string
          entry_date: string
          id?: string
          notes?: string | null
          receipt_url?: string | null
          recorded_by?: string | null
          updated_at?: string
          vendor?: string | null
        }
        Update: {
          amount?: number
          approved_by?: string | null
          category?: Database["public"]["Enums"]["expense_category"]
          created_at?: string
          description?: string
          entry_date?: string
          id?: string
          notes?: string | null
          receipt_url?: string | null
          recorded_by?: string | null
          updated_at?: string
          vendor?: string | null
        }
        Relationships: []
      }
      payments: {
        Row: {
          amount: number
          booking_id: string | null
          created_at: string
          description: string | null
          id: string
          momo_number: string | null
          notes: string | null
          payment_date: string | null
          payment_method: string | null
          receipt_number: string | null
          rejection_reason: string | null
          session_id: string | null
          status:
            | Database["public"]["Enums"]["payment_verification_status"]
            | null
          transaction_reference: string | null
          updated_at: string
          user_id: string
          verified_at: string | null
          verified_by: string | null
        }
        Insert: {
          amount: number
          booking_id?: string | null
          created_at?: string
          description?: string | null
          id?: string
          momo_number?: string | null
          notes?: string | null
          payment_date?: string | null
          payment_method?: string | null
          receipt_number?: string | null
          rejection_reason?: string | null
          session_id?: string | null
          status?:
            | Database["public"]["Enums"]["payment_verification_status"]
            | null
          transaction_reference?: string | null
          updated_at?: string
          user_id: string
          verified_at?: string | null
          verified_by?: string | null
        }
        Update: {
          amount?: number
          booking_id?: string | null
          created_at?: string
          description?: string | null
          id?: string
          momo_number?: string | null
          notes?: string | null
          payment_date?: string | null
          payment_method?: string | null
          receipt_number?: string | null
          rejection_reason?: string | null
          session_id?: string | null
          status?:
            | Database["public"]["Enums"]["payment_verification_status"]
            | null
          transaction_reference?: string | null
          updated_at?: string
          user_id?: string
          verified_at?: string | null
          verified_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "payments_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: false
            referencedRelation: "bookings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payments_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "coaching_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      pledges: {
        Row: {
          amount: number
          campaign_id: string | null
          created_at: string
          due_date: string
          id: string
          member_id: string
          member_name: string
          notes: string | null
          paid_amount: number | null
          pledge_date: string
          purpose: string | null
          remaining_amount: number | null
          status: Database["public"]["Enums"]["pledge_status"] | null
          updated_at: string
        }
        Insert: {
          amount: number
          campaign_id?: string | null
          created_at?: string
          due_date: string
          id?: string
          member_id: string
          member_name: string
          notes?: string | null
          paid_amount?: number | null
          pledge_date: string
          purpose?: string | null
          remaining_amount?: number | null
          status?: Database["public"]["Enums"]["pledge_status"] | null
          updated_at?: string
        }
        Update: {
          amount?: number
          campaign_id?: string | null
          created_at?: string
          due_date?: string
          id?: string
          member_id?: string
          member_name?: string
          notes?: string | null
          paid_amount?: number | null
          pledge_date?: string
          purpose?: string | null
          remaining_amount?: number | null
          status?: Database["public"]["Enums"]["pledge_status"] | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "pledges_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "campaigns"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          address: string | null
          approval_status: string | null
          approved_at: string | null
          approved_by: string | null
          avatar_url: string | null
          bio: string | null
          certifications: string[] | null
          created_at: string
          date_of_birth: string | null
          email: string | null
          emergency_contact: string | null
          emergency_phone: string | null
          full_name: string
          hourly_rate: number | null
          id: string
          membership_end: string | null
          membership_start: string | null
          membership_type: Database["public"]["Enums"]["membership_type"] | null
          notes: string | null
          phone: string | null
          specialties: string[] | null
          status: Database["public"]["Enums"]["user_status"] | null
          updated_at: string
          user_id: string
          years_experience: number | null
        }
        Insert: {
          address?: string | null
          approval_status?: string | null
          approved_at?: string | null
          approved_by?: string | null
          avatar_url?: string | null
          bio?: string | null
          certifications?: string[] | null
          created_at?: string
          date_of_birth?: string | null
          email?: string | null
          emergency_contact?: string | null
          emergency_phone?: string | null
          full_name: string
          hourly_rate?: number | null
          id?: string
          membership_end?: string | null
          membership_start?: string | null
          membership_type?:
            | Database["public"]["Enums"]["membership_type"]
            | null
          notes?: string | null
          phone?: string | null
          specialties?: string[] | null
          status?: Database["public"]["Enums"]["user_status"] | null
          updated_at?: string
          user_id: string
          years_experience?: number | null
        }
        Update: {
          address?: string | null
          approval_status?: string | null
          approved_at?: string | null
          approved_by?: string | null
          avatar_url?: string | null
          bio?: string | null
          certifications?: string[] | null
          created_at?: string
          date_of_birth?: string | null
          email?: string | null
          emergency_contact?: string | null
          emergency_phone?: string | null
          full_name?: string
          hourly_rate?: number | null
          id?: string
          membership_end?: string | null
          membership_start?: string | null
          membership_type?:
            | Database["public"]["Enums"]["membership_type"]
            | null
          notes?: string | null
          phone?: string | null
          specialties?: string[] | null
          status?: Database["public"]["Enums"]["user_status"] | null
          updated_at?: string
          user_id?: string
          years_experience?: number | null
        }
        Relationships: []
      }
      revenue_entries: {
        Row: {
          amount: number
          category: Database["public"]["Enums"]["revenue_category"]
          created_at: string
          description: string
          entry_date: string
          id: string
          member_id: string | null
          notes: string | null
          payment_id: string | null
          recorded_by: string | null
          reference_number: string | null
          updated_at: string
        }
        Insert: {
          amount: number
          category: Database["public"]["Enums"]["revenue_category"]
          created_at?: string
          description: string
          entry_date: string
          id?: string
          member_id?: string | null
          notes?: string | null
          payment_id?: string | null
          recorded_by?: string | null
          reference_number?: string | null
          updated_at?: string
        }
        Update: {
          amount?: number
          category?: Database["public"]["Enums"]["revenue_category"]
          created_at?: string
          description?: string
          entry_date?: string
          id?: string
          member_id?: string | null
          notes?: string | null
          payment_id?: string | null
          recorded_by?: string | null
          reference_number?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "revenue_entries_payment_id_fkey"
            columns: ["payment_id"]
            isOneToOne: false
            referencedRelation: "payments"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string
          created_by: string | null
          id: string
          is_super_admin: boolean | null
          role: Database["public"]["Enums"]["app_role"]
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          id?: string
          is_super_admin?: boolean | null
          role?: Database["public"]["Enums"]["app_role"]
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          id?: string
          is_super_admin?: boolean | null
          role?: Database["public"]["Enums"]["app_role"]
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_pending_coaches: {
        Args: never
        Returns: {
          bio: string
          certifications: string[]
          created_at: string
          email: string
          full_name: string
          id: string
          phone: string
          specialties: string[]
          user_id: string
          years_experience: number
        }[]
      }
      get_user_role: {
        Args: { _user_id: string }
        Returns: Database["public"]["Enums"]["app_role"]
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_admin: { Args: { _user_id: string }; Returns: boolean }
      is_coach: { Args: { _user_id: string }; Returns: boolean }
      is_coach_approved: { Args: { _user_id: string }; Returns: boolean }
      is_member: { Args: { _user_id: string }; Returns: boolean }
      is_super_admin: { Args: { _user_id: string }; Returns: boolean }
    }
    Enums: {
      app_role: "admin" | "member" | "coach"
      availability_recurring: "none" | "weekly"
      booking_status:
        | "pending"
        | "confirmed"
        | "cancelled"
        | "completed"
        | "no_show"
      booking_type:
        | "member"
        | "non_member"
        | "coaching"
        | "tournament"
        | "maintenance"
      court_status: "active" | "maintenance" | "closed"
      dependent_relationship:
        | "spouse"
        | "child"
        | "parent"
        | "sibling"
        | "other"
      expense_category:
        | "coach_payments"
        | "maintenance"
        | "utilities"
        | "equipment"
        | "supplies"
        | "salaries"
        | "other"
      membership_type: "monthly" | "annual" | "pay_as_you_play"
      payment_status: "unpaid" | "paid" | "refunded"
      payment_verification_status:
        | "pending"
        | "verified"
        | "rejected"
        | "refunded"
      pledge_status:
        | "pending"
        | "partial"
        | "fulfilled"
        | "overdue"
        | "cancelled"
      revenue_category:
        | "pledges"
        | "membership_fees"
        | "playing_fees"
        | "coaching_fees"
        | "tournament_fees"
        | "other"
      session_status:
        | "pending"
        | "confirmed"
        | "rejected"
        | "completed"
        | "cancelled"
        | "no_show"
      session_type: "private" | "semi_private" | "group" | "clinic"
      user_status: "active" | "inactive" | "suspended"
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
      app_role: ["admin", "member", "coach"],
      availability_recurring: ["none", "weekly"],
      booking_status: [
        "pending",
        "confirmed",
        "cancelled",
        "completed",
        "no_show",
      ],
      booking_type: [
        "member",
        "non_member",
        "coaching",
        "tournament",
        "maintenance",
      ],
      court_status: ["active", "maintenance", "closed"],
      dependent_relationship: ["spouse", "child", "parent", "sibling", "other"],
      expense_category: [
        "coach_payments",
        "maintenance",
        "utilities",
        "equipment",
        "supplies",
        "salaries",
        "other",
      ],
      membership_type: ["monthly", "annual", "pay_as_you_play"],
      payment_status: ["unpaid", "paid", "refunded"],
      payment_verification_status: [
        "pending",
        "verified",
        "rejected",
        "refunded",
      ],
      pledge_status: [
        "pending",
        "partial",
        "fulfilled",
        "overdue",
        "cancelled",
      ],
      revenue_category: [
        "pledges",
        "membership_fees",
        "playing_fees",
        "coaching_fees",
        "tournament_fees",
        "other",
      ],
      session_status: [
        "pending",
        "confirmed",
        "rejected",
        "completed",
        "cancelled",
        "no_show",
      ],
      session_type: ["private", "semi_private", "group", "clinic"],
      user_status: ["active", "inactive", "suspended"],
    },
  },
} as const
