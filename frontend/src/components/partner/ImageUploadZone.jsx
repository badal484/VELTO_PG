import React, { useRef, useState } from 'react';
import api from '../../utils/api';
import toast from 'react-hot-toast';

export default function ImageUploadZone({ images = [], onChange, maxImages = 10, label = 'Property Images' }) {
  const inputRef = useRef(null);
  const [uploading, setUploading] = useState(false);

  const handleFiles = async (files) => {
    const remaining = maxImages - images.length;
    const toUpload = Array.from(files).slice(0, remaining);
    if (!toUpload.length) return;

    setUploading(true);
    try {
      const uploaded = await Promise.all(
        toUpload.map(async (file) => {
          const form = new FormData();
          form.append('image', file);
          const { data } = await api.post('/upload/image', form);
          return data.data;
        })
      );
      onChange([...images, ...uploaded]);
    } catch {
      toast.error('Failed to upload image(s)');
    } finally {
      setUploading(false);
    }
  };

  const removeImage = async (idx) => {
    const img = images[idx];
    try {
      if (img.fileId) await api.delete('/upload/image', { data: { fileId: img.fileId } });
    } catch { /* ignore */ }
    onChange(images.filter((_, i) => i !== idx));
  };

  const onDrop = (e) => { e.preventDefault(); handleFiles(e.dataTransfer.files); };

  return (
    <div>
      <label className="input-label">{label} <span className="text-gray-400 font-normal">({images.length}/{maxImages})</span></label>

      {/* Drop zone */}
      {images.length < maxImages && (
        <div
          onDrop={onDrop}
          onDragOver={e => e.preventDefault()}
          onClick={() => inputRef.current?.click()}
          className="border-2 border-dashed border-gray-200 rounded-2xl p-8 text-center cursor-pointer hover:border-primary-300 hover:bg-primary-50/30 transition-all"
        >
          {uploading ? (
            <div className="flex flex-col items-center gap-2">
              <div className="w-8 h-8 border-2 border-gray-200 border-t-primary-500 rounded-full animate-spin" />
              <p className="text-sm text-gray-500">Uploading…</p>
            </div>
          ) : (
            <>
              <svg className="w-10 h-10 text-gray-300 mx-auto mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <p className="text-sm font-semibold text-gray-700">Drop images here or click to upload</p>
              <p className="text-xs text-gray-400 mt-1">JPG, PNG up to 10MB each</p>
            </>
          )}
        </div>
      )}

      <input ref={inputRef} type="file" accept="image/*" multiple className="hidden" onChange={e => handleFiles(e.target.files)} />

      {/* Preview grid */}
      {images.length > 0 && (
        <div className="grid grid-cols-3 sm:grid-cols-4 gap-3 mt-4">
          {images.map((img, idx) => (
            <div key={idx} className="relative aspect-square rounded-xl overflow-hidden group">
              <img src={img.url} alt={`upload ${idx + 1}`} className="w-full h-full object-cover" />
              <button
                type="button"
                onClick={() => removeImage(idx)}
                className="absolute top-1 right-1 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-xs font-bold"
              >
                ×
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}