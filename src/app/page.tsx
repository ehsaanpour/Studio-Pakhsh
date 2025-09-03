
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Film, CalendarCheck, UserCog } from 'lucide-react';
import { AppLogo } from '@/components/icons/logo';

export default function LandingPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <header className="container mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 text-2xl font-bold text-primary">
            <AppLogo className="h-8 w-8" />
            <span>رزرو استودیو</span>
          </Link>
          <Button asChild variant="ghost">
            <Link href="/login">ورود به سیستم</Link>
          </Button>
        </div>
      </header>

      <main className="flex-grow">
        {/* Updated Hero Section with Background Image and Overlay */}
        <section
          className="relative py-20 md:py-28 lg:py-36 bg-cover bg-center"
          style={{ backgroundImage: "url('https://assets.bwbx.io/images/users/iqjWHBFdfxIU/i4E__Y7vjGmg/v1/1200x801.jpg')" }}
        >
          <div className="absolute inset-0 bg-black/60"></div> {/* Dark overlay */}
          <div className="container relative z-10 mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-white">
                استودیوی خود را به راحتی رزرو کنید
              </h1>
              <p className="mt-6 max-w-2xl mx-auto text-lg sm:text-xl text-gray-200">
                به سادگی استودیوهای مجهز ما را برای پروژه‌های فیلمبرداری و صدابرداری خود انتخاب و رزرو نمایید. دسترسی سریع برای مهمانان و تهیه‌کنندگان.
              </p>
              <div className="mt-10 flex flex-col sm:flex-row justify-center gap-4">
                <Button size="lg" asChild className="bg-primary hover:bg-primary/90 text-primary-foreground">
                  <Link href="/guest">
                    رزرو استودیو به عنوان مهمان <ArrowLeft className="ms-2 h-5 w-5" />
                  </Link>
                </Button>
                <Button size="lg" asChild className="bg-gray-300 text-gray-800 hover:bg-gray-400 focus-visible:ring-gray-500">
                  <Link href="/login">
                    ورود تهیه‌کننده / مدیر <ArrowLeft className="ms-2 h-5 w-5" />
                  </Link>
                </Button>
                <Button size="lg" asChild className="bg-gray-300 text-gray-800 hover:bg-gray-400 focus-visible:ring-gray-500">
                  <Link href="/weekly-schedule">
                    برنامه هفتگی <ArrowLeft className="ms-2 h-5 w-5" />
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </section>

        <section className="py-16 md:py-24 bg-background">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold tracking-tight text-foreground">ویژگی‌های کلیدی سیستم</h2>
              <p className="mt-4 text-lg text-muted-foreground">طراحی شده برای سهولت در رزرو و مدیریت استودیو.</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="p-6 bg-card rounded-xl shadow-lg flex flex-col items-center text-center">
                <div className="p-3 bg-primary/10 rounded-full mb-4">
                  <CalendarCheck className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-xl font-semibold text-card-foreground mb-2">رزرو آسان برای مهمانان</h3>
                <p className="text-muted-foreground">کاربران مهمان می‌توانند بدون نیاز به ثبت‌نام، درخواست رزرو خود را ثبت کنند.</p>
              </div>
              <div className="p-6 bg-card rounded-xl shadow-lg flex flex-col items-center text-center">
                <div className="p-3 bg-accent/10 rounded-full mb-4">
                 <Film className="h-8 w-8 text-accent" />
                </div>
                <h3 className="text-xl font-semibold text-card-foreground mb-2">پنل اختصاصی تهیه‌کنندگان</h3>
                <p className="text-muted-foreground">تهیه‌کنندگان با ورود به پنل خود، به سرعت و با اطلاعات از پیش ‌تکمیل‌شده رزرو انجام می‌دهند.</p>
              </div>
              <div className="p-6 bg-card rounded-xl shadow-lg flex flex-col items-center text-center">
                <div className="p-3 bg-secondary/20 rounded-full mb-4">
                  <UserCog className="h-8 w-8 text-secondary-foreground" />
                </div>
                <h3 className="text-xl font-semibold text-card-foreground mb-2">مدیریت جامع برای ادمین</h3>
                <p className="text-muted-foreground">ادمین‌ها به تمامی درخواست‌ها دسترسی داشته و می‌توانند تهیه‌کنندگان جدید را اضافه کنند.</p>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="py-8 bg-muted border-t border-border">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center text-muted-foreground">
          <p>
            تمامی حقوق این نرم افزار برای <a href="https://ehsaanpour.github.io/Me/index.html" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">احسان احسانپور</a> محفوظ است
          </p>
        </div>
      </footer>
    </div>
  );
}

