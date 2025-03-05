import type { NextApiRequest, NextApiResponse } from 'next';
import { supabase, getServiceSupabase, formatSupabaseResponse } from '@/utils/supabase';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Get the authenticated user
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  // Only allow POST method for import
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Use service role client for database operations
  const serviceClient = getServiceSupabase();

  try {
    const { data_type, data } = req.body;

    if (!data_type || !data || !Array.isArray(data)) {
      return res.status(400).json({ error: 'Invalid import data. Must provide data_type and data array.' });
    }

    let importResults;

    switch (data_type) {
      case 'people':
        importResults = await importPeople(data, serviceClient);
        break;
      case 'products':
        importResults = await importProducts(data, serviceClient);
        break;
      case 'sales':
        importResults = await importSales(data, serviceClient);
        break;
      default:
        return res.status(400).json({ error: 'Invalid data_type. Must be one of: people, products, sales' });
    }

    return res.status(200).json(importResults);
  } catch (error) {
    console.error(`Error importing ${req.body.data_type || 'data'}:`, error);
    return res.status(500).json({ error: `Failed to import ${req.body.data_type || 'data'}` });
  }
}

async function importPeople(people: any[], supabase: any) {
  const results = {
    total: people.length,
    imported: 0,
    errors: 0,
    details: [] as any[]
  };

  for (const person of people) {
    try {
      // Check if person already exists by legacy_id
      const { data: existingPerson, error: checkError } = await supabase
        .from('people')
        .select('id')
        .eq('legacy_id', person.id)
        .maybeSingle();

      if (checkError && checkError.code !== 'PGRST116') {
        throw checkError;
      }

      if (existingPerson) {
        // Update existing person
        const { data: updatedPerson, error: updateError } = await supabase
          .from('people')
          .update({
            name: person.name,
            email: person.email,
            phone: person.phone,
            avatar_url: person.avatar,
            metadata: person.metadata || {},
            updated_at: new Date().toISOString()
          })
          .eq('id', existingPerson.id)
          .select()
          .single();

        if (updateError) {
          throw updateError;
        }

        results.imported++;
        results.details.push({
          legacy_id: person.id,
          id: updatedPerson.id,
          name: updatedPerson.name,
          status: 'updated'
        });
      } else {
        // Create new person
        const { data: newPerson, error: createError } = await supabase
          .from('people')
          .insert({
            legacy_id: person.id,
            name: person.name,
            email: person.email,
            phone: person.phone,
            avatar_url: person.avatar,
            data_source: 'kyte',
            metadata: person.metadata || {}
          })
          .select()
          .single();

        if (createError) {
          throw createError;
        }

        // Add client function if needed
        if (person.is_client) {
          const { error: functionError } = await supabase
            .from('people_functions')
            .insert({
              person_id: newPerson.id,
              function_type: 'client',
              is_active: true
            });

          if (functionError) {
            throw functionError;
          }
        }

        results.imported++;
        results.details.push({
          legacy_id: person.id,
          id: newPerson.id,
          name: newPerson.name,
          status: 'created'
        });
      }
    } catch (error) {
      console.error('Error importing person:', error, person);
      results.errors++;
      results.details.push({
        legacy_id: person.id,
        name: person.name,
        status: 'error',
        error: error instanceof Error ? error.message : "Unknown error"
      });
    }
  }

  return results;
}

async function importProducts(products: any[], supabase: any) {
  const results = {
    total: products.length,
    imported: 0,
    errors: 0,
    details: [] as any[]
  };

  for (const product of products) {
    try {
      // Check if product already exists by legacy_id
      const { data: existingProduct, error: checkError } = await supabase
        .from('products')
        .select('id')
        .eq('legacy_id', product.id)
        .maybeSingle();

      if (checkError && checkError.code !== 'PGRST116') {
        throw checkError;
      }

      if (existingProduct) {
        // Update existing product
        const { data: updatedProduct, error: updateError } = await supabase
          .from('products')
          .update({
            name: product.name,
            description: product.description,
            price: product.current_price,
            legacy_price: product.original_price,
            image_url: product.image_url,
            sku: product.sku,
            category: product.category,
            is_active: product.is_active !== false,
            stock: product.stock || 0,
            metadata: product.metadata || {},
            updated_at: new Date().toISOString()
          })
          .eq('id', existingProduct.id)
          .select()
          .single();

        if (updateError) {
          throw updateError;
        }

        results.imported++;
        results.details.push({
          legacy_id: product.id,
          id: updatedProduct.id,
          name: updatedProduct.name,
          status: 'updated'
        });
      } else {
        // Create new product
        const { data: newProduct, error: createError } = await supabase
          .from('products')
          .insert({
            legacy_id: product.id,
            name: product.name,
            description: product.description,
            price: product.current_price,
            legacy_price: product.original_price,
            image_url: product.image_url,
            sku: product.sku,
            category: product.category,
            is_active: product.is_active !== false,
            stock: product.stock || 0,
            data_source: 'kyte',
            metadata: product.metadata || {}
          })
          .select()
          .single();

        if (createError) {
          throw createError;
        }

        results.imported++;
        results.details.push({
          legacy_id: product.id,
          id: newProduct.id,
          name: newProduct.name,
          status: 'created'
        });
      }
    } catch (error) {
      console.error('Error importing product:', error, product);
      results.errors++;
      results.details.push({
        legacy_id: product.id,
        name: product.name,
        status: 'error',
        error: error instanceof Error ? error.message : "Unknown error"
      });
    }
  }

  return results;
}

async function importSales(sales: any[], supabase: any) {
  const results = {
    total: sales.length,
    imported: 0,
    errors: 0,
    details: [] as any[]
  };

  for (const sale of sales) {
    try {
      // Check if sale already exists by legacy_id
      const { data: existingSale, error: checkError } = await supabase
        .from('sales')
        .select('id')
        .eq('legacy_id', sale.id)
        .maybeSingle();

      if (checkError && checkError.code !== 'PGRST116') {
        throw checkError;
      }

      if (existingSale) {
        // Skip existing sales to avoid duplicates
        results.details.push({
          legacy_id: sale.id,
          id: existingSale.id,
          status: 'skipped',
          message: 'Sale already imported'
        });
        continue;
      }

      // Find the client by legacy_id
      let clientId = null;
      if (sale.client_id) {
        const { data: client, error: clientError } = await supabase
          .from('people')
          .select('id')
          .eq('legacy_id', sale.client_id)
          .maybeSingle();

        if (clientError && clientError.code !== 'PGRST116') {
          throw clientError;
        }

        if (client) {
          clientId = client.id;
        } else {
          // Create a placeholder client if not found
          const { data: newClient, error: createClientError } = await supabase
            .from('people')
            .insert({
              legacy_id: sale.client_id,
              name: sale.client_name || 'Unknown Client',
              data_source: 'kyte',
              metadata: { imported_from_sale: sale.id }
            })
            .select()
            .single();

          if (createClientError) {
            throw createClientError;
          }

          // Add client function
          const { error: functionError } = await supabase
            .from('people_functions')
            .insert({
              person_id: newClient.id,
              function_type: 'client',
              is_active: true
            });

          if (functionError) {
            throw functionError;
          }

          clientId = newClient.id;
        }
      }

      // Create the sale
      const { data: newSale, error: createSaleError } = await supabase
        .from('sales')
        .insert({
          legacy_id: sale.id,
          client_id: clientId,
          sale_date: sale.date || new Date().toISOString(),
          total_amount: sale.total_amount,
          payment_method: sale.payment_method,
          status: sale.status || 'completed',
          data_source: 'kyte',
          notes: sale.notes,
          metadata: sale.metadata || {}
        })
        .select()
        .single();

      if (createSaleError) {
        throw createSaleError;
      }

      // Create sale items
      if (sale.items && Array.isArray(sale.items) && sale.items.length > 0) {
        const saleItems = [];

        for (const item of sale.items) {
          // Find the product by legacy_id
          const { data: product, error: productError } = await supabase
            .from('products')
            .select('id')
            .eq('legacy_id', item.product_id)
            .maybeSingle();

          if (productError && productError.code !== 'PGRST116') {
            throw productError;
          }

          let productId = null;
          if (product) {
            productId = product.id;
          } else {
            // Create a placeholder product if not found
            const { data: newProduct, error: createProductError } = await supabase
              .from('products')
              .insert({
                legacy_id: item.product_id,
                name: item.product_name || 'Unknown Product',
                price: item.unit_price || 0,
                data_source: 'kyte',
                metadata: { imported_from_sale: sale.id }
              })
              .select()
              .single();

            if (createProductError) {
              throw createProductError;
            }

            productId = newProduct.id;
          }

          saleItems.push({
            sale_id: newSale.id,
            product_id: productId,
            quantity: item.quantity,
            unit_price: item.unit_price
          });
        }

        if (saleItems.length > 0) {
          const { error: itemsError } = await supabase
            .from('sale_items')
            .insert(saleItems);

          if (itemsError) {
            throw itemsError;
          }
        }
      }

      results.imported++;
      results.details.push({
        legacy_id: sale.id,
        id: newSale.id,
        client_id: clientId,
        total_amount: newSale.total_amount,
        status: 'created'
      });
    } catch (error) {
      console.error('Error importing sale:', error, sale);
      results.errors++;
      results.details.push({
        legacy_id: sale.id,
        status: 'error',
        error: error instanceof Error ? error.message : "Unknown error"
      });
    }
  }

  return results;
}
