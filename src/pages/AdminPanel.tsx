import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { getPortfolioItems, addPortfolioItem, deletePortfolioItem, deleteStorageFileByPublicUrl, uploadPortfolioMediaFile, updatePortfolioItem, PortfolioItem, supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { Trash2, LogOut, AlertCircle, Upload, Camera, CheckCircle2, Loader2, Image, XCircle, ImageOff, Video, Pencil, Save } from 'lucide-react';

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
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [videoName, setVideoName] = useState('');
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [itemCode, setItemCode] = useState('0001');
  const [submitting, setSubmitting] = useState(false);
  const [statusMsg, setStatusMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [editingItemId, setEditingItemId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState('');
  const [editingDescription, setEditingDescription] = useState('');
  const [editingPrice, setEditingPrice] = useState('');
  const [editingImageUrls, setEditingImageUrls] = useState<string[]>([]);
  const [editingNewImageFiles, setEditingNewImageFiles] = useState<File[]>([]);
  const [editingNewImagePreviews, setEditingNewImagePreviews] = useState<string[]>([]);
  const [editingVideoUrl, setEditingVideoUrl] = useState<string | null>(null);
  const [editingNewVideoFile, setEditingNewVideoFile] = useState<File | null>(null);
  const [editingSubmitting, setEditingSubmitting] = useState(false);

  const adminPassword = import.meta.env.VITE_ADMIN_PASSWORD || 'admin123';
  const [loginError, setLoginError] = useState(false);

  const getItemPrimaryImage = (item: PortfolioItem) => item.image_urls?.[0] || item.image_url;

  const getNextItemCode = (items: PortfolioItem[]) => {
    const usedCodes = items
      .map((item) => Number(item.item_code))
      .filter((value) => Number.isInteger(value) && value >= 1 && value <= 9999);

    if (usedCodes.length === 0) {
      return '0001';
    }

    const next = Math.max(...usedCodes) + 1;
    const bounded = next > 9999 ? 1 : next;
    return String(bounded).padStart(4, '0');
  };

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
      setItemCode(getNextItemCode(items));
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

  const handleImageFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    if (files.length > 4) {
      setStatusMsg({ type: 'error', text: 'You can upload maximum 4 images per profile.' });
      e.target.value = '';
      return;
    }

    const hasInvalidType = files.some((file) => !file.type.startsWith('image/'));
    if (hasInvalidType) {
      setStatusMsg({ type: 'error', text: 'Only image files are allowed for image upload.' });
      return;
    }

    const oversized = files.find((file) => file.size > 5 * 1024 * 1024);
    if (oversized) {
      setStatusMsg({ type: 'error', text: `Image ${oversized.name} is larger than 5MB.` });
      return;
    }

    setImageFiles(files);
    setImagePreviews(files.map((file) => URL.createObjectURL(file)));
  };

  const handleVideoFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    if (!file) {
      setVideoFile(null);
      setVideoName('');
      return;
    }

    if (!file.type.startsWith('video/')) {
      setStatusMsg({ type: 'error', text: 'Please select a valid video file.' });
      return;
    }

    if (file.size > 50 * 1024 * 1024) {
      setStatusMsg({ type: 'error', text: 'Video size must be less than 50MB.' });
      return;
    }

    setVideoFile(file);
    setVideoName(file.name);
  };

  // Handle add portfolio item
  const handleAddPortfolioItem = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name || !description || !price || imageFiles.length === 0) {
      setStatusMsg({ type: 'error', text: 'Please fill name, description, price and upload at least 1 image.' });
      return;
    }

    const parsedPrice = Number(price);
    if (Number.isNaN(parsedPrice) || parsedPrice <= 0) {
      setStatusMsg({ type: 'error', text: 'Price must be a valid positive number.' });
      return;
    }

    setSubmitting(true);
    try {
      const uploadedImageUrls: string[] = [];
      for (const file of imageFiles) {
        const uploadedUrl = await uploadPortfolioMediaFile(file, 'image');
        if (!uploadedUrl) {
          setStatusMsg({ type: 'error', text: 'Failed to upload one of the images.' });
          setSubmitting(false);
          return;
        }
        uploadedImageUrls.push(uploadedUrl);
      }

      let uploadedVideoUrl: string | null = null;
      if (videoFile) {
        uploadedVideoUrl = await uploadPortfolioMediaFile(videoFile, 'video');
        if (!uploadedVideoUrl) {
          setStatusMsg({ type: 'error', text: 'Failed to upload video.' });
          setSubmitting(false);
          return;
        }
      }

      console.log('📝 [ADMIN ADD ITEM] Saving to Supabase:', { uploadedImageUrls, name, description, price: parsedPrice });
      const newItem = await addPortfolioItem({
        image_url: uploadedImageUrls[0],
        image_urls: uploadedImageUrls,
        video_url: uploadedVideoUrl,
        name,
        description,
        item_code: itemCode,
        price: parsedPrice,
      });

      if (newItem) {
        console.log('✓ [ADMIN ADD ITEM] Success! Item saved:', newItem);
        setPortfolioItems([newItem, ...portfolioItems]);
        setImageFiles([]);
        setImagePreviews([]);
        setVideoFile(null);
        setVideoName('');
        setName('');
        setDescription('');
        setPrice('');
        setItemCode(getNextItemCode([newItem, ...portfolioItems]));
        setStatusMsg({ type: 'success', text: 'Portfolio item added successfully!' });
      } else {
        console.error('✗ [ADMIN ADD ITEM] Failed - no item returned');
        setStatusMsg({ type: 'error', text: 'Failed to add portfolio item. Please run DB migration for new fields.' });
      }
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : String(error);
      console.error('✗ [ADMIN ADD ITEM] Error:', errorMsg);
      setStatusMsg({ type: 'error', text: `Error: ${errorMsg}` });
    } finally {
      setSubmitting(false);
    }
  };

  const startEditingItem = (item: PortfolioItem) => {
    setEditingItemId(item.id);
    setEditingName(item.name);
    setEditingDescription(item.description);
    setEditingPrice(item.price ? String(item.price) : '');
    setEditingImageUrls(item.image_urls?.length ? item.image_urls : [item.image_url]);
    setEditingNewImageFiles([]);
    setEditingNewImagePreviews([]);
    setEditingVideoUrl(item.video_url || null);
    setEditingNewVideoFile(null);
  };

  const handleEditImageFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    const totalCount = editingImageUrls.length + files.length;
    if (totalCount > 4) {
      setStatusMsg({ type: 'error', text: 'Total images cannot exceed 4.' });
      return;
    }

    const hasInvalidType = files.some((file) => !file.type.startsWith('image/'));
    if (hasInvalidType) {
      setStatusMsg({ type: 'error', text: 'Only image files are allowed.' });
      return;
    }

    const oversized = files.find((file) => file.size > 5 * 1024 * 1024);
    if (oversized) {
      setStatusMsg({ type: 'error', text: `Image ${oversized.name} is larger than 5MB.` });
      return;
    }

    setEditingNewImageFiles((prev) => [...prev, ...files]);
    setEditingNewImagePreviews((prev) => [...prev, ...files.map((file) => URL.createObjectURL(file))]);
  };

  const handleEditVideoFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    if (!file) {
      setEditingNewVideoFile(null);
      return;
    }

    if (!file.type.startsWith('video/')) {
      setStatusMsg({ type: 'error', text: 'Please choose a valid video file.' });
      return;
    }

    if (file.size > 50 * 1024 * 1024) {
      setStatusMsg({ type: 'error', text: 'Video size must be less than 50MB.' });
      return;
    }

    setEditingNewVideoFile(file);
  };

  const handleUpdatePortfolioItem = async (id: string) => {
    if (!editingName || !editingDescription || !editingPrice) {
      setStatusMsg({ type: 'error', text: 'Please fill name, description and price for update.' });
      return;
    }

    const parsedPrice = Number(editingPrice);
    if (Number.isNaN(parsedPrice) || parsedPrice <= 0) {
      setStatusMsg({ type: 'error', text: 'Price must be a valid positive number.' });
      return;
    }

    const currentImageUrls = [...editingImageUrls];
    if (currentImageUrls.length === 0 && editingNewImageFiles.length === 0) {
      setStatusMsg({ type: 'error', text: 'At least one image is required.' });
      return;
    }

    setEditingSubmitting(true);
    try {
      const uploadedImageUrls: string[] = [];
      for (const file of editingNewImageFiles) {
        const uploadedUrl = await uploadPortfolioMediaFile(file, 'image');
        if (!uploadedUrl) {
          setStatusMsg({ type: 'error', text: 'Failed to upload new image.' });
          setEditingSubmitting(false);
          return;
        }
        uploadedImageUrls.push(uploadedUrl);
      }

      const mergedImageUrls = [...currentImageUrls, ...uploadedImageUrls].slice(0, 4);

      let finalVideoUrl = editingVideoUrl;
      if (editingNewVideoFile) {
        const uploadedVideoUrl = await uploadPortfolioMediaFile(editingNewVideoFile, 'video');
        if (!uploadedVideoUrl) {
          setStatusMsg({ type: 'error', text: 'Failed to upload updated video.' });
          setEditingSubmitting(false);
          return;
        }
        finalVideoUrl = uploadedVideoUrl;
      }

      const updated = await updatePortfolioItem(id, {
        image_url: mergedImageUrls[0],
        image_urls: mergedImageUrls,
        video_url: finalVideoUrl,
        name: editingName,
        description: editingDescription,
        price: parsedPrice,
      });

      if (!updated) {
        setStatusMsg({ type: 'error', text: 'Failed to update item.' });
        setEditingSubmitting(false);
        return;
      }

      setPortfolioItems((prev) => prev.map((item) => (item.id === id ? updated : item)));
      setStatusMsg({ type: 'success', text: 'Portfolio item updated successfully.' });
      setEditingItemId(null);
      setEditingNewImageFiles([]);
      setEditingNewImagePreviews([]);
      setEditingNewVideoFile(null);
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : String(error);
      setStatusMsg({ type: 'error', text: `Update error: ${errorMsg}` });
    } finally {
      setEditingSubmitting(false);
    }
  };

  // Handle delete portfolio item — require extra password BEFORE deleting photo + DB row
  const handleDeletePortfolioItem = async (id: string) => {
    const target = portfolioItems.find((p) => p.id === id);
    if (!confirm('Are you sure you want to delete this item?')) return;

    // Prompt for confirmation password first (adminPassword + "99")
    const promptMsg = 'Enter confirmation password to delete this item and its photo from storage (admin password + 99).\nCancel to abort.';
    const confirmation = window.prompt(promptMsg, '');
    if (confirmation === null || confirmation === '') {
      setStatusMsg({ type: 'error', text: 'Deletion cancelled.' });
      return;
    }

    if (confirmation !== `${adminPassword}99`) {
      setStatusMsg({ type: 'error', text: 'Incorrect confirmation password — deletion aborted.' });
      return;
    }

    try {
      let storageRemovedCount = 0;
      const mediaUrls = new Set<string>();
      if (target?.image_url) {
        mediaUrls.add(target.image_url);
      }
      target?.image_urls?.forEach((url) => mediaUrls.add(url));
      if (target?.video_url) {
        mediaUrls.add(target.video_url);
      }

      for (const mediaUrl of mediaUrls) {
        const removed = await deleteStorageFileByPublicUrl(mediaUrl);
        if (removed) {
          storageRemovedCount += 1;
        }
      }

      // Delete DB row
      const success = await deletePortfolioItem(id);
      if (!success) {
        setStatusMsg({ type: 'error', text: 'Failed to delete portfolio item from database.' });
        return;
      }

      // Update local state
      setPortfolioItems((prev) => prev.filter((item) => item.id !== id));

      // Notify admin
      if (storageRemovedCount > 0) {
        setStatusMsg({ type: 'success', text: `Portfolio item deleted with ${storageRemovedCount} media file(s) removed from storage.` });
      } else if (mediaUrls.size > 0) {
        setStatusMsg({ type: 'success', text: 'Portfolio item deleted; media was not removed from storage.' });
      } else {
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
    <section className="min-h-screen bg-background py-5 md:py-8 px-3 md:px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col sm:flex-row justify-between sm:items-center gap-3 mb-5 md:mb-7"
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
            className={`mb-5 p-3 rounded-xl flex items-center gap-2.5 ${
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
              title="Dismiss status message"
              aria-label="Dismiss status message"
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
          className="mb-7"
        >
          <Card className="p-4 md:p-6 rounded-2xl border-border/40">
            <h2 className="text-xl font-serif mb-4">Add New Portfolio Item</h2>
            
          
            
            <form onSubmit={handleAddPortfolioItem} className="space-y-3">
              <div>
                <label className="block text-sm font-medium mb-2">Unique No (Auto)</label>
                <Input type="text" value={itemCode} readOnly />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Name</label>
                <Input
                  type="text"
                  placeholder="Product name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Description</label>
                <Textarea
                  placeholder="Describe this profile"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={4}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Price</label>
                <Input
                  type="number"
                  min="1"
                  step="0.01"
                  placeholder="Enter price"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Upload Images (1 to 4 images)</label>
                <Input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleImageFileSelect}
                  required
                />
                <p className="text-xs text-muted-foreground mt-1">Select 1 or more images (max 4)</p>
                {imageFiles.length > 0 && (
                  <p className="text-xs text-primary mt-1">
                    ✓ Selected {imageFiles.length} image(s)
                  </p>
                )}
                {imagePreviews.length > 0 && (
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mt-2.5">
                    {imagePreviews.map((preview, idx) => (
                      <img key={`${preview}-${idx}`} src={preview} alt={`Preview ${idx + 1}`} className="w-full h-24 object-cover rounded-lg border" />
                    ))}
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Upload Video (Optional, 1 file)</label>
                <Input
                  type="file"
                  accept="video/*"
                  onChange={handleVideoFileSelect}
                />
                {videoName && (
                  <p className="text-xs text-muted-foreground mt-2">Selected video: {videoName}</p>
                )}
              </div>

              <Button
                type="submit"
                disabled={submitting || imageFiles.length === 0}
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
          <Card className="p-4 md:p-6 rounded-2xl border-border/40">
            <div className="flex items-center justify-between mb-4">
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
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 md:gap-5">
                {portfolioItems.map((item, index) => (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="border border-border/40 rounded-xl overflow-hidden hover:shadow-lg transition-shadow"
                  >
                    <AdminImageCard src={getItemPrimaryImage(item)} alt={item.name} />

                    <div className="p-4 space-y-3">
                      <div className="flex items-center justify-between gap-2">
                        <p className="text-xs font-medium text-primary">Unique No: {item.item_code || '----'}</p>
                        <p className="text-sm font-semibold">₹ {item.price ?? 0}</p>
                      </div>

                      {editingItemId === item.id ? (
                        <div className="space-y-3">
                          <Input value={editingName} onChange={(e) => setEditingName(e.target.value)} placeholder="Name" />
                          <Textarea value={editingDescription} onChange={(e) => setEditingDescription(e.target.value)} placeholder="Description" rows={3} />
                          <Input type="number" min="1" step="0.01" value={editingPrice} onChange={(e) => setEditingPrice(e.target.value)} placeholder="Price" />

                          <div>
                            <p className="text-xs font-medium mb-2">Current Images ({editingImageUrls.length})</p>
                            <div className="grid grid-cols-2 gap-2 mb-2">
                              {editingImageUrls.map((url) => (
                                <div key={url} className="relative">
                                  <img src={url} alt="Current" className="w-full h-20 object-cover rounded-md border" />
                                  <button
                                    type="button"
                                    onClick={() => setEditingImageUrls((prev) => prev.filter((current) => current !== url))}
                                    className="absolute -top-2 -right-2 bg-destructive text-white rounded-full p-1"
                                    title="Remove image"
                                  >
                                    <XCircle className="w-3 h-3" />
                                  </button>
                                </div>
                              ))}
                            </div>
                          </div>

                          <div>
                            <label className="text-xs font-medium block mb-1">Add More Images (Max total 4)</label>
                            <Input type="file" accept="image/*" multiple onChange={handleEditImageFileSelect} />
                            {editingNewImagePreviews.length > 0 && (
                              <div className="grid grid-cols-2 gap-2 mt-2">
                                {editingNewImagePreviews.map((preview, previewIndex) => (
                                  <img key={`${preview}-${previewIndex}`} src={preview} alt="New preview" className="w-full h-20 object-cover rounded-md border" />
                                ))}
                              </div>
                            )}
                          </div>

                          <div>
                            <label className="text-xs font-medium block mb-1">Replace/Add Video (Optional)</label>
                            <Input type="file" accept="video/*" onChange={handleEditVideoFileSelect} />
                            {editingVideoUrl && !editingNewVideoFile && (
                              <a href={editingVideoUrl} target="_blank" rel="noreferrer" className="text-xs text-primary underline mt-1 inline-block">
                                View current video
                              </a>
                            )}
                            {editingNewVideoFile && (
                              <p className="text-xs text-muted-foreground mt-1">Selected: {editingNewVideoFile.name}</p>
                            )}
                          </div>

                          <div className="flex gap-2">
                            <Button size="sm" onClick={() => handleUpdatePortfolioItem(item.id)} disabled={editingSubmitting} className="flex-1 gap-2">
                              <Save className="w-4 h-4" />
                              {editingSubmitting ? 'Saving...' : 'Save'}
                            </Button>
                            <Button size="sm" variant="outline" onClick={() => setEditingItemId(null)} className="flex-1">
                              Cancel
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <>
                          <h3 className="font-serif text-lg mb-1">{item.name}</h3>
                          <p className="text-sm text-muted-foreground line-clamp-2">{item.description}</p>
                          <p className="text-xs text-muted-foreground">Images: {(item.image_urls?.length || (item.image_url ? 1 : 0))} {item.video_url ? '• Video: Yes' : '• Video: No'}</p>

                          <div className="flex gap-2 pt-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => startEditingItem(item)}
                              className="flex-1 gap-2"
                            >
                              <Pencil className="w-4 h-4" />
                              Edit
                            </Button>
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
                        </>
                      )}
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
