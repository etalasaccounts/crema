"use server";

import { createClient } from "./client-server";

type FilterOperator =
  | "eq"
  | "neq"
  | "gt"
  | "gte"
  | "lt"
  | "lte"
  | "like"
  | "ilike"
  | "is"
  | "in";

type OrderDirection = "asc" | "desc";

export interface QueryOptions {
  filters?: { column: string; operator: FilterOperator; value: any }[];
  sort?: { column: string; direction: OrderDirection };
  limit?: number;
  offset?: number;
}

export interface UpdateOptions {
  where: { column: string; value: any }[];
}

export interface DeleteOptions {
  where: { column: string; value: any }[];
}

export async function fetchData<T>(
  table: string,
  options: QueryOptions = {}
): Promise<{ data: T[] | null; error: Error | null }> {
  const supabase = await createClient();
  let query: any = supabase.from(table).select("*");

  // Apply filters
  options.filters?.forEach((filter) => {
    if (filter.operator === "in") {
      query = query.in(filter.column, filter.value);
    } else {
      query = query.filter(filter.column, filter.operator, filter.value);
    }
  });

  // Apply sorting
  if (options.sort) {
    query = query.order(options.sort.column, {
      ascending: options.sort.direction === "asc",
    });
  }

  // Apply pagination
  if (options.limit) {
    query = query.limit(options.limit);
  }
  if (options.offset) {
    query = query.range(
      options.offset,
      options.offset + (options.limit || 0) - 1
    );
  }

  const { data, error } = await query;

  if (error) {
    return { data: null, error };
  }

  return { data, error: null };
}

export async function insertData<T>(
  table: string,
  data: Partial<T>
): Promise<{ data: T | null; error: Error | null }> {
  const supabase = await createClient();
  const { data: insertedData, error } = await supabase
    .from(table)
    .insert(data)
    .select("*")
    .single();

  if (error) {
    return { data: null, error };
  }
  return { data: insertedData, error: null };
}

export async function updateData<T>(
  table: string,
  data: Partial<T>,
  options: UpdateOptions
): Promise<{ data: T | null; error: Error | null }> {
  const supabase = await createClient();
  let query = supabase.from(table).update(data);

  // Apply all where conditions
  options.where.forEach(({ column, value }) => {
    query = query.eq(column, value);
  });

  const { data: updatedData, error } = await query.select().single();

  if (error) {
    return { data: null, error };
  }

  return { data: updatedData, error: null };
}

export async function deleteData(
  table: string,
  options: DeleteOptions
): Promise<void> {
  const supabase = await createClient();
  let query = supabase.from(table).delete();

  // Apply all where conditions
  options.where.forEach(({ column, value }) => {
    query = query.eq(column, value);
  });

  const { error } = await query;

  if (error) {
    throw error;
  }
}