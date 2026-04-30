"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Model } from "survey-core";
import { Survey } from "survey-react-ui";
import "survey-core/survey-core.css";

const API = "http://localhost:8080/api/surveys";

export default function SurveyPage() {
  const { id } = useParams();

  const [surveyModel, setSurveyModel] = useState<Model | null>(null);
  const [loading, setLoading] = useState(true);

  // 🔥 Fetch survey JSON
  useEffect(() => {
    const loadSurvey = async () => {
      try {
        const res = await fetch(`${API}/${id}`);
        const json = await res.json();

        const model = new Model(json);

        // ✅ Handle submit
        model.onComplete.add(async (sender) => {
          try {
            const res = await fetch(`${API}/${id}/results`, {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify(sender.data),
            });

            if (!res.ok) throw new Error();

            alert("✅ Thank you! Your response is submitted.");
          } catch (err) {
            console.error(err);
            alert("❌ Failed to submit survey");
          }
        });

        setSurveyModel(model);
      } catch (err) {
        console.error(err);
        alert("❌ Failed to load survey");
      } finally {
        setLoading(false);
      }
    };

    if (id) loadSurvey();
  }, [id]);

  if (loading) return <p className="p-6">Loading survey...</p>;

  if (!surveyModel) return <p className="p-6">Survey not found</p>;

  return (
    <div className="min-h-screen bg-gray-50 flex justify-center items-center p-6">
      <div className="w-full max-w-3xl bg-white p-6 rounded shadow">
        <Survey model={surveyModel} />
      </div>
    </div>
  );
}
