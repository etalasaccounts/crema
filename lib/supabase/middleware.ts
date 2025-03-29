import { createServerClient } from "@supabase/ssr";
import { NextResponse } from "next/server";
import { NextRequest } from "next/server";

export async function updateSession(request: NextRequest) {
  // create a NextResponse object with the incoming request
  let supabaseResponse = NextResponse.next({
    request,
  });

  // create a new supabase client
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL as string,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string,
    // pass in the cookies object
    {
      cookies: {
        // get all cookies
        getAll() {
          return request.cookies.getAll();
        },
        // set all cookies
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            request.cookies.set(name, value)
          );
          // update the supabaseResponse object with the new cookies
          supabaseResponse = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // refreshing the auth token
  await supabase.auth.getUser();

  return supabaseResponse;
}
