export const decidePumpAction = (score) => {
    if (score > 0.8) return "ON";
    if (score < 0.5) return "OFF";
    return "KEEP";
};