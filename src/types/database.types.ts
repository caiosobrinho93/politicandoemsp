/* eslint-disable */
/**
 * Tipos do banco de dados — ARQUIVO GERADO AUTOMATICAMENTE.
 *
 * Não edite à mão: altere a migração em `supabase/migrations` e rode
 * `npm run db:types` (scripts/db/generate-types.mjs) para regerar.
 * O formato é o mesmo produzido por `supabase gen types typescript`.
 */

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
      audit_logs: {
        Row: {
          id: string
          actor_id: string | null
          actor_role: Database["public"]["Enums"]["user_role"] | null
          action: Database["public"]["Enums"]["audit_action"]
          entity_type: string
          entity_id: string | null
          previous_value: Json | null
          new_value: Json | null
          reason: string | null
          created_at: string
        }

        Insert: {
          id?: string
          actor_id?: string | null
          actor_role?: Database["public"]["Enums"]["user_role"] | null
          action: Database["public"]["Enums"]["audit_action"]
          entity_type: string
          entity_id?: string | null
          previous_value?: Json | null
          new_value?: Json | null
          reason?: string | null
          created_at?: string
        }

        Update: {
          id?: string
          actor_id?: string | null
          actor_role?: Database["public"]["Enums"]["user_role"] | null
          action?: Database["public"]["Enums"]["audit_action"]
          entity_type?: string
          entity_id?: string | null
          previous_value?: Json | null
          new_value?: Json | null
          reason?: string | null
          created_at?: string
        }

        Relationships: []
      }
      comments: {
        Row: {
          id: string
          politician_id: string
          author_id: string
          body: string
          evidence_kind: Database["public"]["Enums"]["evidence_kind"]
          moderation_status: Database["public"]["Enums"]["moderation_status"]
          moderated_by: string | null
          moderated_at: string | null
          created_at: string
          updated_at: string
        }

        Insert: {
          id?: string
          politician_id: string
          author_id: string
          body: string
          evidence_kind?: Database["public"]["Enums"]["evidence_kind"]
          moderation_status?: Database["public"]["Enums"]["moderation_status"]
          moderated_by?: string | null
          moderated_at?: string | null
          created_at?: string
          updated_at?: string
        }

        Update: {
          id?: string
          politician_id?: string
          author_id?: string
          body?: string
          evidence_kind?: Database["public"]["Enums"]["evidence_kind"]
          moderation_status?: Database["public"]["Enums"]["moderation_status"]
          moderated_by?: string | null
          moderated_at?: string | null
          created_at?: string
          updated_at?: string
        }

        Relationships: [
          {
            foreignKeyName: "comments_author_id_fkey"
            columns: ["author_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "comments_moderated_by_fkey"
            columns: ["moderated_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "comments_politician_id_fkey"
            columns: ["politician_id"]
            isOneToOne: false
            referencedRelation: "politicians"
            referencedColumns: ["id"]
          },
        ]
      }
      correction_suggestions: {
        Row: {
          id: string
          entity_type: Database["public"]["Enums"]["correction_entity_type"]
          entity_id: string
          field: string
          current_value: string | null
          suggested_value: string
          source_url: string
          submitted_by: string | null
          status: Database["public"]["Enums"]["moderation_status"]
          reviewed_by: string | null
          reviewed_at: string | null
          review_note: string | null
          created_at: string
        }

        Insert: {
          id?: string
          entity_type: Database["public"]["Enums"]["correction_entity_type"]
          entity_id: string
          field: string
          current_value?: string | null
          suggested_value: string
          source_url: string
          submitted_by?: string | null
          status?: Database["public"]["Enums"]["moderation_status"]
          reviewed_by?: string | null
          reviewed_at?: string | null
          review_note?: string | null
          created_at?: string
        }

        Update: {
          id?: string
          entity_type?: Database["public"]["Enums"]["correction_entity_type"]
          entity_id?: string
          field?: string
          current_value?: string | null
          suggested_value?: string
          source_url?: string
          submitted_by?: string | null
          status?: Database["public"]["Enums"]["moderation_status"]
          reviewed_by?: string | null
          reviewed_at?: string | null
          review_note?: string | null
          created_at?: string
        }

        Relationships: [
          {
            foreignKeyName: "correction_suggestions_reviewed_by_fkey"
            columns: ["reviewed_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "correction_suggestions_submitted_by_fkey"
            columns: ["submitted_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      entity_sources: {
        Row: {
          id: string
          source_id: string
          entity_type: string
          entity_id: string
          created_at: string
        }

        Insert: {
          id?: string
          source_id: string
          entity_type: string
          entity_id: string
          created_at?: string
        }

        Update: {
          id?: string
          source_id?: string
          entity_type?: string
          entity_id?: string
          created_at?: string
        }

        Relationships: [
          {
            foreignKeyName: "entity_sources_source_id_fkey"
            columns: ["source_id"]
            isOneToOne: false
            referencedRelation: "sources"
            referencedColumns: ["id"]
          },
        ]
      }
      expenses: {
        Row: {
          id: string
          politician_id: string
          category: Database["public"]["Enums"]["expense_category"]
          paying_agency: string
          description: string
          amount: number
          reference_month: string
          source_id: string
          evidence_kind: Database["public"]["Enums"]["evidence_kind"]
          verified: boolean
          verified_at: string | null
          verified_by: string | null
          created_by: string | null
          created_at: string
          updated_at: string
        }

        Insert: {
          id?: string
          politician_id: string
          category: Database["public"]["Enums"]["expense_category"]
          paying_agency: string
          description: string
          amount: number
          reference_month: string
          source_id: string
          evidence_kind?: Database["public"]["Enums"]["evidence_kind"]
          verified?: boolean
          verified_at?: string | null
          verified_by?: string | null
          created_by?: string | null
          created_at?: string
          updated_at?: string
        }

        Update: {
          id?: string
          politician_id?: string
          category?: Database["public"]["Enums"]["expense_category"]
          paying_agency?: string
          description?: string
          amount?: number
          reference_month?: string
          source_id?: string
          evidence_kind?: Database["public"]["Enums"]["evidence_kind"]
          verified?: boolean
          verified_at?: string | null
          verified_by?: string | null
          created_by?: string | null
          created_at?: string
          updated_at?: string
        }

        Relationships: [
          {
            foreignKeyName: "expenses_politician_id_fkey"
            columns: ["politician_id"]
            isOneToOne: false
            referencedRelation: "politicians"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "expenses_source_id_fkey"
            columns: ["source_id"]
            isOneToOne: false
            referencedRelation: "sources"
            referencedColumns: ["id"]
          },
        ]
      }
      favorites: {
        Row: {
          id: string
          user_id: string
          politician_id: string
          created_at: string
        }

        Insert: {
          id?: string
          user_id: string
          politician_id: string
          created_at?: string
        }

        Update: {
          id?: string
          user_id?: string
          politician_id?: string
          created_at?: string
        }

        Relationships: [
          {
            foreignKeyName: "favorites_politician_id_fkey"
            columns: ["politician_id"]
            isOneToOne: false
            referencedRelation: "politicians"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "favorites_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      list_items: {
        Row: {
          id: string
          list_id: string
          politician_id: string
          position: number
          created_at: string
        }

        Insert: {
          id?: string
          list_id: string
          politician_id: string
          position: number
          created_at?: string
        }

        Update: {
          id?: string
          list_id?: string
          politician_id?: string
          position?: number
          created_at?: string
        }

        Relationships: [
          {
            foreignKeyName: "list_items_list_id_fkey"
            columns: ["list_id"]
            isOneToOne: false
            referencedRelation: "lists"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "list_items_politician_id_fkey"
            columns: ["politician_id"]
            isOneToOne: false
            referencedRelation: "politicians"
            referencedColumns: ["id"]
          },
        ]
      }
      lists: {
        Row: {
          id: string
          owner_id: string
          name: string
          description: string | null
          is_public: boolean
          created_at: string
          updated_at: string
        }

        Insert: {
          id?: string
          owner_id: string
          name: string
          description?: string | null
          is_public?: boolean
          created_at?: string
          updated_at?: string
        }

        Update: {
          id?: string
          owner_id?: string
          name?: string
          description?: string | null
          is_public?: boolean
          created_at?: string
          updated_at?: string
        }

        Relationships: [
          {
            foreignKeyName: "lists_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      mandates: {
        Row: {
          id: string
          politician_id: string
          office: Database["public"]["Enums"]["political_office"]
          level: Database["public"]["Enums"]["federative_level"]
          institution: string
          state: string | null
          city: string | null
          started_at: string
          ended_at: string | null
          evidence_kind: Database["public"]["Enums"]["evidence_kind"]
          verified: boolean
          verified_at: string | null
          verified_by: string | null
          created_by: string | null
          created_at: string
          updated_at: string
        }

        Insert: {
          id?: string
          politician_id: string
          office: Database["public"]["Enums"]["political_office"]
          level: Database["public"]["Enums"]["federative_level"]
          institution: string
          state?: string | null
          city?: string | null
          started_at: string
          ended_at?: string | null
          evidence_kind?: Database["public"]["Enums"]["evidence_kind"]
          verified?: boolean
          verified_at?: string | null
          verified_by?: string | null
          created_by?: string | null
          created_at?: string
          updated_at?: string
        }

        Update: {
          id?: string
          politician_id?: string
          office?: Database["public"]["Enums"]["political_office"]
          level?: Database["public"]["Enums"]["federative_level"]
          institution?: string
          state?: string | null
          city?: string | null
          started_at?: string
          ended_at?: string | null
          evidence_kind?: Database["public"]["Enums"]["evidence_kind"]
          verified?: boolean
          verified_at?: string | null
          verified_by?: string | null
          created_by?: string | null
          created_at?: string
          updated_at?: string
        }

        Relationships: [
          {
            foreignKeyName: "mandates_politician_id_fkey"
            columns: ["politician_id"]
            isOneToOne: false
            referencedRelation: "politicians"
            referencedColumns: ["id"]
          },
        ]
      }
      news: {
        Row: {
          id: string
          title: string
          publisher: string
          original_url: string
          canonical_url: string | null
          published_at: string
          summary: string
          category: string
          moderation_status: Database["public"]["Enums"]["moderation_status"]
          is_statement: boolean
          evidence_kind: Database["public"]["Enums"]["evidence_kind"]
          source_id: string
          verified: boolean
          verified_at: string | null
          verified_by: string | null
          created_by: string | null
          created_at: string
          updated_at: string
        }

        Insert: {
          id?: string
          title: string
          publisher: string
          original_url: string
          canonical_url?: string | null
          published_at: string
          summary: string
          category: string
          moderation_status?: Database["public"]["Enums"]["moderation_status"]
          is_statement?: boolean
          evidence_kind?: Database["public"]["Enums"]["evidence_kind"]
          source_id: string
          verified?: boolean
          verified_at?: string | null
          verified_by?: string | null
          created_by?: string | null
          created_at?: string
          updated_at?: string
        }

        Update: {
          id?: string
          title?: string
          publisher?: string
          original_url?: string
          canonical_url?: string | null
          published_at?: string
          summary?: string
          category?: string
          moderation_status?: Database["public"]["Enums"]["moderation_status"]
          is_statement?: boolean
          evidence_kind?: Database["public"]["Enums"]["evidence_kind"]
          source_id?: string
          verified?: boolean
          verified_at?: string | null
          verified_by?: string | null
          created_by?: string | null
          created_at?: string
          updated_at?: string
        }

        Relationships: [
          {
            foreignKeyName: "news_source_id_fkey"
            columns: ["source_id"]
            isOneToOne: false
            referencedRelation: "sources"
            referencedColumns: ["id"]
          },
        ]
      }
      news_politicians: {
        Row: {
          id: string
          news_id: string
          politician_id: string
          mention_role: string
          created_at: string
        }

        Insert: {
          id?: string
          news_id: string
          politician_id: string
          mention_role?: string
          created_at?: string
        }

        Update: {
          id?: string
          news_id?: string
          politician_id?: string
          mention_role?: string
          created_at?: string
        }

        Relationships: [
          {
            foreignKeyName: "news_politicians_news_id_fkey"
            columns: ["news_id"]
            isOneToOne: false
            referencedRelation: "news"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "news_politicians_politician_id_fkey"
            columns: ["politician_id"]
            isOneToOne: false
            referencedRelation: "politicians"
            referencedColumns: ["id"]
          },
        ]
      }
      parties: {
        Row: {
          id: string
          acronym: string
          name: string
          tse_number: string | null
          evidence_kind: Database["public"]["Enums"]["evidence_kind"]
          verified: boolean
          verified_at: string | null
          verified_by: string | null
          created_by: string | null
          created_at: string
          updated_at: string
        }

        Insert: {
          id?: string
          acronym: string
          name: string
          tse_number?: string | null
          evidence_kind?: Database["public"]["Enums"]["evidence_kind"]
          verified?: boolean
          verified_at?: string | null
          verified_by?: string | null
          created_by?: string | null
          created_at?: string
          updated_at?: string
        }

        Update: {
          id?: string
          acronym?: string
          name?: string
          tse_number?: string | null
          evidence_kind?: Database["public"]["Enums"]["evidence_kind"]
          verified?: boolean
          verified_at?: string | null
          verified_by?: string | null
          created_by?: string | null
          created_at?: string
          updated_at?: string
        }

        Relationships: []
      }
      politicians: {
        Row: {
          id: string
          full_name: string
          public_name: string | null
          photo_url: string | null
          photo_source_id: string | null
          office: Database["public"]["Enums"]["political_office"] | null
          office_level: Database["public"]["Enums"]["federative_level"] | null
          party_id: string | null
          state: string | null
          city: string | null
          biography: string | null
          evidence_kind: Database["public"]["Enums"]["evidence_kind"]
          verified: boolean
          verified_at: string | null
          verified_by: string | null
          created_by: string | null
          created_at: string
          updated_at: string
        }

        Insert: {
          id?: string
          full_name: string
          public_name?: string | null
          photo_url?: string | null
          photo_source_id?: string | null
          office?: Database["public"]["Enums"]["political_office"] | null
          office_level?: Database["public"]["Enums"]["federative_level"] | null
          party_id?: string | null
          state?: string | null
          city?: string | null
          biography?: string | null
          evidence_kind?: Database["public"]["Enums"]["evidence_kind"]
          verified?: boolean
          verified_at?: string | null
          verified_by?: string | null
          created_by?: string | null
          created_at?: string
          updated_at?: string
        }

        Update: {
          id?: string
          full_name?: string
          public_name?: string | null
          photo_url?: string | null
          photo_source_id?: string | null
          office?: Database["public"]["Enums"]["political_office"] | null
          office_level?: Database["public"]["Enums"]["federative_level"] | null
          party_id?: string | null
          state?: string | null
          city?: string | null
          biography?: string | null
          evidence_kind?: Database["public"]["Enums"]["evidence_kind"]
          verified?: boolean
          verified_at?: string | null
          verified_by?: string | null
          created_by?: string | null
          created_at?: string
          updated_at?: string
        }

        Relationships: [
          {
            foreignKeyName: "politicians_party_id_fkey"
            columns: ["party_id"]
            isOneToOne: false
            referencedRelation: "parties"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "politicians_photo_source_id_fkey"
            columns: ["photo_source_id"]
            isOneToOne: false
            referencedRelation: "sources"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          id: string
          display_name: string
          role: Database["public"]["Enums"]["user_role"]
          created_at: string
          updated_at: string
        }

        Insert: {
          id: string
          display_name: string
          role?: Database["public"]["Enums"]["user_role"]
          created_at?: string
          updated_at?: string
        }

        Update: {
          id?: string
          display_name?: string
          role?: Database["public"]["Enums"]["user_role"]
          created_at?: string
          updated_at?: string
        }

        Relationships: [
          {
            foreignKeyName: "profiles_id_fkey"
            columns: ["id"]
            isOneToOne: true
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      project_authors: {
        Row: {
          id: string
          project_id: string
          politician_id: string
          author_role: string
          position: number
          created_at: string
        }

        Insert: {
          id?: string
          project_id: string
          politician_id: string
          author_role?: string
          position?: number
          created_at?: string
        }

        Update: {
          id?: string
          project_id?: string
          politician_id?: string
          author_role?: string
          position?: number
          created_at?: string
        }

        Relationships: [
          {
            foreignKeyName: "project_authors_politician_id_fkey"
            columns: ["politician_id"]
            isOneToOne: false
            referencedRelation: "politicians"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "project_authors_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      projects: {
        Row: {
          id: string
          kind: Database["public"]["Enums"]["project_kind"]
          official_code: string | null
          title: string
          summary: string
          status: Database["public"]["Enums"]["project_status"]
          presented_at: string
          status_updated_at: string | null
          institution: string
          state: string | null
          evidence_kind: Database["public"]["Enums"]["evidence_kind"]
          verified: boolean
          verified_at: string | null
          verified_by: string | null
          created_by: string | null
          created_at: string
          updated_at: string
        }

        Insert: {
          id?: string
          kind: Database["public"]["Enums"]["project_kind"]
          official_code?: string | null
          title: string
          summary: string
          status?: Database["public"]["Enums"]["project_status"]
          presented_at: string
          status_updated_at?: string | null
          institution: string
          state?: string | null
          evidence_kind?: Database["public"]["Enums"]["evidence_kind"]
          verified?: boolean
          verified_at?: string | null
          verified_by?: string | null
          created_by?: string | null
          created_at?: string
          updated_at?: string
        }

        Update: {
          id?: string
          kind?: Database["public"]["Enums"]["project_kind"]
          official_code?: string | null
          title?: string
          summary?: string
          status?: Database["public"]["Enums"]["project_status"]
          presented_at?: string
          status_updated_at?: string | null
          institution?: string
          state?: string | null
          evidence_kind?: Database["public"]["Enums"]["evidence_kind"]
          verified?: boolean
          verified_at?: string | null
          verified_by?: string | null
          created_by?: string | null
          created_at?: string
          updated_at?: string
        }

        Relationships: []
      }
      public_funds: {
        Row: {
          id: string
          kind: Database["public"]["Enums"]["public_fund_kind"]
          politician_id: string | null
          granting_agency: string
          beneficiary: string
          purpose: string
          amount: number
          paid_amount: number | null
          reference_year: number
          evidence_kind: Database["public"]["Enums"]["evidence_kind"]
          verified: boolean
          verified_at: string | null
          verified_by: string | null
          created_by: string | null
          created_at: string
          updated_at: string
        }

        Insert: {
          id?: string
          kind: Database["public"]["Enums"]["public_fund_kind"]
          politician_id?: string | null
          granting_agency: string
          beneficiary: string
          purpose: string
          amount: number
          paid_amount?: number | null
          reference_year: number
          evidence_kind?: Database["public"]["Enums"]["evidence_kind"]
          verified?: boolean
          verified_at?: string | null
          verified_by?: string | null
          created_by?: string | null
          created_at?: string
          updated_at?: string
        }

        Update: {
          id?: string
          kind?: Database["public"]["Enums"]["public_fund_kind"]
          politician_id?: string | null
          granting_agency?: string
          beneficiary?: string
          purpose?: string
          amount?: number
          paid_amount?: number | null
          reference_year?: number
          evidence_kind?: Database["public"]["Enums"]["evidence_kind"]
          verified?: boolean
          verified_at?: string | null
          verified_by?: string | null
          created_by?: string | null
          created_at?: string
          updated_at?: string
        }

        Relationships: [
          {
            foreignKeyName: "public_funds_politician_id_fkey"
            columns: ["politician_id"]
            isOneToOne: false
            referencedRelation: "politicians"
            referencedColumns: ["id"]
          },
        ]
      }
      ranking_definitions: {
        Row: {
          id: string
          metric: Database["public"]["Enums"]["ranking_metric"]
          direction: Database["public"]["Enums"]["ranking_direction"]
          office_scope: Database["public"]["Enums"]["political_office"] | null
          state_scope: string | null
          period_start: string
          period_end: string
          created_by: string | null
          created_at: string
          updated_at: string
        }

        Insert: {
          id?: string
          metric: Database["public"]["Enums"]["ranking_metric"]
          direction: Database["public"]["Enums"]["ranking_direction"]
          office_scope?: Database["public"]["Enums"]["political_office"] | null
          state_scope?: string | null
          period_start: string
          period_end: string
          created_by?: string | null
          created_at?: string
          updated_at?: string
        }

        Update: {
          id?: string
          metric?: Database["public"]["Enums"]["ranking_metric"]
          direction?: Database["public"]["Enums"]["ranking_direction"]
          office_scope?: Database["public"]["Enums"]["political_office"] | null
          state_scope?: string | null
          period_start?: string
          period_end?: string
          created_by?: string | null
          created_at?: string
          updated_at?: string
        }

        Relationships: []
      }
      ranking_entries: {
        Row: {
          id: string
          snapshot_id: string
          politician_id: string
          position: number
          value: number
          created_at: string
        }

        Insert: {
          id?: string
          snapshot_id: string
          politician_id: string
          position: number
          value: number
          created_at?: string
        }

        Update: {
          id?: string
          snapshot_id?: string
          politician_id?: string
          position?: number
          value?: number
          created_at?: string
        }

        Relationships: [
          {
            foreignKeyName: "ranking_entries_politician_id_fkey"
            columns: ["politician_id"]
            isOneToOne: false
            referencedRelation: "politicians"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ranking_entries_snapshot_id_fkey"
            columns: ["snapshot_id"]
            isOneToOne: false
            referencedRelation: "ranking_snapshots"
            referencedColumns: ["id"]
          },
        ]
      }
      ranking_snapshot_sources: {
        Row: {
          id: string
          snapshot_id: string
          source_id: string
          created_at: string
        }

        Insert: {
          id?: string
          snapshot_id: string
          source_id: string
          created_at?: string
        }

        Update: {
          id?: string
          snapshot_id?: string
          source_id?: string
          created_at?: string
        }

        Relationships: [
          {
            foreignKeyName: "ranking_snapshot_sources_snapshot_id_fkey"
            columns: ["snapshot_id"]
            isOneToOne: false
            referencedRelation: "ranking_snapshots"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ranking_snapshot_sources_source_id_fkey"
            columns: ["source_id"]
            isOneToOne: false
            referencedRelation: "sources"
            referencedColumns: ["id"]
          },
        ]
      }
      ranking_snapshots: {
        Row: {
          id: string
          definition_id: string
          methodology: string
          computed_at: string
          created_by: string | null
          is_user_ranking: boolean
          created_at: string
        }

        Insert: {
          id?: string
          definition_id: string
          methodology: string
          computed_at: string
          created_by?: string | null
          is_user_ranking?: boolean
          created_at?: string
        }

        Update: {
          id?: string
          definition_id?: string
          methodology?: string
          computed_at?: string
          created_by?: string | null
          is_user_ranking?: boolean
          created_at?: string
        }

        Relationships: [
          {
            foreignKeyName: "ranking_snapshots_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ranking_snapshots_definition_id_fkey"
            columns: ["definition_id"]
            isOneToOne: false
            referencedRelation: "ranking_definitions"
            referencedColumns: ["id"]
          },
        ]
      }
      ratings: {
        Row: {
          id: string
          politician_id: string
          author_id: string
          score: number
          rationale: string | null
          evidence_kind: Database["public"]["Enums"]["evidence_kind"]
          created_at: string
          updated_at: string
        }

        Insert: {
          id?: string
          politician_id: string
          author_id: string
          score: number
          rationale?: string | null
          evidence_kind?: Database["public"]["Enums"]["evidence_kind"]
          created_at?: string
          updated_at?: string
        }

        Update: {
          id?: string
          politician_id?: string
          author_id?: string
          score?: number
          rationale?: string | null
          evidence_kind?: Database["public"]["Enums"]["evidence_kind"]
          created_at?: string
          updated_at?: string
        }

        Relationships: [
          {
            foreignKeyName: "ratings_author_id_fkey"
            columns: ["author_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ratings_politician_id_fkey"
            columns: ["politician_id"]
            isOneToOne: false
            referencedRelation: "politicians"
            referencedColumns: ["id"]
          },
        ]
      }
      reports: {
        Row: {
          id: string
          target_type: Database["public"]["Enums"]["report_target_type"]
          target_id: string
          reporter_id: string | null
          reason: string
          details: string | null
          source_url: string | null
          status: Database["public"]["Enums"]["moderation_status"]
          resolved_by: string | null
          resolved_at: string | null
          resolution_note: string | null
          created_at: string
        }

        Insert: {
          id?: string
          target_type: Database["public"]["Enums"]["report_target_type"]
          target_id: string
          reporter_id?: string | null
          reason: string
          details?: string | null
          source_url?: string | null
          status?: Database["public"]["Enums"]["moderation_status"]
          resolved_by?: string | null
          resolved_at?: string | null
          resolution_note?: string | null
          created_at?: string
        }

        Update: {
          id?: string
          target_type?: Database["public"]["Enums"]["report_target_type"]
          target_id?: string
          reporter_id?: string | null
          reason?: string
          details?: string | null
          source_url?: string | null
          status?: Database["public"]["Enums"]["moderation_status"]
          resolved_by?: string | null
          resolved_at?: string | null
          resolution_note?: string | null
          created_at?: string
        }

        Relationships: [
          {
            foreignKeyName: "reports_reporter_id_fkey"
            columns: ["reporter_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reports_resolved_by_fkey"
            columns: ["resolved_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      sources: {
        Row: {
          id: string
          official_source_id: string | null
          publisher: string
          url: string
          canonical_url: string | null
          title: string | null
          data_url: string | null
          evidence_kind: Database["public"]["Enums"]["evidence_kind"]
          collected_at: string
          published_at: string | null
          verified: boolean
          verified_at: string | null
          verified_by: string | null
          notes: string | null
          created_by: string | null
          created_at: string
          updated_at: string
        }

        Insert: {
          id?: string
          official_source_id?: string | null
          publisher: string
          url: string
          canonical_url?: string | null
          title?: string | null
          data_url?: string | null
          evidence_kind?: Database["public"]["Enums"]["evidence_kind"]
          collected_at: string
          published_at?: string | null
          verified?: boolean
          verified_at?: string | null
          verified_by?: string | null
          notes?: string | null
          created_by?: string | null
          created_at?: string
          updated_at?: string
        }

        Update: {
          id?: string
          official_source_id?: string | null
          publisher?: string
          url?: string
          canonical_url?: string | null
          title?: string | null
          data_url?: string | null
          evidence_kind?: Database["public"]["Enums"]["evidence_kind"]
          collected_at?: string
          published_at?: string | null
          verified?: boolean
          verified_at?: string | null
          verified_by?: string | null
          notes?: string | null
          created_by?: string | null
          created_at?: string
          updated_at?: string
        }

        Relationships: []
      }
      timeline_events: {
        Row: {
          id: string
          politician_id: string
          kind: Database["public"]["Enums"]["timeline_event_kind"]
          title: string
          description: string
          occurred_at: string
          evidence_kind: Database["public"]["Enums"]["evidence_kind"]
          verified: boolean
          verified_at: string | null
          verified_by: string | null
          created_by: string | null
          created_at: string
          updated_at: string
        }

        Insert: {
          id?: string
          politician_id: string
          kind: Database["public"]["Enums"]["timeline_event_kind"]
          title: string
          description: string
          occurred_at: string
          evidence_kind?: Database["public"]["Enums"]["evidence_kind"]
          verified?: boolean
          verified_at?: string | null
          verified_by?: string | null
          created_by?: string | null
          created_at?: string
          updated_at?: string
        }

        Update: {
          id?: string
          politician_id?: string
          kind?: Database["public"]["Enums"]["timeline_event_kind"]
          title?: string
          description?: string
          occurred_at?: string
          evidence_kind?: Database["public"]["Enums"]["evidence_kind"]
          verified?: boolean
          verified_at?: string | null
          verified_by?: string | null
          created_by?: string | null
          created_at?: string
          updated_at?: string
        }

        Relationships: [
          {
            foreignKeyName: "timeline_events_politician_id_fkey"
            columns: ["politician_id"]
            isOneToOne: false
            referencedRelation: "politicians"
            referencedColumns: ["id"]
          },
        ]
      }
      vote_records: {
        Row: {
          id: string
          vote_session_id: string
          politician_id: string
          position: Database["public"]["Enums"]["vote_position"]
          evidence_kind: Database["public"]["Enums"]["evidence_kind"]
          verified: boolean
          verified_at: string | null
          verified_by: string | null
          created_by: string | null
          created_at: string
          updated_at: string
        }

        Insert: {
          id?: string
          vote_session_id: string
          politician_id: string
          position: Database["public"]["Enums"]["vote_position"]
          evidence_kind?: Database["public"]["Enums"]["evidence_kind"]
          verified?: boolean
          verified_at?: string | null
          verified_by?: string | null
          created_by?: string | null
          created_at?: string
          updated_at?: string
        }

        Update: {
          id?: string
          vote_session_id?: string
          politician_id?: string
          position?: Database["public"]["Enums"]["vote_position"]
          evidence_kind?: Database["public"]["Enums"]["evidence_kind"]
          verified?: boolean
          verified_at?: string | null
          verified_by?: string | null
          created_by?: string | null
          created_at?: string
          updated_at?: string
        }

        Relationships: [
          {
            foreignKeyName: "vote_records_politician_id_fkey"
            columns: ["politician_id"]
            isOneToOne: false
            referencedRelation: "politicians"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "vote_records_vote_session_id_fkey"
            columns: ["vote_session_id"]
            isOneToOne: false
            referencedRelation: "vote_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      vote_sessions: {
        Row: {
          id: string
          institution: string
          description: string
          occurred_at: string
          project_id: string | null
          evidence_kind: Database["public"]["Enums"]["evidence_kind"]
          verified: boolean
          verified_at: string | null
          verified_by: string | null
          created_by: string | null
          created_at: string
          updated_at: string
        }

        Insert: {
          id?: string
          institution: string
          description: string
          occurred_at: string
          project_id?: string | null
          evidence_kind?: Database["public"]["Enums"]["evidence_kind"]
          verified?: boolean
          verified_at?: string | null
          verified_by?: string | null
          created_by?: string | null
          created_at?: string
          updated_at?: string
        }

        Update: {
          id?: string
          institution?: string
          description?: string
          occurred_at?: string
          project_id?: string | null
          evidence_kind?: Database["public"]["Enums"]["evidence_kind"]
          verified?: boolean
          verified_at?: string | null
          verified_by?: string | null
          created_by?: string | null
          created_at?: string
          updated_at?: string
        }

        Relationships: [
          {
            foreignKeyName: "vote_sessions_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      canonicalize_url: {
        Args: { p_url: string }
        Returns: string
      }
      current_user_role: {
        Args: {  }
        Returns: Database["public"]["Enums"]["user_role"]
      }
      immutable_unaccent: {
        Args: { p_text: string }
        Returns: string
      }
      is_admin: {
        Args: {  }
        Returns: boolean
      }
      is_public_row: {
        Args: { p_entity_type: string; p_entity_id: string }
        Returns: boolean
      }
      is_staff: {
        Args: {  }
        Returns: boolean
      }
      search_politicians: {
        Args: { p_term: string; p_limit?: number }
        Returns: Database["public"]["Tables"]["politicians"]["Row"][]
      }
    }
    Enums: {
      audit_action: "insert" | "update" | "delete" | "moderate" | "login"
      correction_entity_type: "politician" | "mandate" | "project" | "vote" | "expense" | "public_fund"
      evidence_kind: "fato" | "dado_oficial" | "noticia" | "declaracao" | "opiniao"
      expense_category: "cota_parlamentar" | "gabinete" | "diarias" | "passagens" | "remuneracao" | "outra"
      federative_level: "federal" | "estadual" | "municipal"
      moderation_status: "pending" | "approved" | "rejected" | "hidden"
      political_office: "presidente" | "governador" | "senador" | "deputado_federal" | "deputado_estadual" | "deputado_distrital" | "prefeito" | "vice_prefeito" | "vereador"
      project_kind: "projeto_de_lei" | "projeto_de_lei_complementar" | "proposta_de_emenda_constitucional" | "medida_provisoria" | "requerimento" | "indicacao" | "outro"
      project_status: "apresentado" | "em_tramitacao" | "aprovado" | "sancionado" | "vetado" | "arquivado" | "executado" | "entregue"
      public_fund_kind: "emenda" | "convenio" | "contrato" | "transferencia"
      ranking_direction: "desc" | "asc"
      ranking_metric: "projetos_apresentados" | "projetos_aprovados" | "participacao" | "gastos" | "emendas" | "atividade_legislativa"
      report_target_type: "comment" | "rating" | "politician_data" | "news"
      timeline_event_kind: "eleicao" | "posse" | "projeto" | "votacao" | "nomeacao" | "decisao_judicial" | "outro"
      user_role: "user" | "moderator" | "admin"
      vote_position: "sim" | "nao" | "abstencao" | "ausente" | "obstrucao"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

export type PublicSchema = Database["public"]

export type Tables<T extends keyof PublicSchema["Tables"]> =
  PublicSchema["Tables"][T]["Row"]
export type TablesInsert<T extends keyof PublicSchema["Tables"]> =
  PublicSchema["Tables"][T]["Insert"]
export type TablesUpdate<T extends keyof PublicSchema["Tables"]> =
  PublicSchema["Tables"][T]["Update"]
export type Enums<T extends keyof PublicSchema["Enums"]> = PublicSchema["Enums"][T]
