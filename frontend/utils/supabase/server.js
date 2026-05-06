import { createBrowserClient } from "@supabase/ssr";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Note: In Vite, we don't have built-in server components or next/headers.
// This is a placeholder that works on the client side.
export const createClient = (cookieStore) => {
  return createBrowserClient(
    supabaseUrl,
    supabaseKey,
    {
      cookies: {
        getAll() {
          return cookieStore?.getAll() || []
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => {
              // Browser-side cookie setting if needed
            })
          } catch {
            // Ignore
          }
        },
      },
    },
  );
};
