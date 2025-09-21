import { supabase } from '@/integrations/supabase/client';

export interface OrganizationMember {
  id: string;
  user_id: string;
  role: 'main_organiser' | 'organiser' | 'pending';
  joined_at: string;
  user_name: string;
  user_email: string;
  user_avatar: string | null;
}

export interface Organization {
  id: string;
  name: string;
  description?: string;
  avatar_url?: string;
  owner_id: string;
  status: string;
  created_at: string;
}

export const organizationService = {
  async getUserOrganization(userId: string): Promise<Organization | null> {
    const { data, error } = await supabase
      .from('organizations')
      .select('*')
      .eq('owner_id', userId)
      .single();

    if (error && error.code !== 'PGRST116') {
      throw error;
    }

    return data;
  },

  async getOrganizationMembers(orgId: string): Promise<OrganizationMember[]> {
    const { data, error } = await supabase
      .rpc('get_organization_members', { org_id: orgId });

    if (error) throw error;
    return data || [];
  },

  async generateInviteToken(orgId: string): Promise<string> {
    const { data, error } = await supabase
      .rpc('generate_org_invite_token', { org_id: orgId });

    if (error) throw error;
    return data;
  },

  async joinByToken(inviteToken: string, userId: string): Promise<{ success: boolean; message: string; organization_name?: string }> {
    const { data, error } = await supabase
      .rpc('join_organization_by_token', {
        invite_token: inviteToken,
        joining_user_id: userId
      });

    if (error) throw error;
    return data;
  },

  async approveMember(orgId: string, memberUserId: string, approverUserId: string): Promise<{ success: boolean; message: string }> {
    const { data, error } = await supabase
      .rpc('approve_member', {
        org_id: orgId,
        member_user_id: memberUserId,
        approver_user_id: approverUserId
      });

    if (error) throw error;
    return data;
  },

  async createOrganization(orgData: {
    name: string;
    description?: string;
    avatar_url?: string;
    owner_id: string;
  }): Promise<Organization> {
    const { data, error } = await supabase
      .from('organizations')
      .insert({
        ...orgData,
        status: 'pending'
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }
};