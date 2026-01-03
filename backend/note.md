QoS (Quality of Service) trong MQTT là mức độ đảm bảo giao message giữa publisher ↔ broker ↔ subscriber.

> Nói ngắn gọn: QoS quyết định: “message có chắc chắn tới nơi không, và tới mấy lần?”

- QoS 0 – At most once (0 hoặc 1 lần): Gửi 1 lần duy nhất, không xác nhận
- QoS 1 – At least once (≥ 1 lần): Message chắc chắn tới, nhưng có thể bị gửi trùng
- QoS 2 – Exactly once (chính xác 1 lần): Message tới đúng 1 lần duy nhất