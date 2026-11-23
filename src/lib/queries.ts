import { queryOptions } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";

export type Customer = Tables<"customers">;
export type Product = Tables<"products">;
export type Order = Tables<"orders">;
export type OrderItem = Tables<"order_items">;
export type OrderWithRelations = Order & {
  customers: Pick<Customer, "name" | "phone"> | null;
  order_items: OrderItem[];
};

export const customersQuery = queryOptions({
  queryKey: ["customers"],
  queryFn: async () => {
    const { data, error } = await supabase.from("customers").select("*").order("name");
    if (error) throw error;
    return data;
  },
});

export const productsQuery = queryOptions({
  queryKey: ["products"],
  queryFn: async () => {
    const { data, error } = await supabase.from("products").select("*").order("name");
    if (error) throw error;
    return data;
  },
});

export const ordersQuery = queryOptions({
  queryKey: ["orders"],
  queryFn: async () => {
    const { data, error } = await supabase
      .from("orders")
      .select("*, customers(name, phone), order_items(*)")
      .order("order_date", { ascending: false })
      .order("created_at", { ascending: false });
    if (error) throw error;
    return data as OrderWithRelations[];
  },
});
