export async function draw(questionInput: string) {
    const response = await fetch("/api/draw", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ question: questionInput }),
    });
    return await response.json();
  }
  