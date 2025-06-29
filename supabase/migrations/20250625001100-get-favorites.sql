-- RPC: get_favorites(user_id uuid)
CREATE OR REPLACE FUNCTION public.get_favorites(p_user_id UUID)
RETURNS TABLE (
  item_id UUID,
  name TEXT,
  image_url TEXT,
  order_count BIGINT
) LANGUAGE sql AS $$
  SELECT
    (jsonb_array_elements(o.items)->>'id')::uuid AS item_id,
    (jsonb_array_elements(o.items)->>'name') AS name,
    (jsonb_array_elements(o.items)->>'image_url') AS image_url,
    COUNT(*) AS order_count
  FROM orders o
  WHERE o.user_id = p_user_id
  GROUP BY item_id, name, image_url
  ORDER BY order_count DESC
  LIMIT 5;
$$;

GRANT EXECUTE ON FUNCTION public.get_favorites(UUID) TO authenticated; 