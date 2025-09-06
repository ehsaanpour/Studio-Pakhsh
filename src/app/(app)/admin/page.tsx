'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { UserCog, Users, ListChecks, PlusSquare, ArrowRight, Edit3, Trash2, CheckCircle, XCircle, Inbox, MailOpen, Check, ShieldCheck, ThumbsUp, ThumbsDown, Repeat } from 'lucide-react';

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import React, { useState, FormEvent, useEffect } from 'react';
import type { Producer, StudioReservationRequest, AdditionalService, CateringService, Repetition } from '@/types';
import { useToast } from '@/hooks/use-toast';
import { getReservations, updateReservationStatus, deleteReservation, deleteAllRejectedReservations } from '@/lib/reservation-store';
import { format, parse } from 'date-fns-jalali';
import faIR from 'date-fns-jalali/locale/fa-IR';
import { Badge } from '@/components/ui/badge';
import { addProducer, getAllProducers, deleteProducer, updateProducer } from '@/lib/producer-store';
import { PakhshManager } from '@/lib/pakhsh-manager-store';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';

// Helper function to get studio label
const getStudioLabel = (studioId: StudioReservationRequest['studio']) => {
  switch (studioId) {
    case 'studio2': return 'استودیو ۲ (فرانسه)';
    case 'studio5': return 'استودیو ۵ (-۳)';
    case 'studio6': return 'استودیو ۶ (مایا ناصر)';
    default: return 'نامشخص';
  }
};

// Helper function to get service type label
const getServiceTypeLabel = (serviceType: StudioReservationRequest['studioServices']['serviceType']) => {
  switch (serviceType) {
    case 'with_crew': return 'با عوامل';
    case 'without_crew': return 'بدون عوامل';
    default: return 'نامشخص';
  }
};

const additionalServiceItemsMap: Record<AdditionalService, string> = {
  videowall: 'ویدئووال',
  xdcam: 'XDCAM',
  crane: 'کرین',
  makeup_artist: 'گریمور',
  service_staff: 'نیروی خدمات',
  live_communication: 'ارتباط زنده',
  stream: 'استریم',
  live_program: 'برنامه زنده',
  simultaneous_translator: 'مترجم همزمان',
};

const getAdditionalServiceLabel = (serviceId: AdditionalService): string => {
  return additionalServiceItemsMap[serviceId] || serviceId;
};

const cateringServiceItemsMap: Record<CateringService, string> = {
  drinks: 'نوشیدنی',
  breakfast: 'صبحانه',
  snack: 'میان وعده',
  lunch: 'ناهار',
  dinner: 'شام',
};

const getCateringServiceLabel = (serviceId: CateringService): string => {
  return cateringServiceItemsMap[serviceId] || serviceId;
};

const getRepetitionLabel = (repetition: Repetition | undefined): string => {
  if (!repetition) return '';
  switch (repetition.type) {
    case 'weekly_1month': return 'هفتگی (یک ماه)';
    case 'weekly_3months': return 'هفتگی (سه ماه)';
    case 'daily_until_date': return 'روزانه';
    default: return '';
  }
};

const getStatusLabel = (status: StudioReservationRequest['status']): string => {
  switch (status) {
    case 'new': return 'جدید';
    case 'read': return 'خوانده شده';
    case 'admin_confirmed': return 'تایید ادمین';
    case 'pakhsh_confirmed': return 'تایید پخش';
    case 'confirmed': return 'تایید شده';
    case 'cancelled': return 'رد شده';
    case 'finalized': return 'نهایی شده';
    default: return status;
  }
};

const getStatusBadgeVariant = (status: StudioReservationRequest['status']): "default" | "secondary" | "destructive" | "outline" => {
  switch (status) {
    case 'new': return 'destructive';
    case 'read': return 'secondary';
    case 'admin_confirmed': return 'outline';
    case 'pakhsh_confirmed': return 'outline';
    case 'confirmed': return 'default'; // Uses primary color, good for positive
    case 'cancelled': return 'outline';
    case 'finalized': return 'default';
    default: return 'secondary';
  }
};

const parseDateString = (dateString: string | Date): Date => {
    if (dateString instanceof Date) {
        return dateString;
    }
    const [year, month, day] = dateString.split('T')[0].split('-').map(Number);
    return new Date(year, month - 1, day);
};

export default function AdminPanelPage() {
  const { user, isAdmin } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const [producers, setProducers] = useState<Producer[]>([]);
  const [allRequests, setAllRequests] = useState<StudioReservationRequest[]>([]);
  
  const [newProducerName, setNewProducerName] = useState('');
  const [newProducerWorkplace, setNewProducerWorkplace] = useState('');
  const [newProducerUsername, setNewProducerUsername] = useState('');
  const [newProducerPassword, setNewProducerPassword] = useState('');
  const [newProducerEmail, setNewProducerEmail] = useState('');
  const [newProducerPhone, setNewProducerPhone] = useState('');

  const [editingProducer, setEditingProducer] = useState<Producer | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [userType, setUserType] = useState<'producer' | 'pakhsh-manager'>('producer');

  // Pakhsh manager states
  const [pakhshManagers, setPakhshManagers] = useState<PakhshManager[]>([]);
  const [editingPakhshManager, setEditingPakhshManager] = useState<PakhshManager | null>(null);

  const [activeTab, setActiveTab] = useState('requests');

  const [newRequestsPage, setNewRequestsPage] = useState(1);
  const [finalizedRequestsPage, setFinalizedRequestsPage] = useState(1);
  const [rejectedRequestsPage, setRejectedRequestsPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    if (!isAdmin) {
      router.push('/login');
      return;
    }
    async function loadRequests() {
      const requests = await getReservations();
      setAllRequests(requests);
    }
    loadRequests();

    const loadProducers = async () => {
      try {
        const producersList = await getAllProducers();
        setProducers(producersList);
      } catch (error) {
        console.error('Error loading producers:', error);
        toast({
          title: "خطا",
          description: "خطا در بارگذاری لیست تهیه‌کنندگان.",
          variant: "destructive",
        });
      }
    };
    loadProducers();

    const loadPakhshManagers = async () => {
      try {
        const managersResponse = await fetch('/api/pakhsh-manager/list');
        if (managersResponse.ok) {
          const managersData = await managersResponse.json();
          setPakhshManagers(managersData);
        }
      } catch (error) {
        console.error('Error loading pakhsh managers:', error);
        toast({
          title: "خطا",
          description: "خطا در بارگذاری لیست مدیران پخش.",
          variant: "destructive",
        });
      }
    };
    loadPakhshManagers();

  }, [isAdmin, router, toast]);

  const newSystemRequests = allRequests.filter(req => req.status === 'new' || req.status === 'read' || req.status === 'pakhsh_confirmed');
  const finalizedSystemRequests = allRequests.filter(req => req.status === 'confirmed' || req.status === 'finalized');
  const rejectedSystemRequests = allRequests.filter(req => req.status === 'cancelled');

  const handleAddUser = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!newProducerName || !newProducerUsername || !newProducerPassword || !newProducerPhone) {
      toast({
        title: "خطا",
        description: "لطفاً تمامی فیلدهای ستاره‌دار را تکمیل کنید.",
        variant: "destructive",
      });
      return;
    }

    try {
      if (isEditing) {
        // Handle editing
        if (userType === 'producer' && editingProducer) {
          await updateProducer(editingProducer.id, {
            name: newProducerName,
            username: newProducerUsername,
            email: newProducerEmail,
            phone: newProducerPhone,
            workplace: newProducerWorkplace,
            ...(newProducerPassword ? { password: newProducerPassword } : {}),
          });
          
          const producersList = await getAllProducers();
          setProducers(producersList);
          setActiveTab('producers');
        } else if (userType === 'pakhsh-manager' && editingPakhshManager) {
          const response = await fetch('/api/pakhsh-manager/update', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              id: editingPakhshManager.id,
              name: newProducerName,
              username: newProducerUsername,
              password: newProducerPassword,
              email: newProducerEmail,
              phone: newProducerPhone,
              workplace: newProducerWorkplace,
            }),
          });
          
          if (!response.ok) throw new Error('Failed to update pakhsh manager');
          
          const managersResponse = await fetch('/api/pakhsh-manager/list');
          if (managersResponse.ok) {
            const managersData = await managersResponse.json();
            setPakhshManagers(managersData);
          }
          setActiveTab('pakhsh-managers');
        }
      } else {
        // Handle adding new user
        if (userType === 'producer') {
          await addProducer({
            name: newProducerName,
            username: newProducerUsername,
            password: newProducerPassword,
            email: newProducerEmail,
            phone: newProducerPhone,
            workplace: newProducerWorkplace,
          });
          
          const producersList = await getAllProducers();
          setProducers(producersList);
          setActiveTab('producers');
        } else {
          const response = await fetch('/api/pakhsh-manager/add', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              name: newProducerName,
              username: newProducerUsername,
              password: newProducerPassword,
              email: newProducerEmail,
              phone: newProducerPhone,
              workplace: newProducerWorkplace,
            }),
          });
          
          if (!response.ok) throw new Error('Failed to add pakhsh manager');
          
          const managersResponse = await fetch('/api/pakhsh-manager/list');
          if (managersResponse.ok) {
            const managersData = await managersResponse.json();
            setPakhshManagers(managersData);
          }
          setActiveTab('pakhsh-managers');
        }
      }
      
      toast({
        title: "موفقیت",
        description: `${userType === 'producer' ? 'تهیه‌کننده' : 'مدیر پخش'} "${newProducerName}" با موفقیت ${isEditing ? 'بروزرسانی شد' : 'اضافه شد'}.`,
      });
      
      // Reset form
      setNewProducerName('');
      setNewProducerUsername('');
      setNewProducerPassword('');
      setNewProducerEmail('');
      setNewProducerPhone('');
      setNewProducerWorkplace('');
      setEditingProducer(null);
      setEditingPakhshManager(null);
      setIsEditing(false);
      setUserType('producer');
      
    } catch (error) {
      console.error('Error with user operation:', error);
      toast({
        title: "خطا",
        description: `خطا در ${isEditing ? 'بروزرسانی' : 'افزودن'} ${userType === 'producer' ? 'تهیه‌کننده' : 'مدیر پخش'}. لطفاً دوباره تلاش کنید.`,
        variant: "destructive",
      });
    }
  };

  const handleDeleteProducer = async (producerId: string) => {
    try {
      await deleteProducer(producerId);
      const producersList = await getAllProducers();
      setProducers(producersList);
      toast({
        title: "موفقیت",
        description: "تهیه‌کننده با موفقیت حذف شد.",
      });
    } catch (error) {
      console.error('Error deleting producer:', error);
      toast({
        title: "خطا",
        description: "خطا در حذف تهیه‌کننده. لطفاً دوباره تلاش کنید.",
        variant: "destructive",
      });
    }
  };

  const handleDeleteRequest = async (requestId: string) => {
    try {
      await deleteReservation(requestId);
      const requests = await getReservations();
      setAllRequests(requests);
      toast({
        title: "درخواست حذف شد",
        description: "درخواست با موفقیت حذف شد.",
      });
    } catch (error) {
      console.error(`Error deleting request ${requestId}:`, error);
      toast({
        title: "خطا",
        description: "خطا در حذف درخواست.",
        variant: "destructive",
      });
    }
  };

  const handleUpdateRequestStatus = async (requestId: string, status: StudioReservationRequest['status']) => {
    try {
      await updateReservationStatus(requestId, status);
      const requests = await getReservations();
      setAllRequests(requests);
      toast({
        title: "وضعیت بروز شد",
        description: `درخواست به عنوان "${getStatusLabel(status)}" علامت‌گذاری شد.`,
      });
    } catch (error) {
      console.error(`Error updating status for request ${requestId}:`, error);
      toast({
        title: "خطا",
        description: "خطا در بروزرسانی وضعیت درخواست.",
        variant: "destructive",
      });
    }
  };

  const handleEditProducer = (producer: Producer) => {
    setEditingProducer(producer);
    setNewProducerName(producer.name);
    setNewProducerWorkplace(producer.workplace || '');
    setNewProducerUsername(producer.username);
    setNewProducerPassword('');
    setNewProducerEmail(producer.email || '');
    setNewProducerPhone(producer.phone || '');
    setIsEditing(true);
    setActiveTab('add-producer');
  };

  const handleUpdateProducer = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!editingProducer || !newProducerName || !newProducerUsername || !newProducerPhone) {
      toast({
        title: "خطا",
        description: "لطفاً تمامی فیلدهای ستاره‌دار را تکمیل کنید.",
        variant: "destructive",
      });
      return;
    }

    try {
      await updateProducer(editingProducer.id, {
        name: newProducerName,
        username: newProducerUsername,
        email: newProducerEmail,
        phone: newProducerPhone,
        workplace: newProducerWorkplace,
        ...(newProducerPassword ? { password: newProducerPassword } : {}),
      });
      
      toast({
        title: "موفقیت",
        description: `تهیه‌کننده "${newProducerName}" با موفقیت بروزرسانی شد.`,
      });
      
      setEditingProducer(null);
      setIsEditing(false);
      setNewProducerName('');
      setNewProducerUsername('');
      setNewProducerPassword('');
      setNewProducerEmail('');
      setNewProducerPhone('');
      setNewProducerWorkplace('');
      
      setActiveTab('producers');
      
      const producersList = await getAllProducers();
      setProducers(producersList);
    } catch (error) {
      console.error('Error updating producer:', error);
      toast({
        title: "خطا",
        description: "خطا در بروزرسانی تهیه‌کننده. لطفاً دوباره تلاش کنید.",
        variant: "destructive",
      });
    }
  };

  // Pakhsh Manager Functions
  const handleEditPakhshManager = (manager: PakhshManager) => {
    setEditingPakhshManager(manager);
    setNewProducerName(manager.name);
    setNewProducerWorkplace(manager.workplace || '');
    setNewProducerUsername(manager.username);
    setNewProducerPassword('');
    setNewProducerEmail(manager.email || '');
    setNewProducerPhone(manager.phone || '');
    setUserType('pakhsh-manager');
    setIsEditing(true);
    setActiveTab('add-producer');
  };

  const handleDeletePakhshManager = async (managerId: string) => {
    try {
      const response = await fetch('/api/pakhsh-manager/remove', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id: managerId }),
      });

      if (!response.ok) {
        throw new Error('Failed to delete pakhsh manager');
      }

      // Reload pakhsh managers list
      const managersResponse = await fetch('/api/pakhsh-manager/list');
      if (managersResponse.ok) {
        const managersData = await managersResponse.json();
        setPakhshManagers(managersData);
      }

      toast({
        title: "موفقیت",
        description: "مدیر پخش با موفقیت حذف شد.",
      });
    } catch (error) {
      console.error('Error deleting pakhsh manager:', error);
      toast({
        title: "خطا",
        description: "خطا در حذف مدیر پخش. لطفاً دوباره تلاش کنید.",
        variant: "destructive",
      });
    }
  };

  const handleDeleteAllRejectedRequests = async () => {
    try {
      await deleteAllRejectedReservations();
      const requests = await getReservations();
      setAllRequests(requests);
      toast({
        title: "درخواست‌های رد شده حذف شدند",
        description: "تمام درخواست‌های رد شده با موفقیت حذف شدند.",
      });
    } catch (error) {
      console.error('Error deleting all rejected requests:', error);
      toast({
        title: "خطا",
        description: "خطا در حذف درخواست‌های رد شده.",
        variant: "destructive",
      });
    }
  };

  if (!isAdmin) {
    return null;
  }

  const renderRequestCard = (request: StudioReservationRequest) => (
    <Card key={request.id} className="shadow-sm mb-4" dir="rtl">
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <h3 className="text-xl font-bold text-right mb-2 text-primary flex items-center">
              {request.programName}
              {(request.repetition?.type === 'weekly_1month' || request.repetition?.type === 'weekly_3months') && (
                <Repeat className="mr-2 h-5 w-5 text-blue-500" />
              )}
            </h3>
            <CardTitle className="text-lg text-right">درخواست از: {request.requesterName || (request.type === 'guest' ? request.personalInfo?.nameOrOrganization : 'تهیه‌کننده نامشخص')}</CardTitle>
            <CardDescription className="text-right">
              تاریخ ثبت: {request.submittedAt ? format(parseDateString(request.submittedAt), 'PPP p', { locale: faIR }) : 'نامشخص'} - نوع: {request.type === 'guest' ? 'مهمان' : 'تهیه‌کننده'}
            </CardDescription>
          </div>
          <Badge variant={getStatusBadgeVariant(request.status)}>
            {getStatusLabel(request.status)}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-2 text-sm text-right">
        {request.repetition && request.repetition.type !== 'no_repetition' && (
          <div><strong>نوع تکرار:</strong> <Badge variant="outline">{getRepetitionLabel(request.repetition)}</Badge></div>
        )}
        {request.dateTime && request.dateTime.reservationDate ? (
          <p><strong>تاریخ رزرو:</strong> {format(parseDateString(request.dateTime.reservationDate as string), 'EEEE, PPP', { locale: faIR })} از {request.dateTime.startTime} تا {request.dateTime.endTime}</p>
        ) : (
          <p><strong>تاریخ رزرو:</strong> <span className='text-red-500'>نامشخص</span></p>
        )}
        <p><strong>استودیو:</strong> {getStudioLabel(request.studio)}</p>
        {request.studioServices && (
          <>
            <p><strong>نوع سرویس:</strong> {getServiceTypeLabel(request.studioServices.serviceType)} ({request.studioServices.numberOfDays} روز, {request.studioServices.hoursPerDay} ساعت/روز)</p>
            <div className="mt-2 p-2 bg-blue-50 rounded-lg">
              <p className="text-xs text-blue-700">
                <strong>نوع تایید مورد نیاز:</strong> {request.studioServices.serviceType === 'with_crew' ? 'تایید ادمین + تایید پخش' : 'فقط تایید ادمین'}
              </p>
              {request.studioServices.serviceType === 'with_crew' && (
                <div className="flex gap-2 mt-1">
                  <span className={`text-xs px-2 py-1 rounded ${request.adminConfirmedAt ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                    ادمین: {request.adminConfirmedAt ? '✅ تایید شده' : '⏳ در انتظار'}
                  </span>
                  <span className={`text-xs px-2 py-1 rounded ${request.pakhshConfirmedAt ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                    پخش: {request.pakhshConfirmedAt ? '✅ تایید شده' : '⏳ در انتظار'}
                  </span>
                </div>
              )}
            </div>
          </>
        )}
        {request.personalInfo && (
          <>
            <p><strong>تماس مهمان:</strong> {request.personalInfo.phoneNumber} - {request.personalInfo.emailAddress}</p>
          </>
        )}
        {request.additionalServices && request.additionalServices.length > 0 && (
          <p><strong>خدمات جانبی:</strong> {request.additionalServices.map(getAdditionalServiceLabel).join('، ')}</p>
        )}
        {request.cateringServices && request.cateringServices.length > 0 && (
           <p><strong>خدمات پذیرایی:</strong> {request.cateringServices.map(getCateringServiceLabel).join('، ')}</p>
        )}
      </CardContent>
      {(request.status === 'new' || request.status === 'read') && (
        <CardFooter className="flex justify-end gap-2">
          <Button asChild size="sm" variant="outline">
            <Link href={`/producer/edit-request/${request.id}`}>
              ویرایش <Edit3 className="me-2 h-4 w-4" />
            </Link>
          </Button>
          <Button onClick={() => handleUpdateRequestStatus(request.id, 'admin_confirmed')} size="sm" variant="default" className="bg-green-600 hover:bg-green-700 text-white">
            تایید ادمین <ThumbsUp className="me-2 h-4 w-4" /> 
          </Button>
          <Button onClick={() => handleUpdateRequestStatus(request.id, 'cancelled')} size="sm" variant="destructive">
            رد کردن <ThumbsDown className="me-2 h-4 w-4" />
          </Button>
          {request.status === 'new' && (
             <Button onClick={() => handleUpdateRequestStatus(request.id, 'read')} size="sm" variant="outline">
                علامت‌گذاری به عنوان خوانده شده <CheckCircle className="me-2 h-4 w-4" /> 
            </Button>
          )}
        </CardFooter>
      )}
       {(request.status === 'cancelled') && (
        <CardFooter className="flex justify-end gap-2">
          <Button onClick={() => handleDeleteRequest(request.id)} size="sm" variant="destructive">
            حذف <Trash2 className="me-2 h-4 w-4" />
          </Button>
        </CardFooter>
      )}
      {(request.status === 'confirmed' || request.status === 'finalized') && (
        <CardFooter className="flex justify-end gap-2">
          <Button asChild size="sm" variant="outline">
            <Link href={`/producer/edit-request/${request.id}`}>
              ویرایش <Edit3 className="me-2 h-4 w-4" />
            </Link>
          </Button>
          <Button onClick={() => handleDeleteRequest(request.id)} size="sm" variant="destructive">
            حذف <Trash2 className="me-2 h-4 w-4" />
          </Button>
        </CardFooter>
      )}
    </Card>
  );

  const renderPagination = (totalItems: number, currentPage: number, onPageChange: (page: number) => void) => {
    const totalPages = Math.ceil(totalItems / itemsPerPage);
    if (totalPages <= 1) return null;

    const pageNumbers = [];
    for (let i = 1; i <= totalPages; i++) {
      pageNumbers.push(i);
    }

    return (
      <div className="flex justify-center items-center space-x-2 mt-4">
        {pageNumbers.map(number => (
          <Button key={number} onClick={() => onPageChange(number)} variant={currentPage === number ? 'default' : 'outline'}>
            {number}
          </Button>
        ))}
      </div>
    );
  };

  const paginatedNewRequests = newSystemRequests.slice((newRequestsPage - 1) * itemsPerPage, newRequestsPage * itemsPerPage);
  const paginatedFinalizedRequests = finalizedSystemRequests.slice((finalizedRequestsPage - 1) * itemsPerPage, finalizedRequestsPage * itemsPerPage);
  const paginatedRejectedRequests = rejectedSystemRequests.slice((rejectedRequestsPage - 1) * itemsPerPage, rejectedRequestsPage * itemsPerPage);

  return (
    <div className="space-y-6">
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="text-3xl font-bold flex items-center">
            <UserCog className="me-3 h-8 w-8 text-primary" /> پنل مدیریت سیستم رزرواسیون 
          </CardTitle>
          <CardDescription>مدیریت درخواست‌های رزرو، تهیه‌کنندگان و تنظیمات کلی سیستم.</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-4 mb-6">
              <TabsTrigger value="requests">مدیریت درخواست‌ها <ListChecks className="me-2 h-4 w-4"/></TabsTrigger>
              <TabsTrigger value="producers">مدیریت تهیه‌کنندگان <Users className="me-2 h-4 w-4"/></TabsTrigger>
              <TabsTrigger value="pakhsh-managers">مدیریت پخش <UserCog className="me-2 h-4 w-4"/></TabsTrigger>
              <TabsTrigger value="add-producer">افزودن کاربر <PlusSquare className="me-2 h-4 w-4"/></TabsTrigger>
            </TabsList>
            
            <TabsContent value="requests">
              <Card>
                <CardHeader>
                  <CardTitle className="text-right">درخواست‌های رزرو</CardTitle>
                  <CardDescription className="text-right">مشاهده و مدیریت تمامی درخواست‌های ثبت شده.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4" dir="rtl">
                  <Tabs defaultValue="new-requests" className="w-full">
                    <TabsList className="grid w-full grid-cols-3 mb-4">
                      <TabsTrigger value="new-requests">
                        درخواست‌های در انتظار بررسی ({newSystemRequests.length}) <Inbox className="me-2 h-4 w-4" />
                      </TabsTrigger>
                      <TabsTrigger value="finalized-requests">
                         درخواست‌های نهایی شده ({finalizedSystemRequests.length}) <ShieldCheck className="me-2 h-4 w-4" />
                      </TabsTrigger>
                       <TabsTrigger value="rejected-requests">
                        درخواست‌های رد شده ({rejectedSystemRequests.length}) <XCircle className="me-2 h-4 w-4" />
                      </TabsTrigger>
                    </TabsList>
                    <TabsContent value="new-requests">
                      {newSystemRequests.length === 0 ? (
                        <p className="text-muted-foreground py-4 text-center">هیچ درخواست در انتظار بررسی وجود ندارد.</p>
                      ) : (
                        <>
                          {paginatedNewRequests.map(req => renderRequestCard(req))}
                          {renderPagination(newSystemRequests.length, newRequestsPage, setNewRequestsPage)}
                        </>
                      )}
                    </TabsContent>
                    <TabsContent value="finalized-requests">
                      {finalizedSystemRequests.length === 0 ? (
                         <p className="text-muted-foreground py-4 text-center">هیچ درخواست نهایی شده‌ای وجود ندارد.</p>
                      ) : (
                        <>
                          {paginatedFinalizedRequests.map(req => renderRequestCard(req))}
                          {renderPagination(finalizedSystemRequests.length, finalizedRequestsPage, setFinalizedRequestsPage)}
                        </>
                      )}
                    </TabsContent>
                    <TabsContent value="rejected-requests">
                      {rejectedSystemRequests.length === 0 ? (
                        <p className="text-muted-foreground py-4 text-center">هیچ درخواست رد شده‌ای وجود ندارد.</p>
                      ) : (
                        <>
                          <div className="flex justify-end mb-4">
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button variant="destructive" size="sm">
                                  <Trash2 className="me-2 h-4 w-4" />
                                  حذف همه ({rejectedSystemRequests.length})
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent dir="rtl">
                                <AlertDialogHeader>
                                  <AlertDialogTitle>آیا مطمئن هستید؟</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    این عمل قابل بازگشت نیست. با این کار تمام {rejectedSystemRequests.length} درخواست رد شده برای همیشه حذف خواهند شد.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>انصراف</AlertDialogCancel>
                                  <AlertDialogAction onClick={handleDeleteAllRejectedRequests}>
                                    حذف کن
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </div>
                          {paginatedRejectedRequests.map(req => renderRequestCard(req))}
                          {renderPagination(rejectedSystemRequests.length, rejectedRequestsPage, setRejectedRequestsPage)}
                        </>
                      )}
                    </TabsContent>
                  </Tabs>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="producers">
              <Card>
                <CardHeader>
                  <CardTitle className="text-right">لیست تهیه‌کنندگان</CardTitle>
                  <CardDescription className="text-right">مشاهده لیست تهیه‌کنندگان موجود و امکان ویرایش یا حذف آن‌ها.</CardDescription>
                </CardHeader>
                <CardContent>
                  {producers.length === 0 ? (
                    <div className="p-6 border border-dashed rounded-lg bg-muted/30 min-h-[150px] flex items-center justify-center" dir="rtl">
                      <p className="text-muted-foreground text-center">
                        هیچ تهیه‌کننده‌ای یافت نشد. برای افزودن، به تب "افزودن تهیه‌کننده" بروید.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-4" dir="rtl">
                      {producers.map(producer => (
                        <Card key={producer.id} className="shadow-sm">
                          <CardHeader>
                            <CardTitle className="text-lg text-right">{producer.name}</CardTitle>
                            <CardDescription className="text-right">
                              {producer.workplace} (نام کاربری: {producer.username})
                              <br />
                              ایمیل: {producer.email} | تلفن: {producer.phone}
                            </CardDescription>
                          </CardHeader>
                          <CardFooter className="flex justify-end gap-2">
                            <Button 
                              variant="outline" 
                              size="sm" 
                              onClick={() => handleEditProducer(producer)}
                            >
                              ویرایش <Edit3 className="me-1 h-4 w-4" /> 
                            </Button>
                            <Button 
                              variant="destructive" 
                              size="sm" 
                              onClick={() => handleDeleteProducer(producer.id)}
                            >
                              حذف <Trash2 className="me-1 h-4 w-4" /> 
                            </Button>
                          </CardFooter>
                        </Card>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="pakhsh-managers">
              <Card>
                <CardHeader>
                  <CardTitle className="text-right">لیست مدیران پخش</CardTitle>
                  <CardDescription className="text-right">مشاهده لیست مدیران پخش موجود و امکان ویرایش یا حذف آن‌ها.</CardDescription>
                </CardHeader>
                <CardContent>
                  {pakhshManagers.length === 0 ? (
                    <div className="p-6 border border-dashed rounded-lg bg-muted/30 min-h-[150px] flex items-center justify-center" dir="rtl">
                      <p className="text-muted-foreground text-center">
                        هیچ مدیر پخشی یافت نشد. برای افزودن، به تب "افزودن کاربر" بروید.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-4" dir="rtl">
                      {pakhshManagers.map(manager => (
                        <Card key={manager.id} className="shadow-sm">
                          <CardHeader>
                            <CardTitle className="text-lg text-right">{manager.name}</CardTitle>
                            <CardDescription className="text-right">
                              {manager.workplace} (نام کاربری: {manager.username})
                              <br />
                              ایمیل: {manager.email} | تلفن: {manager.phone}
                            </CardDescription>
                          </CardHeader>
                          <CardFooter className="flex justify-end gap-2">
                            <Button 
                              variant="outline" 
                              size="sm" 
                              onClick={() => handleEditPakhshManager(manager)}
                            >
                              ویرایش <Edit3 className="me-1 h-4 w-4" /> 
                            </Button>
                            <Button 
                              variant="destructive" 
                              size="sm" 
                              onClick={() => handleDeletePakhshManager(manager.id)}
                            >
                              حذف <Trash2 className="me-1 h-4 w-4" /> 
                            </Button>
                          </CardFooter>
                        </Card>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="add-producer">
              <Card>
                <CardHeader>
                  <CardTitle className="text-right">
                    {isEditing 
                      ? (userType === 'producer' ? 'ویرایش تهیه‌کننده' : 'ویرایش مدیر پخش')
                      : 'افزودن کاربر جدید'
                    }
                  </CardTitle>
                  <CardDescription className="text-right">
                    {isEditing 
                      ? `برای ویرایش اطلاعات ${userType === 'producer' ? 'تهیه‌کننده' : 'مدیر پخش'}، فرم زیر را تکمیل کنید.`
                      : 'برای افزودن یک کاربر جدید به سیستم، نوع کاربر را انتخاب کرده و فرم زیر را تکمیل کنید.'
                    }
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {!isEditing && (
                    <div className="mb-4" dir="rtl">
                      <Label className="text-right">نوع کاربر *</Label>
                      <div className="flex gap-4 mt-2">
                        <label className="flex items-center">
                          <input 
                            type="radio" 
                            name="userType" 
                            value="producer" 
                            checked={userType === 'producer'}
                            onChange={(e) => setUserType(e.target.value as 'producer' | 'pakhsh-manager')}
                            className="ml-2"
                          />
                          تهیه‌کننده
                        </label>
                        <label className="flex items-center">
                          <input 
                            type="radio" 
                            name="userType" 
                            value="pakhsh-manager" 
                            checked={userType === 'pakhsh-manager'}
                            onChange={(e) => setUserType(e.target.value as 'producer' | 'pakhsh-manager')}
                            className="ml-2"
                          />
                          مدیر پخش
                        </label>
                      </div>
                    </div>
                  )}
                  <form onSubmit={handleAddUser} className="space-y-4" dir="rtl">
                    <div>
                      <Label htmlFor="producerName" className="text-right">نام *</Label>
                      <Input 
                        type="text" 
                        id="producerName" 
                        value={newProducerName}
                        onChange={(e) => setNewProducerName(e.target.value)}
                        className="mt-1 text-right" 
                        placeholder="نام کامل تهیه‌کننده"
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="producerWorkplace" className="text-right">محل کار *</Label>
                      <Input 
                        type="text" 
                        id="producerWorkplace" 
                        value={newProducerWorkplace}
                        onChange={(e) => setNewProducerWorkplace(e.target.value)}
                        className="mt-1 text-right" 
                        placeholder="نام دقیق قسمت در خواست دهنده استودیو را بنویسید"
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="producerEmail" className="text-right">ایمیل</Label>
                      <Input 
                        type="email" 
                        id="producerEmail" 
                        value={newProducerEmail}
                        onChange={(e) => setNewProducerEmail(e.target.value)}
                        className="mt-1 text-right" 
                        placeholder="example@domain.com"
                      />
                    </div>
                    <div>
                      <Label htmlFor="producerPhone" className="text-right">شماره تماس *</Label>
                      <Input 
                        type="tel" 
                        id="producerPhone" 
                        value={newProducerPhone}
                        onChange={(e) => setNewProducerPhone(e.target.value)}
                        className="mt-1 text-right" 
                        placeholder="شماره تماس"
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="producerUsername" className="text-right">نام کاربری *</Label>
                      <Input 
                        type="text" 
                        id="producerUsername" 
                        value={newProducerUsername}
                        onChange={(e) => setNewProducerUsername(e.target.value)}
                        className="mt-1 text-right"
                        placeholder="نام کاربری برای ورود به سیستم"
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="producerPassword" className="text-right">رمز عبور *</Label>
                      <Input 
                        type="password" 
                        id="producerPassword" 
                        value={newProducerPassword}
                        onChange={(e) => setNewProducerPassword(e.target.value)}
                        className="mt-1 text-right" 
                        placeholder="رمز عبور"
                        required={!isEditing}
                      />
                      {isEditing && <p className="text-xs text-muted-foreground mt-1">در صورت عدم نیاز به تغییر رمز، این فیلد را خالی بگذارید.</p>}
                    </div>
                    <Button type="submit" className="w-full">{isEditing ? 'بروزرسانی' : 'افزودن'}</Button>
                    {isEditing && (
                      <Button type="button" variant="ghost" onClick={() => { setIsEditing(false); setEditingProducer(null); }} className="w-full mt-2">
                        لغو ویرایش
                      </Button>
                    )}
                  </form>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
