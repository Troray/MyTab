import React, { useState } from 'react';
import { FolderPlus, Pencil } from 'lucide-react';
import { Category, ThemeSettings } from '../../types';
import { ResolvedTextColors } from '../../utils/wallpaperAnalyzer';
import { CategoryModal } from './CategoryModal';
import { t } from '../../utils/i18n';

interface CategoryTabsProps {
 categories: Category[];
 activeCategoryId: string;
 settings: ThemeSettings;
 resolvedColors?: ResolvedTextColors;
 siteCounts: Record<string, number>;
 onSelectCategory: (id: string) => void;
 onAddCategory: (data: { name: string; showInAll: boolean }) => void;
 onUpdateCategory: (id: string, updates: Partial<Category>) => void;
 onDeleteCategory: (id: string) => void;
}

export const CategoryTabs: React.FC<CategoryTabsProps> = React.memo(({
 categories,
 activeCategoryId,
 settings,
 resolvedColors,
 siteCounts,
 onSelectCategory,
 onAddCategory,
 onUpdateCategory,
 onDeleteCategory,
}) => {
 // modalCategory: undefined -> closed; null -> add mode; Category -> edit mode
 const [modalCategory, setModalCategory] = useState<Category | null | undefined>(undefined);
 const isLight = settings.mode === 'light';
 const isDarkWallpaper = resolvedColors
   ? (resolvedColors.tabs === '#ffffff' || resolvedColors.tabs.startsWith('rgba(255') || resolvedColors.centerIsDark)
   : !isLight;

 const handleSaveCategory = (catId: string | null, data: { name: string; showInAll: boolean }) => {
 if (catId) {
 onUpdateCategory(catId, data);
 } else {
 onAddCategory(data);
 }
 };

 return (
 <div className="flex items-center justify-center flex-wrap gap-2 px-4 mb-6 max-w-4xl mx-auto z-20">
 {categories.map((cat) => {
 const isActive = activeCategoryId === cat.id;
 const count = siteCounts[cat.id] || 0;

 return (
 <div
 key={cat.id}
 className="group relative flex items-center"
 >
 <button
 onClick={() => onSelectCategory(cat.id)}
 style={
 !isActive && resolvedColors?.tabs
 ? {
 color: resolvedColors.tabs,
 borderColor: `${resolvedColors.tabs}35`,
 backgroundColor: `${resolvedColors.tabs}14`,
 }
 : undefined
 }
 className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs md:text-sm font-medium transition-all duration-150 cursor-pointer select-none active:scale-95 ${
 isActive
 ? 'bg-white text-slate-950 shadow-md border border-black/10 font-semibold'
 : !resolvedColors?.tabs
 ? isDarkWallpaper
 ? 'text-white/85 hover:text-white bg-white/10 hover:bg-white/20 border border-white/15'
 : 'text-slate-700 hover:text-black bg-white/70 hover:bg-white/95 border border-black/8 shadow-sm shadow-black/[0.02]'
 : 'hover:brightness-110 shadow-xs'
 }`}
 >
 <span
 style={!isActive && resolvedColors?.tabs ? { color: resolvedColors.tabs } : undefined}
 className={!isActive && resolvedColors?.tabsShadow ? resolvedColors.tabsShadow : ''}
 >
 {cat.name}
 </span>
 <span
 style={!isActive && resolvedColors?.tabs ? { color: resolvedColors.tabs, backgroundColor: `${resolvedColors.tabs}22` } : undefined}
 className={`text-[10px] px-1.5 py-0.2 rounded-full font-tabular ${
 isActive
 ? 'bg-black/15 text-slate-900 font-semibold'
 : !resolvedColors?.tabs
 ? isDarkWallpaper
 ? 'bg-white/15 text-white/80'
 : 'bg-black/[0.05] text-slate-600'
 : ''
 }`}
 >
 {count}
 </span>
 </button>

 {/* Edit button for custom category on hover */}
 {!cat.isDefault && (
 <button
 onClick={(e) => {
 e.stopPropagation();
 setModalCategory(cat);
 }}
 title={t('editCategory', settings.language)}
 className={`hidden group-hover:flex absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full items-center justify-center transition-transform hover:scale-110 shadow-sm cursor-pointer z-10 ${
 isLight
 ? 'bg-white text-slate-700 hover:text-black shadow-sm border border-black/5'
 : 'bg-white text-slate-900 hover:bg-slate-100'
 }`}
 >
 <Pencil className="w-2.5 h-2.5" />
 </button>
 )}
 </div>
 );
 })}

 {/* Add Category Button */}
 <button
 onClick={() => setModalCategory(null)}
 style={
 resolvedColors?.tabs
 ? {
 color: resolvedColors.tabs,
 borderColor: `${resolvedColors.tabs}40`,
 backgroundColor: `${resolvedColors.tabs}0d`,
 }
 : undefined
 }
 className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-medium border border-dashed transition-all cursor-pointer select-none active:scale-95 ${
 !resolvedColors?.tabs
 ? isDarkWallpaper
 ? 'text-white/70 hover:text-white bg-white/[0.05] hover:bg-white/15 border-white/20'
 : 'text-slate-600 hover:text-black bg-white/50 hover:bg-white border-black/15 shadow-sm'
 : 'hover:brightness-110'
 }`}
 title={t('addCategory', settings.language)}
 >
 <FolderPlus className="w-3.5 h-3.5" />
 <span className="hidden sm:inline">{t('addCategory', settings.language)}</span>
 </button>

 {/* Unified Add/Edit Category Modal */}
 <CategoryModal
 isOpen={modalCategory !== undefined}
 category={modalCategory ?? null}
 settings={settings}
 onClose={() => setModalCategory(undefined)}
 onSave={handleSaveCategory}
 onDelete={onDeleteCategory}
 />
 </div>
 );
});
