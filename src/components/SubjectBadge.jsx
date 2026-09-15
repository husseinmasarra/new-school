import React from 'react';
import { useApp } from '../context/AppContext';

const hexToRgba = (hex, alpha = 0.15) => {
  if (!hex || typeof hex !== 'string' || !hex.startsWith('#')) return null;
  let c = hex.replace('#', '');
  if (c.length === 3) c = c.split('').map(x => x + x).join('');
  if (c.length !== 6) return null;
  const r = parseInt(c.substring(0, 2), 16);
  const g = parseInt(c.substring(2, 4), 16);
  const b = parseInt(c.substring(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};

const getSubjectColorTheme = (name = '') => {
  const n = (name || '').toLowerCase();
  
  if (n.includes('عرب') || n.includes('لغوي')) {
    return { color: '#E11D48', bgColor: '#FFE4E6', borderColor: '#FDA4AF', icon: '📖' };
  }
  if (n.includes('رياضيات') || n.includes('حساب') || n.includes('جبر')) {
    return { color: '#0284C7', bgColor: '#E0F2FE', borderColor: '#7DD3FC', icon: '📐' };
  }
  if (n.includes('علوم') || n.includes('فيزياء') || n.includes('كيمياء')) {
    return { color: '#047857', bgColor: '#D1FAE5', borderColor: '#6EE7B7', icon: '🧪' };
  }
  if (n.includes('انكليز') || n.includes('إنجليز') || n.includes('english')) {
    return { color: '#6D28D9', bgColor: '#EDE9FE', borderColor: '#C4B5FD', icon: '🇬🇧' };
  }
  if (n.includes('قرآن') || n.includes('إسلام') || n.includes('دين')) {
    return { color: '#B45309', bgColor: '#FEF3C7', borderColor: '#FCD34D', icon: '🕌' };
  }
  if (n.includes('مدنية') || n.includes('اجتماع')) {
    return { color: '#DB2777', bgColor: '#FCE7F3', borderColor: '#F472B6', icon: '🏛️' };
  }
  if (n.includes('تفاعل') || n.includes('مشاركة')) {
    return { color: '#EA580C', bgColor: '#FFEDD5', borderColor: '#FDBA74', icon: '🌟' };
  }

  return { color: '#0284C7', bgColor: '#F0F9FF', borderColor: '#BAE6FD', icon: '📚' };
};

export const SubjectBadge = ({ subjectName, subjectId, className = '' }) => {
  const { lang, subjects = [] } = useApp();

  const cleanTargetName = (subjectName || '').trim();

  const sub = (subjects || []).find(
    (s) => s.id === subjectId || 
           s.name === subjectName || 
           s.nameEn === subjectName ||
           (s.name && cleanTargetName && (s.name.trim() === cleanTargetName || s.name.includes(cleanTargetName) || cleanTargetName.includes(s.name)))
  );

  const fallbackTheme = getSubjectColorTheme(cleanTargetName || sub?.name);

  const name = sub
    ? lang === 'ar'
      ? sub.name
      : (sub.nameEn || sub.name)
    : subjectName || 'المادة';

  const hexColor = sub?.color || fallbackTheme.color;
  const computedBg = hexToRgba(hexColor, 0.15) || sub?.bgColor || fallbackTheme.bgColor;
  const computedBorder = hexToRgba(hexColor, 0.4) || sub?.borderColor || fallbackTheme.borderColor;

  const icon = sub?.icon || fallbackTheme.icon;
  const image = sub?.image || null;

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-black border transition-all shadow-2xs ${className}`}
      style={{
        color: hexColor,
        backgroundColor: computedBg,
        borderColor: computedBorder
      }}
    >
      {image ? (
        <img src={image} alt={name} className="w-4 h-4 rounded-full object-cover border border-white/60 shrink-0" />
      ) : (
        <span className="text-xs">{icon}</span>
      )}
      <span>{name}</span>
    </span>
  );
};
