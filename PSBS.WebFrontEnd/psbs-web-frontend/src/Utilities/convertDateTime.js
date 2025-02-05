
export const formatDate = (isoString) => {
    const date = new Date(isoString);
    const now = new Date();
  
    const isToday =
      date.getDate() === now.getDate() &&
      date.getMonth() === now.getMonth() &&
      date.getFullYear() === now.getFullYear();
  
    const isThisYear = date.getFullYear() === now.getFullYear();
  
    if (isToday) {
      return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    } else if (isThisYear) {
      return date.toLocaleDateString([], { day: "2-digit", month: "short" });
    } else {
      return date.toLocaleDateString([], {
        year: "numeric",
        month: "short",
        day: "2-digit",
      });
    }
  };
  