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
  image_urls?: string[] | null;
  video_url?: string | null;
  name: string;
  description: string;
  item_code?: string | null;
  price?: number | null;
  key_feature?: string | null;
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

interface PortfolioCreateInput {
  image_url: string;
  image_urls?: string[];
  video_url?: string | null;
  name: string;
  description: string;
  item_code?: string;
  price?: number;
  key_feature?: string;
}

interface PortfolioUpdateInput {
  image_url?: string;
  image_urls?: string[];
  video_url?: string | null;
  name?: string;
  description?: string;
  item_code?: string;
  price?: number;
  key_feature?: string;
}

export const addPortfolioItem = async (input: PortfolioCreateInput) => {
  if (!supabase) {
    console.error('❌ [SUPABASE] Not configured');
    alert('Supabase not configured');
    return null;
  }

  try {
    console.log('📤 [SUPABASE] Inserting portfolio item:', input);
    const { data, error } = await supabase
      .from('portfolio_items')
      .insert([{
        image_url: input.image_url,
        image_urls: input.image_urls,
        video_url: input.video_url ?? null,
        name: input.name,
        description: input.description,
        item_code: input.item_code,
        price: input.price,
        key_feature: input.key_feature,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }])
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

export const updatePortfolioItem = async (id: string, input: PortfolioUpdateInput) => {
  if (!supabase) {
    console.error('❌ [SUPABASE] Not configured');
    return null;
  }

  try {
    const payload: PortfolioUpdateInput & { updated_at: string } = {
      ...input,
      updated_at: new Date().toISOString(),
    };

    const { data, error } = await supabase
      .from('portfolio_items')
      .update(payload)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('❌ [SUPABASE] Update error:', error.message, error.details);
      return null;
    }

    return data;
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
export const uploadPortfolioMediaFile = async (
  file: File,
  type: 'image' | 'video'
): Promise<string | null> => {
  if (!supabase) {
    alert('Supabase not configured');
    return null;
  }

  try {
    if (type === 'image' && !file.type.startsWith('image/')) {
      throw new Error('Please select an image file (JPG, PNG, etc.)');
    }

    if (type === 'video' && !file.type.startsWith('video/') && file.type !== 'image/gif') {
      throw new Error('Please select a video or GIF file (MP4, MOV, GIF, etc.)');
    }

    if (type === 'image' && file.size > 5 * 1024 * 1024) {
      throw new Error('Image size must be less than 5MB');
    }

    if (type === 'video' && file.size > 50 * 1024 * 1024) {
      throw new Error('Video size must be less than 50MB');
    }

    const timestamp = Date.now();
    const randomStr = Math.random().toString(36).substring(7);
    const extension = file.name.split('.').pop() || 'jpg';
    const filename = `${timestamp}-${randomStr}.${extension}`;
    const folder = type === 'image' ? 'portfolio/images' : 'portfolio/videos';
    const filepath = `${folder}/${filename}`;

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

// Delete a storage file given its public URL (returns true if removed)
export const deleteStorageFileByPublicUrl = async (publicUrl: string): Promise<boolean> => {
  if (!supabase) {
    console.warn('Supabase not configured — cannot delete storage file');
    return false;
  }

  try {
    if (!publicUrl.includes('/storage/v1/object/public/')) {
      // Not a Supabase storage URL — nothing to remove
      console.warn('URL is not a Supabase storage public URL. Skipping removal:', publicUrl);
      return false;
    }

    // Extract the bucket and file path from the public URL
    // Example public URL: https://<project>.supabase.co/storage/v1/object/public/<bucket>/<filepath>
    const parts = publicUrl.split('/storage/v1/object/public/');
    const pathAfter = parts[1];
    if (!pathAfter) return false;

    const firstSlash = pathAfter.indexOf('/');
    if (firstSlash === -1) return false;

    const bucket = pathAfter.substring(0, firstSlash);
    const filePath = pathAfter.substring(firstSlash + 1);

    const { error } = await supabase.storage.from(bucket).remove([filePath]);
    if (error) {
      console.error('Supabase storage deletion error:', error.message || error);
      return false;
    }

    console.log('✓ [SUPABASE STORAGE] Removed file from', bucket, '/', filePath);
    return true;
  } catch (err) {
    console.error('Exception while deleting storage file:', err);
    return false;
  }
};

export const uploadPortfolioImage = async (file: File): Promise<string | null> => {
  return uploadPortfolioMediaFile(file, 'image');
};
