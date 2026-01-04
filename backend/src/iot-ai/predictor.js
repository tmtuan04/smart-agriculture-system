import { InferenceSession, Tensor } from "onnxruntime-node";
import { readFileSync } from "fs";

const scalerData = JSON.parse(
    readFileSync("./src/iot-ai/scaler_params.json", "utf8")
);

const MIN = scalerData.min;
const MAX = scalerData.max;

let session = null;

const scaleInput = (input) =>
    input.map((v, i) => (v - MIN[i]) / (MAX[i] - MIN[i]));

export const initModel = async () => {
    session = await InferenceSession.create("./src/iot-ai/model.onnx");
};

export const predictAI = async (rawInput) => {
    if (!session) throw new Error("Model not loaded");

    const scaled = scaleInput(rawInput);

    const tensor = new Tensor(
        "float32",
        Float32Array.from(scaled),
        [1, rawInput.length]
    );

    const result = await session.run({ input: tensor });
    return result.output.data[0];
};
