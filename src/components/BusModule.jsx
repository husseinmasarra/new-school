import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { useApp } from '../context/AppContext';
import { 
  Bus, 
  CheckCircle2, 
  Plus, 
  Trash2, 
  Users, 
  UserPlus 
} from 'lucide-react';

export const BusModule = () => {
  const { 
    lang, 
    t, 
    currentRole, 
    buses = [], 
    addBus, 
    deleteBus, 
    students = [], 
    selectedStudentId, 
    assignStudentToBus 
  } = useApp();

  const isAr = lang === 'ar';
  const safeStudents = students || [];
  const safeBuses = buses || [];

  const currentStudent = safeStudents.find((s) => s.id === selectedStudentId) || safeStudents[0];
  const studentBus = safeBuses.find((b) => b.id === currentStudent?.busId) || safeBuses[0];

  // Add Bus Modal State
  const [showAddBusModal, setShowAddBusModal] = useState(false);
  const [busNumber, setBusNumber] = useState('');
  const [busNumberEn, setBusNumberEn] = useState('');
  const [driverName, setDriverName] = useState('');
  const [driverNameEn, setDriverNameEn] = useState('');
  const [driverPhone, setDriverPhone] = useState('');
  const [routeName, setRouteName] = useState('');
  const [routeNameEn, setRouteNameEn] = useState('');

  // Assign Student to Bus Modal State
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [selectedStudentForBus, setSelectedStudentForBus] = useState(safeStudents[0]?.id || '');
  const [targetBusIdForAssign, setTargetBusIdForAssign] = useState(safeBuses[0]?.id || '');
  const [assignToast, setAssignToast] = useState(false);

  const handleAddBusSubmit = (e) => {
    e.preventDefault();
    if (!busNumber || !driverName || !driverPhone) return;

    addBus({
      busNumber,
      busNumberEn: busNumberEn || busNumber,
      driverName,
      driverNameEn: driverNameEn || driverName,
      driverPhone,
      routeName: routeName || (isAr ? 'مسار عام للمدرسة' : 'General School Route'),
      routeNameEn: routeNameEn || 'General School Route'
    });

    setBusNumber('');
    setBusNumberEn('');
    setDriverName('');
    setDriverNameEn('');
    setDriverPhone('');
    setRouteName('');
    setRouteNameEn('');
    setShowAddBusModal(false);
  };

  const handleAssignStudentSubmit = (e) => {
    e.preventDefault();
    const finalStudentId = selectedStudentForBus || (safeStudents[0]?.id || '');
    const finalBusId = targetBusIdForAssign || (safeBuses[0]?.id || '');

    if (!finalStudentId || !finalBusId) return;

    assignStudentToBus(finalStudentId, finalBusId);
    setAssignToast(true);
    setTimeout(() => setAssignToast(false), 3000);
    setShowAssignModal(false);
    setSelectedStudentForBus('');
    setTargetBusIdForAssign('');
  };

  return (
    <div className="space-y-6 animate-fade-in text-[#0F172A]">
      
      {/* Title Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white border border-[#E2E8F0] p-6 rounded-3xl shadow-sm text-[#0F172A]">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-[#0284C7]/10 text-[#0284C7] rounded-2xl">
            <Bus className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-[#0284C7]">{isAr ? 'قسم النقل والحافلات المدرسية' : 'School Bus Fleet'}</h2>
            <p className="text-xs text-slate-500 mt-1">
              {isAr 
                ? "إدارة حافلات النقل وتوزيع الطلاب على الحافلات وقوائم السائقين والمجموعات."
                : "Manage school bus fleet, drivers, and student assignments."}
            </p>
          </div>
        </div>

        {/* Admin Action Buttons Only */}
        {currentRole === 'admin' && (
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setShowAssignModal(true)}
              className="btn-mustard flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold shadow transition-all cursor-pointer"
            >
              <UserPlus className="w-4 h-4" />
              <span>{isAr ? "توزيع طالب على حافلة" : "Assign Student to Bus"}</span>
            </button>

            <button
              onClick={() => setShowAddBusModal(true)}
              className="btn-mustard flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold shadow transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>{isAr ? "إضافة حافلة وسائق جديد" : "Add New Bus"}</span>
            </button>
          </div>
        )}
      </div>

      {assignToast && (
        <div className="bg-emerald-50 border border-emerald-300 text-emerald-800 p-4 rounded-2xl flex items-center gap-3 text-xs font-semibold animate-fade-in shadow-lg">
          <CheckCircle2 className="w-6 h-6 text-emerald-600 shrink-0" />
          <span>{isAr ? 'تم تعيين الطالب للحافلة بنجاح!' : 'Student assigned to bus successfully!'}</span>
        </div>
      )}

      {/* Parent/Student Individual Bus Status Card */}
      {(currentRole === 'student' || currentRole === 'parent') && currentStudent && (
        <div className="bg-white border border-[#E2E8F0] rounded-3xl p-6 text-[#0F172A] space-y-4 shadow-sm">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
            <div>
              <h3 className="text-base font-bold text-[#0284C7] flex items-center gap-2">
                <Bus className="w-5 h-5 text-[#0284C7]" />
                <span>{isAr ? `حافلة الطالب: ${currentStudent.name}` : `Student Bus: ${currentStudent.nameEn}`}</span>
              </h3>
              <p className="text-xs text-slate-500">{isAr ? `الحافلة رقم: ${studentBus?.busNumber || '01'}` : `Bus #: ${studentBus?.busNumberEn || '01'}`}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div className="bg-[#F8FAFC] p-3.5 rounded-2xl border border-[#E2E8F0]">
              <span className="text-slate-500 block">{t('busDriver')}:</span>
              <span className="font-bold text-[#0F172A]">{isAr ? studentBus?.driverName : studentBus?.driverNameEn}</span>
            </div>

            <div className="bg-[#F8FAFC] p-3.5 rounded-2xl border border-[#E2E8F0]">
              <span className="text-slate-500 block">{t('driverPhone')}:</span>
              <span className="font-mono font-bold text-[#0284C7]">{studentBus?.driverPhone}</span>
            </div>

            <div className="bg-[#F8FAFC] p-3.5 rounded-2xl border border-[#E2E8F0]">
              <span className="text-slate-500 block">{t('busRoute')}:</span>
              <span className="font-bold text-[#0F172A]">{isAr ? studentBus?.routeName : studentBus?.routeNameEn}</span>
            </div>
          </div>
        </div>
      )}

      {/* All Buses Fleet Roster Cards */}
      <div className="bg-white border border-[#E2E8F0] p-6 rounded-3xl space-y-4 shadow-sm text-[#0F172A]">
        <h3 className="text-base font-bold text-[#0284C7] border-b border-slate-100 pb-3 flex items-center justify-between">
          <span>{isAr ? `أسطول الحافلات المدرسية (${safeBuses.length})` : `School Bus Fleet (${safeBuses.length})`}</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {safeBuses.map((bus) => {
            const busStudents = safeStudents.filter((s) => s.busId === bus.id);

            return (
              <div key={bus.id} className="interactive-card bg-[#F8FAFC] border border-[#E2E8F0] p-5 rounded-3xl space-y-4 shadow-sm hover:border-[#0284C7]/50">
                <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-[#0284C7]/10 text-[#0284C7] rounded-2xl">
                      <Bus className="w-6 h-6" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-[#0F172A]">
                        {isAr ? bus.busNumber : bus.busNumberEn}
                      </h4>
                      <p className="text-[11px] text-slate-500">{isAr ? bus.routeName : bus.routeNameEn}</p>
                    </div>
                  </div>

                  {currentRole === 'admin' && (
                    <button
                      onClick={() => deleteBus(bus.id)}
                      className="p-1.5 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg cursor-pointer"
                      title={t('delete')}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-3 text-xs bg-white p-3 rounded-2xl border border-slate-100">
                  <div>
                    <span className="text-slate-500 block">{t('busDriver')}:</span>
                    <span className="font-bold text-[#0F172A]">{isAr ? bus.driverName : bus.driverNameEn}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">{t('driverPhone')}:</span>
                    <span className="font-mono font-bold text-[#0284C7]">{bus.driverPhone}</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-bold text-[#0F172A] flex items-center gap-1">
                      <Users className="w-4 h-4 text-[#0284C7]" />
                      <span>{isAr ? `الطلاب المخصصون للحافلة (${busStudents.length}):` : `Assigned Students (${busStudents.length}):`}</span>
                    </span>
                  </div>

                  {busStudents.length === 0 ? (
                    <p className="text-[11px] text-slate-400 italic text-center py-2">
                      {isAr ? 'لا يوجد طلاب مخصصون لهذه الحافلة حالياً.' : 'No students assigned yet.'}
                    </p>
                  ) : (
                    <div className="flex flex-wrap gap-2">
                      {busStudents.map((stu) => (
                        <div key={stu.id} className="flex items-center gap-1.5 bg-white border border-[#E2E8F0] px-2.5 py-1 rounded-xl text-[11px] shadow-sm">
                          <img src={stu.avatar} alt={stu.name} className="w-5 h-5 rounded-full object-cover border border-[#0284C7]" />
                          <span className="font-bold text-[#0F172A]">{isAr ? stu.name : stu.nameEn}</span>
                          {currentRole === 'admin' && (
                            <button
                              type="button"
                              onClick={() => assignStudentToBus(stu.id, null)}
                              className="text-red-500 hover:bg-red-50 hover:text-red-700 font-bold text-xs rounded-full w-4 h-4 flex items-center justify-center cursor-pointer transition-colors"
                              title={isAr ? "إزالة الطالب من هذه الحافلة" : "Remove student from bus"}
                            >
                              ✕
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Add Bus Modal - Teleported to document.body */}
      {showAddBusModal && createPortal(
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-[99999] flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
          <form
            onSubmit={handleAddBusSubmit}
            className="bg-white border-2 border-[#0284C7] rounded-3xl p-6 max-w-lg w-full space-y-4 shadow-2xl animate-scale-up text-[#0F172A] relative"
          >
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-[#0284C7] flex items-center gap-2">
                <Bus className="w-5 h-5 text-[#0284C7]" />
                <span>{isAr ? 'إضافة حافلة وسائق جديد' : 'Add New Bus & Driver'}</span>
              </h3>
              <button 
                type="button" 
                onClick={() => setShowAddBusModal(false)} 
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center font-bold text-xs transition-colors cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700">{isAr ? 'رقم/اسم الحافلة' : 'Bus Number/Name'} <span className="text-red-500">*</span></label>
                <input type="text" required value={busNumber} onChange={(e) => setBusNumber(e.target.value)} placeholder="حافلة رقم 05..." className="w-full bg-[#F8FAFC] border border-[#E2E8F0] text-[#0F172A] rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-[#0284C7]" />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700">{isAr ? 'اسم السائق' : 'Driver Name'} <span className="text-red-500">*</span></label>
                <input type="text" required value={driverName} onChange={(e) => setDriverName(e.target.value)} placeholder="حسن زعيتر..." className="w-full bg-[#F8FAFC] border border-[#E2E8F0] text-[#0F172A] rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-[#0284C7]" />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700">{isAr ? 'رقم هاتف السائق' : 'Driver Phone'} <span className="text-red-500">*</span></label>
                <input type="text" required value={driverPhone} onChange={(e) => setDriverPhone(e.target.value)} placeholder="+961 03 777 888" className="w-full bg-[#F8FAFC] border border-[#E2E8F0] text-[#0F172A] rounded-xl px-3 py-2 text-xs font-mono focus:outline-none focus:border-[#0284C7]" />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700">{isAr ? 'اسم مسار الحافلة' : 'Route Name'}</label>
                <input type="text" value={routeName} onChange={(e) => setRouteName(e.target.value)} placeholder="خط بيروت - الحمرا..." className="w-full bg-[#F8FAFC] border border-[#E2E8F0] text-[#0F172A] rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-[#0284C7]" />
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
              <button type="button" onClick={() => setShowAddBusModal(false)} className="px-4 py-2 bg-slate-100 text-slate-700 rounded-xl text-xs font-bold cursor-pointer">{t('cancel')}</button>
              <button type="submit" className="px-5 py-2 btn-mustard rounded-xl text-xs font-bold shadow cursor-pointer">{t('save')}</button>
            </div>
          </form>
        </div>,
        document.body
      )}

      {/* Assign Student Modal - Teleported to document.body */}
      {showAssignModal && createPortal(
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-[99999] flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
          <form
            onSubmit={handleAssignStudentSubmit}
            className="bg-white border-2 border-[#0284C7] rounded-3xl p-6 max-w-md w-full space-y-4 shadow-2xl animate-scale-up text-[#0F172A] relative"
          >
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-[#0284C7] flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-[#0284C7]" />
                <span>{isAr ? 'تخصيص طالب للحافلة' : 'Assign Student to Bus'}</span>
              </h3>
              <button 
                type="button" 
                onClick={() => setShowAssignModal(false)} 
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center font-bold text-xs transition-colors cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700">{isAr ? 'اختر الطالب:' : 'Select Student:'}</label>
              <select
                value={selectedStudentForBus || safeStudents[0]?.id || ''}
                onChange={(e) => setSelectedStudentForBus(e.target.value)}
                className="w-full bg-[#F8FAFC] border border-[#E2E8F0] text-[#0F172A] rounded-xl px-3 py-2 text-xs focus:outline-none cursor-pointer"
              >
                {safeStudents.map((s) => (
                  <option key={s.id} value={s.id}>
                    {isAr ? s.name : s.nameEn} ({isAr ? s.grade : s.gradeEn})
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700">{isAr ? 'اختر الحافلة:' : 'Select Bus:'}</label>
              <select
                value={targetBusIdForAssign || safeBuses[0]?.id || ''}
                onChange={(e) => setTargetBusIdForAssign(e.target.value)}
                className="w-full bg-[#F8FAFC] border border-[#E2E8F0] text-[#0F172A] rounded-xl px-3 py-2 text-xs focus:outline-none cursor-pointer"
              >
                {safeBuses.map((b) => (
                  <option key={b.id} value={b.id}>
                    {isAr ? b.busNumber : b.busNumberEn} ({isAr ? b.routeName : b.routeNameEn})
                  </option>
                ))}
              </select>
            </div>

            <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
              <button type="button" onClick={() => setShowAssignModal(false)} className="px-4 py-2 bg-slate-100 text-slate-700 rounded-xl text-xs font-bold cursor-pointer">{t('cancel')}</button>
              <button type="submit" className="px-5 py-2 btn-mustard rounded-xl text-xs font-bold shadow cursor-pointer">{t('save')}</button>
            </div>
          </form>
        </div>,
        document.body
      )}

    </div>
  );
};
