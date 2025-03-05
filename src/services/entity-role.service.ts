import { supabase } from '@/utils/supabaseClient';

/**
 * Serviço de Entidades e Funções
 * 
 * Este serviço implementa um modelo onde pessoas e organizações são as entidades básicas
 * e diferentes papéis/funções podem ser atribuídos a essas entidades.
 * 
 * Uma mesma entidade pode desempenhar múltiplos papéis no sistema, por exemplo:
 * - Uma pessoa pode ser cliente, funcionário e fornecedor ao mesmo tempo
 * - Uma organização pode ser cliente e fornecedor simultaneamente
 */

// ===== INTERFACES DE ENTIDADES BÁSICAS =====

export interface Person {
  id?: string;
  first_name: string;
  last_name: string;
  email?: string;
  phone?: string;
  birth_date?: string;
  gender?: string;
  tax_id?: string; // CPF
  nationality?: string;
  profile_image_url?: string;
  notes?: string;
  status: 'active' | 'inactive' | 'blocked';
  created_at?: string;
  updated_at?: string;
}

export interface Organization {
  id?: string;
  name: string;
  legal_name?: string;
  tax_id?: string; // CNPJ
  industry?: string;
  size?: 'small' | 'medium' | 'large' | 'enterprise';
  logo_url?: string;
  website?: string;
  founded_date?: string;
  notes?: string;
  status: 'active' | 'inactive' | 'blocked';
  created_at?: string;
  updated_at?: string;
}

export interface Address {
  id?: string;
  entity_id: string;
  entity_type: 'person' | 'organization';
  address_line1: string;
  address_line2?: string;
  city: string;
  state?: string;
  postal_code?: string;
  country: string;
  type: 'billing' | 'shipping' | 'home' | 'work' | 'other';
  is_primary: boolean;
  is_verified: boolean;
  coordinates?: {
    latitude: number;
    longitude: number;
  };
  notes?: string;
  created_at?: string;
  updated_at?: string;
}

export interface Contact {
  id?: string;
  person_id: string;
  organization_id?: string;
  position?: string;
  department?: string;
  email?: string;
  phone?: string;
  is_primary: boolean;
  notes?: string;
  created_at?: string;
  updated_at?: string;
}

// ===== INTERFACES DE FUNÇÕES/PAPÉIS =====

export interface CustomerRole {
  id?: string;
  entity_id: string;
  entity_type: 'person' | 'organization';
  customer_segment?: 'retail' | 'wholesale' | 'vip' | 'corporate';
  credit_limit?: number;
  payment_terms?: string;
  tax_exempt?: boolean;
  status: 'active' | 'inactive' | 'prospect' | 'blocked';
  account_manager_id?: string;
  acquisition_channel?: string;
  lifetime_value?: number;
  notes?: string;
  created_at?: string;
  updated_at?: string;
}

export interface SupplierRole {
  id?: string;
  entity_id: string;
  entity_type: 'person' | 'organization';
  supplier_category?: string;
  payment_terms?: string;
  lead_time_days?: number;
  quality_rating?: number;
  reliability_rating?: number;
  status: 'active' | 'inactive' | 'blocked';
  notes?: string;
  created_at?: string;
  updated_at?: string;
}

export interface EmployeeRole {
  id?: string;
  person_id: string;
  employee_id: string;
  department_id?: string;
  position_id?: string;
  supervisor_id?: string;
  hire_date: string;
  employment_type: 'full-time' | 'part-time' | 'contract' | 'intern';
  salary?: number;
  status: 'active' | 'inactive' | 'on-leave' | 'terminated';
  termination_date?: string;
  notes?: string;
  created_at?: string;
  updated_at?: string;
}

export interface SalesRepRole {
  id?: string;
  employee_role_id: string;
  commission_rate?: number;
  territory?: string;
  target?: number;
  sales_level?: string;
  is_active: boolean;
  start_date: string;
  end_date?: string;
  notes?: string;
  created_at?: string;
  updated_at?: string;
}

// ===== FUNÇÕES DE SERVIÇO PARA PESSOAS =====

export const getPeople = async (status?: string) => {
  try {
    let query = supabase
      .from('core.people')
      .select('*')
      .order('last_name', { ascending: true });
    
    if (status) {
      query = query.eq('status', status);
    }
    
    const { data, error } = await query;
    
    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('Erro ao buscar pessoas:', error);
    return { data: null, error };
  }
};

export const getPerson = async (id: string) => {
  try {
    const { data, error } = await supabase
      .from('core.people')
      .select(`
        *,
        addresses:core.addresses(*)
      `)
      .eq('id', id)
      .single();
    
    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error(`Erro ao buscar pessoa com ID ${id}:`, error);
    return { data: null, error };
  }
};

export const createPerson = async (person: Person) => {
  try {
    const { data, error } = await supabase
      .from('core.people')
      .insert(person)
      .select();
    
    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('Erro ao criar pessoa:', error);
    return { data: null, error };
  }
};

export const updatePerson = async (id: string, person: Partial<Person>) => {
  try {
    const { data, error } = await supabase
      .from('core.people')
      .update({ ...person, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select();
    
    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error(`Erro ao atualizar pessoa com ID ${id}:`, error);
    return { data: null, error };
  }
};

// ===== FUNÇÕES DE SERVIÇO PARA ORGANIZAÇÕES =====

export const getOrganizations = async (status?: string) => {
  try {
    let query = supabase
      .from('core.organizations')
      .select('*')
      .order('name', { ascending: true });
    
    if (status) {
      query = query.eq('status', status);
    }
    
    const { data, error } = await query;
    
    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('Erro ao buscar organizações:', error);
    return { data: null, error };
  }
};

export const getOrganization = async (id: string) => {
  try {
    const { data, error } = await supabase
      .from('core.organizations')
      .select(`
        *,
        addresses:core.addresses(*),
        contacts:core.contacts(*)
      `)
      .eq('id', id)
      .single();
    
    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error(`Erro ao buscar organização com ID ${id}:`, error);
    return { data: null, error };
  }
};

export const createOrganization = async (organization: Organization) => {
  try {
    const { data, error } = await supabase
      .from('core.organizations')
      .insert(organization)
      .select();
    
    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('Erro ao criar organização:', error);
    return { data: null, error };
  }
};

export const updateOrganization = async (id: string, organization: Partial<Organization>) => {
  try {
    const { data, error } = await supabase
      .from('core.organizations')
      .update({ ...organization, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select();
    
    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error(`Erro ao atualizar organização com ID ${id}:`, error);
    return { data: null, error };
  }
};

// ===== FUNÇÕES DE SERVIÇO PARA ENDEREÇOS =====

export const getAddresses = async (entityId: string, entityType: 'person' | 'organization') => {
  try {
    const { data, error } = await supabase
      .from('core.addresses')
      .select('*')
      .eq('entity_id', entityId)
      .eq('entity_type', entityType)
      .order('is_primary', { ascending: false });
    
    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error(`Erro ao buscar endereços para ${entityType} ${entityId}:`, error);
    return { data: null, error };
  }
};

export const createAddress = async (address: Address) => {
  try {
    // Se este for um endereço primário, precisamos garantir que apenas um seja primário
    if (address.is_primary) {
      await supabase
        .from('core.addresses')
        .update({ is_primary: false })
        .eq('entity_id', address.entity_id)
        .eq('entity_type', address.entity_type)
        .eq('type', address.type);
    }
    
    const { data, error } = await supabase
      .from('core.addresses')
      .insert(address)
      .select();
    
    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('Erro ao criar endereço:', error);
    return { data: null, error };
  }
};

// ===== FUNÇÕES DE SERVIÇO PARA CONTATOS =====

export const getContacts = async (organizationId?: string) => {
  try {
    let query = supabase
      .from('core.contacts')
      .select(`
        *,
        person:person_id(id, first_name, last_name)
      `)
      .order('is_primary', { ascending: false });
    
    if (organizationId) {
      query = query.eq('organization_id', organizationId);
    }
    
    const { data, error } = await query;
    
    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('Erro ao buscar contatos:', error);
    return { data: null, error };
  }
};

export const createContact = async (contact: Contact) => {
  try {
    // Se este for um contato primário, precisamos garantir que apenas um seja primário
    if (contact.is_primary && contact.organization_id) {
      await supabase
        .from('core.contacts')
        .update({ is_primary: false })
        .eq('organization_id', contact.organization_id);
    }
    
    const { data, error } = await supabase
      .from('core.contacts')
      .insert(contact)
      .select();
    
    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('Erro ao criar contato:', error);
    return { data: null, error };
  }
};

// ===== FUNÇÕES DE SERVIÇO PARA PAPEL DE CLIENTE =====

export const getCustomerRoles = async (status?: string) => {
  try {
    let query = supabase
      .from('sales.customer_roles')
      .select(`
        *,
        person:entity_id!inner(id, first_name, last_name, email, phone),
        organization:entity_id!inner(id, name, legal_name)
      `)
      .order('created_at', { ascending: false });
    
    if (status) {
      query = query.eq('status', status);
    }
    
    const { data, error } = await query;
    
    if (error) throw error;
    
    // Separar clientes pessoa física e jurídica
    const personCustomers = data?.filter(customer => customer.entity_type === 'person');
    const orgCustomers = data?.filter(customer => customer.entity_type === 'organization');
    
    return { 
      data: { personCustomers, orgCustomers, all: data },
      error: null 
    };
  } catch (error) {
    console.error('Erro ao buscar papéis de cliente:', error);
    return { data: null, error };
  }
};

export const getCustomerRole = async (id: string) => {
  try {
    const { data, error } = await supabase
      .from('sales.customer_roles')
      .select(`
        *,
        person:entity_id(id, first_name, last_name, email, phone, tax_id),
        organization:entity_id(id, name, legal_name, tax_id, website),
        account_manager:account_manager_id(id, first_name, last_name)
      `)
      .eq('id', id)
      .single();
    
    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error(`Erro ao buscar papel de cliente com ID ${id}:`, error);
    return { data: null, error };
  }
};

export const createCustomerRole = async (customerRole: CustomerRole) => {
  try {
    const { data, error } = await supabase
      .from('sales.customer_roles')
      .insert(customerRole)
      .select();
    
    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('Erro ao criar papel de cliente:', error);
    return { data: null, error };
  }
};

export const updateCustomerRole = async (id: string, customerRole: Partial<CustomerRole>) => {
  try {
    const { data, error } = await supabase
      .from('sales.customer_roles')
      .update({ ...customerRole, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select();
    
    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error(`Erro ao atualizar papel de cliente com ID ${id}:`, error);
    return { data: null, error };
  }
};

// ===== FUNÇÕES DE SERVIÇO PARA PAPEL DE REPRESENTANTE DE VENDAS =====

export const getSalesRepRoles = async (isActive?: boolean) => {
  try {
    let query = supabase
      .from('sales.sales_rep_roles')
      .select(`
        *,
        employee:employee_role_id(
          id,
          person:person_id(id, first_name, last_name, email, phone)
        )
      `);
    
    if (isActive !== undefined) {
      query = query.eq('is_active', isActive);
    }
    
    const { data, error } = await query;
    
    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('Erro ao buscar papéis de representante de vendas:', error);
    return { data: null, error };
  }
};

export const createSalesRepRole = async (salesRepRole: SalesRepRole) => {
  try {
    const { data, error } = await supabase
      .from('sales.sales_rep_roles')
      .insert(salesRepRole)
      .select();
    
    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('Erro ao criar papel de representante de vendas:', error);
    return { data: null, error };
  }
};

// ===== FUNÇÕES AUXILIARES PARA INTEGRAÇÃO ENTRE MÓDULOS =====

export const getCustomerAccountBalance = async (customerRoleId: string) => {
  try {
    const { data, error } = await supabase.rpc('finance.get_customer_balance', {
      p_customer_role_id: customerRoleId
    });
    
    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error(`Erro ao buscar saldo da conta do cliente ${customerRoleId}:`, error);
    return { data: null, error };
  }
};

export const getCustomerSalesHistory = async (customerRoleId: string) => {
  try {
    const { data, error } = await supabase
      .from('sales.sales')
      .select('*')
      .eq('customer_role_id', customerRoleId)
      .order('date', { ascending: false });
    
    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error(`Erro ao buscar histórico de vendas do cliente ${customerRoleId}:`, error);
    return { data: null, error };
  }
};

export const getSalesRepPerformance = async (salesRepRoleId: string, period?: string) => {
  try {
    const { data, error } = await supabase.rpc('sales.get_sales_rep_performance', {
      p_sales_rep_role_id: salesRepRoleId,
      p_period: period || 'month'
    });
    
    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error(`Erro ao buscar performance do representante de vendas ${salesRepRoleId}:`, error);
    return { data: null, error };
  }
};

// ===== FUNÇÕES DE INTEGRAÇÃO COM O AGENTE =====

export const getAgentEntityInsights = async (entityId: string, entityType: 'person' | 'organization') => {
  try {
    const { data, error } = await supabase.rpc('agent.get_entity_insights', {
      p_entity_id: entityId,
      p_entity_type: entityType
    });
    
    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error(`Erro ao buscar insights do Agente para ${entityType} ${entityId}:`, error);
    return { data: null, error };
  }
};

export const getAgentCustomerRecommendations = async (customerRoleId: string) => {
  try {
    const { data, error } = await supabase.rpc('agent.get_customer_recommendations', {
      p_customer_role_id: customerRoleId
    });
    
    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error(`Erro ao buscar recomendações do Agente para o cliente ${customerRoleId}:`, error);
    return { data: null, error };
  }
};

export const getAgentSalesRepSuggestions = async (salesRepRoleId: string) => {
  try {
    const { data, error } = await supabase.rpc('agent.get_sales_rep_suggestions', {
      p_sales_rep_role_id: salesRepRoleId
    });
    
    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error(`Erro ao buscar sugestões do Agente para o representante ${salesRepRoleId}:`, error);
    return { data: null, error };
  }
};
