declare namespace NodeJS {
  interface ProcessEnv {
    readonly NEXT_PUBLIC_DEVELOPER_EMAIL?: string;
    readonly NEXT_PUBLIC_GEMINI_API_KEY?: string;
    readonly NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY?: string;
    readonly NEXT_PUBLIC_SUPABASE_URL?: string;
  }
}
