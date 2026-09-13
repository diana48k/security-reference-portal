// Schema types synchronized with the application migrations. Regenerate from the
// linked project with: npx supabase gen types typescript --linked > src/types/database.ts
export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

type Relation = { foreignKeyName: string; columns: string[]; isOneToOne: boolean; referencedRelation: string; referencedColumns: string[] }
type Table<Row, Insert = Partial<Row>, Update = Partial<Insert>> = { Row: Row; Insert: Insert; Update: Update; Relationships: Relation[] }

export type Database = {
  public: {
    Tables: {
      profiles: Table<{ id: string; full_name: string | null; role: 'viewer' | 'sales' | 'tech' | 'admin'; is_active: boolean; must_change_password: boolean; created_at: string; updated_at: string }>
      notifications: Table<{ id: string; event_type: 'case_published' | 'case_updated' | 'document_updated' | 'faq_updated'; title: string; message: string | null; href: string; entity_type: string | null; entity_id: string | null; actor_id: string | null; target_roles: string[] | null; created_at: string }>
      notification_reads: Table<{ notification_id: string; user_id: string; read_at: string }>
      user_admin_audit_logs: Table<{ id: number; actor_id: string | null; target_user_id: string; action: string; before_data: Json | null; after_data: Json | null; created_at: string }>
      analytics_visitors: Table<{ visitor_hash: string; first_seen_at: string; last_seen_at: string }>
      analytics_sessions: Table<{ id: string; visitor_hash: string; user_id: string | null; started_at: string; last_seen_at: string; page_view_count: number; download_count: number }>
      analytics_events: Table<{ id: string; session_id: string; visitor_hash: string; user_id: string | null; event_name: 'page_view' | 'document_download' | 'presentation_export' | 'search' | 'favorite_toggle' | 'feedback_submit'; path: string; entity_type: string | null; entity_id: string | null; metadata: Json; occurred_at: string }>
      analytics_daily_rollups: Table<{ day: string; visitors: number; new_visitors: number; sessions: number; page_views: number; downloads: number; presentation_exports: number; active_users: number; updated_at: string }>
    }
    Views: Record<string, never>
    Functions: { increment_case_view: { Args: { p_case_id: string }; Returns: undefined } }
    Enums: Record<string, never>
    CompositeTypes: Record<string, never>
  }
}
