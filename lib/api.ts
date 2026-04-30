const BASE_URL = "http://localhost:8080/api/surveys";

export async function getSurveys() {
  const res = await fetch(BASE_URL);
  if (!res.ok) throw new Error("Failed to fetch surveys");
  return res.json();
}

export async function getSurveyById(id: string) {
  const res = await fetch(`${BASE_URL}/${id}`);
  if (!res.ok) throw new Error("Failed to fetch survey");
  return res.json();
}

export async function createSurvey(data: any) {
  const res = await fetch(BASE_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

  if (!res.ok) throw new Error("Failed to save survey");
  return res.json();
}

export async function deleteSurveyById(id: string) {
  const res = await fetch(`${BASE_URL}/${id}`, {
    method: "DELETE",
  });

  if (!res.ok) throw new Error("Failed to delete survey");
}

export async function updateSurveyById(id: string, data: any) {
  const res = await fetch(`${BASE_URL}/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

  if (!res.ok) throw new Error("Failed to update survey");
}
