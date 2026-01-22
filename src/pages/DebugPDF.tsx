import React, { useState } from 'react';
import { Button } from '@/components/ui/button';

export default function DebugPDF() {
    const [file, setFile] = useState<File | null>(null);
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<any>(null);
    const [error, setError] = useState<string | null>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setFile(e.target.files[0]);
        }
    };

    const handleUpload = async () => {
        if (!file) {
            setError("Please select a file first");
            return;
        }

        setLoading(true);
        setError(null);
        setResult(null);

        try {
            const formData = new FormData();
            formData.append('file', file);

            const token = localStorage.getItem('token');
            const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:8000'}/api/v1/debug/debug-parsing`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`
                },
                body: formData
            });

            const data = await response.json();
            setResult(data);
        } catch (err: any) {
            setError(err.message || "Upload failed");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-8 max-w-7xl mx-auto bg-gray-50 min-h-screen text-slate-900">
            <h1 className="text-2xl font-bold mb-6 text-slate-900">PDF Parser Debugger</h1>

            <div className="bg-white p-6 rounded-lg border border-slate-200 mb-8 shadow-sm">
                <label className="block mb-4">
                    <span className="block text-sm font-medium mb-2 text-slate-700">Upload PDF</span>
                    <input
                        type="file"
                        accept=".pdf"
                        onChange={handleFileChange}
                        className="block w-full text-sm text-slate-500
              file:mr-4 file:py-2 file:px-4
              file:rounded-full file:border-0
              file:text-sm file:font-semibold
              file:bg-violet-50 file:text-violet-700
              hover:file:bg-violet-100"
                    />
                </label>

                <Button
                    onClick={handleUpload}
                    disabled={!file || loading}
                >
                    {loading ? "Parsing..." : "Test Parse"}
                </Button>

                {error && <p className="text-red-500 mt-4">{error}</p>}
            </div>

            {result && (
                <div className="grid grid-cols-2 gap-6 h-[800px]">
                    <div className="flex flex-col">
                        <h2 className="text-lg font-semibold mb-2 text-slate-900">Raw Extracted Text (Python)</h2>
                        <div className="flex-1 overflow-auto bg-white p-4 rounded border border-slate-300 font-mono text-xs whitespace-pre-wrap text-slate-800 shadow-inner">
                            {result.raw_text_preview}
                        </div>
                        <p className="text-sm text-slate-500 mt-2">Length: {result.raw_text_stream_length} chars</p>
                    </div>

                    <div className="flex flex-col">
                        <h2 className="text-lg font-semibold mb-2 text-slate-900">LLM Parsed JSON (GPT-4o)</h2>
                        <div className="flex-1 overflow-auto bg-white p-4 rounded border border-slate-300 font-mono text-xs text-slate-800 shadow-inner">
                            <pre>{JSON.stringify(result.llm_parsed_json, null, 2)}</pre>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
