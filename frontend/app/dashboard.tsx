import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, Switch, TouchableOpacity, ScrollView } from "react-native";
import { AnimatedCircularProgress } from "react-native-circular-progress";

export default function Dashboard() {
  const [temperature, setTemperature] = useState(0);
  const [humidity, setHumidity] = useState(0);
  const [soil1, setSoil1] = useState(0);
  const [soil2, setSoil2] = useState(0);
  const [soil3, setSoil3] = useState(0);

  const [relay1, setRelay1] = useState(false);
  const [relay2, setRelay2] = useState(false);
  const [relay3, setRelay3] = useState(false);

  const [drynessThreshold, setDrynessThreshold] = useState(0);
  const [mode, setMode] = useState<"Manual" | "Automatic" | "AI">("Manual");

  // 🔁 Cập nhật giá trị ngẫu nhiên mỗi 2 giây
  useEffect(() => {
    const interval = setInterval(() => {
      setTemperature(Math.floor(Math.random() * 40)); // 0 - 40 °C
      setHumidity(Math.floor(Math.random() * 100));   // 0 - 100 %
      setSoil1(Math.floor(Math.random() * 4095));     // 0 - 4095
      setSoil2(Math.floor(Math.random() * 4095));
      setSoil3(Math.floor(Math.random() * 4095));
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.header}>Smart Autonomous Irrigation System</Text>

      {/* Temperature, Humidity, Relay */}
      <View style={styles.row}>
        <Gauge label="Temperature" value={temperature} max={100} unit="°C" color="#f44336" />
        <Gauge label="Humidity" value={humidity} max={100} unit="%" color="#2196f3" />
        <View style={styles.relayContainer}>
          <Relay label="Relay 1" value={relay1} onValueChange={setRelay1} />
          <Relay label="Relay 2" value={relay2} onValueChange={setRelay2} />
          <Relay label="Relay 3" value={relay3} onValueChange={setRelay3} />
        </View>
      </View>

      {/* Soil Sensors */}
      <View style={styles.row}>
        <Gauge label="Soil 1" value={soil1} max={4095} color="#4caf50" />
        <Gauge label="Soil 2" value={soil2} max={4095} color="#cddc39" />
        <Gauge label="Soil 3" value={soil3} max={4095} color="#ffeb3b" />
      </View>

      {/* Dryness Threshold */}
      <View style={styles.thresholdBox}>
        <Text style={styles.label}>Dryness Threshold</Text>
        <View style={styles.thresholdRow}>
          <TouchableOpacity
            style={styles.button}
            onPress={() => setDrynessThreshold((prev) => Math.max(0, prev - 1))}
          >
            <Text style={styles.btnText}>−</Text>
          </TouchableOpacity>
          <Text style={styles.thresholdValue}>{drynessThreshold}</Text>
          <TouchableOpacity
            style={styles.button}
            onPress={() => setDrynessThreshold((prev) => prev + 1)}
          >
            <Text style={styles.btnText}>＋</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Control Mode */}
      <ControlModeSelector mode={mode} onChange={setMode} />
    </ScrollView>
  );
}

/* ----------- COMPONENTS ----------- */
const Relay = ({
  label,
  value,
  onValueChange,
}: {
  label: string;
  value: boolean;
  onValueChange: (v: boolean) => void;
}) => (
  <View style={styles.relay}>
    <Text>{label}</Text>
    <Switch value={value} onValueChange={onValueChange} />
  </View>
);

const Gauge = ({
  label,
  value,
  max,
  unit = "",
  color = "#4caf50",
}: {
  label: string;
  value: number;
  max: number;
  unit?: string;
  color?: string;
}) => (
  <View style={styles.gaugeContainer}>
    <AnimatedCircularProgress
      size={100}
      width={10}
      fill={(value / max) * 100}
      tintColor={color}
      backgroundColor="#eee"
    >
      {() => <Text style={{ fontSize: 16 }}>{`${value}${unit}`}</Text>}
    </AnimatedCircularProgress>
    <Text style={styles.gaugeLabel}>{label}</Text>
  </View>
);

const ControlModeSelector = ({
  mode,
  onChange,
}: {
  mode: "Manual" | "Automatic" | "AI";
  onChange: (m: "Manual" | "Automatic" | "AI") => void;
}) => {
  const modes: ("Manual" | "Automatic" | "AI")[] = ["Manual", "Automatic", "AI"];
  return (
    <View style={styles.controlBox}>
      <Text style={styles.label}>Control Mode</Text>
      <View style={styles.modeRow}>
        {modes.map((m) => (
          <TouchableOpacity
            key={m}
            onPress={() => onChange(m)}
            style={[styles.modeBtn, mode === m && styles.activeMode]}
          >
            <Text style={[styles.modeText, mode === m && styles.activeText]}>{m}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
};

/* ----------- STYLES ----------- */
const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: "#fff",
  },
  header: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 10,
    textAlign: "center",
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    marginVertical: 10,
  },
  relayContainer: {
    justifyContent: "center",
  },
  relay: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    width: 120,
    marginVertical: 4,
  },
  gaugeContainer: {
    alignItems: "center",
  },
  gaugeLabel: {
    marginTop: 6,
    fontSize: 14,
    color: "#444",
  },
  thresholdBox: {
    backgroundColor: "#f9f9f9",
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 10,
  },
  thresholdRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  button: {
    backgroundColor: "#ddd",
    borderRadius: 8,
    padding: 10,
    marginHorizontal: 10,
  },
  btnText: {
    fontSize: 20,
    fontWeight: "bold",
  },
  thresholdValue: {
    fontSize: 22,
    fontWeight: "bold",
  },
  label: {
    fontSize: 16,
    marginBottom: 6,
  },
  controlBox: {
    alignItems: "center",
    marginTop: 20,
  },
  modeRow: {
    flexDirection: "row",
  },
  modeBtn: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 20,
    marginHorizontal: 6,
  },
  activeMode: {
    backgroundColor: "#1a237e",
  },
  modeText: {
    color: "#444",
    fontWeight: "600",
  },
  activeText: {
    color: "#fff",
  },
});
