import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { getPortfolioItems, addPortfolioItem, deletePortfolioItem, uploadPortfolioImage, PortfolioItem, supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { Trash2, LogOut, AlertCircle, Upload, Camera, CheckCircle2, Info, Loader2, Image, XCircle, Link as LinkIcon, ImageOff } from 'lucide-react';

const AdminImageCard = ({ src, alt }: { src: string; alt: string }) => {
  const [failed, setFailed] = useState(false);
  return (
    <div className="aspect-square overflow-hidden bg-muted flex items-center justify-center">
      {failed ? (
        <ImageOff className="w-8 h-8 text-muted-foreground" />
      ) : (
        <img
          src={src}
          alt={alt}
          className="w-full h-full object-cover hover:scale-105 transition-transform"
          onError={() => setFailed(true)}
        />
      )}
    </div>
  );
};

const AdminPanel = () => {
  const navigate = useNavigate();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [portfolioItems, setPortfolioItems] = useState<PortfolioItem[]>([]);
  const [loading, setLoading] = useState(false);

  // Form states
  const [imageUrl, setImageUrl] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState('');
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [uploadMode, setUploadMode] = useState<'url' | 'file'>('file');
  const [statusMsg, setStatusMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const adminPassword = import.meta.env.VITE_ADMIN_PASSWORD || 'admin123';
  const [loginError, setLoginError] = useState(false);

  // Handle admin login
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(false);
    if (password === adminPassword) {
      setIsAuthenticated(true);
      setPassword('');
      loadPortfolioItems();
    } else {
      setLoginError(true);
      setPassword('');
    }
  };

  // Load portfolio items
  const loadPortfolioItems = async () => {
    setLoading(true);
    try {
      console.log('🔍 [ADMIN] Loading portfolio items from Supabase...');
      const items = await getPortfolioItems();
      console.log(`✓ [ADMIN] Successfully loaded ${items.length} items:`, items);
      if (items.length === 0) {
        console.warn('⚠️ [ADMIN] Database is EMPTY! No portfolio items found.');
      }
      setPortfolioItems(items);
    } catch (error) {
      console.error('✗ [ADMIN] Error loading portfolio items:', error);
    } finally {
      setLoading(false);
    }
  };

  // Handle logout
  const handleLogout = () => {
    setIsAuthenticated(false);
    setPassword('');
    setPortfolioItems([]);
  };

  // Handle image URL change
  const handleImageUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const url = e.target.value;
    setImageUrl(url);
    if (url) {
      setImagePreview(url);
    } else {
      setImagePreview('');
    }
  };

  // Handle file selection
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setStatusMsg({ type: 'error', text: 'File size must be less than 5MB' });
        return;
      }
      if (!file.type.startsWith('image/')) {
        setStatusMsg({ type: 'error', text: 'Please select an image file' });
        return;
      }
      setImageFile(file);
      // Create preview URL
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleClearFile = () => {
    setImageFile(null);
    setImagePreview('');
  };

  // Handle add portfolio item
  const handleAddPortfolioItem = async (e: React.FormEvent) => {
    e.preventDefault();
    
    let finalImageUrl = imageUrl;

    // Validate inputs
    if (uploadMode === 'url') {
      if (!imageUrl || !name || !description) {
        setStatusMsg({ type: 'error', text: 'Please fill all fields' });
        return;
      }
      if (!imageUrl.startsWith('http://') && !imageUrl.startsWith('https://')) {
        setStatusMsg({ type: 'error', text: 'Invalid URL — must start with http:// or https://' });
        return;
      }
      finalImageUrl = imageUrl;
    } else {
      if (!imageFile || !name || !description) {
        setStatusMsg({ type: 'error', text: 'Please fill all fields and select an image' });
        return;
      }
    }

    setSubmitting(true);
    try {
      // If file upload, upload to Supabase first
      if (uploadMode === 'file' && imageFile) {
        try {
          const uploadedUrl = await uploadPortfolioImage(imageFile);
          if (!uploadedUrl) {
            setStatusMsg({ type: 'error', text: 'Failed to upload image to Supabase' });
            setSubmitting(false);
            return;
          }
          finalImageUrl = uploadedUrl;
          console.log('✓ [FILE UPLOAD] Image uploaded to Supabase:', finalImageUrl);
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Unknown error';
          setStatusMsg({ type: 'error', text: `Upload error: ${errorMessage}` });
          setSubmitting(false);
          return;
        }
      }

      // Validate URL before saving
      if (!finalImageUrl || !finalImageUrl.startsWith('http')) {
        setStatusMsg({ type: 'error', text: 'Invalid image URL — cannot save item.' });
        setSubmitting(false);
        return;
      }

      console.log('📝 [ADMIN ADD ITEM] Saving to Supabase:', { finalImageUrl, name, description });
      const newItem = await addPortfolioItem(finalImageUrl, name, description);
      if (newItem) {
        console.log('✓ [ADMIN ADD ITEM] Success! Item saved:', newItem);
        setPortfolioItems([newItem, ...portfolioItems]);
        setImageUrl('');
        setImageFile(null);
        setImagePreview('');
        setName('');
        setDescription('');
        setUploadMode('file');
        setStatusMsg({ type: 'success', text: 'Portfolio item added successfully!' });
      } else {
        console.error('✗ [ADMIN ADD ITEM] Failed - no item returned');
        setStatusMsg({ type: 'error', text: 'Failed to add portfolio item' });
      }
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : String(error);
      console.error('✗ [ADMIN ADD ITEM] Error:', errorMsg);
      setStatusMsg({ type: 'error', text: `Error: ${errorMsg}` });
    } finally {
      setSubmitting(false);
    }
  };

  // Handle delete portfolio item
  const handleDeletePortfolioItem = async (id: string) => {
    if (!confirm('Are you sure you want to delete this item?')) return;

    try {
      const success = await deletePortfolioItem(id);
      if (success) {
        setPortfolioItems(portfolioItems.filter(item => item.id !== id));
        setStatusMsg({ type: 'success', text: 'Portfolio item deleted.' });
      }
    } catch (error) {
      console.error('Error deleting portfolio item:', error);
      setStatusMsg({ type: 'error', text: 'Error deleting portfolio item' });
    }
  };

  if (!isAuthenticated) {
    return (
      <section className="min-h-screen flex items-center justify-center bg-background">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md px-6"
        >
          {!supabase && (
            <div className="mb-6 p-4 bg-destructive/5 border border-destructive/20 rounded-xl flex gap-3">
              <AlertCircle className="w-5 h-5 text-destructive flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-destructive text-sm">Supabase Not Configured</p>
                <p className="text-muted-foreground text-xs mt-1">Please update your .env.local file with Supabase credentials.</p>
              </div>
            </div>
          )}
          <Card className="p-8 rounded-2xl shadow-lg border-border/40">
            <div className="flex flex-col items-center mb-6">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-3">
                <Camera className="w-6 h-6 text-primary" />
              </div>
              <h1 className="text-2xl font-serif mb-1 text-center">Admin Panel</h1>
              <p className="text-muted-foreground text-sm text-center">Enter your password to continue</p>
            </div>

            {loginError && (
              <div className="mb-4 p-3 bg-destructive/5 border border-destructive/20 rounded-lg flex items-center gap-2">
                <XCircle className="w-4 h-4 text-destructive flex-shrink-0" />
                <p className="text-destructive text-sm">Wrong password. Please try again.</p>
              </div>
            )}
            
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <Input
                  type="password"
                  placeholder="Enter admin password"
                  value={password}
                  onChange={(e) => { setPassword(e.target.value); setLoginError(false); }}
                  className="w-full"
                />
              </div>
              <Button type="submit" className="w-full" disabled={!supabase}>
                Login
              </Button>
            </form>
          </Card>
        </motion.div>
      </section>
    );
  }

  return (
    <section className="min-h-screen bg-background py-8 md:py-12 px-3 md:px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 mb-8 md:mb-12"
        >
          <div>
            <h1 className="text-3xl font-serif mb-1">Admin Panel</h1>
            <p className="text-muted-foreground text-sm">Manage your portfolio and content</p>
          </div>
          <Button variant="outline" onClick={handleLogout} className="gap-2">
            <LogOut className="w-4 h-4" />
            Logout
          </Button>
        </motion.div>

        {/* Status Message */}
        {statusMsg && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`mb-8 p-4 rounded-xl flex items-center gap-3 ${
              statusMsg.type === 'success'
                ? 'bg-primary/5 border border-primary/20'
                : 'bg-destructive/5 border border-destructive/20'
            }`}
          >
            {statusMsg.type === 'success' ? (
              <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0" />
            ) : (
              <XCircle className="w-5 h-5 text-destructive flex-shrink-0" />
            )}
            <p className={`text-sm ${statusMsg.type === 'success' ? 'text-primary' : 'text-destructive'}`}>
              {statusMsg.text}
            </p>
            <button
              onClick={() => setStatusMsg(null)}
              className="ml-auto text-muted-foreground hover:text-foreground transition-colors"
            >
              <XCircle className="w-4 h-4" />
            </button>
          </motion.div>
        )}

        {/* Add New Portfolio Item */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-12"
        >
          <Card className="p-5 md:p-8 rounded-2xl border-border/40">
            <h2 className="text-xl font-serif mb-6">Add New Portfolio Item</h2>
            
          
            
            <form onSubmit={handleAddPortfolioItem} className="space-y-4">
              {/* Upload Mode Toggle */}
              <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 mb-6 p-3 bg-muted/40 border border-border/40 rounded-xl">
                <button
                  type="button"
                  onClick={() => {
                    setUploadMode('url');
                    setImageFile(null);
                    setImageUrl('');
                    setImagePreview('');
                  }}
                  className={`flex-1 py-2.5 px-4 rounded-lg font-medium text-sm transition-all flex items-center justify-center gap-2 ${
                    uploadMode === 'url'
                      ? 'bg-primary text-primary-foreground shadow-sm'
                      : 'bg-background text-muted-foreground hover:text-foreground'
                  }`}
                >
                  <LinkIcon className="w-4 h-4" />
                  Paste URL
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setUploadMode('file');
                    setImageUrl('');
                    setImageFile(null);
                    setImagePreview('');
                  }}
                  className={`flex-1 py-2.5 px-4 rounded-lg font-medium text-sm transition-all flex items-center justify-center gap-2 ${
                    uploadMode === 'file'
                      ? 'bg-primary text-primary-foreground shadow-sm'
                      : 'bg-background text-muted-foreground hover:text-foreground'
                  }`}
                >
                  <Upload className="w-4 h-4" />
                  Upload Photo
                </button>
              </div>

              {/* Image Input - URL Mode */}
              {uploadMode === 'url' && (
                <div>
                  <label className="block text-sm font-medium mb-2">Image URL</label>
                  <Input
                    type="url"
                    placeholder="https://imgur.com/xxx.jpg or paste any image URL"
                    value={imageUrl}
                    onChange={handleImageUrlChange}
                    required={uploadMode === 'url'}
                  />
                  <p className="text-xs text-muted-foreground mt-2 flex items-center gap-1">
                    <Info className="w-3 h-3" />
                    Upload to <a href="https://imgur.com" target="_blank" rel="noopener noreferrer" className="text-primary underline">Imgur.com</a>, copy URL, and paste here.
                  </p>
                </div>
              )}

              {/* Image Input - File Mode */}
              {uploadMode === 'file' && (
                <div>
                  <label className="block text-sm font-medium mb-2">Select Image from Gallery</label>
                  <div className="border-2 border-dashed border-border/50 rounded-lg p-6 text-center hover:border-primary transition-colors cursor-pointer bg-muted/20">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileSelect}
                      className="hidden"
                      id="file-input"
                      required={uploadMode === 'file'}
                    />
                    <label htmlFor="file-input" className="flex flex-col items-center gap-2 cursor-pointer">
                      <Upload className="w-8 h-8 text-muted-foreground" />
                      <div>
                        <p className="font-medium">Click to select an image</p>
                        <p className="text-xs text-muted-foreground mt-1">or drag and drop</p>
                        <p className="text-xs text-muted-foreground">Max 5MB • JPG, PNG, etc.</p>
                      </div>
                    </label>
                  </div>
                  {imageFile && (
                    <div className="mt-2 p-2.5 bg-primary/5 border border-primary/15 rounded-lg text-sm text-primary flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
                      Selected: {imageFile.name} ({(imageFile.size / 1024).toFixed(1)} KB)
                    </div>
                  )}
                </div>
              )}

              {/* Image Preview */}
              {imagePreview && (
                <div className="border border-border/40 rounded-xl p-4 bg-muted/30">
                  <p className="text-xs font-medium mb-2">Preview:</p>
                  <img 
                    src={imagePreview} 
                    alt="Preview" 
                    className="w-32 h-32 object-cover rounded-lg"
                    onError={() => {
                      console.error('Preview failed for:', imagePreview);
                      if (uploadMode === 'url') {
                        setStatusMsg({ type: 'error', text: 'Image URL is invalid or inaccessible' });
                        setImageUrl('');
                        setImagePreview('');
                      }
                    }}
                  />
                </div>
              )}

              <div>
                <label className="block text-sm font-medium mb-2">Name</label>
                <Input
                  type="text"
                  placeholder="Bouquet name (e.g., Red Roses)"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Description</label>
                <Textarea
                  placeholder="Describe this bouquet arrangement..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={4}
                  required
                />
              </div>
              <Button 
                type="submit" 
                disabled={
                  submitting || 
                  (uploadMode === 'url' && !imageUrl) || 
                  (uploadMode === 'file' && !imageFile)
                } 
                className="w-full"
              >
                {submitting ? 'Adding...' : 'Add Portfolio Item'}
              </Button>
            </form>
          </Card>
        </motion.div>

        {/* Portfolio Items List */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="p-5 md:p-8 rounded-2xl border-border/40">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-serif">Portfolio Items</h2>
              <span className="text-sm text-muted-foreground">{portfolioItems.length} items</span>
            </div>
            
            {loading ? (
              <div className="flex items-center justify-center gap-3 py-8">
                <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
                <p className="text-muted-foreground text-sm">Loading…</p>
              </div>
            ) : portfolioItems.length === 0 ? (
              <div className="text-center py-10">
                <Image className="w-10 h-10 text-muted-foreground/50 mx-auto mb-3" />
                <p className="text-muted-foreground text-sm">No portfolio items yet. Add one above!</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                {portfolioItems.map((item, index) => (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="border border-border/40 rounded-xl overflow-hidden hover:shadow-lg transition-shadow"
                  >
                    <AdminImageCard src={item.image_url} alt={item.name} />

                    {/* Item Details */}
                    <div className="p-4">
                      <h3 className="font-serif text-lg mb-1">{item.name}</h3>
                      <p className="text-sm text-muted-foreground mb-4 line-clamp-2">{item.description}</p>
                      <div className="flex gap-2">
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleDeletePortfolioItem(item.id)}
                          className="flex-1 gap-2"
                        >
                          <Trash2 className="w-4 h-4" />
                          Delete
                        </Button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </Card>
        </motion.div>
      </div>
    </section>
  );
};

export default AdminPanel;
