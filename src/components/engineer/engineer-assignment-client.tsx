"use client";

import { useEffect, useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Engineer, StudioReservationRequest } from "@/types";
import { Trash2, ArrowUpDown } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { format } from 'date-fns-jalali';
import faIR from 'date-fns-jalali/locale/fa-IR';

// Helper function to parse date strings consistently
const parseDateString = (dateString: string | Date): Date => {
    if (dateString instanceof Date) {
        return dateString;
    }
    const [year, month, day] = dateString.split('T')[0].split('-').map(Number);
    return new Date(year, month - 1, day);
};

export default function EngineerAssignmentClient() {
  const [engineers, setEngineers] = useState<Engineer[]>([]);
  const [reservations, setReservations] = useState<StudioReservationRequest[]>([]);
  const [newEngineerName, setNewEngineerName] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedEngineers, setSelectedEngineers] = useState<{ [key: string]: string[] }>({});
  const [engineerCounts, setEngineerCounts] = useState<{ [key: string]: number }>({});
  const [currentPage, setCurrentPage] = useState(1);
  const [archivedPage, setArchivedPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [assignmentFilter, setAssignmentFilter] = useState<'all' | 'assigned' | 'unassigned'>('all');
  const [activeTab, setActiveTab] = useState('current');

  async function fetchData() {
    try {
      setIsLoading(true);
      const [engineersRes, reservationsRes] = await Promise.all([
        fetch("/api/engineer/list", { cache: "no-store" }),
        fetch("/api/reservations", { cache: "no-store" }),
      ]);
      if (!engineersRes.ok) throw new Error("Failed to fetch engineers");
      if (!reservationsRes.ok) throw new Error("Failed to fetch reservations");
      const engineersData = await engineersRes.json();
      const reservationsData = await reservationsRes.json();
      setEngineers(engineersData);
      setReservations(reservationsData);
      const initialSelections: { [key: string]: string[] } = {};
      const initialCounts: { [key: string]: number } = {};
      reservationsData.forEach((res: StudioReservationRequest) => {
        const count = res.engineerCount || (res.engineers && res.engineers.length > 0 ? res.engineers.length : 1);
        initialCounts[res.id] = count;
        const currentEngineers = res.engineers || [];
        initialSelections[res.id] = [...currentEngineers, ...Array(Math.max(0, count - currentEngineers.length)).fill('')];
      });
      setEngineerCounts(initialCounts);
      setSelectedEngineers(initialSelections);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unknown error occurred");
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    fetchData();
  }, []);

  async function handleAddEngineer() {
    if (!newEngineerName.trim()) return;
    try {
      const response = await fetch("/api/engineer/add", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newEngineerName }),
      });
      if (!response.ok) throw new Error("Failed to add engineer");
      setNewEngineerName("");
      fetchData();
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unknown error occurred");
    }
  }

  async function handleRemoveEngineer(id: string) {
    try {
      const response = await fetch("/api/engineer/remove", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      if (!response.ok) throw new Error("Failed to remove engineer");
      fetchData();
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unknown error occurred");
    }
  }
  
  async function handleAssignEngineers(reservationId: string, engineerIds: string[], engineerCount: number) {
    try {
      const response = await fetch('/api/reservations/assign-engineer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reservationId, engineerIds, engineerCount }),
      });
      if (!response.ok) {
        throw new Error('Failed to assign engineer');
      }
      fetchData();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
    }
  }

  const { currentReservations, archivedReservations } = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    let filtered = reservations.filter(reservation => reservation.status === 'confirmed' || reservation.status === 'finalized');

    if (assignmentFilter === 'assigned') {
      filtered = filtered.filter(res => res.engineers && res.engineers.length > 0);
    } else if (assignmentFilter === 'unassigned') {
      filtered = filtered.filter(res => !res.engineers || res.engineers.length === 0);
    }

    const sorted = filtered.sort((a, b) => {
      const dateA = parseDateString(a.dateTime.reservationDate).getTime();
      const dateB = parseDateString(b.dateTime.reservationDate).getTime();
      return sortOrder === 'asc' ? dateA - dateB : dateB - dateA;
    });

    const current = sorted.filter(res => parseDateString(res.dateTime.reservationDate) >= today || !res.engineers || res.engineers.length === 0);
    const archived = sorted.filter(res => parseDateString(res.dateTime.reservationDate) < today && res.engineers && res.engineers.length > 0);

    return { currentReservations: current, archivedReservations: archived };
  }, [reservations, sortOrder, assignmentFilter]);

  const currentIndexOfLastItem = currentPage * itemsPerPage;
  const currentIndexOfFirstItem = currentIndexOfLastItem - itemsPerPage;
  const currentItems = currentReservations.slice(currentIndexOfFirstItem, currentIndexOfLastItem);

  const archivedIndexOfLastItem = archivedPage * itemsPerPage;
  const archivedIndexOfFirstItem = archivedIndexOfLastItem - itemsPerPage;
  const archivedItems = archivedReservations.slice(archivedIndexOfFirstItem, archivedIndexOfLastItem);

  const paginate = (pageNumber: number) => setCurrentPage(pageNumber);
  const paginateArchived = (pageNumber: number) => setArchivedPage(pageNumber);

  const renderReservations = (items: StudioReservationRequest[]) => {
    return items.map((reservation) => {
      const assignedEngineers = (reservation.engineers || [])
        .map(id => engineers.find(e => e.id === id)?.name)
        .filter(Boolean);

      return (
        <li key={reservation.id} className="p-4 border rounded-md space-y-4 bg-card">
          <div className="flex justify-between items-start gap-4">
            <div className="flex-grow">
              <p className="font-semibold text-lg text-primary">{reservation.programName}</p>
              <p className="text-sm text-muted-foreground">تهیه‌کننده: {reservation.requesterName}</p>
              <p className="text-sm text-muted-foreground">تاریخ: {format(parseDateString(reservation.dateTime.reservationDate), 'EEEE, PPP', { locale: faIR })}</p>
              <p className="text-sm text-muted-foreground">ساعت: {reservation.dateTime.startTime} - {reservation.dateTime.endTime}</p>
              <div className="flex items-center gap-2 mt-2"><Label>تعداد مهندس</Label><Select value={String(engineerCounts[reservation.id] || 1)} onValueChange={(value) => { const count = parseInt(value, 10); setEngineerCounts(prev => ({ ...prev, [reservation.id]: count })); setSelectedEngineers(prev => { const currentSelection = prev[reservation.id] || []; const newSelection = Array(count).fill('').map((_, i) => currentSelection[i] || ''); return { ...prev, [reservation.id]: newSelection }; }); }}><SelectTrigger className="w-[80px]"><SelectValue /></SelectTrigger><SelectContent>{[1, 2, 3, 4].map(num => (<SelectItem key={num} value={String(num)}>{num}</SelectItem>))}</SelectContent></Select></div>
              {assignedEngineers.length > 0 && 
                  <p className="text-sm font-medium text-green-600 dark:text-green-400">مهندسین فعلی: {assignedEngineers.join(', ')}</p>
              }
            </div>
            <div className="flex flex-col gap-2 w-56">
                {Array.from({ length: engineerCounts[reservation.id] || 1 }).map((_, index) => (
                    <Select
                        key={index}
                        onValueChange={(engineerId) => {
                            const newSelections = { ...selectedEngineers };
                            if (!newSelections[reservation.id]) {
                                newSelections[reservation.id] = Array(engineerCounts[reservation.id] || 1).fill('');
                            }
                            newSelections[reservation.id][index] = engineerId;
                            setSelectedEngineers(newSelections);
                        }}
                        value={selectedEngineers[reservation.id]?.[index] || ''}
                        dir="rtl"
                    >
                        <SelectTrigger>
                            <SelectValue placeholder={`مهندس ${index + 1}`} />
                        </SelectTrigger>
                        <SelectContent>
                            {engineers.map((engineer) => (
                                <SelectItem key={engineer.id} value={engineer.id}>
                                    {engineer.name}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                ))}
                <div className="flex gap-2 mt-2">
                    <Button className="flex-1" onClick={() => handleAssignEngineers(reservation.id, selectedEngineers[reservation.id]?.filter(id => id) || [], engineerCounts[reservation.id] || 1)}>
                        ثبت
                    </Button>
                </div>
            </div>
          </div>
        </li>
      );
    });
  }

  return (
    <div className="space-y-4" dir="rtl">
      <h1 className="text-2xl font-bold">پنل اختصاص مهندس</h1>

      <Card>
        <CardHeader>
          <CardTitle>مدیریت مهندسین</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2 mb-4">
            <Label htmlFor="new-engineer-name" className="sr-only">نام مهندس</Label>
            <Input
              id="new-engineer-name"
              value={newEngineerName}
              onChange={(e) => setNewEngineerName(e.target.value)}
              placeholder="نام مهندس جدید را وارد کنید"
            />
            <Button onClick={handleAddEngineer}>افزودن</Button>
          </div>
          {isLoading && <p>در حال بارگذاری مهندسین...</p>}
          {error && <p className="text-red-500">{error}</p>}
          <ul className="space-y-2">
            {engineers.map((engineer) => (
              <li key={engineer.id} className="flex items-center justify-between p-2 bg-muted rounded-md">
                <span>{engineer.name}</span>
                <Button variant="ghost" size="icon" onClick={() => handleRemoveEngineer(engineer.id)}>
                  <Trash2 className="h-4 w-4" />
                  <span className="sr-only">حذف</span>
                </Button>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>برنامه‌های ثبت شده</CardTitle>
            <div className="flex items-center gap-2">
              <Select value={assignmentFilter} onValueChange={(value) => setAssignmentFilter(value as any)}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="فیلتر" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">همه</SelectItem>
                  <SelectItem value="assigned">اختصاص یافته</SelectItem>
                  <SelectItem value="unassigned">اختصاص نیافته</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline" size="icon" onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}>
                <ArrowUpDown className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab} dir="rtl">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="current">جاری</TabsTrigger>
              <TabsTrigger value="archived">آرشیوشده</TabsTrigger>
            </TabsList>
            <TabsContent value="current">
              {isLoading && <p>در حال بارگذاری برنامه‌ها...</p>}
              <ul className="space-y-4">
                {renderReservations(currentItems)}
              </ul>
              <div className="flex justify-center items-center space-x-2 mt-4">
                {Array.from({ length: Math.ceil(currentReservations.length / itemsPerPage) }, (_, i) => (
                  <Button key={i + 1} onClick={() => paginate(i + 1)} variant={currentPage === i + 1 ? "default" : "outline"}>
                    {i + 1}
                  </Button>
                ))}
              </div>
            </TabsContent>
            <TabsContent value="archived">
              {isLoading && <p>در حال بارگذاری برنامه‌ها...</p>}
              <ul className="space-y-4">
                {renderReservations(archivedItems)}
              </ul>
              <div className="flex justify-center items-center space-x-2 mt-4">
                {Array.from({ length: Math.ceil(archivedReservations.length / itemsPerPage) }, (_, i) => (
                  <Button key={i + 1} onClick={() => paginateArchived(i + 1)} variant={archivedPage === i + 1 ? "default" : "outline"}>
                    {i + 1}
                  </Button>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
