
'use client';

import React from 'react';
import Editor, { OnChange, BeforeMount } from '@monaco-editor/react';
import { useTheme } from 'next-themes';
import { Loader2 } from 'lucide-react';

interface CodeEditorProps {
  value: string;
  onChange: (value: string | undefined) => void;
  language: string;
}

const CodeEditor: React.FC<CodeEditorProps> = ({ value, onChange, language }) => {
  const { theme } = useTheme();

  const handleEditorWillMount: BeforeMount = (monaco) => {
    // Define a custom dark theme for Monaco
    monaco.editor.defineTheme('talxify-dark', {
      base: 'vs-dark',
      inherit: true,
      rules: [],
      colors: {
        'editor.background': '#000000', // Pure black background
      },
    });
  };

  return (
    <div className="rounded-md border border-input overflow-hidden h-[400px]">
      <Editor
        height="100%"
        language={language.toLowerCase()}
        value={value}
        onChange={onChange}
        beforeMount={handleEditorWillMount}
        theme={theme === 'dark' ? 'talxify-dark' : 'light'}
        loading={<div className="flex justify-center items-center h-full"><Loader2 className="animate-spin h-8 w-8 text-primary" /></div>}
        options={{
          minimap: { enabled: false },
          fontSize: 14,
          fontFamily: 'Menlo, Monaco, "Courier New", monospace',
          scrollBeyondLastLine: false,
          padding: {
            top: 16,
            bottom: 16,
          },
          automaticLayout: true,
        }}
      />
    </div>
  );
};

export default CodeEditor;
