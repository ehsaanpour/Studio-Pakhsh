import { LoginForm } from '@/components/auth/login-form';
import { AppLogo } from '@/components/icons/logo';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function LoginPage() {
  return (
    <div className="min-h-screen w-full bg-[#0F172A] flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-[#1E293B] rounded-xl shadow-2xl overflow-hidden">
        <div className="p-8 space-y-6">
          <div className="text-center">
            <AppLogo className="h-12 w-12 text-blue-500 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-white mb-2">ورود به سیستم</h1>
            <p className="text-gray-400 text-sm">
              برای دسترسی به پنل تهیه‌کننده یا مدیریت وارد شوید
            </p>
          </div>

          <LoginForm />

          <div className="relative my-4">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-gray-700" />
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="bg-[#1E293B] px-2 text-gray-400">یا</span>
            </div>
          </div>

          <Button
            variant="outline"
            className="w-full bg-transparent text-gray-300 border-gray-700 hover:bg-gray-800"
            asChild
          >
            <Link href="/guest">ادامه به عنوان کاربر مهمان</Link>
          </Button>
        </div>

        <div className="bg-[#0F172A] p-4 text-center text-xs text-gray-500">
          <p>
            تمامی حقوق این نرم افزار برای <Link href="https://ehsaanpour.github.io/Me/index.html" target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">احسان احسانپور</Link> محفوظ است
          </p>
        </div>
      </div>
    </div>
  );
}

