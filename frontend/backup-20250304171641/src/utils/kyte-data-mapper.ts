/**
 * Utility functions for mapping data from Kyte to AgentVox format
 */

// Map a Kyte person to AgentVox person format
export function mapKytePerson(kytePerson: any) {
  return {
    legacy_id: kytePerson.id,
    name: kytePerson.name || kytePerson.fullName || 'Unknown',
    email: kytePerson.email,
    phone: kytePerson.phone || kytePerson.phoneNumber,
    avatar_url: kytePerson.avatar || kytePerson.profilePicture,
    data_source: 'kyte',
    metadata: {
      original_data: kytePerson,
      import_date: new Date().toISOString()
    },
    is_client: kytePerson.isClient || kytePerson.is_client || 
               kytePerson.type === 'client' || 
               kytePerson.role === 'client'
  };
}

// Map a Kyte product to AgentVox product format
export function mapKyteProduct(kyteProduct: any) {
  return {
    legacy_id: kyteProduct.id,
    name: kyteProduct.name || kyteProduct.title || 'Unknown Product',
    description: kyteProduct.description,
    current_price: parseFloat(kyteProduct.price) || 
                  parseFloat(kyteProduct.currentPrice) || 0,
    original_price: parseFloat(kyteProduct.originalPrice) || 
                   parseFloat(kyteProduct.oldPrice) || 
                   parseFloat(kyteProduct.price) || 0,
    image_url: kyteProduct.image || kyteProduct.imageUrl || kyteProduct.image_url,
    sku: kyteProduct.sku || kyteProduct.productCode,
    category: kyteProduct.category,
    is_active: kyteProduct.isActive !== false && kyteProduct.active !== false,
    stock: parseInt(kyteProduct.stock) || parseInt(kyteProduct.inventory) || 0,
    data_source: 'kyte',
    metadata: {
      original_data: kyteProduct,
      import_date: new Date().toISOString()
    }
  };
}

// Map a Kyte sale to AgentVox sale format
export function mapKyteSale(kyteSale: any) {
  // Calculate total if not provided
  let totalAmount = parseFloat(kyteSale.total) || 
                   parseFloat(kyteSale.totalAmount) || 
                   parseFloat(kyteSale.amount) || 0;
  
  if ((!totalAmount || totalAmount === 0) && kyteSale.items && Array.isArray(kyteSale.items)) {
    totalAmount = kyteSale.items.reduce((sum: number, item: any) => {
      const quantity = parseInt(item.quantity) || 1;
      const price = parseFloat(item.price) || parseFloat(item.unitPrice) || 0;
      return sum + (quantity * price);
    }, 0);
  }

  return {
    legacy_id: kyteSale.id,
    client_id: kyteSale.clientId || kyteSale.client_id || kyteSale.customerId,
    client_name: kyteSale.clientName || kyteSale.client_name || kyteSale.customerName,
    date: kyteSale.date || kyteSale.saleDate || kyteSale.createdAt,
    total_amount: totalAmount,
    payment_method: kyteSale.paymentMethod || kyteSale.payment_method,
    status: kyteSale.status || 'completed',
    notes: kyteSale.notes || kyteSale.comments,
    data_source: 'kyte',
    items: Array.isArray(kyteSale.items) ? kyteSale.items.map((item: any) => ({
      product_id: item.productId || item.product_id,
      product_name: item.productName || item.product_name,
      quantity: parseInt(item.quantity) || 1,
      unit_price: parseFloat(item.price) || parseFloat(item.unitPrice) || 0
    })) : [],
    metadata: {
      original_data: kyteSale,
      import_date: new Date().toISOString()
    }
  };
}

// Process WhatsApp conversation data
export function processWhatsAppConversation(conversation: any) {
  // Extract client info from conversation
  const clientPhone = conversation.clientPhone || conversation.phone;
  const clientName = conversation.clientName || conversation.name;
  
  // Extract conversation text
  const conversationText = Array.isArray(conversation.messages) 
    ? conversation.messages.map((msg: any) => {
        const sender = msg.fromMe ? 'Me' : clientName || 'Client';
        return `${sender}: ${msg.text || msg.content}`;
      }).join('\n')
    : conversation.text || '';
  
  // Check if conversation contains sale information
  const hasSale = conversationText.toLowerCase().includes('compra') || 
                 conversationText.toLowerCase().includes('venda') ||
                 conversationText.toLowerCase().includes('pagamento') ||
                 conversationText.toLowerCase().includes('preço') ||
                 conversationText.toLowerCase().includes('valor');
  
  return {
    client_phone: clientPhone,
    client_name: clientName,
    start_timestamp: conversation.startTime || conversation.date || new Date().toISOString(),
    end_timestamp: conversation.endTime,
    conversation_text: conversationText,
    conversation_summary: conversation.summary || '',
    has_sale: hasSale,
    metadata: {
      original_data: conversation,
      import_date: new Date().toISOString()
    }
  };
}
