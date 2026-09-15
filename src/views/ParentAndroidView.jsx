import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { 
  Smartphone, 
  Bell, 
  Award, 
  BookOpen, 
  Bus, 
  CreditCard, 
  Send, 
  CheckCircle2
} from 'lucide-react';

export const ParentAndroidView = () => {
  const { lang, t, pushNotifs, sendPushNotification, students, selectedStudentId } = useApp();

  const isAr = lang === 'ar';
  const [testNotifType, setTestNotifType] = useState('mark');

  const selectedStudent = students.find((s) => s.id === selectedStudentId) || students[0];

  const handleSendTestPushNotif = () => {
    if (testNotifType === 'mark') {
      sendPushNotification(
        isAr ? `📊 علامة جديدة للطالب ${selectedStudent.name}` : `📊 New Exam Mark for ${selectedStudent.nameEn}`,
        isAr ? `حصل الطالب على 98/100 في امتحان العلوم والفيزياء (المركز الأول 🥇)` : `Student achieved 98/100 in Physics & Science (Rank #1 🥇)`,
        'mark',
        selectedStudent.id
      );
    } else if (testNotifType === 'bus') {
      sendPushNotification(
        isAr ? `🚌 صعود الطالب للحافلة` : `🚌 Student Bus Boarding`,
        isAr ? `تم صعود الطالب ${selectedStudent.name} إلى حافلة رقم 101 بنجاح (المسار المباشر)` : `Student ${selectedStudent.nameEn} boarded Bus #101 successfully`,
        'bus',
        selectedStudent.id
      );
    } else if (testNotifType === 'homework') {
      sendPushNotification(
        isAr ? `📌 واجب منزلي جديد` : `📌 New Daily Homework`,
        isAr ? `تنبيه: تم إضافة واجب في مادة الرياضيات (حل تمارين ص 48)` : `Notice: Mathematics homework added (Exercises Page 48)`,
        'homework',
        selectedStudent.id
      );
    } else if (testNotifType === 'tuition') {
      sendPushNotification(
        isAr ? `💳 إشعار القسط المالي ($ USD)` : `💳 Tuition Payment Notice ($ USD)`,
        isAr ? `تذكير: موعد القسط القادم هو نهاية الشهر لضمان استمرار كافة الخدمات` : `Reminder: Tuition payment due by end of month`,
        'tuition',
        selectedStudent.id
      );
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      
      {/* Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white border border-[#E2E8F0] p-6 rounded-3xl shadow-sm text-[#0F172A]">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-[#0A5C36]/10 text-[#0A5C36] rounded-2xl">
            <Smartphone className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-[#0A5C36]">{t('androidAppTitle')}</h2>
            <p className="text-xs text-slate-500 mt-1">
              {isAr 
                ? "تطبيق أندرويد للهواتف الذكية يُرسل إشعارات حية ومباشرة للأهل للعلامات، الحافلة، والواجبات."
                : "Android Smartphone App sending real-time push notifications for marks, bus GPS, and homework."}
            </p>
          </div>
        </div>

        {/* Trigger Push Notification Simulator */}
        <div className="flex items-center gap-2">
          <select
            value={testNotifType}
            onChange={(e) => setTestNotifType(e.target.value)}
            className="bg-[#F8FAFC] border border-[#E2E8F0] text-[#0F172A] rounded-xl px-3 py-2 text-xs font-semibold focus:outline-none cursor-pointer"
          >
            <option value="mark">📊 {t('notificationMark')}</option>
            <option value="bus">🚌 {t('notificationBus')}</option>
            <option value="homework">📌 {t('notificationHomework')}</option>
            <option value="tuition">💳 {t('notificationTuition')}</option>
          </select>

          <button
            onClick={handleSendTestPushNotif}
            className="btn-mustard flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold shadow transition-all cursor-pointer whitespace-nowrap"
          >
            <Send className="w-4 h-4" />
            <span>{isAr ? 'إرسال إشعار لحظي' : 'Send Push Notif'}</span>
          </button>
        </div>
      </div>

      {/* Main Container: Full Width Notification Feed (Phone Simulator Removed) */}
      <div className="bg-white border border-[#E2E8F0] p-6 rounded-3xl space-y-4 shadow-sm text-[#0F172A]">
        <h3 className="text-base font-bold text-[#0A5C36] flex items-center justify-between border-b border-slate-100 pb-3">
          <span className="flex items-center gap-2">
            <Bell className="w-5 h-5 text-[#0A5C36]" />
            <span>{t('pushNotifications')} ({pushNotifs.length})</span>
          </span>
          <span className="text-xs text-slate-400 font-normal">
            {isAr ? 'سجل الإشعارات المرسلة لتطبيق الأهل' : 'Sent push history'}
          </span>
        </h3>

        <div className="space-y-3">
          {pushNotifs.map((notif) => (
            <div
              key={notif.id}
              className="interactive-card bg-[#F8FAFC] p-4 rounded-2xl border border-[#E2E8F0] hover:border-[#0A5C36]/40 transition-all flex items-start justify-between gap-4"
            >
              <div className="flex items-start gap-3">
                <div className="p-2.5 bg-[#0A5C36]/10 text-[#0A5C36] rounded-2xl shrink-0">
                  {notif.type === 'mark' ? <Award className="w-5 h-5" /> : notif.type === 'bus' ? <Bus className="w-5 h-5" /> : notif.type === 'homework' ? <BookOpen className="w-5 h-5" /> : <CreditCard className="w-5 h-5" />}
                </div>

                <div className="space-y-1">
                  <h4 className="text-xs font-bold text-[#0F172A]">{notif.title}</h4>
                  <p className="text-xs text-slate-600 leading-relaxed bg-white p-2.5 rounded-xl border border-slate-100">
                    {notif.content}
                  </p>
                </div>
              </div>

              <span className="text-[11px] text-slate-400 shrink-0 font-mono">{notif.date}</span>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};
