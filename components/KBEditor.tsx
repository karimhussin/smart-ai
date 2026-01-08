import React, { useState } from 'react';
import { KnowledgeBase, KBSection } from '../types';

interface KBEditorProps {
  kb: KnowledgeBase;
  onUpdate: (kb: KnowledgeBase) => void;
  onSave: () => void;
}

const KBEditor: React.FC<KBEditorProps> = ({ kb, onUpdate, onSave }) => {
  const [activeSection, setActiveSection] = useState<string>(kb.sections[0]?.id || '0');
  const [isSaving, setIsSaving] = useState(false);

  const updateSection = (id: string, field: keyof KBSection, value: string) => {
    const updatedSections = kb.sections.map(section =>
      section.id === id ? { ...section, [field]: value } : section
    );
    onUpdate({ ...kb, sections: updatedSections });
  };

  const addSection = () => {
    const newId = String(kb.sections.length);
    const newSection: KBSection = {
      id: newId,
      title: 'قسم جديد',
      content: 'أضف محتوى القسم هنا...'
    };
    onUpdate({ ...kb, sections: [...kb.sections, newSection] });
    setActiveSection(newId);
  };

  const deleteSection = (id: string) => {
    if (kb.sections.length <= 1) {
      alert('لا يمكن حذف آخر قسم');
      return;
    }
    const updatedSections = kb.sections.filter(s => s.id !== id);
    onUpdate({ ...kb, sections: updatedSections });
    if (activeSection === id) {
      setActiveSection(updatedSections[0]?.id || '0');
    }
  };

  const handleSave = () => {
    setIsSaving(true);
    setTimeout(() => {
      onSave();
      setIsSaving(false);
    }, 500);
  };

  const currentSection = kb.sections.find(s => s.id === activeSection);

  return (
    <div className="w-full max-w-6xl">
      <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-6">
          <h2 className="text-2xl font-black text-white mb-2">محرر قاعدة البيانات</h2>
          <p className="text-indigo-100 text-sm">قم بتحرير معلومات الشركة والأقسام</p>
        </div>

        {/* Company Info */}
        <div className="p-6 border-b border-gray-100 bg-gray-50">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2 text-right">
                اسم الشركة
              </label>
              <input
                type="text"
                value={kb.companyName}
                onChange={(e) => onUpdate({ ...kb, companyName: e.target.value })}
                className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all outline-none text-right"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2 text-right">
                اسم التطبيق
              </label>
              <input
                type="text"
                value={kb.appName}
                onChange={(e) => onUpdate({ ...kb, appName: e.target.value })}
                className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all outline-none text-right"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2 text-right">
                اسم الصوت
              </label>
              <select
                value={kb.voiceName}
                onChange={(e) => onUpdate({ ...kb, voiceName: e.target.value })}
                className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all outline-none text-right"
              >
                <option value="Puck">Puck (ذكر)</option>
                <option value="Kore">Kore (أنثى)</option>
                <option value="Zephyr">Zephyr (أنثى)</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2 text-right">
                اللهجة
              </label>
              <input
                type="text"
                value={kb.dialect}
                onChange={(e) => onUpdate({ ...kb, dialect: e.target.value })}
                className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all outline-none text-right"
              />
            </div>
          </div>
        </div>

        {/* Sections Editor */}
        <div className="flex flex-col md:flex-row min-h-[500px]">
          {/* Sections List */}
          <div className="w-full md:w-1/3 border-b md:border-b-0 md:border-r border-gray-200 bg-gray-50 p-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-black text-gray-900">الأقسام</h3>
              <button
                onClick={addSection}
                className="px-3 py-1.5 bg-indigo-600 text-white rounded-lg text-sm font-bold hover:bg-indigo-700 transition-all"
              >
                + إضافة
              </button>
            </div>
            <div className="space-y-2">
              {kb.sections.map((section) => (
                <div
                  key={section.id}
                  className={`p-3 rounded-lg cursor-pointer transition-all ${
                    activeSection === section.id
                      ? 'bg-indigo-600 text-white shadow-lg'
                      : 'bg-white hover:bg-gray-100 text-gray-700'
                  }`}
                  onClick={() => setActiveSection(section.id)}
                >
                  <div className="flex justify-between items-start">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteSection(section.id);
                      }}
                      className={`text-xs ${
                        activeSection === section.id ? 'text-indigo-200 hover:text-white' : 'text-red-500 hover:text-red-700'
                      }`}
                    >
                      حذف
                    </button>
                    <span className="font-bold text-sm text-right flex-1">{section.title}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Section Editor */}
          <div className="flex-1 p-6">
            {currentSection && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2 text-right">
                    عنوان القسم
                  </label>
                  <input
                    type="text"
                    value={currentSection.title}
                    onChange={(e) => updateSection(currentSection.id, 'title', e.target.value)}
                    className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all outline-none text-right font-bold"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2 text-right">
                    محتوى القسم
                  </label>
                  <textarea
                    value={currentSection.content}
                    onChange={(e) => updateSection(currentSection.id, 'content', e.target.value)}
                    rows={15}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all outline-none text-right resize-none font-sans"
                    dir="rtl"
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-6 bg-gray-50 border-t border-gray-200 flex justify-end gap-3">
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="px-8 py-3 bg-green-600 text-white rounded-xl font-black hover:bg-green-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
          >
            {isSaving ? 'جاري الحفظ...' : '💾 حفظ التغييرات'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default KBEditor;
