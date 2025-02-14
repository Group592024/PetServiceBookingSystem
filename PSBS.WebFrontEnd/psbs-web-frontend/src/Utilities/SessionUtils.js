export const monitorSessionStorage = (key, callback, interval = 1000) => {
    let lastValue = sessionStorage.getItem(key);
  
    setInterval(() => {
      const currentValue = sessionStorage.getItem(key);
  
      if (currentValue !== lastValue) {
        callback(currentValue);
        lastValue = currentValue;
      }
    }, interval);
  };