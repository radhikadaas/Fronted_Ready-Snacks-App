// src/utils/date.js
export function formatIST(dateString) {
  if (!dateString) return "";

  // Convert Supabase timestamp → ISO UTC
  const utcDate = new Date(dateString.replace(" ", "T") + "Z");

  return utcDate.toLocaleString("en-IN", {
    timeZone: "Asia/Kolkata",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
}


