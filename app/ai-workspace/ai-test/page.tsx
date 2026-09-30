"use client";

import { useState } from "react";
import { generateLocalAI } from "../../utils/local-ai";
export default function AITestPage() {
  const [output, setOutput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleTest() {
    setLoading(true);
    setError("");
    setOutput("");

    try {
      const result = await generateLocalAI(
        "Write a short professional introduction for a freelance designer."
      );

      setOutput(result);
    } catch (err) {
      console.error(err);
      setError(
        err instanceof Error ? err.message : "The local AI test failed."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#F8F9FA] px-6 py-8 md:px-9">
      <div>
        <div className="mb-8">
          <p className="text-sm font-medium text-[#2563EB]">Kyrenox AI</p>

          <h1 className="mt-2 text-2xl font-semibold tracking-tight text-[#111111]">
            Local AI Test
          </h1>

          <p className="mt-2 max-w-2xl text-sm leading-6 text-[#6B7280]">
            This page tests whether Kyrenox AI can run directly in the
            browser.
          </p>
        </div>

        <section className="rounded-lg border border-[#E5E7EB] bg-white p-5 shadow-sm">
          <button
            type="button"
            onClick={handleTest}
            disabled={loading}
            className="rounded-md bg-[#111111] px-4 py-2.5 text-sm font-medium text-white transition hover:bg-[#222222] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? "Loading AI..." : "Test Kyrenox AI"}
          </button>

          {loading && (
            <p className="mt-4 text-sm text-[#6B7280]">
              The AI model may take a moment to download the first time.
            </p>
          )}

          {error && (
            <div className="mt-4 rounded-md border border-[#FECACA] bg-[#FEF2F2] p-4 text-sm text-[#B91C1C]">
              {error}
            </div>
          )}

          {output && (
            <div className="mt-6 rounded-md border border-[#E5E7EB] bg-[#F8F9FA] p-4">
              <p className="mb-2 text-sm font-medium text-[#111111]">
                Kyrenox AI response
              </p>

              <p className="whitespace-pre-wrap text-sm leading-6 text-[#374151]">
                {output}
              </p>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}