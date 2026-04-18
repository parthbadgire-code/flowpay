import type { NextConfig } from "next";
import { config } from "dotenv";
import path from "path";

// Load from parent (root) folder's .env
config({ path: path.resolve(process.cwd(), '../.env') });

const nextConfig: NextConfig = {
  env: {
    SUPABASE_URL: process.env.SUPABASE_URL || '',
    SUPABASE_ANON_KEY: process.env.SUPABASE_ANON_KEY || '',
  },
};

export default nextConfig;
