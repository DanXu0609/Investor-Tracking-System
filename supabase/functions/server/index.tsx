import { Hono } from "npm:hono";
import { cors } from "npm:hono/cors";
import { logger } from "npm:hono/logger";
import * as kv from "./kv_store.tsx";
import { createClient } from "npm:@supabase/supabase-js@2";

const app = new Hono();

// Enable logger
app.use('*', logger(console.log));

// Enable CORS for all routes and methods
app.use(
  "/*",
  cors({
    origin: "*",
    allowHeaders: ["Content-Type", "Authorization", "apikey", "x-client-info"],
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    exposeHeaders: ["Content-Length"],
    maxAge: 600,
  }),
);

// Health check endpoint
app.get("/make-server-8ca89582/health", (c) => {
  return c.json({ 
    status: "ok",
    env: {
      hasSupabaseUrl: !!Deno.env.get('SUPABASE_URL'),
      hasSupabaseAnonKey: !!Deno.env.get('SUPABASE_ANON_KEY'),
      hasSupabaseServiceRoleKey: !!Deno.env.get('SUPABASE_SERVICE_ROLE_KEY'),
    }
  });
});

// Sign up endpoint
app.post("/make-server-8ca89582/signup", async (c) => {
  try {
    const { email, password, name } = await c.req.json();
    
    if (!email || !password || !name) {
      return c.json({ error: "Email, password, and name are required" }, 400);
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY');
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    console.log('Environment check:', {
      hasUrl: !!supabaseUrl,
      hasAnonKey: !!supabaseAnonKey,
      hasServiceKey: !!supabaseServiceKey,
      urlValue: supabaseUrl,
      anonKeyPrefix: supabaseAnonKey?.substring(0, 20) + '...',
      serviceKeyPrefix: supabaseServiceKey?.substring(0, 20) + '...'
    });

    if (!supabaseUrl || !supabaseServiceKey) {
      console.error('Missing Supabase configuration');
      return c.json({ error: "Server configuration error - missing credentials" }, 500);
    }

    // Create admin client with service role key
    const supabase = createClient(
      supabaseUrl,
      supabaseServiceKey,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    );

    // Check if this is the first user - if so, make them admin
    const existingUsers = await kv.getByPrefix('user:');
    const isFirstUser = !existingUsers || existingUsers.length === 0;
    
    // Admin emails - add your admin emails here
    const adminEmails = [
      'admin@beyond-wm.com',
      'admin@beyondgm.com'
    ];
    
    const isAdmin = isFirstUser || adminEmails.includes(email.toLowerCase());

    console.log('Creating user with admin status:', isAdmin);

    const { data, error } = await supabase.auth.admin.createUser({
      email,
      password,
      user_metadata: { 
        name,
        role: isAdmin ? 'admin' : 'user'
      },
      // Automatically confirm the user's email since an email server hasn't been configured.
      email_confirm: true
    });

    if (error) {
      console.error('Supabase createUser error:', {
        message: error.message,
        status: error.status,
        name: error.name
      });
      return c.json({ error: error.message }, 400);
    }

    if (!data.user) {
      console.error('No user data returned from Supabase');
      return c.json({ error: "Failed to create user" }, 500);
    }

    // Store user info in KV to track user count
    await kv.set(`user:${data.user.id}`, { 
      email, 
      name,
      role: isAdmin ? 'admin' : 'user',
      createdAt: new Date().toISOString()
    });

    console.log('User created successfully:', data.user.id);

    return c.json({ user: data.user });
  } catch (err) {
    console.error('Signup exception:', err);
    return c.json({ error: `Internal server error during signup: ${err.message}` }, 500);
  }
});

// Get all users (admin only)
app.get("/make-server-8ca89582/users", async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    
    if (!accessToken) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    // Use ANON_KEY to validate user JWTs
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? ''
    );

    // Verify user is admin
    const { data: { user } } = await supabase.auth.getUser(accessToken);
    if (!user || user.user_metadata?.role !== 'admin') {
      return c.json({ error: 'Forbidden: Admin access required' }, 403);
    }

    // Get all users from KV store
    const usersData = await kv.getByPrefix('user:');
    const users = usersData.map(item => ({
      id: item.key.replace('user:', ''),
      ...item.value
    }));

    return c.json({ users });
  } catch (err) {
    console.error('Error fetching users:', err);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

// Update user role (admin only)
app.put("/make-server-8ca89582/users/:userId/role", async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    
    if (!accessToken) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    // Use ANON_KEY to validate user JWT, then switch to SERVICE_ROLE_KEY for admin operations
    const anonSupabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? ''
    );

    // Verify user is admin
    const { data: { user } } = await anonSupabase.auth.getUser(accessToken);
    if (!user || user.user_metadata?.role !== 'admin') {
      return c.json({ error: 'Forbidden: Admin access required' }, 403);
    }

    const userId = c.req.param('userId');
    const { role } = await c.req.json();

    if (!role || !['admin', 'user'].includes(role)) {
      return c.json({ error: 'Invalid role. Must be "admin" or "user"' }, 400);
    }

    // Use SERVICE_ROLE_KEY for admin operations
    const adminSupabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Update user metadata in Supabase Auth
    const { error: updateError } = await adminSupabase.auth.admin.updateUserById(
      userId,
      { user_metadata: { role } }
    );

    if (updateError) {
      console.error('Error updating user role in auth:', updateError);
      return c.json({ error: updateError.message }, 400);
    }

    // Update user role in KV store
    const userKey = `user:${userId}`;
    const userData = await kv.get(userKey);
    
    if (userData) {
      await kv.set(userKey, { ...userData, role });
    }

    return c.json({ success: true, role });
  } catch (err) {
    console.error('Error updating user role:', err);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

// Get all investors for authenticated user
app.get("/make-server-8ca89582/investors", async (c) => {
  try {
    const authHeader = c.req.header('Authorization');
    console.log('GET /investors - Authorization header:', authHeader ? `Bearer ${authHeader.substring(7, 27)}...` : 'MISSING');
    
    const accessToken = authHeader?.split(' ')[1];
    
    if (!accessToken) {
      console.log('GET /investors - No token provided');
      return c.json({ error: "Unauthorized - No token provided" }, 401);
    }

    console.log('GET /investors - Token length:', accessToken.length);

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    );

    console.log('GET /investors - About to call getUser with token');

    const { data: { user }, error: authError } = await supabase.auth.getUser(accessToken);
    
    console.log('GET /investors - getUser result:', {
      hasUser: !!user,
      userId: user?.id,
      hasError: !!authError,
      errorMessage: authError?.message
    });
    
    if (authError || !user) {
      console.error('Auth error while getting investors:', JSON.stringify(authError, null, 2));
      return c.json({ error: "Unauthorized - Invalid token", details: authError?.message }, 401);
    }

    console.log('GET /investors - User authenticated, searching with prefix:', `investor:${user.id}:`);

    // Get all investors for this user
    const investorsData = await kv.getByPrefix(`investor:${user.id}:`);
    const investors = investorsData.map(item => item.value);

    console.log('GET /investors - Found investors:', {
      count: investors?.length || 0,
      firstInvestor: investors?.[0] ? JSON.stringify(investors[0]).substring(0, 100) : 'none'
    });

    return c.json({ investors: investors || [] });
  } catch (err) {
    console.error('Get investors exception:', err);
    return c.json({ error: "Internal server error while fetching investors" }, 500);
  }
});

// Save/update investor for authenticated user
app.post("/make-server-8ca89582/investors", async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    
    if (!accessToken) {
      return c.json({ error: "Unauthorized - No token provided" }, 401);
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    );

    const { data: { user }, error: authError } = await supabase.auth.getUser(accessToken);
    
    if (authError || !user) {
      console.error('Auth error while saving investor:', authError);
      return c.json({ error: "Unauthorized - Invalid token" }, 401);
    }

    console.log('POST /investors - User authenticated:', user.id);

    const { investors } = await c.req.json();
    
    if (!investors || !Array.isArray(investors)) {
      console.error('POST /investors - Invalid data format:', { investors });
      return c.json({ error: "Invalid data format" }, 400);
    }

    console.log('POST /investors - Saving investors:', {
      count: investors.length,
      userId: user.id,
      investorIds: investors.map(inv => inv.id),
      firstInvestor: investors[0] ? JSON.stringify(investors[0]).substring(0, 150) : 'none'
    });

    // Save investors to KV store with user-specific keys
    const keys = investors.map(inv => `investor:${user.id}:${inv.id}`);
    console.log('POST /investors - Keys to save:', keys);
    
    await kv.mset(keys, investors);
    
    console.log('POST /investors - Successfully saved investors');
    
    return c.json({ success: true, count: investors.length });
  } catch (err) {
    console.error('Save investors exception:', err);
    return c.json({ error: "Internal server error while saving investors" }, 500);
  }
});

// Delete investor for authenticated user
app.delete("/make-server-8ca89582/investors/:id", async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    
    if (!accessToken) {
      return c.json({ error: "Unauthorized - No token provided" }, 401);
    }

    // Use SERVICE_ROLE_KEY for JWT validation
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    );

    // Validate JWT by passing it directly as parameter
    const { data: { user }, error: authError } = await supabase.auth.getUser(accessToken);
    
    if (authError || !user) {
      console.error('Auth error while deleting investor:', authError);
      return c.json({ error: "Unauthorized - Invalid token" }, 401);
    }

    const investorId = c.req.param('id');
    await kv.del(`investor:${user.id}:${investorId}`);
    
    return c.json({ success: true });
  } catch (err) {
    console.error('Delete investor exception:', err);
    return c.json({ error: "Internal server error while deleting investor" }, 500);
  }
});

Deno.serve(app.fetch);