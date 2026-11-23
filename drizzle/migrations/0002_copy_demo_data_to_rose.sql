DO $$
DECLARE
  src uuid := '5d8b0691-4abb-4ae5-8ebf-a2ccda35ceea';
  dst uuid := '10423647-85d8-4cbb-a156-295a29ce5fc9';
BEGIN
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE id = dst) THEN RETURN; END IF;
  IF EXISTS (SELECT 1 FROM public.customers WHERE user_id = dst) THEN RETURN; END IF;

  CREATE TEMP TABLE map_p ON COMMIT DROP AS SELECT id AS old_id, gen_random_uuid() AS new_id FROM public.products WHERE user_id = src;
  CREATE TEMP TABLE map_c ON COMMIT DROP AS SELECT id AS old_id, gen_random_uuid() AS new_id FROM public.customers WHERE user_id = src;
  CREATE TEMP TABLE map_o ON COMMIT DROP AS SELECT id AS old_id, gen_random_uuid() AS new_id FROM public.orders WHERE user_id = src;

  INSERT INTO public.products (id,user_id,name,brand,category,price,stock,created_at)
  SELECT m.new_id, dst, p.name, p.brand, p.category, p.price, p.stock, p.created_at
  FROM public.products p JOIN map_p m ON m.old_id = p.id;

  INSERT INTO public.customers (id,user_id,name,phone,email,birth_date,notes,created_at)
  SELECT m.new_id, dst, c.name, c.phone, c.email, c.birth_date, c.notes, c.created_at
  FROM public.customers c JOIN map_c m ON m.old_id = c.id;

  INSERT INTO public.orders (id,user_id,customer_id,order_date,total,status,payment_method,notes,repurchase_contacted,created_at)
  SELECT m.new_id, dst, mc.new_id, o.order_date, o.total, o.status, o.payment_method, o.notes, o.repurchase_contacted, o.created_at
  FROM public.orders o JOIN map_o m ON m.old_id = o.id LEFT JOIN map_c mc ON mc.old_id = o.customer_id;

  INSERT INTO public.order_items (user_id,order_id,product_id,product_name,quantity,unit_price,created_at)
  SELECT dst, mo.new_id, mp.new_id, i.product_name, i.quantity, i.unit_price, i.created_at
  FROM public.order_items i JOIN map_o mo ON mo.old_id = i.order_id LEFT JOIN map_p mp ON mp.old_id = i.product_id;
END $$;