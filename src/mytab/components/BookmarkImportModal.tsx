import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  X,
  Bookmark,
  Globe,
  Upload,
  Folder,
  FolderCheck,
  ChevronRight,
  ChevronDown,
  CheckCircle2,
  AlertTriangle,
  Loader2,
  Sparkles,
  Layers,
  ListTree,
  ArrowRight,
  ArrowLeft,
  Shield,
  ExternalLink,
  Check
} from 'lucide-react';
import {
  AppState,
  BookmarkDuplicateStrategy,
  BookmarkImportOptions,
  BookmarkOrganizeStrategy,
  RawBookmarkNode,
  BookmarkImportPreviewStats
} from '../../types';
import {
  checkBookmarkPermission,
  requestBookmarkPermission,
  fetchNativeBookmarkTree,
  calculateImportPreview,
  executeBookmarkImport
} from '../../services/bookmarkImporter';
import { parseNetscapeBookmarkHtml } from '../../services/bookmarkHtmlParser';
import { t } from '../../utils/i18n';
import { isLightMode } from '../../utils/constants';

interface BookmarkImportModalProps {
  isOpen: boolean;
  appState: AppState;
  onClose: () => void;
  onImportSuccess: () => void;
}

type WizardStep = 'source' | 'select' | 'preview' | 'executing' | 'result';

/**
 * Recursively find a bookmark node by its ID in the node tree.
 */
function findNodeById(nodes: RawBookmarkNode[], targetId: string): RawBookmarkNode | null {
  for (const node of nodes) {
    if (node.id === targetId) return node;
    if (node.children) {
      const found = findNodeById(node.children, targetId);
      if (found) return found;
    }
  }
  return null;
}

/**
 * Collect all folder IDs from a node and all its descendants.
 */
function getDescendantFolderIds(node: RawBookmarkNode): string[] {
  const ids: string[] = [];
  if (node.children) {
    ids.push(node.id);
    for (const child of node.children) {
      if (child.children) {
        ids.push(...getDescendantFolderIds(child));
      }
    }
  }
  return ids;
}

export const BookmarkImportModal: React.FC<BookmarkImportModalProps> = ({
  isOpen,
  appState,
  onClose,
  onImportSuccess,
}) => {
  const isLight = isLightMode(appState.settings);
  const language = appState.settings.language;
  const isPrivateSpace = appState.profileId === 'private';

  const [step, setStep] = useState<WizardStep>('source');
  const [rootNodes, setRootNodes] = useState<RawBookmarkNode[]>([]);
  const [selectedFolderIds, setSelectedFolderIds] = useState<string[]>([]);
  const [expandedFolderIds, setExpandedFolderIds] = useState<Record<string, boolean>>({});
  const [strategy, setStrategy] = useState<BookmarkOrganizeStrategy>('smart');
  const [duplicateStrategy, setDuplicateStrategy] = useState<BookmarkDuplicateStrategy>('skip');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [importResult, setImportResult] = useState<{
    sitesCount: number;
    catsCount: number;
    skippedCount: number;
  } | null>(null);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Reset modal state on open
  useEffect(() => {
    if (isOpen) {
      setStep('source');
      setRootNodes([]);
      setSelectedFolderIds([]);
      setExpandedFolderIds({});
      setStrategy('smart');
      setDuplicateStrategy('skip');
      setIsLoading(false);
      setErrorMessage(null);
      setImportResult(null);
    }
  }, [isOpen]);

  // Extract all folder IDs recursively from node tree
  const allFolderIds = useMemo(() => {
    const ids: string[] = [];
    function collect(nodes: RawBookmarkNode[]) {
      for (const node of nodes) {
        if (node.children) {
          ids.push(node.id);
          collect(node.children);
        }
      }
    }
    collect(rootNodes);
    return ids;
  }, [rootNodes]);

  // Pre-select all folders when rootNodes are loaded
  useEffect(() => {
    if (rootNodes.length > 0 && selectedFolderIds.length === 0) {
      setSelectedFolderIds(allFolderIds);
    }
  }, [rootNodes, allFolderIds]);

  // Read native browser bookmarks
  const handleReadNativeBookmarks = async () => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const hasPermission = await checkBookmarkPermission();
      if (!hasPermission) {
        const granted = await requestBookmarkPermission();
        if (!granted) {
          setErrorMessage(t('requestPermissionFailed', language));
          setIsLoading(false);
          return;
        }
      }

      const tree = await fetchNativeBookmarkTree();
      if (!tree || tree.length === 0) {
        setErrorMessage(t('noBookmarksFound', language));
        setIsLoading(false);
        return;
      }

      setRootNodes(tree);
      setStep('select');
    } catch (err: any) {
      console.error('[BookmarkImportModal] Error reading native bookmarks:', err);
      setErrorMessage(err.message || t('requestPermissionFailed', language));
    } finally {
      setIsLoading(false);
    }
  };

  // Upload HTML bookmark file
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsLoading(true);
    setErrorMessage(null);

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const content = event.target?.result as string;
        if (!content) {
          setErrorMessage(t('parseHtmlFailed', language));
          setIsLoading(false);
          return;
        }

        const nodes = parseNetscapeBookmarkHtml(content);
        if (!nodes || nodes.length === 0) {
          setErrorMessage(t('noBookmarksFound', language));
          setIsLoading(false);
          return;
        }

        setRootNodes(nodes);
        setStep('select');
      } catch (err: any) {
        console.error('[BookmarkImportModal] Error parsing HTML:', err);
        setErrorMessage(t('parseHtmlFailed', language));
      } finally {
        setIsLoading(false);
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      }
    };
    reader.onerror = () => {
      setErrorMessage(t('parseHtmlFailed', language));
      setIsLoading(false);
    };
    reader.readAsText(file);
  };

  // Cascading toggle: selecting a parent folder selects all child folders/subdirectories;
  // deselecting a parent deselects all of them. Clicking a child toggles that child independently.
  const handleToggleFolder = (folderId: string) => {
    const targetNode = findNodeById(rootNodes, folderId);
    if (!targetNode) return;

    const subtreeFolderIds = getDescendantFolderIds(targetNode);
    const allSelected = subtreeFolderIds.every((id) => selectedFolderIds.includes(id));

    if (allSelected) {
      const toRemove = new Set(subtreeFolderIds);
      setSelectedFolderIds((prev) => prev.filter((id) => !toRemove.has(id)));
    } else {
      const toAdd = subtreeFolderIds.filter((id) => !selectedFolderIds.includes(id));
      setSelectedFolderIds((prev) => [...prev, ...toAdd]);
    }
  };

  const handleToggleExpandFolder = (folderId: string) => {
    setExpandedFolderIds((prev) => ({
      ...prev,
      [folderId]: prev[folderId] === false ? true : false,
    }));
  };

  // Select all or deselect all
  const handleSelectAllFolders = () => {
    setSelectedFolderIds(allFolderIds);
  };

  const handleDeselectAllFolders = () => {
    setSelectedFolderIds([]);
  };

  // Compute preview stats for Step 3
  const previewStats: BookmarkImportPreviewStats = useMemo(() => {
    if (rootNodes.length === 0) {
      return {
        totalUrls: 0,
        validUrls: 0,
        duplicateUrls: 0,
        ignoredFolders: 0,
        predictedCategories: [],
      };
    }
    const options: BookmarkImportOptions = {
      strategy,
      duplicateStrategy,
      selectedFolderIds,
      targetProfileId: appState.profileId,
    };
    return calculateImportPreview(rootNodes, options, appState.sites);
  }, [rootNodes, strategy, duplicateStrategy, selectedFolderIds, appState.sites, appState.profileId]);

  // Execute import
  const handleExecuteImport = async () => {
    setStep('executing');
    setIsLoading(true);

    const options: BookmarkImportOptions = {
      strategy,
      duplicateStrategy,
      selectedFolderIds,
      targetProfileId: appState.profileId,
    };

    const result = await executeBookmarkImport(rootNodes, options);
    setIsLoading(false);

    if (result.success) {
      setImportResult({
        sitesCount: result.importedSitesCount,
        catsCount: result.importedCategoriesCount,
        skippedCount: result.skippedDuplicatesCount,
      });
      setStep('result');
    } else {
      setErrorMessage(result.error || 'Failed to import bookmarks');
      setStep('preview');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/50 backdrop-blur-md animate-fade-in">
      {/* Click outside to close (disabled during executing) */}
      <div
        className="absolute inset-0"
        onClick={() => {
          if (step !== 'executing') onClose();
        }}
      />

      <div
        className={`relative z-10 w-full max-w-2xl max-h-[90vh] flex flex-col rounded-3xl border shadow-2xl overflow-hidden transition-all duration-200 ${
          isLight
            ? 'bg-white/90 border-black/10 text-slate-800 shadow-slate-900/15'
            : 'bg-[#18181b]/90 border-white/15 text-white shadow-black/50'
        }`}
        style={{ backdropFilter: 'blur(28px)' }}
      >
        {/* Header */}
        <div
          className={`flex items-center justify-between px-6 py-4 border-b shrink-0 ${
            isLight ? 'border-black/8 bg-black/[0.02]' : 'border-white/10 bg-white/[0.02]'
          }`}
        >
          <div className="flex items-center gap-3">
            <div
              className={`p-2 rounded-xl border ${
                isLight
                  ? 'bg-black/5 border-black/10 text-slate-800'
                  : 'bg-white/10 border-white/15 text-white'
              }`}
            >
              <Bookmark className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-semibold tracking-wide">
                {t('importBookmarks', language)}
              </h3>
              <p className={`text-[11px] ${isLight ? 'text-slate-500' : 'text-white/50'}`}>
                {t('importBookmarksDesc', language)}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Target Space Badge */}
            <div
              className={`px-2.5 py-1 rounded-full text-[10px] font-medium flex items-center gap-1.5 border ${
                isPrivateSpace
                  ? isLight
                    ? 'bg-amber-500/10 border-amber-500/20 text-amber-800'
                    : 'bg-amber-500/15 border-amber-500/30 text-amber-300'
                  : isLight
                  ? 'bg-black/5 border-black/10 text-slate-700'
                  : 'bg-white/10 border-white/15 text-white/80'
              }`}
            >
              {isPrivateSpace ? (
                <>
                  <Shield className="w-3 h-3 text-amber-500" />
                  <span>{t('importTargetPrivate', language)}</span>
                </>
              ) : (
                <>
                  <Globe className="w-3 h-3" />
                  <span>{t('importTargetNormal', language)}</span>
                </>
              )}
            </div>

            {/* Close Button */}
            {step !== 'executing' && (
              <button
                type="button"
                onClick={onClose}
                className={`p-1.5 rounded-xl border duration-0 cursor-pointer ${
                  isLight
                    ? 'hover:bg-black/5 border-black/10 text-slate-600'
                    : 'hover:bg-white/10 border-white/15 text-white/70'
                }`}
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Step Indicator Bar */}
        <div
          className={`flex items-center justify-between px-6 py-2.5 border-b text-xs font-medium ${
            isLight ? 'border-black/5 bg-black/[0.01]' : 'border-white/5 bg-white/[0.01]'
          }`}
        >
          <div className="flex items-center gap-2">
            <span
              className={`px-2 py-0.5 rounded-full text-[10px] ${
                step === 'source'
                  ? isLight
                    ? 'bg-slate-900 text-white font-semibold'
                    : 'bg-white text-slate-900 font-semibold'
                  : isLight
                  ? 'bg-black/5 text-slate-500'
                  : 'bg-white/10 text-white/50'
              }`}
            >
              1
            </span>
            <span className={step === 'source' ? 'font-semibold' : 'text-slate-400 dark:text-white/40'}>
              {t('importBookmarksSourceTitle', language)}
            </span>
          </div>

          <ChevronRight className="w-3.5 h-3.5 text-slate-300 dark:text-white/20" />

          <div className="flex items-center gap-2">
            <span
              className={`px-2 py-0.5 rounded-full text-[10px] ${
                step === 'select'
                  ? isLight
                    ? 'bg-slate-900 text-white font-semibold'
                    : 'bg-white text-slate-900 font-semibold'
                  : isLight
                  ? 'bg-black/5 text-slate-500'
                  : 'bg-white/10 text-white/50'
              }`}
            >
              2
            </span>
            <span className={step === 'select' ? 'font-semibold' : 'text-slate-400 dark:text-white/40'}>
              {t('selectFoldersTitle', language)}
            </span>
          </div>

          <ChevronRight className="w-3.5 h-3.5 text-slate-300 dark:text-white/20" />

          <div className="flex items-center gap-2">
            <span
              className={`px-2 py-0.5 rounded-full text-[10px] ${
                step === 'preview' || step === 'executing'
                  ? isLight
                    ? 'bg-slate-900 text-white font-semibold'
                    : 'bg-white text-slate-900 font-semibold'
                  : isLight
                  ? 'bg-black/5 text-slate-500'
                  : 'bg-white/10 text-white/50'
              }`}
            >
              3
            </span>
            <span
              className={
                step === 'preview' || step === 'executing'
                  ? 'font-semibold'
                  : 'text-slate-400 dark:text-white/40'
              }
            >
              {t('importPreviewTitle', language)}
            </span>
          </div>

          <ChevronRight className="w-3.5 h-3.5 text-slate-300 dark:text-white/20" />

          <div className="flex items-center gap-2">
            <span
              className={`px-2 py-0.5 rounded-full text-[10px] ${
                step === 'result'
                  ? 'bg-emerald-500 text-white font-semibold'
                  : isLight
                  ? 'bg-black/5 text-slate-500'
                  : 'bg-white/10 text-white/50'
              }`}
            >
              4
            </span>
            <span className={step === 'result' ? 'font-semibold' : 'text-slate-400 dark:text-white/40'}>
              {t('done', language)}
            </span>
          </div>
        </div>

        {/* Modal Body Container */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Error Message Banner */}
          {errorMessage && (
            <div
              className={`p-3 rounded-2xl border text-xs flex items-start gap-2.5 animate-fade-in ${
                isLight
                  ? 'bg-red-500/10 border-red-500/20 text-red-700'
                  : 'bg-red-500/15 border-red-500/30 text-red-300'
              }`}
            >
              <AlertTriangle className="w-4 h-4 shrink-0 text-red-500 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Private Space Security Notice */}
          {isPrivateSpace && (
            <div
              className={`p-3.5 rounded-2xl border text-xs flex items-start gap-2.5 leading-relaxed ${
                isLight
                  ? 'bg-amber-500/[0.08] border-amber-500/20 text-amber-900'
                  : 'bg-amber-500/10 border-amber-500/25 text-amber-200'
              }`}
            >
              <Shield className="w-4 h-4 shrink-0 text-amber-500 mt-0.5" />
              <span>{t('importPrivateWarning', language)}</span>
            </div>
          )}

          {/* ========================================================= */}
          {/* STEP 1: CHOOSE IMPORT SOURCE */}
          {/* ========================================================= */}
          {step === 'source' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Native Browser Bookmarks */}
                <button
                  type="button"
                  onClick={handleReadNativeBookmarks}
                  disabled={isLoading}
                  className={`p-5 rounded-2xl border text-left flex flex-col justify-between transition-all duration-200 group cursor-pointer active:scale-[0.98] ${
                    isLight
                      ? 'bg-black/[0.02] hover:bg-black/[0.05] border-black/10 hover:border-black/20'
                      : 'bg-white/[0.04] hover:bg-white/[0.08] border-white/10 hover:border-white/20'
                  }`}
                >
                  <div className="space-y-3">
                    <div
                      className={`w-10 h-10 rounded-xl flex items-center justify-center border transition-all ${
                        isLight
                          ? 'bg-black/5 border-black/10 group-hover:bg-black/10 text-slate-800'
                          : 'bg-white/10 border-white/15 group-hover:bg-white/20 text-white'
                      }`}
                    >
                      <Globe className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold">
                        {t('browserNativeBookmarks', language)}
                      </h4>
                      <p
                        className={`text-xs mt-1 leading-relaxed ${
                          isLight ? 'text-slate-500' : 'text-white/50'
                        }`}
                      >
                        {t('browserNativeBookmarksDesc', language)}
                      </p>
                    </div>
                  </div>

                  <div className="pt-4 mt-2 flex items-center text-xs font-semibold gap-1.5 text-blue-500 group-hover:translate-x-1 transition-transform">
                    <span>{t('nextStep', language)}</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </div>
                </button>

                {/* Upload HTML File */}
                <label
                  className={`p-5 rounded-2xl border text-left flex flex-col justify-between transition-all duration-200 group cursor-pointer active:scale-[0.98] ${
                    isLight
                      ? 'bg-black/[0.02] hover:bg-black/[0.05] border-black/10 hover:border-black/20'
                      : 'bg-white/[0.04] hover:bg-white/[0.08] border-white/10 hover:border-white/20'
                  }`}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".html,.htm"
                    onChange={handleFileUpload}
                    className="hidden"
                    disabled={isLoading}
                  />
                  <div className="space-y-3">
                    <div
                      className={`w-10 h-10 rounded-xl flex items-center justify-center border transition-all ${
                        isLight
                          ? 'bg-black/5 border-black/10 group-hover:bg-black/10 text-slate-800'
                          : 'bg-white/10 border-white/15 group-hover:bg-white/20 text-white'
                      }`}
                    >
                      <Upload className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold">{t('uploadHtmlFile', language)}</h4>
                      <p
                        className={`text-xs mt-1 leading-relaxed ${
                          isLight ? 'text-slate-500' : 'text-white/50'
                        }`}
                      >
                        {t('uploadHtmlFileDesc', language)}
                      </p>
                    </div>
                  </div>

                  <div className="pt-4 mt-2 flex items-center text-xs font-semibold gap-1.5 text-blue-500 group-hover:translate-x-1 transition-transform">
                    <span>{t('nextStep', language)}</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </div>
                </label>
              </div>

              {isLoading && (
                <div className="flex items-center justify-center gap-2.5 py-8 text-xs font-medium text-slate-500">
                  <Loader2 className="w-4 h-4 animate-spin text-blue-500" />
                  <span>{t('readingBookmarks', language)}</span>
                </div>
              )}
            </div>
          )}

          {/* ========================================================= */}
          {/* STEP 2: SELECT FOLDERS & STRATEGY */}
          {/* ========================================================= */}
          {step === 'select' && (
            <div className="space-y-6">
              {/* Folder Selection Tree Container */}
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold">
                    {t('selectFoldersTitle', language)}
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={handleSelectAllFolders}
                      className={`text-[11px] px-2 py-0.5 rounded-lg border font-medium duration-0 cursor-pointer ${
                        isLight
                          ? 'bg-black/5 hover:bg-black/10 border-black/10 text-slate-700'
                          : 'bg-white/10 hover:bg-white/15 border-white/15 text-white/80'
                      }`}
                    >
                      {t('selectAll', language)}
                    </button>
                    <button
                      type="button"
                      onClick={handleDeselectAllFolders}
                      className={`text-[11px] px-2 py-0.5 rounded-lg border font-medium duration-0 cursor-pointer ${
                        isLight
                          ? 'bg-black/5 hover:bg-black/10 border-black/10 text-slate-700'
                          : 'bg-white/10 hover:bg-white/15 border-white/15 text-white/80'
                      }`}
                    >
                      {t('deselectAll', language)}
                    </button>
                  </div>
                </div>

                {/* Folder Tree Scrollbox */}
                <div
                  className={`max-h-56 overflow-y-auto p-3 rounded-2xl border divide-y ${
                    isLight
                      ? 'bg-black/[0.02] border-black/10 divide-black/5'
                      : 'bg-white/[0.03] border-white/10 divide-white/5'
                  }`}
                >
                  <FolderTreeNodeRenderer
                    nodes={rootNodes}
                    selectedIds={selectedFolderIds}
                    onToggle={handleToggleFolder}
                    expandedMap={expandedFolderIds}
                    onToggleExpand={handleToggleExpandFolder}
                    isLight={isLight}
                  />
                </div>
              </div>

              {/* Strategy Selector */}
              <div className="space-y-2.5">
                <span className="text-xs font-semibold">{t('strategyTitle', language)}</span>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {/* Smart Organize */}
                  <button
                    type="button"
                    onClick={() => setStrategy('smart')}
                    className={`p-3.5 rounded-2xl border text-left transition-all duration-0 cursor-pointer ${
                      strategy === 'smart'
                        ? isLight
                          ? 'bg-blue-500/10 border-blue-500/30 text-blue-900 shadow-xs'
                          : 'bg-blue-500/20 border-blue-500/40 text-blue-200 shadow-xs'
                        : isLight
                        ? 'bg-black/[0.02] border-black/8 text-slate-700 hover:bg-black/[0.05]'
                        : 'bg-white/[0.03] border-white/10 text-white/70 hover:bg-white/[0.06]'
                    }`}
                  >
                    <div className="flex items-center gap-2 font-semibold text-xs">
                      <Sparkles className="w-3.5 h-3.5 text-blue-500" />
                      <span>{t('strategySmart', language)}</span>
                    </div>
                    <p
                      className={`text-[11px] mt-1.5 leading-relaxed ${
                        strategy === 'smart'
                          ? isLight
                            ? 'text-blue-800/80'
                            : 'text-blue-300/80'
                          : isLight
                          ? 'text-slate-500'
                          : 'text-white/50'
                      }`}
                    >
                      {t('strategySmartDesc', language)}
                    </p>
                  </button>

                  {/* Top-Level */}
                  <button
                    type="button"
                    onClick={() => setStrategy('top_level')}
                    className={`p-3.5 rounded-2xl border text-left transition-all duration-0 cursor-pointer ${
                      strategy === 'top_level'
                        ? isLight
                          ? 'bg-blue-500/10 border-blue-500/30 text-blue-900 shadow-xs'
                          : 'bg-blue-500/20 border-blue-500/40 text-blue-200 shadow-xs'
                        : isLight
                        ? 'bg-black/[0.02] border-black/8 text-slate-700 hover:bg-black/[0.05]'
                        : 'bg-white/[0.03] border-white/10 text-white/70 hover:bg-white/[0.06]'
                    }`}
                  >
                    <div className="flex items-center gap-2 font-semibold text-xs">
                      <Layers className="w-3.5 h-3.5 text-blue-500" />
                      <span>{t('strategyTopLevel', language)}</span>
                    </div>
                    <p
                      className={`text-[11px] mt-1.5 leading-relaxed ${
                        strategy === 'top_level'
                          ? isLight
                            ? 'text-blue-800/80'
                            : 'text-blue-300/80'
                          : isLight
                          ? 'text-slate-500'
                          : 'text-white/50'
                      }`}
                    >
                      {t('strategyTopLevelDesc', language)}
                    </p>
                  </button>

                  {/* Deepest Leaf */}
                  <button
                    type="button"
                    onClick={() => setStrategy('deepest_leaf')}
                    className={`p-3.5 rounded-2xl border text-left transition-all duration-0 cursor-pointer ${
                      strategy === 'deepest_leaf'
                        ? isLight
                          ? 'bg-blue-500/10 border-blue-500/30 text-blue-900 shadow-xs'
                          : 'bg-blue-500/20 border-blue-500/40 text-blue-200 shadow-xs'
                        : isLight
                        ? 'bg-black/[0.02] border-black/8 text-slate-700 hover:bg-black/[0.05]'
                        : 'bg-white/[0.03] border-white/10 text-white/70 hover:bg-white/[0.06]'
                    }`}
                  >
                    <div className="flex items-center gap-2 font-semibold text-xs">
                      <ListTree className="w-3.5 h-3.5 text-blue-500" />
                      <span>{t('strategyDeepestLeaf', language)}</span>
                    </div>
                    <p
                      className={`text-[11px] mt-1.5 leading-relaxed ${
                        strategy === 'deepest_leaf'
                          ? isLight
                            ? 'text-blue-800/80'
                            : 'text-blue-300/80'
                          : isLight
                          ? 'text-slate-500'
                          : 'text-white/50'
                      }`}
                    >
                      {t('strategyDeepestLeafDesc', language)}
                    </p>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================= */}
          {/* STEP 3: PREVIEW & CONFLICT RESOLUTION */}
          {/* ========================================================= */}
          {step === 'preview' && (
            <div className="space-y-6">
              {/* Stat Metric Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div
                  className={`p-3 rounded-2xl border ${
                    isLight ? 'bg-black/[0.02] border-black/8' : 'bg-white/[0.03] border-white/10'
                  }`}
                >
                  <span className="text-[11px] font-medium text-slate-400 dark:text-white/40 block">
                    {t('totalBookmarksFound', language)}
                  </span>
                  <span className="text-lg font-bold mt-1 block">
                    {previewStats.totalUrls}
                  </span>
                </div>

                <div
                  className={`p-3 rounded-2xl border ${
                    isLight ? 'bg-black/[0.02] border-black/8' : 'bg-white/[0.03] border-white/10'
                  }`}
                >
                  <span className="text-[11px] font-medium text-slate-400 dark:text-white/40 block">
                    {t('validBookmarksCount', language)}
                  </span>
                  <span className="text-lg font-bold mt-1 block text-emerald-500">
                    {previewStats.validUrls}
                  </span>
                </div>

                <div
                  className={`p-3 rounded-2xl border ${
                    isLight ? 'bg-black/[0.02] border-black/8' : 'bg-white/[0.03] border-white/10'
                  }`}
                >
                  <span className="text-[11px] font-medium text-slate-400 dark:text-white/40 block">
                    {t('duplicateBookmarksCount', language)}
                  </span>
                  <span className="text-lg font-bold mt-1 block text-amber-500">
                    {previewStats.duplicateUrls}
                  </span>
                </div>

                <div
                  className={`p-3 rounded-2xl border ${
                    isLight ? 'bg-black/[0.02] border-black/8' : 'bg-white/[0.03] border-white/10'
                  }`}
                >
                  <span className="text-[11px] font-medium text-slate-400 dark:text-white/40 block">
                    {t('predictedCategoriesCount', language)}
                  </span>
                  <span className="text-lg font-bold mt-1 block text-blue-500">
                    {previewStats.predictedCategories.length}
                  </span>
                </div>
              </div>

              {/* Duplicate Strategy Option */}
              {previewStats.duplicateUrls > 0 && (
                <div
                  className={`p-4 rounded-2xl border space-y-3 ${
                    isLight
                      ? 'bg-amber-500/[0.06] border-amber-500/20'
                      : 'bg-amber-500/[0.08] border-amber-500/25'
                  }`}
                >
                  <span className="text-xs font-semibold block">
                    {t('duplicateStrategyTitle', language)}
                  </span>
                  <div className="space-y-2">
                    <label className="flex items-center gap-2 text-xs cursor-pointer">
                      <input
                        type="radio"
                        name="dupStrategy"
                        value="skip"
                        checked={duplicateStrategy === 'skip'}
                        onChange={() => setDuplicateStrategy('skip')}
                        className="accent-blue-500"
                      />
                      <span>{t('duplicateStrategySkip', language)}</span>
                    </label>
                    <label className="flex items-center gap-2 text-xs cursor-pointer">
                      <input
                        type="radio"
                        name="dupStrategy"
                        value="overwrite"
                        checked={duplicateStrategy === 'overwrite'}
                        onChange={() => setDuplicateStrategy('overwrite')}
                        className="accent-blue-500"
                      />
                      <span>{t('duplicateStrategyOverwrite', language)}</span>
                    </label>
                    <label className="flex items-center gap-2 text-xs cursor-pointer">
                      <input
                        type="radio"
                        name="dupStrategy"
                        value="keep_both"
                        checked={duplicateStrategy === 'keep_both'}
                        onChange={() => setDuplicateStrategy('keep_both')}
                        className="accent-blue-500"
                      />
                      <span>{t('duplicateStrategyKeepBoth', language)}</span>
                    </label>
                  </div>
                </div>
              )}

              {/* Predicted Categories Preview List */}
              <div className="space-y-2">
                <span className="text-xs font-semibold block">
                  {t('predictedCategoriesCount', language)} ({previewStats.predictedCategories.length})
                </span>
                <div
                  className={`max-h-48 overflow-y-auto p-3 rounded-2xl border divide-y text-xs ${
                    isLight
                      ? 'bg-black/[0.02] border-black/10 divide-black/5'
                      : 'bg-white/[0.03] border-white/10 divide-white/5'
                  }`}
                >
                  {previewStats.predictedCategories.length === 0 ? (
                    <div className="py-6 text-center text-slate-400">
                      {t('noBookmarksFound', language)}
                    </div>
                  ) : (
                    previewStats.predictedCategories.map((cat, idx) => (
                      <div key={idx} className="py-2.5 first:pt-0 last:pb-0 space-y-1">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2 font-medium">
                            <Folder className="w-3.5 h-3.5 text-blue-500" />
                            <span>{cat.name}</span>
                          </div>
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                              isLight
                                ? 'bg-black/5 text-slate-600'
                                : 'bg-white/10 text-white/70'
                            }`}
                          >
                            {cat.siteCount}
                          </span>
                        </div>
                        {/* Sample sites badges */}
                        <div className="flex flex-wrap gap-1.5 pt-0.5">
                          {cat.sampleSites.map((site, sIdx) => (
                            <span
                              key={sIdx}
                              className={`text-[10px] px-2 py-0.5 rounded-md truncate max-w-[160px] ${
                                isLight
                                  ? 'bg-black/[0.04] text-slate-600'
                                  : 'bg-white/[0.06] text-white/60'
                              }`}
                              title={site.title}
                            >
                              {site.title}
                            </span>
                          ))}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          )}

          {/* ========================================================= */}
          {/* STEP 4: EXECUTING SPINNER */}
          {/* ========================================================= */}
          {step === 'executing' && (
            <div className="py-12 flex flex-col items-center justify-center space-y-4">
              <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
              <p className="text-xs font-medium text-slate-600 dark:text-white/70">
                {t('importExecuting', language)}
              </p>
            </div>
          )}

          {/* ========================================================= */}
          {/* STEP 5: SUCCESS RESULT */}
          {/* ========================================================= */}
          {step === 'result' && importResult && (
            <div className="py-6 flex flex-col items-center text-center space-y-4 animate-fade-in">
              <div className="w-12 h-12 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-500">
                <CheckCircle2 className="w-6 h-6" />
              </div>

              <div className="space-y-1">
                <h4 className="text-base font-semibold">
                  {t('importSuccessTitle', language)}
                </h4>
                <p className={`text-xs ${isLight ? 'text-slate-600' : 'text-white/60'}`}>
                  {t('importSuccessDesc', language)
                    .replace('{sites}', String(importResult.sitesCount))
                    .replace('{cats}', String(importResult.catsCount))}
                </p>
                {importResult.skippedCount > 0 && (
                  <p className="text-[11px] text-amber-500">
                    ({importResult.skippedCount} duplicate links skipped)
                  </p>
                )}
              </div>

              {/* Tip for Board view or Grid navbar if multiple categories created */}
              {importResult.catsCount > (appState.settings.maxNavCategories || 6) && (
                <div
                  className={`p-3.5 rounded-2xl border text-xs leading-relaxed max-w-md ${
                    isLight
                      ? 'bg-blue-500/5 border-blue-500/20 text-blue-900'
                      : 'bg-blue-500/10 border-blue-500/30 text-blue-200'
                  }`}
                >
                  <span>{t('importBoardTip', language)}</span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Modal Footer Controls */}
        <div
          className={`flex items-center justify-between px-6 py-4 border-t shrink-0 ${
            isLight ? 'border-black/8 bg-black/[0.02]' : 'border-white/10 bg-white/[0.02]'
          }`}
        >
          {step === 'source' && <div />}

          {step === 'select' && (
            <>
              <button
                type="button"
                onClick={() => setStep('source')}
                className="glass-btn-secondary flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-medium cursor-pointer duration-0"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>{t('prevStep', language)}</span>
              </button>
              <button
                type="button"
                onClick={() => setStep('preview')}
                disabled={selectedFolderIds.length === 0}
                className="glass-btn-primary flex items-center gap-1.5 px-5 py-2 rounded-xl text-xs font-medium cursor-pointer duration-0 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span>{t('nextStep', language)}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </>
          )}

          {step === 'preview' && (
            <>
              <button
                type="button"
                onClick={() => setStep('select')}
                className="glass-btn-secondary flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-medium cursor-pointer duration-0"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>{t('prevStep', language)}</span>
              </button>
              <button
                type="button"
                onClick={handleExecuteImport}
                disabled={previewStats.validUrls === 0}
                className="glass-btn-primary flex items-center gap-1.5 px-5 py-2 rounded-xl text-xs font-medium cursor-pointer duration-0 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>{t('startImport', language)}</span>
              </button>
            </>
          )}

          {step === 'result' && (
            <div className="w-full flex justify-end">
              <button
                type="button"
                onClick={() => {
                  onImportSuccess();
                  onClose();
                }}
                className="glass-btn-primary flex items-center gap-1.5 px-6 py-2 rounded-xl text-xs font-medium cursor-pointer duration-0"
              >
                <Check className="w-4 h-4" />
                <span>{t('done', language)}</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// ---------------------------------------------------------------------------
// Folder Tree Recursive Node Component
// ---------------------------------------------------------------------------
interface FolderTreeNodeRendererProps {
  nodes: RawBookmarkNode[];
  selectedIds: string[];
  onToggle: (id: string) => void;
  expandedMap: Record<string, boolean>;
  onToggleExpand: (id: string) => void;
  isLight: boolean;
  depth?: number;
}

const FolderTreeNodeItem: React.FC<{
  node: RawBookmarkNode;
  selectedIds: string[];
  onToggle: (id: string) => void;
  expandedMap: Record<string, boolean>;
  onToggleExpand: (id: string) => void;
  isLight: boolean;
  depth: number;
}> = ({ node, selectedIds, onToggle, expandedMap, onToggleExpand, isLight, depth }) => {
  const checkboxRef = useRef<HTMLInputElement>(null);

  const subtreeFolderIds = useMemo(() => getDescendantFolderIds(node), [node]);
  const selectedCount = useMemo(
    () => subtreeFolderIds.filter((id) => selectedIds.includes(id)).length,
    [subtreeFolderIds, selectedIds]
  );

  const isAllSelected = selectedCount === subtreeFolderIds.length && subtreeFolderIds.length > 0;
  const isIndeterminate = selectedCount > 0 && selectedCount < subtreeFolderIds.length;

  useEffect(() => {
    if (checkboxRef.current) {
      checkboxRef.current.indeterminate = isIndeterminate;
    }
  }, [isIndeterminate]);

  const childFolders = (node.children || []).filter((c) => Boolean(c.children));
  const childBookmarksCount = (node.children || []).filter((c) => Boolean(c.url)).length;
  const hasChildFolders = childFolders.length > 0;
  const isExpanded = expandedMap[node.id] !== false; // Default expanded

  return (
    <div className="py-0.5">
      <div
        className="flex items-center justify-between group cursor-pointer hover:bg-black/[0.03] dark:hover:bg-white/[0.05] rounded-xl px-2 py-1.5 transition-colors"
        style={{ paddingLeft: `${depth * 18 + 6}px` }}
        onClick={() => onToggle(node.id)}
      >
        <div className="flex items-center gap-2 min-w-0">
          {hasChildFolders ? (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onToggleExpand(node.id);
              }}
              className="p-0.5 -ml-1 rounded hover:bg-black/10 dark:hover:bg-white/10 cursor-pointer text-slate-400 hover:text-slate-700 dark:text-white/40 dark:hover:text-white transition-colors"
              title={isExpanded ? 'Collapse' : 'Expand'}
            >
              <ChevronRight
                className={`w-3.5 h-3.5 transition-transform duration-150 ${isExpanded ? 'rotate-90' : ''}`}
              />
            </button>
          ) : (
            <div className="w-3.5 shrink-0" />
          )}

          <input
            ref={checkboxRef}
            type="checkbox"
            checked={isAllSelected}
            onChange={() => onToggle(node.id)}
            onClick={(e) => e.stopPropagation()}
            className="rounded accent-blue-500 cursor-pointer w-3.5 h-3.5 shrink-0"
          />
          <Folder className="w-3.5 h-3.5 text-blue-500 shrink-0" />
          <span className="text-xs font-medium truncate max-w-[260px]" title={node.title || 'Folder'}>
            {node.title || 'Folder'}
          </span>
        </div>

        {childBookmarksCount > 0 && (
          <span
            className={`text-[10px] px-2 py-0.5 rounded-full font-medium shrink-0 ml-2 ${
              isLight
                ? 'bg-black/5 text-slate-500'
                : 'bg-white/10 text-white/50'
            }`}
          >
            {childBookmarksCount}
          </span>
        )}
      </div>

      {/* Recursively render child folders when expanded */}
      {hasChildFolders && isExpanded && (
        <FolderTreeNodeRenderer
          nodes={childFolders}
          selectedIds={selectedIds}
          onToggle={onToggle}
          expandedMap={expandedMap}
          onToggleExpand={onToggleExpand}
          isLight={isLight}
          depth={depth + 1}
        />
      )}
    </div>
  );
};

const FolderTreeNodeRenderer: React.FC<FolderTreeNodeRendererProps> = ({
  nodes,
  selectedIds,
  onToggle,
  expandedMap,
  onToggleExpand,
  isLight,
  depth = 0,
}) => {
  return (
    <>
      {nodes.map((node) => {
        if (!node.children) return null; // Only render folders
        return (
          <FolderTreeNodeItem
            key={node.id}
            node={node}
            selectedIds={selectedIds}
            onToggle={onToggle}
            expandedMap={expandedMap}
            onToggleExpand={onToggleExpand}
            isLight={isLight}
            depth={depth}
          />
        );
      })}
    </>
  );
};
