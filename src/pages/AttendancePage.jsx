import React, { useState } from 'react';
import { useSchool } from '../context/SchoolContext';
import { CalendarCheck, Check, X, Clock, AlertCircle, Calendar } from 'lucide-react';

export const AttendancePage = () => {
  const { students, classes, attendanceRecords, markAttendance } = useSchool();
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedGrade, setSelectedGrade] = useState('ALL');

  const filteredStudents = students.filter(s => selectedGrade === 'ALL' || s.grade === selectedGrade);

  const getStudentStatus = (id) => {
    return attendanceRecords[selectedDate]?.[id] || 'حاضر';
  };

  const statusColors = {
    'حاضر': 'bg-emerald-500 text-white border-emerald-600',
    'غائب': 'bg-rose-500 text-white border-rose-600',
    'متأخر': 'bg-amber-500 text-white border-amber-600',
    'بعذر': 'bg-sky-500 text-white border-sky-600'
  };

  const currentRecords = filteredStudents.map(s => getStudentStatus(s.id));
  const presentCount = currentRecords.filter(st => st === 'حاضر').length;
  const absentCount = currentRecords.filter(st => st === 'غائب').length;
  const lateCount = currentRecords.filter(st => st === 'متأخر').length;

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm no-print">
        <div>
          <h2 className="text-xl font-black text-slate-900 flex items-center gap-2">
            <CalendarCheck className="w-6 h-6 text-emerald-600" />
            سجل الحضور والغياب المباشر
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            رصد حضور وغياب الطلاب يومياً بنقرة زر واحدة وتوليد نسب الالتزام
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200 text-xs">
            <Calendar className="w-4 h-4 text-slate-400" />
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="bg-transparent font-bold text-slate-800 focus:outline-none"
            />
          </div>

          <select
            value={selectedGrade}
            onChange={(e) => setSelectedGrade(e.target.value)}
            className="text-xs p-2 rounded-xl border border-slate-200 font-bold text-slate-700 focus:outline-none"
          >
            <option value="ALL">جميع الصفوف والشعب</option>
            {classes.map(c => (
              <option key={c.id} value={c.name}>{c.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Live Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-emerald-50 border border-emerald-200 p-4 rounded-2xl flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-emerald-800">حاضرون اليوم</span>
            <div className="text-2xl font-black text-emerald-900 mt-1">{presentCount} طلاب</div>
          </div>
          <div className="w-10 h-10 rounded-full bg-emerald-200 text-emerald-800 flex items-center justify-center font-bold">
            <Check className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-rose-50 border border-rose-200 p-4 rounded-2xl flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-rose-800">الغياب</span>
            <div className="text-2xl font-black text-rose-900 mt-1">{absentCount} طلاب</div>
          </div>
          <div className="w-10 h-10 rounded-full bg-rose-200 text-rose-800 flex items-center justify-center font-bold">
            <X className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-amber-50 border border-amber-200 p-4 rounded-2xl flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-amber-800">تأخير صباحي</span>
            <div className="text-2xl font-black text-amber-900 mt-1">{lateCount} طلاب</div>
          </div>
          <div className="w-10 h-10 rounded-full bg-amber-200 text-amber-800 flex items-center justify-center font-bold">
            <Clock className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Attendance Sheet Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 bg-slate-900 text-white flex items-center justify-between">
          <span className="text-xs font-bold">قائمة طلاب اليوم: {selectedDate}</span>
          <span className="text-xs text-slate-400">انقر على الحالة لرصدها فوراً</span>
        </div>

        <div className="divide-y divide-slate-100">
          {filteredStudents.map(student => {
            const currentStatus = getStudentStatus(student.id);

            return (
              <div key={student.id} className="p-3.5 flex items-center justify-between hover:bg-slate-50 transition">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-sky-100 text-sky-700 font-bold flex items-center justify-center text-xs">
                    {student.name[0]}
                  </div>
                  <div>
                    <h4 className="font-extrabold text-sm text-slate-900">{student.name}</h4>
                    <p className="text-xs text-slate-500">{student.grade} - شعبة {student.section}</p>
                  </div>
                </div>

                <div className="flex items-center gap-1.5">
                  {['حاضر', 'غائب', 'متأخر', 'بعذر'].map((st) => (
                    <button
                      key={st}
                      onClick={() => markAttendance(selectedDate, student.id, st)}
                      className={`px-3 py-1.5 text-xs font-bold rounded-xl border transition ${
                        currentStatus === st
                          ? statusColors[st]
                          : 'bg-slate-100 text-slate-600 border-slate-200 hover:bg-slate-200'
                      }`}
                    >
                      {st}
                    </button>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
};
