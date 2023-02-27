export async function saveImage(imgUrl: string) {
    const response = await fetch("/api/saveImage", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ url: imgUrl }),
    });
    return await response.json();
  }
  