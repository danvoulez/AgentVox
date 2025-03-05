import { supabase } from '@/util s/supabaseClient';
import { deliveryTrackingService } from '@/utils/realtime/delivery-tracking';

/**
 * Serviços para o módulo de Vendas com integração profunda do Agente
 * O Agente funciona como o cérebro do sistema, oferecendo análises avançadas,
 * previsões e recomendações inteligentes baseadas nos dados de vendas.
 */

// Interfaces principais
interface Customer {
  id?: string;
  name: string;
  email?: string;
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
  postal_code?: string;
  country?: string;
  tax_id?: string;
  notes?: string;
  customer_segment?: string;
  credit_limit?: number;
  status: 'active' | 'inactive' | 'prospect' | 'blocked';
  created_at?: string;
  updated_at?: string;
}

interface Contact {
  id?: string;
  customer_id: string;
  name: string;
  position?: string;
  email?: string;
  phone?: string;
  is_primary: boolean;
  notes?: string;
}

interface Sale {
  id?: string;
  customer_id: string;
  sales_rep_id?: string;
  date: string;
  status: 'draft' | 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled' | 'returned';
  total: number;
  tax_amount?: number;
  discount_amount?: number;
  shipping_amount?: number;
  payment_method?: string;
  payment_status: 'pending' | 'partial' | 'paid' | 'refunded';
  notes?: string;
  shipping_address?: string;
  billing_address?: string;
  created_at?: string;
  updated_at?: string;
}

interface SaleItem {
  id?: string;
  sale_id: string;
  product_id: string;
  quantity: number;
  unit_price: number;
  discount?: number;
  total: number;
  notes?: string;
}

interface SalesRep {
  id?: string;
  employee_id: string;
  commission_rate?: number;
  territory?: string;
  target?: number;
  is_active: boolean;
}

interface AgentInsight {
  type: string;
  title: string;
  description: string;
  data: any;
  priority: 'low' | 'medium' | 'high';
  recommendations?: string[];
  created_at: string;
}

interface AgentPrediction {
  target: string;
  period: string;
  value: number;
  confidence: number;
  factors: {
    name: string;
    impact: number;
  }[];
  created_at: string;
}

// Funções de serviço para Clientes
export const getCustomers = async (segment?: string, status?: string) => {
  try {
    let query = supabase
      .from('sales.customers')
      .select('*')
      .order('name');
    
    if (segment) {
      query = query.eq('customer_segment', segment);
    }
    
    if (status) {
      query = query.eq('status', status);
    }
    
    const { data, error } = await query;
    
    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('Erro ao buscar clientes:', error);
    return { data: null, error };
  }
};

export const getCustomer = async (id: string) => {
  try {
    const { data, error } = await supabase
      .from('sales.customers')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error(`Erro ao buscar cliente com ID ${id}:`, error);
    return { data: null, error };
  }
};

export const createCustomer = async (customer: Customer) => {
  try {
    const { data, error } = await supabase
      .from('sales.customers')
      .insert(customer)
      .select();
    
    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('Erro ao criar cliente:', error);
    return { data: null, error };
  }
};

export const updateCustomer = async (id: string, customer: Partial<Customer>) => {
  try {
    const { data, error } = await supabase
      .from('sales.customers')
      .update(customer)
      .eq('id', id)
      .select();
    
    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error(`Erro ao atualizar cliente com ID ${id}:`, error);
    return { data: null, error };
  }
};

export const deleteCustomer = async (id: string) => {
  try {
    const { error } = await supabase
      .from('sales.customers')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
    return { error: null };
  } catch (error) {
    console.error(`Erro ao excluir cliente com ID ${id}:`, error);
    return { error };
  }
};

// Funções de serviço para Contatos
export const getCustomerContacts = async (customerId: string) => {
  try {
    const { data, error } = await supabase
      .from('sales.contacts')
      .select('*')
      .eq('customer_id', customerId)
      .order('is_primary', { ascending: false });
    
    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error(`Erro ao buscar contatos do cliente ${customerId}:`, error);
    return { data: null, error };
  }
};

export const createContact = async (contact: Contact) => {
  try {
    const { data, error } = await supabase
      .from('sales.contacts')
      .insert(contact)
      .select();
    
    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('Erro ao criar contato:', error);
    return { data: null, error };
  }
};

export const updateContact = async (id: string, contact: Partial<Contact>) => {
  try {
    const { data, error } = await supabase
      .from('sales.contacts')
      .update(contact)
      .eq('id', id)
      .select();
    
    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error(`Erro ao atualizar contato com ID ${id}:`, error);
    return { data: null, error };
  }
};

export const deleteContact = async (id: string) => {
  try {
    const { error } = await supabase
      .from('sales.contacts')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
    return { error: null };
  } catch (error) {
    console.error(`Erro ao excluir contato com ID ${id}:`, error);
    return { error };
  }
};

// Funções de serviço para Vendas
export const getSales = async (status?: string, startDate?: string, endDate?: string) => {
  try {
    let query = supabase
      .from('sales.sales')
      .select(`
        *,
        customer:customer_id(id, name),
        sales_rep:sales_rep_id(id, employee_id)
      `)
      .order('date', { ascending: false });
    
    if (status) {
      query = query.eq('status', status);
    }
    
    if (startDate) {
      query = query.gte('date', startDate);
    }
    
    if (endDate) {
      query = query.lte('date', endDate);
    }
    
    const { data, error } = await query;
    
    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('Erro ao buscar vendas:', error);
    return { data: null, error };
  }
};

export const getSale = async (id: string) => {
  try {
    const { data, error } = await supabase
      .from('sales.sales')
      .select(`
        *,
        customer:customer_id(id, name),
        sales_rep:sales_rep_id(id, employee_id),
        items:sales.sale_items(*)
      `)
      .eq('id', id)
      .single();
    
    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error(`Erro ao buscar venda com ID ${id}:`, error);
    return { data: null, error };
  }
};

export const createSale = async (sale: Sale, items: SaleItem[]) => {
  try {
    // Iniciar transação
    const { data: saleData, error: saleError } = await supabase
      .from('sales.sales')
      .insert(sale)
      .select();
    
    if (saleError) throw saleError;
    
    const saleId = saleData[0].id;
    
    // Adicionar itens
    const itemsWithSaleId = items.map(item => ({
      ...item,
      sale_id: saleId
    }));
    
    const { error: itemsError } = await supabase
      .from('sales.sale_items')
      .insert(itemsWithSaleId);
    
    if (itemsError) throw itemsError;
    
    // Atualizar estoque
    for (const item of items) {
      await supabase.rpc('inventory.update_stock', {
        p_product_id: item.product_id,
        p_quantity: -item.quantity,
        p_reference_id: saleId,
        p_reference_type: 'sale'
      });
    }
    
    return { data: { id: saleId }, error: null };
  } catch (error) {
    console.error('Erro ao criar venda:', error);
    return { data: null, error };
  }
};

export const updateSaleStatus = async (id: string, status: string) => {
  try {
    const { data, error } = await supabase
      .from('sales.sales')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select();
    
    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error(`Erro ao atualizar status da venda ${id}:`, error);
    return { data: null, error };
  }
};

/**
 * Atribui um estafeta a um pedido e envia automaticamente o link de rastreamento para o cliente
 * @param saleId ID da venda/pedido
 * @param courierId ID do estafeta
 * @returns Objeto com status da operação e link de rastreamento
 */
export const assignCourierToSale = async (saleId: string, courierId: string) => {
  try {
    // 1. Obter informações do pedido e do cliente
    const { data: saleData, error: saleError } = await supabase
      .from('sales.sales')
      .select('customer_id')
      .eq('id', saleId)
      .single();
    
    if (saleError) throw saleError;
    if (!saleData) throw new Error(`Venda ${saleId} não encontrada`);
    
    const customerId = saleData.customer_id;
    
    // 2. Obter informações de contato do cliente
    const { data: customerData, error: customerError } = await supabase
      .from('sales.customers')
      .select('email, phone')
      .eq('id', customerId)
      .single();
    
    if (customerError) throw customerError;
    
    // 3. Atribuir o estafeta ao pedido e enviar o link de rastreamento
    const { success, trackingLink, error: assignError } = await deliveryTrackingService.assignCourierToOrder(
      saleId,
      courierId,
      customerId,
      customerData?.email,
      customerData?.phone
    );
    
    if (!success) throw assignError;
    
    return { success: true, trackingLink, error: null };
  } catch (error) {
    console.error(`Erro ao atribuir estafeta à venda ${saleId}:`, error);
    return { success: false, trackingLink: null, error };
  }
};

export const updateSalePaymentStatus = async (id: string, paymentStatus: string) => {
  try {
    const { data, error } = await supabase
      .from('sales.sales')
      .update({ payment_status: paymentStatus, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select();
    
    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error(`Erro ao atualizar status de pagamento da venda ${id}:`, error);
    return { data: null, error };
  }
};

export const getSaleItems = async (saleId: string) => {
  try {
    const { data, error } = await supabase
      .from('sales.sale_items')
      .select(`
        *,
        product:product_id(id, name, sku)
      `)
      .eq('sale_id', saleId);
    
    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error(`Erro ao buscar itens da venda ${saleId}:`, error);
    return { data: null, error };
  }
};

// Funções de serviço para Representantes de Vendas
export const getSalesReps = async () => {
  try {
    const { data, error } = await supabase
      .from('sales.sales_reps')
      .select(`
        *,
        employee:employee_id(id, first_name, last_name)
      `)
      .eq('is_active', true);
    
    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('Erro ao buscar representantes de vendas:', error);
    return { data: null, error };
  }
};

export const getSalesRepPerformance = async (salesRepId: string, startDate: string, endDate: string) => {
  try {
    const { data, error } = await supabase
      .rpc('sales.calculate_sales_rep_performance', {
        p_sales_rep_id: salesRepId,
        p_start_date: startDate,
        p_end_date: endDate
      });
    
    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error(`Erro ao calcular desempenho do representante ${salesRepId}:`, error);
    return { data: null, error };
  }
};

// Integração do Agente - Funções de análise e previsão
export const getAgentSalesInsights = async (period?: string) => {
  try {
    // O Agente analisa os dados de vendas e retorna insights valiosos
    const { data, error } = await supabase
      .rpc('agent.analyze_sales_trends', {
        p_period: period || 'last_30_days'
      });
    
    if (error) throw error;
    return { data: data as AgentInsight[], error: null };
  } catch (error) {
    console.error('Erro ao obter insights de vendas do Agente:', error);
    return { data: null, error };
  }
};

export const getAgentSalesPredictions = async (targetPeriod: string) => {
  try {
    // O Agente fornece previsões de vendas baseadas em modelos preditivos
    const { data, error } = await supabase
      .rpc('agent.predict_sales', {
        p_target_period: targetPeriod
      });
    
    if (error) throw error;
    return { data: data as AgentPrediction[], error: null };
  } catch (error) {
    console.error(`Erro ao obter previsões de vendas do Agente para ${targetPeriod}:`, error);
    return { data: null, error };
  }
};

export const getAgentCustomerRecommendations = async (customerId: string) => {
  try {
    // O Agente recomenda produtos e ações baseadas no histórico e perfil do cliente
    const { data, error } = await supabase
      .rpc('agent.get_customer_recommendations', {
        p_customer_id: customerId
      });
    
    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error(`Erro ao obter recomendações do Agente para o cliente ${customerId}:`, error);
    return { data: null, error };
  }
};

export const getAgentSalesAnomalyDetection = async () => {
  try {
    // O Agente detecta anomalias nas vendas que podem indicar problemas ou oportunidades
    const { data, error } = await supabase
      .rpc('agent.detect_sales_anomalies');
    
    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('Erro ao executar detecção de anomalias pelo Agente:', error);
    return { data: null, error };
  }
};

export const getAgentInventoryRecommendations = async () => {
  try {
    // O Agente fornece recomendações inteligentes para otimização de estoque baseadas nas vendas
    const { data, error } = await supabase
      .rpc('agent.get_inventory_optimization_recommendations');
    
    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('Erro ao obter recomendações de estoque do Agente:', error);
    return { data: null, error };
  }
};

export const getAgentPricingRecommendations = async (productId: string) => {
  try {
    // O Agente sugere estratégias de precificação otimizadas baseadas em dados de mercado e vendas
    const { data, error } = await supabase
      .rpc('agent.get_pricing_recommendations', {
        p_product_id: productId
      });
    
    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error(`Erro ao obter recomendações de preço do Agente para o produto ${productId}:`, error);
    return { data: null, error };
  }
};

// Dashboard e relatórios
export const getSalesDashboardData = async (period?: string) => {
  try {
    const { data, error } = await supabase
      .rpc('sales.get_dashboard_data', {
        p_period: period || 'current_month'
      });
    
    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('Erro ao obter dados do dashboard de vendas:', error);
    return { data: null, error };
  }
};

export const getSalesReport = async (startDate: string, endDate: string, groupBy?: string) => {
  try {
    const { data, error } = await supabase
      .rpc('sales.generate_sales_report', {
        p_start_date: startDate,
        p_end_date: endDate,
        p_group_by: groupBy || 'day'
      });
    
    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('Erro ao gerar relatório de vendas:', error);
    return { data: null, error };
  }
};

// Funções de busca e utilitários
export const searchCustomers = async (query: string) => {
  try {
    const { data, error } = await supabase
      .from('sales.customers')
      .select('*')
      .or(`name.ilike.%${query}%,email.ilike.%${query}%,phone.ilike.%${query}%`)
      .order('name');
    
    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error(`Erro ao pesquisar clientes com a consulta "${query}":`, error);
    return { data: null, error };
  }
};

export const getCustomerSalesHistory = async (customerId: string) => {
  try {
    const { data, error } = await supabase
      .from('sales.sales')
      .select(`
        *,
        items:sales.sale_items(
          *,
          product:product_id(id, name)
        )
      `)
      .eq('customer_id', customerId)
      .order('date', { ascending: false });
    
    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error(`Erro ao buscar histórico de vendas do cliente ${customerId}:`, error);
    return { data: null, error };
  }
};

// Integração com módulo de Finanças
export const getCustomerAccountBalance = async (customerId: string) => {
  try {
    const { data, error } = await supabase
      .rpc('finance.get_customer_balance', {
        p_customer_id: customerId
      });
    
    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error(`Erro ao obter saldo da conta do cliente ${customerId}:`, error);
    return { data: null, error };
  }
};
