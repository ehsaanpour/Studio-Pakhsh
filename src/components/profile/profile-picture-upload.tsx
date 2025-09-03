'use client';

import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/lib/auth-context';
import { Loader2, UploadCloud, XCircle } from 'lucide-react';

export function ProfilePictureUpload() {
  const { user, updateProfile } = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) { // 2MB limit
        toast({
          title: 'خطا در آپلود',
          description: 'حجم فایل نباید بیشتر از 2 مگابایت باشد.',
          variant: 'destructive',
        });
        return;
      }

      setIsLoading(true);
      const formData = new FormData();
      formData.append('profilePic', file);

      try {
        const response = await fetch('/api/upload-profile-pic', {
          method: 'POST',
          body: formData,
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Failed to upload image');
        }

        const data = await response.json();
        if (updateProfile) {
          updateProfile({ profilePictureUrl: data.url });
          toast({
            title: 'تصویر پروفایل به‌روزرسانی شد',
            description: 'تصویر پروفایل شما با موفقیت آپلود شد.',
          });
        }
      } catch (error: any) {
        console.error('Upload error:', error);
        toast({
          title: 'خطا در آپلود',
          description: error.message || 'خطا در آپلود تصویر پروفایل.',
          variant: 'destructive',
        });
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleRemovePicture = async () => {
    if (!user?.profilePictureUrl) return;

    setIsLoading(true);
    try {
      const response = await fetch('/api/upload-profile-pic', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url: user.profilePictureUrl }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to delete image');
      }

      if (updateProfile) {
        updateProfile({ profilePictureUrl: undefined });
        toast({
          title: 'تصویر پروفایل حذف شد',
          description: 'تصویر پروفایل شما با موفقیت حذف شد.',
        });
      }
    } catch (error: any) {
      console.error('Delete error:', error);
      toast({
        title: 'خطا در حذف',
        description: error.message || 'خطا در حذف تصویر پروفایل.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="flex flex-col items-center space-y-4 p-4 border rounded-lg shadow-sm bg-card">
      <Avatar className="h-40 w-40 border-2 border-primary">
        <AvatarImage src={user?.profilePictureUrl || '/placeholder-avatar.png'} alt="Profile Picture" />
        <AvatarFallback>{user?.name ? user.name.charAt(0) : '?'}</AvatarFallback>
      </Avatar>
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        className="hidden"
        accept="image/png, image/jpeg, image/jpg"
        disabled={isLoading}
      />
      <div className="flex space-x-2 rtl:space-x-reverse">
        <Button onClick={triggerFileInput} disabled={isLoading}>
          {isLoading ? <Loader2 className="ms-2 h-4 w-4 animate-spin" /> : <UploadCloud className="ms-2 h-4 w-4" />}
          {user?.profilePictureUrl ? 'تغییر تصویر' : 'آپلود تصویر'}
        </Button>
        {user?.profilePictureUrl && (
          <Button variant="outline" onClick={handleRemovePicture} disabled={isLoading}>
            {isLoading ? <Loader2 className="ms-2 h-4 w-4 animate-spin" /> : <XCircle className="ms-2 h-4 w-4" />}
            حذف تصویر
          </Button>
        )}
      </div>
      <p className="text-xs text-muted-foreground">فایل‌های JPG، JPEG، PNG (حداکثر 2 مگابایت)</p>
    </div>
  );
}
