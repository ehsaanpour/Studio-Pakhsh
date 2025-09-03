'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ArrowRight, Edit3 } from 'lucide-react';
import { ProducerReservationForm } from '@/components/forms/producer-reservation-form';
import React, { useEffect, useState } from 'react';
import { useAuth } from '@/lib/auth-context';
import { getReservationById } from '@/lib/reservation-store';
import { StudioReservationRequest } from '@/types';
import { useParams } from 'next/navigation';

export default function EditProducerRequestPage() {
  const { user, isAdmin } = useAuth();
  const { id } = useParams();
  const [reservation, setReservation] = useState<StudioReservationRequest | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id || !user) return;

    const fetchRequest = async () => {
      try {
        const fetchedRequest = await getReservationById(id as string);
        if (!fetchedRequest) {
          setError('درخواست یافت نشد.');
          return;
        }

        // Allow admin to edit any request
        if (!isAdmin && fetchedRequest.requesterName !== user.name) {
          setError('شما مجاز به ویرایش این درخواست نیستید.');
          return;
        }

        setReservation(fetchedRequest);
      } catch (err) {
        setError('خطا در دریافت اطلاعات درخواست رزرو.');
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchRequest();
  }, [id, user, isAdmin]);

  if (isLoading) {
    return <div className="flex items-center justify-center h-screen">در حال بارگذاری...</div>;
  }

  if (error) {
    return <div className="flex items-center justify-center h-screen text-red-500">{error}</div>;
  }

  return (
    <div className="container mx-auto px-4 py-6 max-w-4xl" dir="rtl">
      <div className="space-y-6">
        <Button variant="outline" asChild className="mb-6 w-full sm:w-auto">
          <Link href={isAdmin ? "/admin" : "/producer"} className="flex items-center justify-center sm:justify-start">
            <ArrowRight className="ms-2 h-4 w-4" />
            <span>{isAdmin ? 'بازگشت به پنل مدیریت' : 'بازگشت به پنل تهیه‌کننده'}</span>
          </Link>
        </Button>
        <Card className="shadow-lg">
          <CardHeader className="space-y-4">
            <CardTitle className="text-2xl sm:text-3xl font-bold flex items-center justify-center sm:justify-start">
              <Edit3 className="ms-3 h-6 w-6 sm:h-8 sm:w-8 text-primary" />
              <span>ویرایش درخواست رزرو</span>
            </CardTitle>
            <CardDescription className="text-center sm:text-right text-base sm:text-lg">
              شما در حال ویرایش درخواست ثبت شده توسط {reservation?.requesterName || 'کاربر'} هستید.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {reservation ? (
              <ProducerReservationForm producerName={reservation.requesterName || ''} existingReservation={reservation} />
            ) : (
              <p>درخواست مورد نظر یافت نشد.</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

