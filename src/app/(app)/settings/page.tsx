'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ArrowRight, SettingsIcon, UserPlus, KeyRound, LockKeyhole, Trash2 } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import React, { useState, FormEvent, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { ChangePasswordForm } from '@/components/forms/change-password-form';

interface Admin {
  name: string;
  username: string;
}

export default function SettingsPage() {
  const { toast } = useToast();

  // State for Add New Admin form
  const [newAdminName, setNewAdminName] = useState('');
  const [newAdminUsername, setNewAdminUsername] = useState('');
  const [newAdminPassword, setNewAdminPassword] = useState('');
  const [admins, setAdmins] = useState<Admin[]>([]);

  // Load admins on component mount
  useEffect(() => {
    loadAdmins();
  }, []);

  const loadAdmins = async () => {
    try {
      const response = await fetch('/api/admin/list');
      if (response.ok) {
        const data = await response.json();
        setAdmins(data);
      }
    } catch (error) {
      console.error('Error loading admins:', error);
      toast({
        title: "خطا",
        description: "خطا در بارگذاری لیست ادمین‌ها.",
        variant: "destructive",
      });
    }
  };

  const handleAddAdminSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!newAdminName || !newAdminUsername || !newAdminPassword) {
      toast({
        title: "خطا",
        description: "لطفاً تمامی فیلدهای مربوط به افزودن ادمین را تکمیل کنید.",
        variant: "destructive",
      });
      return;
    }

    try {
      const response = await fetch('/api/admin/add', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: newAdminName,
          username: newAdminUsername,
          password: newAdminPassword,
        }),
      });

      if (response.ok) {
        toast({
          title: "موفقیت",
          description: `ادمین "${newAdminName}" با موفقیت اضافه شد.`,
        });
        setNewAdminName('');
        setNewAdminUsername('');
        setNewAdminPassword('');
        loadAdmins(); // Reload the admin list
      } else {
        const data = await response.json();
        toast({
          title: "خطا",
          description: data.message || "خطا در افزودن ادمین.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error adding admin:', error);
      toast({
        title: "خطا",
        description: "خطا در افزودن ادمین.",
        variant: "destructive",
      });
    }
  };

  const handleRemoveAdmin = async (username: string) => {
    try {
      const response = await fetch('/api/admin/remove', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username }),
      });

      if (response.ok) {
        toast({
          title: "موفقیت",
          description: "ادمین با موفقیت حذف شد.",
        });
        loadAdmins(); // Reload the admin list
      } else {
        const data = await response.json();
        toast({
          title: "خطا",
          description: data.message || "خطا در حذف ادمین.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error removing admin:', error);
      toast({
        title: "خطا",
        description: "خطا در حذف ادمین.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6">
      <Button variant="outline" asChild className="mb-6">
        <Link href="/dashboard">
          <ArrowRight className="ms-2 h-4 w-4" /> بازگشت به داشبورد
        </Link>
      </Button>
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="text-3xl font-bold flex items-center">
            <SettingsIcon className="ms-3 h-8 w-8 text-primary" />
            تنظیمات سیستم
          </CardTitle>
          <CardDescription>مدیریت تنظیمات ادمین‌ها و سایر موارد.</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="add-admin" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="add-admin">
                <UserPlus className="ms-2 h-4 w-4" /> افزودن ادمین جدید
              </TabsTrigger>
              <TabsTrigger value="change-password">
                <LockKeyhole className="ms-2 h-4 w-4" /> تغییر رمز عبور
              </TabsTrigger>
            </TabsList>

            <TabsContent value="add-admin">
              <div className="grid gap-6">
                <Card dir="rtl">
                  <CardHeader>
                    <CardTitle>افزودن ادمین جدید</CardTitle>
                    <CardDescription>برای افزودن یک ادمین جدید به سیستم، فرم زیر را تکمیل کنید.</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={handleAddAdminSubmit} className="space-y-4">
                      <div>
                        <Label htmlFor="newAdminName">نام کامل *</Label>
                        <Input
                          type="text"
                          id="newAdminName"
                          value={newAdminName}
                          onChange={(e) => setNewAdminName(e.target.value)}
                          className="mt-1"
                          placeholder="نام کامل ادمین"
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="newAdminUsername">نام کاربری *</Label>
                        <Input
                          type="text"
                          id="newAdminUsername"
                          value={newAdminUsername}
                          onChange={(e) => setNewAdminUsername(e.target.value)}
                          className="mt-1"
                          placeholder="برای ورود به سیستم"
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="newAdminPassword">رمز عبور *</Label>
                        <Input
                          type="password"
                          id="newAdminPassword"
                          value={newAdminPassword}
                          onChange={(e) => setNewAdminPassword(e.target.value)}
                          className="mt-1"
                          placeholder="یک رمز عبور قوی انتخاب کنید"
                          required
                        />
                      </div>
                      <Button type="submit" className="bg-primary hover:bg-primary/90 text-primary-foreground">
                        افزودن ادمین <UserPlus className="me-2 h-4 w-4" />
                      </Button>
                    </form>
                  </CardContent>
                </Card>

                <Card dir="rtl">
                  <CardHeader>
                    <CardTitle>لیست ادمین‌ها</CardTitle>
                    <CardDescription>مدیریت ادمین‌های سیستم</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {admins.length === 0 ? (
                      <div className="p-6 border border-dashed rounded-lg bg-muted/30 min-h-[150px] flex items-center justify-center">
                        <p className="text-muted-foreground text-center">
                          هیچ ادمینی یافت نشد.
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {admins.map((admin) => (
                          <div key={admin.username} className="flex items-center justify-between p-4 border rounded-lg">
                            <div>
                              <p className="font-medium">{admin.name}</p>
                              <p className="text-sm text-muted-foreground">{admin.username}</p>
                            </div>
                            {admin.username !== 'admin' && (
                              <Button
                                variant="destructive"
                                size="sm"
                                onClick={() => handleRemoveAdmin(admin.username)}
                              >
                                حذف <Trash2 className="me-2 h-4 w-4" />
                              </Button>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="change-password">
              <Card dir="rtl">
                <CardHeader>
                  <CardTitle>تغییر رمز عبور</CardTitle>
                  <CardDescription>برای تغییر رمز عبور فعلی خود، فرم زیر را تکمیل کنید.</CardDescription>
                </CardHeader>
                <CardContent>
                  <ChangePasswordForm />
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
