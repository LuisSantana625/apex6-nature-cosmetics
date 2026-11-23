DO $$
DECLARE
  u uuid := '5d8b0691-4abb-4ae5-8ebf-a2ccda35ceea';
  fn text[] := ARRAY['Ana','Beatriz','Camila','Daniela','Eduarda','Fernanda','Gabriela','Helena','Isabela','Juliana','Larissa','Mariana','Natália','Olívia','Patrícia','Rafaela','Sofia','Tatiane','Vanessa','Yasmin','Aline','Bruna','Carolina','Débora','Elaine','Flávia','Giovana','Jéssica','Letícia','Luana','Manuela','Priscila','Renata','Sabrina','Thaís','Valentina','Alice','Laura','Lívia','Cecília','Clara','Marina','Paula','Raquel','Simone','Luiza','Bianca','Carla','Lorena','Viviane','Lucas','Pedro','Rafael','Gustavo','Marcos'];
  ln text[] := ARRAY['Silva','Santos','Oliveira','Souza','Rodrigues','Ferreira','Alves','Pereira','Lima','Gomes','Costa','Ribeiro','Martins','Carvalho','Almeida','Lopes','Soares','Fernandes','Vieira','Barbosa','Rocha','Dias','Nascimento','Andrade','Moreira','Nunes','Marques','Machado','Mendes','Freitas','Cardoso','Teixeira','Araújo','Monteiro','Correia'];
  nts text[] := ARRAY[NULL,NULL,NULL,'Pele oleosa','Pele seca, prefere produtos sem fragrância','Pele sensível','Cabelo cacheado','Prefere contato à tarde','Cliente desde a inauguração','Gosta de lançamentos','Pele mista','Alergia a parabenos'];
  ddd text[] := ARRAY['11','11','11','21','31','41','19','13','61','71','81','85'];
  doms text[] := ARRAY['gmail.com','hotmail.com','outlook.com','yahoo.com.br'];
  pays text[] := ARRAY['pix','pix','pix','credito','credito','debito','dinheiro','boleto'];
  cust uuid[];
  prods uuid[];
  i int; k int; d int; nitems int;
  f text; l text; slugf text; slugl text;
  cid uuid; oid uuid; pid uuid; pr numeric; pn text; qt int; tot numeric; st text; od date;
BEGIN
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE id = u) THEN RETURN; END IF;
  IF EXISTS (SELECT 1 FROM public.customers WHERE user_id = u) THEN RETURN; END IF;
  PERFORM setseed(0.42);

  INSERT INTO public.products (user_id,name,brand,category,price,stock) VALUES
  (u,'Sérum Vitamina C 10%','Naturé','Skincare',89.90,12),(u,'Hidratante Facial FPS 30','Naturé','Skincare',64.90,20),
  (u,'Gel de Limpeza Facial','Naturé','Skincare',42.90,25),(u,'Água Micelar 200ml','Naturé','Skincare',39.90,3),
  (u,'Tônico Facial Calmante','Naturé','Skincare',49.90,15),(u,'Máscara de Argila Verde','Naturé','Skincare',54.90,8),
  (u,'Protetor Solar FPS 50','Naturé','Skincare',72.90,30),(u,'Creme para Olhos','Naturé','Skincare',79.90,2),
  (u,'Óleo Facial Rosa Mosqueta','Naturé','Skincare',69.90,10),(u,'Esfoliante Facial','Naturé','Skincare',44.90,14),
  (u,'Shampoo Nutrição 300ml','Naturé','Cabelos',45.90,22),(u,'Condicionador Nutrição 300ml','Naturé','Cabelos',47.90,18),
  (u,'Máscara Capilar Reconstrução','Naturé','Cabelos',59.90,0),(u,'Óleo Capilar de Argan','Naturé','Cabelos',52.90,9),
  (u,'Leave-in Cachos','Naturé','Cabelos',39.90,16),(u,'Batom Matte Rosé','Naturé','Maquiagem',34.90,25),
  (u,'Base Líquida Natural','Naturé','Maquiagem',79.90,7),(u,'Máscara de Cílios','Naturé','Maquiagem',49.90,11),
  (u,'Blush Pêssego','Naturé','Maquiagem',42.90,1),(u,'Pó Compacto Translúcido','Naturé','Maquiagem',54.90,13),
  (u,'Hidratante Corporal Lavanda','Naturé','Corpo',49.90,20),(u,'Óleo Corporal Amêndoas','Naturé','Corpo',44.90,12),
  (u,'Sabonete Líquido Erva-doce','Naturé','Corpo',29.90,35),(u,'Esfoliante Corporal Café','Naturé','Corpo',46.90,6),
  (u,'Creme para Mãos Karité','Naturé','Corpo',27.90,28),(u,'Perfume Flor de Laranjeira 50ml','Naturé','Perfumaria',149.90,5),
  (u,'Body Splash Frutas Vermelhas','Naturé','Perfumaria',69.90,17),(u,'Desodorante Natural','Naturé','Corpo',32.90,24);
  SELECT array_agg(id ORDER BY name) INTO prods FROM public.products WHERE user_id = u;

  cust := ARRAY[]::uuid[];
  FOR i IN 1..70 LOOP
    f := fn[1 + (i-1) % array_length(fn,1)];
    l := ln[1 + (((i-1)/55)*13 + (i-1)*3) % array_length(ln,1)];
    slugf := lower(translate(f,'áàâãéêíóôõúçÁÉÍÓÚ','aaaaeeiooouc AEIOU'));
    slugl := lower(translate(l,'áàâãéêíóôõúçÁÉÍÓÚ','aaaaeeiooouc AEIOU'));
    INSERT INTO public.customers (user_id,name,phone,email,birth_date,notes,created_at)
    VALUES (u, f||' '||l,
      '('||ddd[1+floor(random()*12)::int]||') 9'||(6000+floor(random()*4000)::int)||'-'||(1000+floor(random()*9000)::int),
      slugf||'.'||slugl||(1+floor(random()*98)::int)||'@'||doms[1+floor(random()*4)::int],
      make_date(1965+floor(random()*40)::int, 1+floor(random()*12)::int, 1+floor(random()*28)::int),
      nts[1+floor(random()*12)::int],
      now() - ((95+floor(random()*100)::int)||' days')::interval)
    RETURNING id INTO cid;
    cust := cust || cid;
  END LOOP;

  FOR i IN 1..100 LOOP
    IF i <= 70 THEN cid := cust[i]; ELSE cid := cust[1+floor(random()*70)::int]; END IF;
    d := floor(random()*86)::int;
    od := CURRENT_DATE - d;
    IF d <= 2 THEN st := (ARRAY['pendente','pago'])[1+floor(random()*2)::int];
    ELSIF d <= 7 THEN st := (ARRAY['pago','enviado'])[1+floor(random()*2)::int];
    ELSIF random() < 0.08 THEN st := 'cancelado';
    ELSE st := 'entregue'; END IF;
    INSERT INTO public.orders (user_id,customer_id,order_date,total,status,payment_method,repurchase_contacted,created_at)
    VALUES (u, cid, od, 0, st, pays[1+floor(random()*8)::int], (d >= 20 AND random() < 0.25),
      od::timestamp + ((9+floor(random()*10)::int)||' hours')::interval)
    RETURNING id INTO oid;
    tot := 0;
    nitems := 1 + floor(random()*3)::int + CASE WHEN random() < 0.15 THEN 1 ELSE 0 END;
    FOR k IN 1..nitems LOOP
      pid := prods[1+floor(random()*array_length(prods,1))::int];
      SELECT name, price INTO pn, pr FROM public.products WHERE id = pid;
      qt := CASE WHEN random() < 0.25 THEN 2 ELSE 1 END;
      INSERT INTO public.order_items (user_id,order_id,product_id,product_name,quantity,unit_price)
      VALUES (u, oid, pid, pn, qt, pr);
      tot := tot + qt*pr;
    END LOOP;
    UPDATE public.orders SET total = tot WHERE id = oid;
  END LOOP;
END $$;