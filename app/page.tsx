"use client";

import { useState, useEffect, useCallback } from "react";
import dynamic from "next/dynamic";
import {
  getSurveys,
  getSurveyById,
  createSurvey,
  deleteSurveyById,
  updateSurveyById,
} from "@/lib/api";

const FormBuilderComponent = dynamic(() => import("@/components/FormBuilder"), {
  ssr: false,
});

export default function Home() {
  const [surveyJson, setSurveyJson] = useState<any>(null);
  const [surveys, setSurveys] = useState<any[]>([]);
  const [selectedSurveyId, setSelectedSurveyId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // ================= FETCH =================
  const fetchSurveys = useCallback(async () => {
    try {
      setLoading(true);
      const data = await getSurveys();
      setSurveys(data);
    } catch (err) {
      console.error(err);
      alert("❌ Cannot connect to backend");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSurveys();
  }, [fetchSurveys]);

  // ================= SAVE =================
  // const saveSurvey = async () => {
  //   if (!surveyJson) return alert("No survey");

  //   try {
  //     const res = await createSurvey(surveyJson);

  //     setSelectedSurveyId(res.id);

  //     alert("✅ Saved!");

  //     fetchSurveys();
  //   } catch (err) {
  //     console.error(err);
  //     alert("❌ Save failed");
  //   }
  // };

  const saveSurvey = async () => {
    if (!surveyJson) return alert("No survey");

    try {
      if (selectedSurveyId) {
        // ✅ UPDATE
        await updateSurveyById(selectedSurveyId, surveyJson);
        alert("✅ Updated!");
      } else {
        // ✅ CREATE
        const res = await createSurvey(surveyJson);
        setSelectedSurveyId(res.id);
        alert("✅ Created!");
      }

      fetchSurveys();
    } catch (err) {
      console.error(err);
      alert("❌ Save failed");
    }
  };

  // ================= LOAD =================
  const loadSurvey = async (id: string) => {
    try {
      const json = await getSurveyById(id);

      setSurveyJson(json);
      setSelectedSurveyId(id);
    } catch (err) {
      console.error(err);
      alert("❌ Load failed");
    }
  };

  // ================= DELETE =================
  const handleDelete = async (id: string) => {
    if (!confirm("Delete this survey?")) return;

    try {
      await deleteSurveyById(id);

      if (selectedSurveyId === id) {
        setSurveyJson(null);
        setSelectedSurveyId(null);
      }

      fetchSurveys();
    } catch (err) {
      console.error(err);
      alert("❌ Delete failed");
    }
  };

  // ================= CHANGE =================
  const handleSurveyChange = (json: any) => {
    setSurveyJson(json);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* ================= HEADER ================= */}
      <header className="bg-white border-b shadow px-6 h-16 flex justify-between items-center">
        <h1 className="text-xl font-bold">Survey Admin</h1>

        <div className="flex gap-3">
          {selectedSurveyId && (
            <>
              <button
                onClick={() =>
                  window.open(`/survey/${selectedSurveyId}`, "_blank")
                }
                className="px-3 py-2 bg-green-600 text-white rounded"
              >
                Preview
              </button>

              <button
                onClick={() =>
                  window.open(`/survey/${selectedSurveyId}/results`, "_blank")
                }
                className="px-3 py-2 bg-purple-600 text-white rounded"
              >
                Results
              </button>
            </>
          )}

          <button
            onClick={saveSurvey}
            className="px-4 py-2 bg-blue-600 text-white rounded"
          >
            Save
          </button>
        </div>
      </header>

      {/* ================= BODY ================= */}
      <div className="flex flex-1 overflow-hidden">
        {/* ===== SIDEBAR ===== */}
        <aside className="w-80 bg-white border-r p-4 overflow-y-auto">
          <h2 className="font-semibold mb-4">Surveys</h2>

          {loading ? (
            <p>Loading...</p>
          ) : surveys.length === 0 ? (
            <p className="text-gray-500">No surveys</p>
          ) : (
            <div className="space-y-2">
              {surveys.map((s) => (
                <div
                  key={s.id}
                  className={`border p-3 rounded ${
                    selectedSurveyId === s.id
                      ? "bg-blue-50 border-blue-400"
                      : "hover:bg-gray-50"
                  }`}
                >
                  <p className="text-xs break-all">{s.id}</p>

                  <div className="flex gap-2 mt-2">
                    <button
                      onClick={() => loadSurvey(s.id)}
                      className="text-blue-600 text-sm"
                    >
                      Load
                    </button>

                    <button
                      onClick={() => handleDelete(s.id)}
                      className="text-red-600 text-sm"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </aside>

        {/* ===== MAIN ===== */}
        <main className="flex-1">
          <FormBuilderComponent
            json={surveyJson}
            onSaveSurvey={handleSurveyChange}
          />
        </main>
      </div>
    </div>
  );
}
