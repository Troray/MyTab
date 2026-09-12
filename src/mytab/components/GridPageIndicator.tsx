import React, { useState, useRef, useEffect } from 'react';
import { Plus, Pencil, Trash2, ChevronLeft, ChevronRight, X } from 'lucide-react';
import { GridPage, ThemeSettings } from '../../types';
import { ResolvedTextColors } from '../../utils/wallpaperAnalyzer';
import { ConfirmModal } from './ConfirmModal';
import { t } from '../../utils/i18n';

interface GridPageIndicatorProps {
  gridPages: GridPage[];
  activeGridPageId: string;
  settings: ThemeSettings;
  resolvedColors?: ResolvedTextColors;
  isLight?: boolean;
  onSelectPage: (pageId: string) => void;
  onAddPage: (name?: string) => void;
  onRenamePage: (pageId: string, newName: string) => void;
  onDeletePage: (pageId: string) => void;
}

export const GridPageIndicator: React.FC<GridPageIndicatorProps> = ({
  gridPages,
  activeGridPageId,
  settings,
  resolvedColors,
  isLight = false,
  onSelectPage,
  onAddPage,
  onRenamePage,
  onDeletePage,
}) => {
  const [contextMenu, setContextMenu] = useState<{
    page: GridPage;
    x: number;
    y: number;
  } | null>(null);
  const [renamingPage, setRenamingPage] = useState<GridPage | null>(null);
  const [renameInput, setRenameInput] = useState('');
  const [deletingPage, setDeletingPage] = useState<GridPage | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close context menu on click outside or Esc
  useEffect(() => {
    if (!contextMenu) return;
    const handleClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setContextMenu(null);
      }
    };
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setContextMenu(null);
    };
    document.addEventListener('mousedown', handleClick);
    document.addEventListener('keydown', handleKey);
    return () => {
      document.removeEventListener('mousedown', handleClick);
      document.removeEventListener('keydown', handleKey);
    };
  }, [contextMenu]);

  const handleContextMenu = (e: React.MouseEvent, page: GridPage) => {
    e.preventDefault();
    e.stopPropagation();
    const menuWidth = 140;
    const menuHeight = 88;
    const x = Math.min(e.clientX, window.innerWidth - menuWidth - 8);
    const y = Math.min(e.clientY, window.innerHeight - menuHeight - 8);
    setContextMenu({ page, x, y });
  };

  const startRename = (page: GridPage) => {
    setRenamingPage(page);
    setRenameInput(page.name);
    setContextMenu(null);
  };

  const handleRenameSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!renamingPage) return;
    const trimmed = renameInput.trim();
    if (trimmed) {
      onRenamePage(renamingPage.id, trimmed);
    }
    setRenamingPage(null);
  };

  const activeIndex = Math.max(
    0,
    gridPages.findIndex((p) => p.id === activeGridPageId)
  );

  return (
    <div className="flex flex-col items-center justify-center mt-3 mb-1 select-none z-20">
      {/* Frosted Floating Pill Capsule */}
      <div
        className={`inline-flex items-center gap-2.5 px-3.5 py-1.5 rounded-full border backdrop-blur-md shadow-sm transition-all ${
          isLight
            ? 'bg-white/65 border-black/10 text-slate-800'
            : 'bg-black/30 border-white/15 text-white'
        }`}
      >
        {/* Previous page arrow (if multiple pages) */}
        {gridPages.length > 1 && (
          <button
            type="button"
            disabled={activeIndex === 0}
            onClick={() => {
              if (activeIndex > 0) {
                onSelectPage(gridPages[activeIndex - 1].id);
              }
            }}
            className={`p-1 rounded-full transition-all cursor-pointer disabled:opacity-20 disabled:cursor-not-allowed ${
              isLight ? 'hover:bg-black/5' : 'hover:bg-white/10'
            }`}
            title={t('prevPage', settings.language)}
          >
            <ChevronLeft className="w-3.5 h-3.5" />
          </button>
        )}

        {/* Page Dots / Pills */}
        <div className="flex items-center gap-2">
          {gridPages.map((page, idx) => {
            const isActive = page.id === activeGridPageId;
            return (
              <button
                key={page.id}
                type="button"
                onClick={() => onSelectPage(page.id)}
                onContextMenu={(e) => handleContextMenu(e, page)}
                title={`${page.name || `${t('defaultDesktopName', settings.language)} ${idx + 1}`} (${t('desktopPage', settings.language)} ${idx + 1})`}
                className={`relative group transition-all duration-300 cursor-pointer focus:outline-none ${
                  isActive
                    ? isLight
                      ? 'w-6 h-2 rounded-full bg-slate-900 shadow-sm'
                      : 'w-6 h-2 rounded-full bg-white shadow-[0_0_8px_rgba(255,255,255,0.7)]'
                    : isLight
                    ? 'w-2 h-2 rounded-full bg-slate-400 hover:bg-slate-700 hover:scale-125'
                    : 'w-2 h-2 rounded-full bg-white/35 hover:bg-white/75 hover:scale-125'
                }`}
              >
                {/* Active Tooltip */}
                <span className="pointer-events-none absolute -top-7 left-1/2 -translate-x-1/2 px-2 py-0.5 rounded-md text-[10px] font-medium whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity bg-slate-900 text-white shadow-md z-30">
                  {page.name || `${t('defaultDesktopName', settings.language)} ${idx + 1}`}
                </span>
              </button>
            );
          })}
        </div>

        {/* Next page arrow (if multiple pages) */}
        {gridPages.length > 1 && (
          <button
            type="button"
            disabled={activeIndex === gridPages.length - 1}
            onClick={() => {
              if (activeIndex < gridPages.length - 1) {
                onSelectPage(gridPages[activeIndex + 1].id);
              }
            }}
            className={`p-1 rounded-full transition-all cursor-pointer disabled:opacity-20 disabled:cursor-not-allowed ${
              isLight ? 'hover:bg-black/5' : 'hover:bg-white/10'
            }`}
            title={t('nextPage', settings.language)}
          >
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        )}

        {/* Add Page Button */}
        <button
          type="button"
          onClick={() => onAddPage()}
          className={`p-1 rounded-full transition-all cursor-pointer active:scale-90 ${
            isLight
              ? 'text-slate-600 hover:text-black hover:bg-black/5'
              : 'text-white/70 hover:text-white hover:bg-white/15'
          }`}
          title={t('addDesktopPage', settings.language)}
        >
          <Plus className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Context Menu for Page */}
      {contextMenu && (
        <div
          ref={menuRef}
          style={{ top: `${contextMenu.y}px`, left: `${contextMenu.x}px` }}
          className={`fixed z-50 min-w-[140px] py-1.5 px-1 rounded-2xl border backdrop-blur-xl shadow-2xl animate-in fade-in zoom-in-95 duration-150 ${
            isLight
              ? 'bg-white/90 border-black/10 text-slate-800 shadow-black/15'
              : 'bg-slate-900/90 border-white/15 text-white shadow-black/80'
          }`}
        >
          <div className="px-3 py-1 text-[10px] font-semibold text-white/50 truncate">
            {contextMenu.page.name}
          </div>

          <button
            type="button"
            onClick={() => startRename(contextMenu.page)}
            className={`w-full flex items-center gap-2 px-3 py-2 text-xs rounded-xl transition-colors cursor-pointer text-left ${
              isLight ? 'hover:bg-black/5 text-slate-700' : 'hover:bg-white/10 text-white/90'
            }`}
          >
            <Pencil className="w-3.5 h-3.5 text-blue-400" />
            <span>{t('renameDesktopPage', settings.language)}</span>
          </button>

          {gridPages.length > 1 && (
            <button
              type="button"
              onClick={() => {
                setDeletingPage(contextMenu.page);
                setContextMenu(null);
              }}
              className="w-full flex items-center gap-2 px-3 py-2 text-xs rounded-xl transition-colors cursor-pointer text-left text-red-400 hover:bg-red-500/10"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>{t('deleteDesktopPage', settings.language)}</span>
            </button>
          )}
        </div>
      )}

      {/* Rename Dialog Modal */}
      {renamingPage && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
          <div
            className={`fixed inset-0 transition-opacity ${isLight ? 'bg-black/30' : 'bg-black/60'}`}
            onClick={() => setRenamingPage(null)}
          />
          <div
            className={`glass-modal relative z-10 w-full max-w-sm rounded-3xl p-6 border shadow-2xl ${
              isLight ? 'border-black/10 text-slate-900' : 'border-white/15 text-white'
            }`}
          >
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-white/10">
              <h3 className="text-sm font-semibold tracking-tight">
                {t('renameDesktopPage', settings.language)}
              </h3>
              <button
                type="button"
                onClick={() => setRenamingPage(null)}
                className="p-1 rounded-xl hover:bg-white/10 text-white/60 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleRenameSubmit} className="space-y-4">
              <input
                type="text"
                autoFocus
                required
                value={renameInput}
                onChange={(e) => setRenameInput(e.target.value)}
                placeholder={t('pageNamePlaceholder', settings.language)}
                className="glass-input w-full px-3.5 py-2.5 rounded-xl text-sm"
              />

              <div className="flex justify-end gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setRenamingPage(null)}
                  className="glass-btn-ghost px-4 py-2 rounded-xl text-xs font-medium"
                >
                  {t('cancel', settings.language)}
                </button>
                <button
                  type="submit"
                  className="glass-btn-primary px-4 py-2 rounded-xl text-xs font-medium active:scale-95"
                >
                  {t('save', settings.language)}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={Boolean(deletingPage)}
        title={t('deleteDesktopPage', settings.language)}
        message={t('confirmDeletePage', settings.language)}
        confirmText={t('delete', settings.language)}
        cancelText={t('cancel', settings.language)}
        onConfirm={() => {
          if (deletingPage) {
            onDeletePage(deletingPage.id);
            setDeletingPage(null);
          }
        }}
        onCancel={() => setDeletingPage(null)}
        isLight={isLight}
      />
    </div>
  );
};
