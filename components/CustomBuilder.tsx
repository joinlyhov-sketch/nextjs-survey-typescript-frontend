"use client";

import { useState } from "react";

type Question = {
  id: string;
  type: "text" | "radiogroup" | "checkbox";
  title: string;
  choices?: string[];
};

export default function CustomBuilder({
  onSave,
  initialData,
}: {
  onSave: (json: any) => void;
  initialData?: any;
}) {
  const [title, setTitle] = useState(initialData?.title || "Untitled Survey");
  const [questions, setQuestions] = useState<Question[]>([]);

  // ================= ADD QUESTION =================
  const addQuestion = () => {
    setQuestions([
      ...questions,
      {
        id: Date.now().toString(),
        type: "text",
        title: "",
        choices: [],
      },
    ]);
  };

  // ================= UPDATE =================
  const updateQuestion = (id: string, field: string, value: any) => {
    setQuestions((prev) =>
      prev.map((q) => (q.id === id ? { ...q, [field]: value } : q)),
    );
  };

  // ================= DELETE =================
  const deleteQuestion = (id: string) => {
    setQuestions((prev) => prev.filter((q) => q.id !== id));
  };

  // ================= CHOICES =================
  const addChoice = (id: string) => {
    setQuestions((prev) =>
      prev.map((q) =>
        q.id === id ? { ...q, choices: [...(q.choices || []), ""] } : q,
      ),
    );
  };

  const updateChoice = (qId: string, index: number, value: string) => {
    setQuestions((prev) =>
      prev.map((q) => {
        if (q.id !== qId) return q;
        const newChoices = [...(q.choices || [])];
        newChoices[index] = value;
        return { ...q, choices: newChoices };
      }),
    );
  };

  // ================= SAVE =================
  const handleSave = () => {
    const surveyJson = {
      title,
      pages: [
        {
          name: "page1",
          elements: questions.map((q) => ({
            type: q.type,
            name: q.id,
            title: q.title,
            choices:
              q.type !== "text"
                ? q.choices?.filter((c) => c.trim() !== "")
                : undefined,
          })),
        },
      ],
    };

    onSave(surveyJson);
  };

  return (
    <div className="p-6 space-y-6">
      {/* TITLE */}
      <input
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        className="border p-2 w-full text-lg font-semibold"
      />

      {/* QUESTIONS */}
      {questions.map((q, i) => (
        <div key={q.id} className="border p-4 rounded bg-white">
          <div className="flex justify-between mb-2">
            <strong>Q{i + 1}</strong>
            <button
              onClick={() => deleteQuestion(q.id)}
              className="text-red-500"
            >
              Delete
            </button>
          </div>

          {/* TITLE */}
          <input
            placeholder="Question title"
            value={q.title}
            onChange={(e) => updateQuestion(q.id, "title", e.target.value)}
            className="border p-2 w-full mb-2"
          />

          {/* TYPE */}
          <select
            value={q.type}
            onChange={(e) => updateQuestion(q.id, "type", e.target.value)}
            className="border p-2 mb-2"
          >
            <option value="text">Text</option>
            <option value="radiogroup">Radio</option>
            <option value="checkbox">Checkbox</option>
          </select>

          {/* CHOICES */}
          {q.type !== "text" && (
            <div className="space-y-2">
              {q.choices?.map((c, idx) => (
                <input
                  key={idx}
                  value={c}
                  onChange={(e) => updateChoice(q.id, idx, e.target.value)}
                  placeholder={`Choice ${idx + 1}`}
                  className="border p-2 w-full"
                />
              ))}

              <button
                onClick={() => addChoice(q.id)}
                className="text-blue-600 text-sm"
              >
                + Add Choice
              </button>
            </div>
          )}
        </div>
      ))}

      {/* ACTIONS */}
      <div className="flex gap-4">
        <button
          onClick={addQuestion}
          className="px-4 py-2 bg-gray-700 text-white rounded"
        >
          + Add Question
        </button>

        <button
          onClick={handleSave}
          className="px-4 py-2 bg-blue-600 text-white rounded"
        >
          Save Survey
        </button>
      </div>
    </div>
  );
}
