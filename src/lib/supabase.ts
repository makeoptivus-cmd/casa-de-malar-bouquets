import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

// Check if environment variables are set
const isSupabaseConfigured = supabaseUrl && supabaseAnonKey && 
  !supabaseUrl.includes('your_') && !supabaseAnonKey.includes('your_');

if (!isSupabaseConfigured) {
  console.warn('⚠️ Supabase not configured. Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in .env.local');
}

export const supabase = isSupabaseConfigured ? createClient(supabaseUrl, supabaseAnonKey) : null;

// Portfolio Types
export interface PortfolioItem {
  id: string;
  image_url: string;
  name: string;
  description: string;
  created_at: string;
  updated_at: string;
}

// Reviews Types
export interface Review {
  id: string;
  name: string;
  email: string;
  rating: number;
  message: string;
  created_at: string;
}

// Portfolio Functions
export const getPortfolioItems = async (): Promise<PortfolioItem[]> => {
  if (!supabase) {
    console.warn('❌ [SUPABASE] Not configured - VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY missing');
    return [];
  }
  
  try {
    console.log('📦 [SUPABASE] Fetching from portfolio_items table...');
    const { data, error } = await supabase
      .from('portfolio_items')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('❌ [SUPABASE] Query error:', error.message, error.details);
      return [];
    }
    
    const count = data?.length || 0;
    console.log(`✓ [SUPABASE] Fetched ${count} items from database`);
    if (count === 0) {
      console.warn('⚠️ [SUPABASE] portfolio_items table is EMPTY');
    } else {
      console.log('📋 [SUPABASE] Items:', data);
    }
    return data || [];
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    console.error('❌ [SUPABASE] Exception:', msg);
    return [];
  }
};

export const addPortfolioItem = async (
  image_url: string,
  name: string,
  description: string
) => {
  if (!supabase) {
    console.error('❌ [SUPABASE] Not configured');
    alert('Supabase not configured');
    return null;
  }

  try {
    console.log('📤 [SUPABASE] Inserting portfolio item:', { image_url, name, description });
    const { data, error } = await supabase
      .from('portfolio_items')
      .insert([{ image_url, name, description, created_at: new Date().toISOString(), updated_at: new Date().toISOString() }])
      .select();

    if (error) {
      console.error('❌ [SUPABASE] Insert error:', error.message, error.details);
      return null;
    }
    console.log('✓ [SUPABASE] Item inserted successfully:', data?.[0]);
    return data?.[0];
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    console.error('❌ [SUPABASE] Exception:', msg);
    return null;
  }
};

export const deletePortfolioItem = async (id: string) => {
  if (!supabase) {
    alert('Supabase not configured');
    return false;
  }

  try {
    const { error } = await supabase
      .from('portfolio_items')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting portfolio item:', error);
      return false;
    }
    return true;
  } catch (error) {
    console.error('Error deleting portfolio item:', error);
    return false;
  }
};

// Reviews Functions
export const getReviews = async (): Promise<Review[]> => {
  if (!supabase) {
    console.warn('Supabase not configured');
    return [];
  }

  try {
    const { data, error } = await supabase
      .from('malar_reviews')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching reviews:', error);
      return [];
    }
    return data || [];
  } catch (error) {
    console.error('Error fetching reviews:', error);
    return [];
  }
};

export const addReview = async (
  name: string,
  email: string,
  rating: number,
  message: string
) => {
  if (!supabase) {
    alert('Supabase not configured. Please set up your Supabase credentials.');
    return null;
  }

  try {
    const { data, error } = await supabase
      .from('malar_reviews')
      .insert([{ name, email, rating, message, created_at: new Date().toISOString() }])
      .select();

    if (error) {
      console.error('Error adding review:', error);
      return null;
    }
    return data?.[0];
  } catch (error) {
    console.error('Error adding review:', error);
    return null;
  }
};

// Image Upload Function
export const uploadPortfolioImage = async (file: File): Promise<string | null> => {
  if (!supabase) {
    alert('Supabase not configured');
    return null;
  }

  try {
    // Validate file type
    if (!file.type.startsWith('image/')) {
      throw new Error('Please select an image file (JPG, PNG, etc.)');
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      throw new Error('Image size must be less than 5MB');
    }

    // Create unique filename with timestamp
    const timestamp = Date.now();
    const randomStr = Math.random().toString(36).substring(7);
    const extension = file.name.split('.').pop() || 'jpg';
    const filename = `${timestamp}-${randomStr}.${extension}`;
    const filepath = `portfolio/${filename}`;

    console.log('Uploading file:', filepath);

    // Upload file to Supabase Storage
    const { data, error: uploadError } = await supabase.storage
      .from('portfolio_images')
      .upload(filepath, file, {
        cacheControl: '3600',
        upsert: false
      });

    if (uploadError) {
      console.error('Supabase upload error:', uploadError);
      throw new Error(uploadError.message || 'Failed to upload image');
    }

    if (!data?.path) {
      throw new Error('Upload succeeded but no path returned');
    }

    console.log('Upload successful:', data);

    // Get the public URL for the uploaded file
    const { data: publicData } = supabase.storage
      .from('portfolio_images')
      .getPublicUrl(data.path);

    if (!publicData?.publicUrl) {
      throw new Error('Failed to generate public URL');
    }

    console.log('Generated public URL:', publicData.publicUrl);

    return publicData.publicUrl;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    console.error('Error uploading image:', errorMessage);
    throw new Error(errorMessage);
  }
};
