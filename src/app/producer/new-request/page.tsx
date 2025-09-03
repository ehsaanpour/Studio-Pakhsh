'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ArrowRight, PlusCircle } from 'lucide-react';
import { ProducerReservationForm } from '@/components/forms/producer-reservation-form';
import React from 'react';
import { useAuth } from '@/lib/auth-context';

export default function NewProducerRequestPage() {
  const { user } = useAuth();

  // Use the actual producer name from auth context
  const producerName = user?.name || "تهیه‌کننده";

  return (
    <div className="container mx-auto px-4 py-6 max-w-4xl" dir="rtl">
      <div className="space-y-6">
        <Button variant="outline" asChild className="mb-6 w-full sm:w-auto">
          <Link href="/producer" className="flex items-center justify-center sm:justify-start">
            <ArrowRight className="ms-2 h-4 w-4" />
            <span>بازگشت به پنل تهیه‌کننده</span>
          </Link>
        </Button>
        <Card className="shadow-lg">
          <CardHeader className="space-y-4">
            <CardTitle className="text-2xl sm:text-3xl font-bold flex items-center justify-center sm:justify-start">
              <PlusCircle className="ms-3 h-6 w-6 sm:h-8 sm:w-8 text-primary" />
              <span>ثبت درخواست رزرو جدید</span>
            </CardTitle>
            <CardDescription className="text-center sm:text-right text-base sm:text-lg">
              تهیه‌کننده گرامی، {producerName}، لطفاً فرم زیر را برای ثبت درخواست خود تکمیل نمایید.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ProducerReservationForm producerName={producerName} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

