export const PRODUCTS_WITH_STATUS = `(
  SELECT p.*, c.name AS category_name,
    CASE WHEN p.stock = 0 THEN 'Out of Stock'
         WHEN p.stock <= p.min_stock THEN 'Severe'
         WHEN p.stock <= p.low_stock THEN 'Low'
         ELSE 'Normal' END AS stock_status
  FROM products p JOIN categories c ON c.id = p.category_id
) AS pv`;
