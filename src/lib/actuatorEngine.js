import ZRC_DA from "@/data/ZRC_DA.json";
import ZRC_SA_Ball from "@/data/ZRC_SA_Ball.json";
import ZRC_SA_Butterfly from "@/data/ZRC_SA_Butterfly.json";

import drawingNo from "@/data/drawing_no.json";
import otherDetails from "@/data/other_details.json";
import adaptorData from "@/data/adaptor.json";
import accessories from "@/data/accessories.json";



export function calculateTorqueWithFOS(torque, fos) {
  return Number(torque) + (Number(torque) * Number(fos)) / 100;
}



export function getActuatorType(failPosition) {
  if (failPosition === "Fail Stay - Double Acting") {
    return "Double Acting (DA)";
  }

  return "Single Acting (SA)";
}



export function getAdaptor(shaftProfile) {
  return shaftProfile === "Double Square" ? "No" : "Yes";
}



export function selectActuator({
  actuatorType,
  valveType,
  requiredTorque,
}) {
  let dataset = [];

  if (actuatorType === "Double Acting (DA)") {
    dataset = ZRC_DA;
  } else {
    if (valveType === "Butterfly Valve") {
      dataset = ZRC_SA_Butterfly;
    } else {
      dataset = ZRC_SA_Ball;
    }
  }

  const matched = dataset.find(
    (item) => Number(item.torque) >= Number(requiredTorque)
  );

  return matched || null;
}



export function getOtherDetails(model) {
  return otherDetails.find((item) => item.model === model);
}



export function getDrawingNumber(model, actuatorType) {
  const typeKey =
    actuatorType === "Double Acting (DA)"
      ? "double_acting"
      : "single_acting";

  return drawingNo[typeKey].find((item) => item.model === model);
}



export function getAdaptorPrice(model) {
  const found = adaptorData.find(
    (item) => item.adaptor === model
  );

  return found ? found.price_inr : 0;
}



export function getAccessoryPrice(model) {
  const found = accessories.find(
    (item) => item.model === model
  );

  return found ? found.price_inr : 0;
}



export function calculateActualFOS(
  outputTorque,
  inputTorque
) {
  return (
    ((Number(outputTorque) - Number(inputTorque)) /
      Number(inputTorque)) *
    100
  ).toFixed(2);
}