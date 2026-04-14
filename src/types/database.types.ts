/**
 * @fileOverview Tipos TypeScript generados automáticamente del esquema Supabase
 * @description Tipos completos para todas las tablas de ConectAr HR
 * @author Database Architect
 * @version 1.0
 */

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      tenants: {
        Row: {
          id: string;
          name: string;
          slug: string;
          description: string | null;
          logo_url: string | null;
          country_code: string;
          timezone: string;
          currency: string;
          status: 'active' | 'inactive' | 'suspended' | 'trial';
          subscription_plan: 'free' | 'starter' | 'professional' | 'enterprise';
          subscription_status: 'active' | 'inactive' | 'canceled' | 'past_due';
          max_employees: number;
          max_users: number;
          features: Json;
          custom_fields: Json;
          created_by: string | null;
          created_at: string;
          updated_at: string;
          deleted_at: string | null;
          metadata: Json;
        };
        Insert: Omit<Database['public']['Tables']['tenants']['Row'], 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['tenants']['Row']>;
      };
      users: {
        Row: {
          id: string;
          tenant_id: string;
          email: string;
          email_confirmed: boolean;
          email_confirmed_at: string | null;
          phone: string | null;
          first_name: string | null;
          last_name: string | null;
          avatar_url: string | null;
          status: 'active' | 'inactive' | 'suspended';
          last_login_at: string | null;
          password_changed_at: string | null;
          is_super_admin: boolean;
          created_at: string;
          updated_at: string;
          deleted_at: string | null;
          metadata: Json;
        };
        Insert: Omit<Database['public']['Tables']['users']['Row'], 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['users']['Row']>;
      };
      employees: {
        Row: {
          id: string;
          tenant_id: string;
          user_id: string | null;
          employee_code: string;
          first_name: string;
          last_name: string;
          email: string | null;
          phone: string | null;
          mobile: string | null;
          date_of_birth: string | null;
          gender: string | null;
          nationality: string | null;
          id_number: string;
          id_type: string;
          marital_status: string | null;
          emergency_contact_name: string | null;
          emergency_contact_phone: string | null;
          emergency_contact_relationship: string | null;
          department_id: string;
          position_id: string;
          manager_id: string | null;
          employment_type: string;
          hire_date: string;
          contract_end_date: string | null;
          salary: number | null;
          salary_frequency: string;
          currency: string;
          status: 'active' | 'inactive' | 'on_leave' | 'suspended' | 'terminated';
          termination_date: string | null;
          termination_reason: string | null;
          address_line_1: string | null;
          address_line_2: string | null;
          city: string | null;
          state: string | null;
          postal_code: string | null;
          country: string | null;
          custom_fields: Json;
          created_at: string;
          updated_at: string;
          deleted_at: string | null;
          metadata: Json;
        };
        Insert: Omit<Database['public']['Tables']['employees']['Row'], 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['employees']['Row']>;
      };
      departments: {
        Row: {
          id: string;
          tenant_id: string;
          name: string;
          description: string | null;
          parent_department_id: string | null;
          manager_id: string | null;
          status: 'active' | 'inactive';
          cost_center: string | null;
          budget_allocated: number | null;
          created_at: string;
          updated_at: string;
          deleted_at: string | null;
          metadata: Json;
        };
        Insert: Omit<Database['public']['Tables']['departments']['Row'], 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['departments']['Row']>;
      };
      positions: {
        Row: {
          id: string;
          tenant_id: string;
          name: string;
          description: string | null;
          department_id: string;
          salary_range_min: number | null;
          salary_range_max: number | null;
          level: string | null;
          status: 'active' | 'inactive';
          created_at: string;
          updated_at: string;
          deleted_at: string | null;
          metadata: Json;
        };
        Insert: Omit<Database['public']['Tables']['positions']['Row'], 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['positions']['Row']>;
      };
      roles: {
        Row: {
          id: string;
          tenant_id: string;
          name: string;
          description: string | null;
          is_system_role: boolean;
          role_type: 'admin' | 'manager' | 'employee' | 'custom';
          permissions: Json;
          created_at: string;
          updated_at: string;
          deleted_at: string | null;
        };
        Insert: Omit<Database['public']['Tables']['roles']['Row'], 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['roles']['Row']>;
      };
      permissions: {
        Row: {
          id: string;
          code: string;
          name: string;
          description: string | null;
          resource: string;
          action: string;
          is_system_permission: boolean;
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['permissions']['Row'], 'id' | 'created_at'>;
        Update: Partial<Database['public']['Tables']['permissions']['Row']>;
      };
      role_permissions: {
        Row: {
          id: string;
          role_id: string;
          permission_id: string;
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['role_permissions']['Row'], 'id' | 'created_at'>;
        Update: Partial<Database['public']['Tables']['role_permissions']['Row']>;
      };
      user_roles: {
        Row: {
          id: string;
          user_id: string;
          role_id: string;
          assigned_at: string;
          assigned_by: string | null;
        };
        Insert: Omit<Database['public']['Tables']['user_roles']['Row'], 'id' | 'assigned_at'>;
        Update: Partial<Database['public']['Tables']['user_roles']['Row']>;
      };
      attendance: {
        Row: {
          id: string;
          tenant_id: string;
          employee_id: string;
          date: string;
          check_in_time: string | null;
          check_out_time: string | null;
          check_in_method: string | null;
          check_in_location: string | null;
          check_out_method: string | null;
          check_out_location: string | null;
          status: 'present' | 'absent' | 'late' | 'early_out' | 'on_leave' | 'half_day';
          late_minutes: number;
          early_out_minutes: number;
          working_hours: number | null;
          notes: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['attendance']['Row'], 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['attendance']['Row']>;
      };
      leave_types: {
        Row: {
          id: string;
          tenant_id: string;
          name: string;
          description: string | null;
          code: string;
          default_days_per_year: number;
          is_paid: boolean;
          requires_approval: boolean;
          requires_medical_certificate: boolean;
          max_consecutive_days: number | null;
          status: string;
          created_at: string;
          updated_at: string;
          deleted_at: string | null;
          metadata: Json;
        };
        Insert: Omit<Database['public']['Tables']['leave_types']['Row'], 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['leave_types']['Row']>;
      };
      leave_balances: {
        Row: {
          id: string;
          tenant_id: string;
          employee_id: string;
          leave_type_id: string;
          year: number;
          total_days: number;
          used_days: number;
          pending_approval_days: number;
          approved_days: number;
          rollover_days: number;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['leave_balances']['Row'], 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['leave_balances']['Row']>;
      };
      leaves: {
        Row: {
          id: string;
          tenant_id: string;
          employee_id: string;
          leave_type_id: string;
          start_date: string;
          end_date: string;
          days_count: number;
          status: 'pending' | 'approved' | 'rejected' | 'canceled';
          reason: string | null;
          notes: string | null;
          requested_at: string;
          approved_by: string | null;
          approved_at: string | null;
          rejection_reason: string | null;
          rejected_by: string | null;
          rejected_at: string | null;
          created_at: string;
          updated_at: string;
          metadata: Json;
        };
        Insert: Omit<Database['public']['Tables']['leaves']['Row'], 'id' | 'requested_at' | 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['leaves']['Row']>;
      };
      payroll: {
        Row: {
          id: string;
          tenant_id: string;
          employee_id: string;
          payroll_period: string;
          period_start: string;
          period_end: string;
          base_salary: number;
          gross_salary: number;
          net_salary: number;
          status: 'draft' | 'pending' | 'approved' | 'paid' | 'canceled';
          issued_at: string | null;
          approved_by: string | null;
          approved_at: string | null;
          paid_at: string | null;
          payment_method: string | null;
          reference_number: string | null;
          notes: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['payroll']['Row'], 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['payroll']['Row']>;
      };
      payroll_components: {
        Row: {
          id: string;
          payroll_id: string;
          component_type: string;
          component_name: string;
          amount: number;
          calculation_method: string | null;
          calculation_basis: number | null;
          is_deduction: boolean;
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['payroll_components']['Row'], 'id' | 'created_at'>;
        Update: Partial<Database['public']['Tables']['payroll_components']['Row']>;
      };
      documents: {
        Row: {
          id: string;
          tenant_id: string;
          employee_id: string;
          document_type: string;
          file_name: string;
          file_url: string;
          file_size: number | null;
          mime_type: string | null;
          document_date: string | null;
          expiry_date: string | null;
          status: 'active' | 'expired' | 'archived';
          uploaded_by: string | null;
          notes: string | null;
          created_at: string;
          updated_at: string;
          deleted_at: string | null;
          metadata: Json;
        };
        Insert: Omit<Database['public']['Tables']['documents']['Row'], 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['documents']['Row']>;
      };
      announcements: {
        Row: {
          id: string;
          tenant_id: string;
          title: string;
          content: string;
          announcement_type: string;
          priority: 'low' | 'normal' | 'high' | 'urgent';
          published_by: string;
          published_at: string;
          expires_at: string | null;
          status: 'draft' | 'published' | 'archived';
          target_roles: Json;
          target_departments: Json;
          created_at: string;
          updated_at: string;
          deleted_at: string | null;
        };
        Insert: Omit<Database['public']['Tables']['announcements']['Row'], 'id' | 'published_at' | 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['announcements']['Row']>;
      };
      notifications: {
        Row: {
          id: string;
          tenant_id: string;
          user_id: string;
          title: string;
          message: string;
          notification_type: string | null;
          related_resource_type: string | null;
          related_resource_id: string | null;
          is_read: boolean;
          read_at: string | null;
          created_at: string;
          expires_at: string;
        };
        Insert: Omit<Database['public']['Tables']['notifications']['Row'], 'id' | 'created_at' | 'expires_at'>;
        Update: Partial<Database['public']['Tables']['notifications']['Row']>;
      };
      audit_logs: {
        Row: {
          id: string;
          tenant_id: string;
          user_id: string | null;
          action: string;
          resource_type: string;
          resource_id: string;
          old_values: Json | null;
          new_values: Json | null;
          ip_address: string | null;
          user_agent: string | null;
          changes_description: string | null;
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['audit_logs']['Row'], 'id' | 'created_at'>;
        Update: Partial<Database['public']['Tables']['audit_logs']['Row']>;
      };
      company_settings: {
        Row: {
          id: string;
          tenant_id: string;
          company_name: string;
          legal_entity_name: string | null;
          cuit: string | null;
          industry: string | null;
          website: string | null;
          email: string | null;
          phone: string | null;
          address_line_1: string | null;
          address_line_2: string | null;
          city: string | null;
          state: string | null;
          postal_code: string | null;
          country: string | null;
          work_week_days: string;
          working_hours_per_day: number;
          start_financial_year: number;
          currency: string;
          timezone: string;
          leave_policies: Json;
          payroll_policies: Json;
          branding: Json;
          created_at: string;
          updated_at: string;
          metadata: Json;
        };
        Insert: Omit<Database['public']['Tables']['company_settings']['Row'], 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['company_settings']['Row']>;
      };
      work_shifts: {
        Row: {
          id: string;
          tenant_id: string;
          name: string;
          description: string | null;
          start_time: string;
          end_time: string;
          break_duration: number;
          working_days: string;
          status: string;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['work_shifts']['Row'], 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['work_shifts']['Row']>;
      };
      employee_shifts: {
        Row: {
          id: string;
          tenant_id: string;
          employee_id: string;
          shift_id: string;
          effective_from: string;
          effective_to: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['employee_shifts']['Row'], 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['employee_shifts']['Row']>;
      };
      performance_reviews: {
        Row: {
          id: string;
          tenant_id: string;
          employee_id: string;
          reviewer_id: string;
          review_period_start: string;
          review_period_end: string;
          overall_rating: number | null;
          performance_score: number | null;
          technical_skills_score: number | null;
          soft_skills_score: number | null;
          comments: string | null;
          recommendations: string | null;
          status: 'draft' | 'pending' | 'completed' | 'archived';
          reviewed_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['performance_reviews']['Row'], 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['performance_reviews']['Row']>;
      };
      employee_documents: {
        Row: {
          id: string;
          tenant_id: string;
          employee_id: string;
          document_type: string;
          is_required: boolean;
          is_completed: boolean;
          completed_at: string | null;
          expiry_date: string | null;
          status: string;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['employee_documents']['Row'], 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['employee_documents']['Row']>;
      };
      time_off_requests: {
        Row: {
          id: string;
          tenant_id: string;
          employee_id: string;
          request_type: string;
          start_date: string;
          end_date: string;
          reason: string | null;
          status: 'pending' | 'approved' | 'rejected' | 'canceled';
          approved_by: string | null;
          approved_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['time_off_requests']['Row'], 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['time_off_requests']['Row']>;
      };
      skills: {
        Row: {
          id: string;
          tenant_id: string;
          name: string;
          category: string | null;
          description: string | null;
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['skills']['Row'], 'id' | 'created_at'>;
        Update: Partial<Database['public']['Tables']['skills']['Row']>;
      };
      employee_skills: {
        Row: {
          id: string;
          tenant_id: string;
          employee_id: string;
          skill_id: string;
          proficiency_level: 'beginner' | 'intermediate' | 'advanced' | 'expert';
          years_of_experience: number | null;
          verified: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['employee_skills']['Row'], 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['employee_skills']['Row']>;
      };
      training_programs: {
        Row: {
          id: string;
          tenant_id: string;
          name: string;
          description: string | null;
          provider: string | null;
          duration_hours: number | null;
          start_date: string | null;
          end_date: string | null;
          max_participants: number | null;
          cost: number | null;
          status: string;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['training_programs']['Row'], 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['training_programs']['Row']>;
      };
      employee_training: {
        Row: {
          id: string;
          tenant_id: string;
          employee_id: string;
          training_program_id: string;
          status: 'registered' | 'completed' | 'canceled';
          completion_date: string | null;
          score: number | null;
          certificate_url: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['employee_training']['Row'], 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['employee_training']['Row']>;
      };
      api_tokens: {
        Row: {
          id: string;
          tenant_id: string;
          name: string;
          token_hash: string;
          last_used_at: string | null;
          expires_at: string | null;
          is_active: boolean;
          created_by: string;
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['api_tokens']['Row'], 'id' | 'created_at'>;
        Update: Partial<Database['public']['Tables']['api_tokens']['Row']>;
      };
      integrations: {
        Row: {
          id: string;
          tenant_id: string;
          name: string;
          integration_type: string;
          credentials: Json;
          webhook_url: string | null;
          is_active: boolean;
          configuration: Json;
          created_at: string;
          updated_at: string;
          deleted_at: string | null;
        };
        Insert: Omit<Database['public']['Tables']['integrations']['Row'], 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['integrations']['Row']>;
      };
    };
    Views: {};
    Functions: {
      get_current_tenant_id: {
        Args: Record<PropertyKey, never>;
        Returns: string;
      };
      is_super_admin: {
        Args: Record<PropertyKey, never>;
        Returns: boolean;
      };
      get_current_user_id: {
        Args: Record<PropertyKey, never>;
        Returns: string;
      };
    };
    Enums: {};
    CompositeTypes: {};
  };
}
