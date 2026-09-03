import React, { useState, useEffect } from 'react';
import {
 X,
 Check,
 Trees,
 Building2,
 Sparkles,
 Rocket,
 Coffee,
 Compass,
 CheckSquare,
 RotateCcw
} from 'lucide-react';
import { UNSPLASH_CATEGORIES } from '../../utils/unsplashTopics';
import { t, Translation } from '../../utils/i18n';

interface UnsplashTopicModalProps {
 isOpen: boolean;
 onClose: () => void;
 initialActiveTab?: string;
 initialKeywords?: string[];
 onSave: (activeTab: string, keywords: string[]) => void;
 language: string;
 isLight: boolean;
}

export const UnsplashTopicModal: React.FC<UnsplashTopicModalProps> = ({
 isOpen,
 onClose,
 initialActiveTab = 'nature',
 initialKeywords = ['nature', 'landscape'],
 onSave,
 language,
 isLight,
}) => {
 const [activeTab, setActiveTab] = useState<string>(initialActiveTab);
 // Map of categoryId -> selected tag strings
 const [selections, setSelections] = useState<Record<string, string[]>>({});

 useEffect(() => {
 if (isOpen) {
 const tab = initialActiveTab || 'nature';
 setActiveTab(tab);
 setSelections({
 [tab]: initialKeywords && initialKeywords.length > 0 ? initialKeywords : ['nature', 'landscape'],
 });
 }
 }, [isOpen, initialActiveTab, initialKeywords]);

 if (!isOpen) return null;

 const currentCategory = UNSPLASH_CATEGORIES.find((c) => c.id === activeTab) || UNSPLASH_CATEGORIES[0];
 const currentSelectedTags = selections[activeTab] || [];

 const handleToggleTag = (tagQuery: string) => {
 setSelections((prev) => {
 const existing = prev[activeTab] || [];
 const isSelected = existing.includes(tagQuery);
 const updated = isSelected
 ? existing.filter((t) => t !== tagQuery)
 : [...existing, tagQuery];
 return {
 ...prev,
 [activeTab]: updated,
 };
 });
 };

 const handleSelectAll = () => {
 const allTags = currentCategory.tags.map((t) => t.tag);
 setSelections((prev) => ({
 ...prev,
 [activeTab]: allTags,
 }));
 };

 const handleClearAll = () => {
 setSelections((prev) => ({
 ...prev,
 [activeTab]: [],
 }));
 };

 const handleSave = () => {
 const tagsToSave = currentSelectedTags.length > 0 ? currentSelectedTags : [currentCategory.id];
 onSave(activeTab, tagsToSave);
 onClose();
 };

 const renderCategoryIcon = (iconName: string, className = 'w-3.5 h-3.5') => {
 switch (iconName) {
 case 'Trees':
 return <Trees className={className} />;
 case 'Building2':
 return <Building2 className={className} />;
 case 'Sparkles':
 return <Sparkles className={className} />;
 case 'Rocket':
 return <Rocket className={className} />;
 case 'Coffee':
 return <Coffee className={className} />;
 case 'Compass':
 return <Compass className={className} />;
 default:
 return <Sparkles className={className} />;
 }
 };

 return (
 <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
 {/* Frosted Glass Backdrop */}
 <div
 className={`fixed inset-0 transition-opacity ${isLight ? 'bg-black/25' : 'bg-black/60'}`}
 onClick={onClose}
 />

 {/* Modal Container */}
 <div
 className={`glass-modal relative z-10 w-full max-w-3xl max-h-[85vh] rounded-3xl border shadow-2xl flex flex-col overflow-hidden transition-all ${
 isLight
 ? 'border-black/10 shadow-black/15 text-slate-900'
 : 'border-white/15 shadow-black/80 text-white'
 }`}
 >
 {/* Header */}
 <div
 className={`flex items-center justify-between px-6 py-4 border-b ${
 isLight ? 'border-black/10' : 'border-white/10'
 }`}
 >
 <div>
 <h3 className="text-base font-semibold tracking-tight">
 {t('unsplashTopicsModalTitle', language)}
 </h3>
 <p className={`text-xs mt-0.5 ${isLight ? 'text-slate-500' : 'text-white/50'}`}>
 {t('unsplashTopicsModalDesc', language)}
 </p>
 </div>
 <button
 type="button"
 onClick={onClose}
 className={`p-1.5 rounded-xl transition-colors cursor-pointer ${
 isLight
 ? 'text-slate-500 hover:text-black hover:bg-black/5'
 : 'text-white/60 hover:text-white hover:bg-white/10'
 }`}
 >
 <X className="w-4.5 h-4.5" />
 </button>
 </div>

 {/* Category Tabs (Mutually Exclusive across tabs, evenly distributed) */}
 <div
 className={`grid grid-cols-3 sm:grid-cols-6 gap-1.5 px-6 py-3 border-b shrink-0 ${
 isLight ? 'border-black/10 bg-black/[0.02]' : 'border-white/10 bg-black/20'
 }`}
 >
 {UNSPLASH_CATEGORIES.map((cat) => {
 const isTabActive = activeTab === cat.id;
 const count = (selections[cat.id] || []).length;
 return (
 <button
 key={cat.id}
 type="button"
 onClick={() => setActiveTab(cat.id)}
 className={`flex items-center justify-center gap-1.5 px-2.5 py-2 rounded-xl text-xs whitespace-nowrap transition-all cursor-pointer active:scale-95 select-none ${
 isTabActive
 ? isLight
 ? 'bg-white text-slate-900 shadow-sm font-semibold border border-black/10'
 : 'bg-white text-slate-950 shadow-sm font-semibold'
 : isLight
 ? 'bg-black/[0.03] hover:bg-black/[0.06] text-slate-700 border border-black/5'
 : 'bg-white/[0.05] hover:bg-white/10 text-white/70 border border-white/5'
 }`}
 >
 {renderCategoryIcon(cat.icon, 'w-3.5 h-3.5 shrink-0')}
 <span className="whitespace-nowrap leading-none">{t(cat.nameKey as keyof Translation, language)}</span>
 {count > 0 && (
 <span
 className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold shrink-0 ${
 isTabActive
 ? isLight
 ? 'bg-white/20 text-white'
 : 'bg-black/20 text-slate-950'
 : isLight
 ? 'bg-black/10 text-slate-700'
 : 'bg-white/15 text-white/90'
 }`}
 >
 {count}
 </span>
 )}
 </button>
 );
 })}
 </div>

 {/* Content Area */}
 <div className="flex-1 overflow-y-auto p-6 space-y-4">
 <div className="flex items-center justify-between">
 <div className="flex items-center gap-2 text-xs">
 <span className={isLight ? 'text-slate-600 font-medium' : 'text-white/60 font-medium'}>
 {t(currentCategory.nameKey as keyof Translation, language)} · {t('unsplashSelectedTags', language)}:{' '}
 <span className="font-semibold">{currentSelectedTags.length} / {currentCategory.tags.length}</span>
 </span>
 </div>
 <div className="flex items-center gap-2">
 <button
 type="button"
 onClick={handleSelectAll}
 className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-medium border transition-colors cursor-pointer active:scale-95 ${
 isLight
 ? 'bg-black/[0.03] border-black/10 hover:bg-black/[0.06] text-slate-700'
 : 'bg-white/[0.05] border-white/10 hover:bg-white/10 text-white/80'
 }`}
 >
 <CheckSquare className="w-3.5 h-3.5" />
 <span>{t('unsplashSelectAll', language)}</span>
 </button>
 <button
 type="button"
 onClick={handleClearAll}
 className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-medium border transition-colors cursor-pointer active:scale-95 ${
 isLight
 ? 'bg-black/[0.03] border-black/10 hover:bg-black/[0.06] text-slate-700'
 : 'bg-white/[0.05] border-white/10 hover:bg-white/10 text-white/80'
 }`}
 >
 <RotateCcw className="w-3.5 h-3.5" />
 <span>{t('unsplashClearAll', language)}</span>
 </button>
 </div>
 </div>

 <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
 {currentCategory.tags.map((tagItem) => {
 const isSelected = currentSelectedTags.includes(tagItem.tag);
 return (
 <div
 key={tagItem.id}
 onClick={() => handleToggleTag(tagItem.tag)}
 className={`p-3 rounded-2xl border transition-all cursor-pointer select-none relative flex flex-col justify-between active:scale-98 ${
 isSelected
 ? isLight
 ? 'bg-black/[0.06] border-black/25 text-slate-900 shadow-sm ring-1 ring-black/15'
 : 'bg-white/[0.12] border-white/30 text-white shadow-sm ring-1 ring-white/20'
 : isLight
 ? 'bg-black/[0.02] border-black/8 hover:bg-black/[0.05] text-slate-700 hover:border-black/15'
 : 'bg-white/[0.03] border-white/8 hover:bg-white/[0.06] text-white/70 hover:border-white/15'
 }`}
 >
 <div className="flex items-start justify-between gap-2 mb-1.5">
 <div>
 <div className="font-semibold text-xs flex items-center gap-1.5">
 <span>{t(tagItem.labelKey as keyof Translation, language)}</span>
 <span className="text-[10px] font-normal opacity-50">({tagItem.tag})</span>
 </div>
 </div>
 <div
 className={`w-4 h-4 rounded-md border flex items-center justify-center shrink-0 transition-colors ${
 isSelected
 ? isLight
 ? 'bg-slate-900 border-slate-900 text-white'
 : 'bg-white border-white text-slate-950'
 : isLight
 ? 'border-black/20 bg-black/5'
 : 'border-white/20 bg-white/5'
 }`}
 >
 {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
 </div>
 </div>
 <div className={`text-[11px] leading-relaxed ${isLight ? 'text-slate-500' : 'text-white/50'}`}>
 {t(tagItem.descKey as keyof Translation, language)}
 </div>
 </div>
 );
 })}
 </div>
 </div>

 {/* Modal Footer */}
 <div
 className={`flex items-center justify-between px-6 py-4 border-t ${
 isLight ? 'border-black/10' : 'border-white/10'
 }`}
 >
 <div className="text-xs">
 <span className={isLight ? 'text-slate-500' : 'text-white/50'}>
 {t('unsplashActiveCategory', language)}:{' '}
 </span>
 <span className="font-semibold">
 {t(currentCategory.nameKey as keyof Translation, language)}
 </span>
 </div>

 <div className="flex items-center gap-2.5">
 <button
 type="button"
 onClick={onClose}
 className={`px-4 py-2 rounded-xl text-xs font-medium border transition-colors cursor-pointer ${
 isLight
 ? 'border-black/10 hover:bg-black/5 text-slate-700'
 : 'border-white/10 hover:bg-white/10 text-white/80'
 }`}
 >
 {t('cancel', language)}
 </button>
 <button
 type="button"
 onClick={handleSave}
 className={`px-5 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer active:scale-95 shadow-md flex items-center gap-1.5 ${
 isLight
 ? 'bg-slate-900 hover:bg-black text-white'
 : 'bg-white hover:bg-slate-100 text-slate-950'
 }`}
 >
 <Check className="w-3.5 h-3.5" />
 <span>{t('unsplashSaveTopics', language)}</span>
 </button>
 </div>
 </div>
 </div>
 </div>
 );
};
