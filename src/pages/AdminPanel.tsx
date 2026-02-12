import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { getPortfolioItems, addPortfolioItem, deletePortfolioItem, uploadPortfolioImage, PortfolioItem, supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { Trash2, LogOut, AlertCircle, Upload } from 'lucide-react';

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

  const adminPassword = import.meta.env.VITE_ADMIN_PASSWORD;

  // Handle admin login
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === adminPassword) {
      setIsAuthenticated(true);
      setPassword('');
      loadPortfolioItems();
    } else {
      alert('Wrong password!');
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
        alert('File size must be less than 5MB');
        return;
      }
      if (!file.type.startsWith('image/')) {
        alert('Please select an image file');
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
        alert('Please fill all fields!');
        return;
      }
      // Validate URL format
      if (!imageUrl.startsWith('http://') && !imageUrl.startsWith('https://')) {
        alert('❌ Invalid URL! Must start with http:// or https://');
        return;
      }
      finalImageUrl = imageUrl;
    } else {
      if (!imageFile || !name || !description) {
        alert('Please fill all fields and select an image!');
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
            alert('❌ Failed to upload image to Supabase');
            setSubmitting(false);
            return;
          }
          finalImageUrl = uploadedUrl;
          console.log('✓ [FILE UPLOAD] Image uploaded to Supabase:', finalImageUrl);
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Unknown error';
          alert(`❌ Error uploading image: ${errorMessage}`);
          setSubmitting(false);
          return;
        }
      }

      // Validate URL before saving
      if (!finalImageUrl || !finalImageUrl.startsWith('http')) {
        alert('❌ Invalid image URL! Cannot save item.');
        setSubmitting(false);
        return;
      }

      // Add portfolio item with the image URL
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
        setUploadMode('url');
        alert('✓ Portfolio item added successfully!');
      } else {
        console.error('✗ [ADMIN ADD ITEM] Failed - no item returned');
        alert('❌ Failed to add portfolio item!');
      }
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : String(error);
      console.error('✗ [ADMIN ADD ITEM] Error:', errorMsg);
      alert(`❌ Error adding portfolio item: ${errorMsg}`);
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
        alert('Portfolio item deleted successfully!');
      }
    } catch (error) {
      console.error('Error deleting portfolio item:', error);
      alert('Error deleting portfolio item!');
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
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-red-900 text-sm">Supabase Not Configured</p>
                <p className="text-red-700 text-xs mt-1">Please update your .env.local file with Supabase credentials.</p>
              </div>
            </div>
          )}
          <Card className="p-8">
            <h1 className="text-3xl font-bold mb-2 text-center">Admin Panel</h1>
            <p className="text-muted-foreground text-center mb-6">Enter admin password to continue</p>
            
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <Input
                  type="password"
                  placeholder="Enter admin password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
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
    <section className="min-h-screen bg-background py-12 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex justify-between items-center mb-12"
        >
          <div>
            <h1 className="text-4xl font-bold mb-2">Admin Panel</h1>
            <p className="text-muted-foreground">Manage your portfolio and content</p>
          </div>
          <Button variant="outline" onClick={handleLogout} className="gap-2">
            <LogOut className="w-4 h-4" />
            Logout
          </Button>
        </motion.div>

        {/* Add New Portfolio Item */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-12"
        >
          <Card className="p-8">
            <h2 className="text-2xl font-bold mb-6">Add New Portfolio Item</h2>
            
            {/* Setup Notice */}
            <div className="mb-6 p-4 bg-green-50 border border-green-300 rounded-lg">
              <p className="text-sm text-green-900 font-medium mb-2">📸 Quick Setup Guide</p>
              <ol className="text-xs text-green-800 space-y-1 ml-4 list-decimal">
                <li>Go to <a href="https://supabase.com/dashboard" target="_blank" rel="noopener noreferrer" className="font-bold underline text-green-700">Supabase Dashboard</a></li>
                <li>Click <span className="font-bold">"Storage"</span> in left sidebar</li>
                <li>Find <span className="font-bold">"portfolio_images"</span> bucket</li>
                <li>Click the <span className="font-bold">3 dots (⋯)</span> → <span className="font-bold">"Make public"</span></li>
                <li>Done! Now upload photos below 👇</li>
              </ol>
            </div>
            
            <form onSubmit={handleAddPortfolioItem} className="space-y-4">
              {/* Upload Mode Toggle */}
              <div className="flex gap-3 mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <button
                  type="button"
                  onClick={() => {
                    setUploadMode('url');
                    setImageFile(null);
                    setImageUrl('');
                    setImagePreview('');
                  }}
                  className={`flex-1 py-2 px-4 rounded-lg font-medium transition-all ${
                    uploadMode === 'url'
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-background text-muted-foreground hover:bg-background/80'
                  }`}
                >
                  Paste URL (External)
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setUploadMode('file');
                    setImageUrl('');
                    setImageFile(null);
                    setImagePreview('');
                  }}
                  className={`flex-1 py-2 px-4 rounded-lg font-medium transition-all flex items-center justify-center gap-2 ${
                    uploadMode === 'file'
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-background text-muted-foreground hover:bg-background/80'
                  }`}
                >
                  <Upload className="w-4 h-4" />
                  Upload Photo (Recommended)
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
                  <p className="text-xs text-muted-foreground mt-2">
                    💡 Get free images: Upload to <a href="https://imgur.com" target="_blank" rel="noopener noreferrer" className="text-primary underline">Imgur.com</a>, copy URL, and paste here.
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
                    <div className="mt-2 p-2 bg-green-50 border border-green-200 rounded text-sm text-green-700">
                      ✓ Selected: {imageFile.name} ({(imageFile.size / 1024).toFixed(1)} KB)
                    </div>
                  )}
                </div>
              )}

              {/* Image Preview */}
              {imagePreview && (
                <div className="border rounded-lg p-4 bg-muted/50">
                  <p className="text-xs font-medium mb-2">Preview:</p>
                  <img 
                    src={imagePreview} 
                    alt="Preview" 
                    className="w-32 h-32 object-cover rounded"
                    onError={() => {
                      console.error('Preview failed for:', imagePreview);
                      if (uploadMode === 'url') {
                        alert('Image URL is invalid or inaccessible');
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

        {/* DEBUG INFO SECTION */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="mb-8"
        >
          <Card className="p-6 bg-blue-50 border-blue-200">
            <h3 className="font-bold text-sm text-blue-900 mb-4">🔍 DATABASE DEBUG INFO</h3>
            <div className="space-y-2 text-xs text-blue-800 font-mono">
              <div>
                <span className="font-bold">Supabase Status:</span>{' '}
                {supabase ? '✓ CONNECTED' : '✗ NOT CONFIGURED'}
              </div>
              <div>
                <span className="font-bold">Portfolio Items in DB:</span> {portfolioItems.length}
              </div>
              {portfolioItems.length > 0 && (
                <div className="mt-3 p-3 bg-white rounded border border-blue-200 max-h-80 overflow-y-auto">
                  <p className="font-bold mb-2">📋 Items in Database:</p>
                  {portfolioItems.map((item, idx) => {
                    const isValidUrl = item.image_url && 
                      (item.image_url.startsWith('http') || item.image_url.startsWith('data:'));
                    console.log(`Item ${idx}: name="${item.name}", url="${item.image_url}", valid=${isValidUrl}`);
                    return (
                      <div key={item.id} className={`mb-3 p-2 rounded text-xs border ${
                        isValidUrl ? 'bg-green-50 border-green-300' : 'bg-red-50 border-red-300'
                      }`}>
                        <p>
                          <span className="font-bold">{idx + 1}.</span> {item.name}
                          {isValidUrl ? ' ✓' : ' ❌'}
                        </p>
                        <p className="text-gray-700 break-all font-mono">
                          🖼️ {item.image_url || '(EMPTY!)'}
                        </p>
                        {!isValidUrl && (
                          <p className="text-red-600 font-bold mt-1">⚠️ INVALID OR MISSING URL!</p>
                        )}
                      </div>
                    )
                  })}
                </div>
              )}
              {portfolioItems.length === 0 && (
                <div className="mt-3 p-3 bg-yellow-50 border border-yellow-300 rounded text-yellow-700">
                  ⚠️ Database is empty! Add items above.
                </div>
              )}
              <div className="text-blue-600 mt-3 pt-2 border-t border-blue-200">
                💡 Open browser console (F12) to see detailed logs
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Portfolio Items List */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="p-8">
            <h2 className="text-2xl font-bold mb-6">Portfolio Items ({portfolioItems.length})</h2>
            
            {loading ? (
              <p className="text-muted-foreground">Loading...</p>
            ) : portfolioItems.length === 0 ? (
              <p className="text-muted-foreground">No portfolio items yet. Add one above!</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {portfolioItems.map((item, index) => (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="border rounded-lg overflow-hidden hover:shadow-lg transition-shadow"
                  >
                    {/* Image Preview */}
                    <div className="aspect-square overflow-hidden bg-muted">
                      <img
                        src={item.image_url}
                        alt={item.name}
                        className="w-full h-full object-cover hover:scale-105 transition-transform"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = 'https://via.placeholder.com/400?text=Image+Not+Found';
                        }}
                      />
                    </div>

                    {/* Item Details */}
                    <div className="p-4">
                      <h3 className="font-bold text-lg mb-2">{item.name}</h3>
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
