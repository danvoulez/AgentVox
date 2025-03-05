-- Create views for dashboard statistics
-- This migration creates the necessary views to power the dashboard statistics

-- Create a view for dashboard stats by time range
CREATE OR REPLACE VIEW dashboard_stats AS
WITH 
  time_ranges AS (
    SELECT 'day' as time_range, CURRENT_DATE - INTERVAL '1 day' as start_date, CURRENT_DATE as end_date
    UNION ALL
    SELECT 'week' as time_range, CURRENT_DATE - INTERVAL '7 days' as start_date, CURRENT_DATE as end_date
    UNION ALL
    SELECT 'month' as time_range, CURRENT_DATE - INTERVAL '30 days' as start_date, CURRENT_DATE as end_date
    UNION ALL
    SELECT 'quarter' as time_range, CURRENT_DATE - INTERVAL '90 days' as start_date, CURRENT_DATE as end_date
    UNION ALL
    SELECT 'year' as time_range, CURRENT_DATE - INTERVAL '365 days' as start_date, CURRENT_DATE as end_date
    UNION ALL
    SELECT 'all' as time_range, '1970-01-01'::date as start_date, CURRENT_DATE as end_date
  ),
  
  current_period_sales AS (
    SELECT 
      tr.time_range,
      COUNT(s.id) as total_sales,
      COALESCE(SUM(s.total_amount), 0) as total_revenue,
      CASE 
        WHEN COUNT(s.id) > 0 THEN COALESCE(SUM(s.total_amount) / COUNT(s.id), 0)
        ELSE 0
      END as average_order_value
    FROM time_ranges tr
    LEFT JOIN sales s ON s.sale_date >= tr.start_date AND s.sale_date < tr.end_date
    GROUP BY tr.time_range
  ),
  
  previous_period_sales AS (
    SELECT 
      tr.time_range,
      COALESCE(SUM(s.total_amount), 0) as prev_revenue
    FROM time_ranges tr
    LEFT JOIN sales s ON 
      s.sale_date >= (tr.start_date - (tr.end_date - tr.start_date)) AND 
      s.sale_date < tr.start_date
    GROUP BY tr.time_range
  ),
  
  active_products AS (
    SELECT
      tr.time_range,
      COUNT(DISTINCT p.id) as active_products
    FROM time_ranges tr
    LEFT JOIN products p ON p.is_active = true
    GROUP BY tr.time_range
  ),
  
  client_stats AS (
    SELECT
      tr.time_range,
      COUNT(DISTINCT p.id) as total_clients,
      COUNT(DISTINCT CASE WHEN p.created_at >= tr.start_date THEN p.id ELSE NULL END) as new_clients
    FROM time_ranges tr
    LEFT JOIN people p ON 
      EXISTS (SELECT 1 FROM people_functions pf WHERE pf.person_id = p.id AND pf.function_type = 'client' AND pf.is_active = true)
    GROUP BY tr.time_range
  )
  
SELECT
  tr.time_range,
  cps.total_sales,
  cps.total_revenue,
  cps.average_order_value,
  CASE 
    WHEN pps.prev_revenue > 0 THEN 
      ((cps.total_revenue - pps.prev_revenue) / pps.prev_revenue) * 100
    ELSE 0
  END as revenue_growth,
  ap.active_products,
  cs.total_clients,
  cs.new_clients
FROM time_ranges tr
JOIN current_period_sales cps ON cps.time_range = tr.time_range
JOIN previous_period_sales pps ON pps.time_range = tr.time_range
JOIN active_products ap ON ap.time_range = tr.time_range
JOIN client_stats cs ON cs.time_range = tr.time_range;

-- Create a view for top products
CREATE OR REPLACE VIEW top_products AS
WITH time_ranges AS (
  SELECT 'day' as time_range, CURRENT_DATE - INTERVAL '1 day' as start_date, CURRENT_DATE as end_date
  UNION ALL
  SELECT 'week' as time_range, CURRENT_DATE - INTERVAL '7 days' as start_date, CURRENT_DATE as end_date
  UNION ALL
  SELECT 'month' as time_range, CURRENT_DATE - INTERVAL '30 days' as start_date, CURRENT_DATE as end_date
  UNION ALL
  SELECT 'quarter' as time_range, CURRENT_DATE - INTERVAL '90 days' as start_date, CURRENT_DATE as end_date
  UNION ALL
  SELECT 'year' as time_range, CURRENT_DATE - INTERVAL '365 days' as start_date, CURRENT_DATE as end_date
  UNION ALL
  SELECT 'all' as time_range, '1970-01-01'::date as start_date, CURRENT_DATE as end_date
)
SELECT
  tr.time_range,
  p.id as product_id,
  p.name as product_name,
  p.image_url,
  COUNT(si.id) as total_sales,
  SUM(si.quantity) as total_quantity,
  SUM(si.quantity * si.unit_price) as total_revenue
FROM time_ranges tr
JOIN sales s ON s.sale_date >= tr.start_date AND s.sale_date < tr.end_date
JOIN sale_items si ON si.sale_id = s.id
JOIN products p ON p.id = si.product_id
GROUP BY tr.time_range, p.id, p.name, p.image_url
ORDER BY tr.time_range, total_revenue DESC;

-- Create a view for top clients
CREATE OR REPLACE VIEW top_clients AS
WITH time_ranges AS (
  SELECT 'day' as time_range, CURRENT_DATE - INTERVAL '1 day' as start_date, CURRENT_DATE as end_date
  UNION ALL
  SELECT 'week' as time_range, CURRENT_DATE - INTERVAL '7 days' as start_date, CURRENT_DATE as end_date
  UNION ALL
  SELECT 'month' as time_range, CURRENT_DATE - INTERVAL '30 days' as start_date, CURRENT_DATE as end_date
  UNION ALL
  SELECT 'quarter' as time_range, CURRENT_DATE - INTERVAL '90 days' as start_date, CURRENT_DATE as end_date
  UNION ALL
  SELECT 'year' as time_range, CURRENT_DATE - INTERVAL '365 days' as start_date, CURRENT_DATE as end_date
  UNION ALL
  SELECT 'all' as time_range, '1970-01-01'::date as start_date, CURRENT_DATE as end_date
)
SELECT
  tr.time_range,
  p.id as client_id,
  p.name as client_name,
  p.avatar_url,
  COUNT(s.id) as total_orders,
  SUM(s.total_amount) as total_spent
FROM time_ranges tr
JOIN sales s ON s.sale_date >= tr.start_date AND s.sale_date < tr.end_date
JOIN people p ON p.id = s.client_id
GROUP BY tr.time_range, p.id, p.name, p.avatar_url
ORDER BY tr.time_range, total_spent DESC;

-- Create a view for recent sales with client and item information
CREATE OR REPLACE VIEW recent_sales_with_details AS
SELECT
  s.id,
  s.sale_date,
  s.total_amount,
  s.status,
  s.payment_method,
  p.id as client_id,
  p.name as client_name,
  p.avatar_url as client_avatar,
  COUNT(si.id) as item_count,
  STRING_AGG(pr.name, ', ' ORDER BY si.id) as product_names
FROM sales s
JOIN people p ON p.id = s.client_id
JOIN sale_items si ON si.sale_id = s.id
JOIN products pr ON pr.id = si.product_id
GROUP BY s.id, s.sale_date, s.total_amount, s.status, s.payment_method, p.id, p.name, p.avatar_url
ORDER BY s.sale_date DESC;

-- Add RLS policies to the views
ALTER VIEW dashboard_stats ENABLE ROW LEVEL SECURITY;
ALTER VIEW top_products ENABLE ROW LEVEL SECURITY;
ALTER VIEW top_clients ENABLE ROW LEVEL SECURITY;
ALTER VIEW recent_sales_with_details ENABLE ROW LEVEL SECURITY;

-- Create policies to allow authenticated users to view the data
CREATE POLICY "Allow authenticated users to view dashboard stats" 
  ON dashboard_stats FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated users to view top products" 
  ON top_products FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated users to view top clients" 
  ON top_clients FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated users to view recent sales" 
  ON recent_sales_with_details FOR SELECT
  USING (auth.role() = 'authenticated');
