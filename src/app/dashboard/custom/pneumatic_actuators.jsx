"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { Plus, RefreshCw, Trash2, Edit2, Settings, Archive, ChevronDown, CheckCircle2, Box, PackagePlus, FileText } from "lucide-react";
import { useRouter } from "next/navigation";
// Helper: get matching double-acting actuator (torque >= required)
const getDoubleActingMatch = (requiredTorque, airPressureBar, daData) => {
  const pressureKey = String(airPressureBar);

  const sorted = [...daData].sort(
    (a, b) =>
      (a?.torque_nm?.[pressureKey] || 0) -
      (b?.torque_nm?.[pressureKey] || 0)
  );

  const matched = sorted.find(
    (item) => (item?.torque_nm?.[pressureKey] || 0) >= requiredTorque
  );

  return matched || sorted[sorted.length - 1] || null;
};

// Helper: get matching single-acting actuator
const getSingleActingMatch = (
  requiredTorque,
  airPressureBar,
  saData
) => {
  const pressureKey = String(airPressureBar);

  // 1. Filter matching models
  const valid = (saData || []).filter((item) => {
    const pressureData = item?.air_pressure_bar?.[pressureKey];

    if (!pressureData) return false;

    const start = Number(pressureData.start || 0);
    const end = Number(pressureData.end || 0);

    // BOTH must be greater than required torque
    return start > requiredTorque && end > requiredTorque;
  });

  // 3. No matches
  if ((valid?.length || 0) === 0) return null;

  // 4. Prefer even spring_qty
  const evenSpringMatches = valid.filter(
    (item) => item.spring_qty % 2 === 0
  );

  const finalPool =
    (evenSpringMatches?.length || 0) > 0
      ? evenSpringMatches
      : valid;

  // 5. Sort by closest match
  finalPool.sort((a, b) => {
    const aStart =
      a.air_pressure_bar?.[pressureKey]?.start || 0;

    const bStart =
      b.air_pressure_bar?.[pressureKey]?.start || 0;

    return aStart - bStart;
  });

  return finalPool[0];
};
export default function PneumaticActuators({ onSave, editProduct, onCancel }) {

  // ========== DATABASE DATA ==========
  const [dbDaData, setDbDaData] = useState([]);
  const [dbSaData, setDbSaData] = useState([]);
  const [dbAccessories, setDbAccessories] = useState([]);
  const [isLoadingData, setIsLoadingData] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoadingData(true);
        const [daRes, saRes, accRes] = await Promise.all([
          fetch('/api/actuator-prices'),
          fetch('/api/actuator-prices-sa'),
          fetch('/api/accessory-prices')
        ]);
        const daJson = await daRes.json();
        const saJson = await saRes.json();
        const accJson = await accRes.json();

        if (daJson.success) setDbDaData(daJson.data);
        if (saJson.success) setDbSaData(saJson.data);
        if (accJson.success) setDbAccessories(accJson.data);
      } catch (err) {
        console.error('Failed to fetch data', err);
      } finally {
        setIsLoadingData(false);
      }
    };
    fetchData();
  }, []);

  // ========== INPUT FIELDS (User entries) ==========
  const [valveType, setValveType] = useState("Ball Valve");
  const [size, setSize] = useState("");
  const [tagNo, setTagNo] = useState("");
  const [isoMounting, setIsoMounting] = useState("F03");
  const [shaftProfile, setShaftProfile] = useState("Double Square");
  const [inputTorqueWOFOS, setInputTorqueWOFOS] = useState("");
  const [factorOfSafety, setFactorOfSafety] = useState("30%");
  const [airPressure, setAirPressure] = useState("2");
  const [failPosition, setFailPosition] = useState("Fail Stay - Double Acting");
  const [actuatorSeries, setActuatorSeries] = useState("ZRC");
  const [quantity, setQuantity] = useState(1);
  const [discount, setDiscount] = useState(0);

  // Accessories selections
  const [accessoriesAFR, setAccessoriesAFR] = useState("");
  const [accessoriesLS, setAccessoriesLS] = useState("");
  const [accessoriesSOV, setAccessoriesSOV] = useState("");
  const [accessoriesQEV, setAccessoriesQEV] = useState("");
  const [accessoriesSC, setAccessoriesSC] = useState("");

  // ========== OUTPUT FIELDS (editable, initially set by formulas) ==========
  const [outputProduct, setOutputProduct] = useState("Pneumatic Actuator");
  const [outputType, setOutputType] = useState("");
  const [outputTorque, setOutputTorque] = useState(0);
  const [outputActualFOS, setOutputActualFOS] = useState(0);
  const [outputSpringQty, setOutputSpringQty] = useState("-");
  const [outputModel, setOutputModel] = useState("");
  const [outputMaterial, setOutputMaterial] = useState("Extruded aluminum");
  const [outputMountingStandard, setOutputMountingStandard] = useState("");
  const [outputDriveType, setOutputDriveType] = useState("");
  const [outputTempRange, setOutputTempRange] = useState("T: -20°C to +80°C (Standard)");
  const [outputProtection, setOutputProtection] = useState("Hard Anodized");
  const [outputTravelAdjust, setOutputTravelAdjust] = useState("Have adjustment range of ±5° for the rotation at 0° and 90°");
  const [outputOperationPrinciple, setOutputOperationPrinciple] = useState("");
  const [outputOperatingMedia, setOutputOperatingMedia] = useState("Dry or lubricated air, or non-corrosive gases. Max particle diameter 30μm");
  const [outputAirPortConnections, setOutputAirPortConnections] = useState("");
  const [outputDrawingNumber, setOutputDrawingNumber] = useState("");
  const [outputActuatorUnitPrice, setOutputActuatorUnitPrice] = useState(0);
  const [outputAdaptorPrice, setOutputAdaptorPrice] = useState(0);

  // ========== DERIVED VALUES from inputs (used in formulas) ==========
  const inputTorqueNum = parseFloat(inputTorqueWOFOS) || 0;
  const safetyFactorNum = parseFloat(factorOfSafety) / 100;
  const inputTorqueWithFOS = inputTorqueNum * (1 + safetyFactorNum);
  const airPressureNum = parseFloat(airPressure);
  const adaptorRequired = shaftProfile !== "Double Square" ? "Yes" : "No";
  const actuatorType = failPosition === "Fail Stay - Double Acting" ? "Double Acting (DA)" : "Single Acting (SA)";

  // ========== ACTUATOR MATCHING (for formulas) ==========
  const doubleActingMatch = useMemo(() => {
    if (actuatorType !== "Double Acting (DA)") return null;

    // Get selected dataset dynamically
    const selectedDaData = (dbDaData || []).filter(item => item?.series === `${actuatorSeries}_DA` || item?.series === actuatorSeries);

    return getDoubleActingMatch(
      inputTorqueWithFOS,
      airPressureNum,
      selectedDaData
    );
  }, [
    actuatorType,
    actuatorSeries,
    inputTorqueWithFOS,
    airPressureNum,
    dbDaData
  ]);

  const singleActingMatch = useMemo(() => {
    if (actuatorType !== "Single Acting (SA)") return null;

    const selectedSaData = (dbSaData || []).filter(item => item?.series === `${actuatorSeries}_SA` || item?.series === actuatorSeries);

    return getSingleActingMatch(
      inputTorqueWithFOS,
      airPressureNum,
      selectedSaData
    );
  }, [
    actuatorType,
    inputTorqueWithFOS,
    airPressureNum,
    actuatorSeries,
    dbSaData
  ]);
  // ========== RECALCULATE FUNCTION (sets all output fields from formulas) ==========
  const recalculateOutputs = useCallback(() => {
    // Type
    const newType = actuatorType;
    setOutputType(newType);

    // Output Torque
    let newOutputTorque = 0;

    if (actuatorType === "Double Acting (DA)" && doubleActingMatch) {
      newOutputTorque =
        doubleActingMatch?.torque_nm?.[String(airPressureNum)] || 0;
    } else if (
      actuatorType === "Single Acting (SA)" &&
      singleActingMatch
    ) {
      newOutputTorque =
        singleActingMatch?.air_pressure_bar?.[String(airPressureNum)]?.start || 0;
    }

    setOutputTorque(newOutputTorque);

    // Actual FOS
    let newActualFOS = 0;

    if (inputTorqueNum !== 0) {
      newActualFOS = Number(
        (((newOutputTorque - inputTorqueNum) / inputTorqueNum)).toFixed(1) * 100
      );
    }

    setOutputActualFOS(newActualFOS);

    // Spring Qty
    if (actuatorType === "Double Acting (DA)") {
      setOutputSpringQty("-");
    } else {
      setOutputSpringQty(singleActingMatch?.spring_qty || "");
    }

    // Model & Metadata
    let newModel = "";
    let matchData = null;

    if (actuatorType === "Double Acting (DA)" && doubleActingMatch) {
      newModel = doubleActingMatch.model;
      matchData = doubleActingMatch;
    } else if (actuatorType === "Single Acting (SA)" && singleActingMatch) {
      newModel = singleActingMatch.model;
      matchData = singleActingMatch;
    }
    setOutputModel(newModel);

    // Metadata directly from the database schema
    setOutputMountingStandard(matchData?.mounting || "");
    setOutputDriveType(matchData?.drive_type || "");
    setOutputAirPortConnections(matchData?.air_port_connections || "");
    setOutputDrawingNumber(matchData?.drawing_no || "");

    // Actuator Unit Price
    setOutputActuatorUnitPrice(matchData?.price_inr || 0);

    // Adaptor Price
    let newAdaptorPrice = 0;
    if (adaptorRequired === "Yes") {
      newAdaptorPrice = matchData?.adaptor_price_inr || 0;
    }
    setOutputAdaptorPrice(newAdaptorPrice);

    // Operation Principle
    setOutputOperationPrinciple(
      actuatorType === "Double Acting (DA)"
        ? "Air-to-open and air-to-close (Double Acting)"
        : "Air-to-open and air-to-close (Single Acting)"
    );

    // Product is fixed
    setOutputProduct("Pneumatic Actuator");
    // Material, Temp, Protection, Travel, Media are static (could be overridden)
  }, [actuatorType, doubleActingMatch, singleActingMatch, airPressureNum, inputTorqueNum, adaptorRequired, valveType]);

  // Recalculate whenever inputs that affect formulas change
  useEffect(() => {
    recalculateOutputs();
  }, [recalculateOutputs]);

  // ========== ACCESSORIES PRICES ==========
  const afrPrice = useMemo(() => {
    const found = dbAccessories.find((acc) => acc.model === accessoriesAFR);
    return found?.price_inr || 0;
  }, [accessoriesAFR, dbAccessories]);
  const lsPrice = useMemo(() => {
    const found = dbAccessories.find((acc) => acc.model === accessoriesLS);
    return found?.price_inr || 0;
  }, [accessoriesLS, dbAccessories]);
  const sovPrice = useMemo(() => {
    const found = dbAccessories.find((acc) => acc.model === accessoriesSOV);
    return found?.price_inr || 0;
  }, [accessoriesSOV, dbAccessories]);
  const qevPrice = useMemo(() => {
    const found = dbAccessories.find((acc) => acc.model === accessoriesQEV);
    return found?.price_inr || 0;
  }, [accessoriesQEV, dbAccessories]);
  const scPrice = useMemo(() => {
    const found = dbAccessories.find((acc) => acc.model === accessoriesSC);
    return found?.price_inr || 0;
  }, [accessoriesSC, dbAccessories]);

  const totalAccessoriesPrice = afrPrice + lsPrice + sovPrice + qevPrice + scPrice;
  const unitPriceTotal = outputActuatorUnitPrice + outputAdaptorPrice + totalAccessoriesPrice;
  const discountAmount = (unitPriceTotal * (parseFloat(discount) || 0)) / 100;
  const discountedUnitPrice = unitPriceTotal - discountAmount;
  const amountInINR = quantity * discountedUnitPrice;

  // Populate from editProduct
  useEffect(() => {
    if (editProduct && editProduct.productCategory === 'Pneumatic Actuator') {
      setValveType(editProduct.valveType || "Ball Valve");
      setSize(editProduct.size || "");
      setTagNo(editProduct.tagNo || "");
      setIsoMounting(editProduct.isoMounting || "F03");
      setShaftProfile(editProduct.shaftProfile || "Double Square");
      setInputTorqueWOFOS(editProduct.inputTorqueWOFOS || "");
      setFactorOfSafety(editProduct.factorOfSafety || "30%");
      setAirPressure(editProduct.airPressure || "2");
      setFailPosition(editProduct.failPosition || "Fail Stay - Double Acting");
      setActuatorSeries(editProduct.actuatorSeries || "ZRC");
      setQuantity(editProduct.quantity || 1);
      setDiscount(editProduct.discount || 0);
      setAccessoriesAFR(editProduct.accessoriesAFR || "");
      setAccessoriesLS(editProduct.accessoriesLS || "");
      setAccessoriesSOV(editProduct.accessoriesSOV || "");
      setAccessoriesQEV(editProduct.accessoriesQEV || "");
      setAccessoriesSC(editProduct.accessoriesSC || "");
    }
  }, [editProduct]);

  const addToQuotation = () => {
    const description = `Model = ${outputModel}\nSize = ${size}\nTorque w/ FOS = ${inputTorqueWithFOS.toFixed(1)}\nAir Pressure = ${airPressure}\nActuator Type = ${outputType}`;

    const newProduct = {
      id: editProduct ? editProduct.id : Date.now(),
      productCategory: 'Pneumatic Actuator',
      description,
      detailsSummary: `Valve: ${valveType}, Size: ${size}\nTorque: ${inputTorqueWithFOS.toFixed(1)}, Air: ${airPressure}`,
      valveType,
      size,
      tagNo,
      isoMounting,
      shaftProfile,
      inputTorqueWOFOS,
      factorOfSafety,
      airPressure: String(airPressureNum),
      failPosition,
      actuatorSeries,
      quantity,
      discount: parseFloat(discount) || 0,
      discountAmount,
      discountedUnitPrice,
      accessoriesAFR,
      accessoriesLS,
      accessoriesSOV,
      accessoriesQEV,
      accessoriesSC,

      inputTorqueWithFOS: inputTorqueWithFOS.toFixed(1),
      actuatorType: outputType,
      model: outputModel,
      accessories: [accessoriesAFR, accessoriesLS, accessoriesSOV, accessoriesQEV, accessoriesSC].filter(Boolean).join(", "),
      actuatorUnitPrice: outputActuatorUnitPrice,
      adaptorPrice: outputAdaptorPrice,
      totalAccessoriesPrice,
      unitPriceTotal,
      amountInINR,
    };

    onSave(newProduct);

    // Optional: Reset commonly changed fields after adding if not editing
    if (!editProduct) {
      setTagNo("");
      setSize("");
      setInputTorqueWOFOS("");
      setDiscount(0);
    }
  };

  // ========== DROPDOWN OPTIONS ==========
  const valveOptions = ["Ball Valve", "Butterfly Valve", "Plug Valve"];
  const isoMountingOptions = ["F03", "F04", "F05", "F07", "F10", "F12", "F14", "F16"];
  const shaftProfileOptions = ["Double Square", "Double D", "Key Way"];
  const safetyOptions = ["20%", "25%", "30%", "40%", "50%", "100%"];
  const airPressureOptions = ["2", "2.5", "3", "4", "4.5", "5", "5.5", "6"];
  const failPositionOptions = ["Normally Open - Single Acting", "Normally Close - Single Acting", "Fail Stay - Double Acting"];
  const actuatorSeriesOptions = ["ZRA", "ZRB", "ZRC", "ZRD"];
  const accessoriesAFROptions = ["", "ZOFR", "ZOFR-02-S3RP0", "ZOFR-02-D3RP0", "ZOFR-01-S3RP0", "ZOFR-01-D3RP0", "ZOFR-02-S3RP0F", "ZOFR-02-D3RP0F"];
  const accessoriesLSOptions = ["", "ZLS100P2", "ZLS210M2", "ZLS 220", "ZLS230", "ZLS500M4", "ZLS500M2", "ZLS910P2", "ZLS910M2"];
  const accessoriesSOVOptions = ["", "ZLV31030A + ZOFR Mini", "ZLV310F3C0A", "ZLV610F3C0B", "ZLV320F3C0D", "ZLV310F02C0D", "ZLV320F02C0D", "ZLV310F3C5"];
  const accessoriesQEVOptions = ["", "ZLQE-02"];
  const accessoriesSCOptions = ["", "ZSCDA-N", "ZSCSR-N"];

  // Styling Variables
  const selectClass = "appearance-none w-full bg-gray-50 border border-gray-200 text-gray-700 py-2.5 px-4 pr-8 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all text-sm";
  const inputClass = "w-full bg-gray-50 border border-gray-200 text-gray-700 py-2.5 px-4 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all text-sm";
  const readOnlyClass = "w-full bg-gray-100 border border-gray-200 text-gray-500 py-2.5 px-4 rounded-xl cursor-not-allowed font-medium text-sm";
  const labelClass = "block text-xs font-bold text-gray-700 mb-1.5 uppercase tracking-wide";

  return (
    <div className="bg-transparent font-sans">
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
        {/* LEFT: Input Form */}
        <div className="xl:col-span-7 space-y-6">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <Settings className="w-5 h-5 text-blue-600" />
                <h2 className="text-xl font-bold text-gray-800">Product Details</h2>
              </div>
              {editProduct && (
                <span className="px-3 py-1 bg-amber-100 text-amber-700 text-xs font-bold rounded-full">
                  Editing Mode
                </span>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-5 gap-y-4">
              <div>
                <label className={labelClass}>Valve Type</label>
                <div className="relative">
                  <select value={valveType} onChange={(e) => setValveType(e.target.value)} className={selectClass}>
                    {valveOptions.map(opt => <option key={opt}>{opt}</option>)}
                  </select>
                  <ChevronDown className="absolute right-3 top-3.5 w-4 h-4 text-gray-400 pointer-events-none" />
                </div>
              </div>

              <div>
                <label className={labelClass}>Size</label>
                <input type="number" value={size} onChange={(e) => setSize(e.target.value)} className={inputClass} placeholder="e.g. 100" />
              </div>

              <div>
                <label className={labelClass}>Tag no</label>
                <input type="text" value={tagNo} onChange={(e) => setTagNo(e.target.value)} className={inputClass} placeholder="e.g. TAG-001" />
              </div>

              <div>
                <label className={labelClass}>ISO Mounting & Size</label>
                <div className="relative">
                  <select value={isoMounting} onChange={(e) => setIsoMounting(e.target.value)} className={selectClass}>
                    {isoMountingOptions.map(opt => <option key={opt}>{opt}</option>)}
                  </select>
                  <ChevronDown className="absolute right-3 top-3.5 w-4 h-4 text-gray-400 pointer-events-none" />
                </div>
              </div>

              <div>
                <label className={labelClass}>Shaft Profile</label>
                <div className="relative">
                  <select value={shaftProfile} onChange={(e) => setShaftProfile(e.target.value)} className={selectClass}>
                    {shaftProfileOptions.map(opt => <option key={opt}>{opt}</option>)}
                  </select>
                  <ChevronDown className="absolute right-3 top-3.5 w-4 h-4 text-gray-400 pointer-events-none" />
                </div>
              </div>

              <div>
                <label className={labelClass}>Adaptor (Required?)</label>
                <input type="text" value={adaptorRequired} readOnly className={readOnlyClass} />
              </div>

              <div>
                <label className={labelClass}>Input Torque (Nm) W/O FOS</label>
                <input type="number" step="any" value={inputTorqueWOFOS} onChange={(e) => setInputTorqueWOFOS(e.target.value)} className={inputClass} placeholder="0.00" />
              </div>

              <div>
                <label className={labelClass}>Factor of Safety</label>
                <div className="relative">
                  <select value={factorOfSafety} onChange={(e) => setFactorOfSafety(e.target.value)} className={selectClass}>
                    {safetyOptions.map(opt => <option key={opt}>{opt}</option>)}
                  </select>
                  <ChevronDown className="absolute right-3 top-3.5 w-4 h-4 text-gray-400 pointer-events-none" />
                </div>
              </div>

              <div>
                <label className={labelClass}>Input Torque (Nm) With FOS</label>
                <input type="text" value={inputTorqueWithFOS.toFixed(1)} readOnly className={readOnlyClass} />
              </div>

              <div>
                <label className={labelClass}>Air Pressure (Input Bar)</label>
                <div className="relative">
                  <select value={airPressure} onChange={(e) => setAirPressure(e.target.value)} className={selectClass}>
                    {airPressureOptions.map(opt => <option key={opt}>{opt}</option>)}
                  </select>
                  <ChevronDown className="absolute right-3 top-3.5 w-4 h-4 text-gray-400 pointer-events-none" />
                </div>
              </div>

              <div>
                <label className={labelClass}>Fail Positions</label>
                <div className="relative">
                  <select value={failPosition} onChange={(e) => setFailPosition(e.target.value)} className={selectClass}>
                    {failPositionOptions.map(opt => <option key={opt}>{opt}</option>)}
                  </select>
                  <ChevronDown className="absolute right-3 top-3.5 w-4 h-4 text-gray-400 pointer-events-none" />
                </div>
              </div>

              <div>
                <label className={labelClass}>Actuator Series</label>
                <div className="relative">
                  <select value={actuatorSeries} onChange={(e) => setActuatorSeries(e.target.value)} className={selectClass}>
                    {actuatorSeriesOptions.map(opt => <option key={opt}>{opt}</option>)}
                  </select>
                  <ChevronDown className="absolute right-3 top-3.5 w-4 h-4 text-gray-400 pointer-events-none" />
                </div>
              </div>

              <div>
                <label className={labelClass}>Quantity</label>
                <input type="number" min="1" value={quantity} onChange={(e) => setQuantity(parseInt(e.target.value) || 1)} className={inputClass} />
              </div>

              <div>
                <label className={labelClass}>Discount (%)</label>
                <input type="number" min="0" step="any" value={discount} onChange={(e) => setDiscount(parseFloat(e.target.value) || 0)} className={inputClass} placeholder="0" />
              </div>
            </div>

            {/* Accessories */}
            <div className="mt-8 border border-gray-100 rounded-2xl p-5 bg-gray-50/50">
              <div className="flex items-center gap-2 mb-4">
                <PackagePlus className="w-5 h-5 text-indigo-600" />
                <h3 className="font-bold text-gray-800">Accessories</h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                {/* AFR */}
                <div className="bg-white p-3 rounded-xl border border-gray-100 shadow-sm">
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 block">AFR</label>
                  <div className="relative mb-2">
                    <select value={accessoriesAFR} onChange={(e) => setAccessoriesAFR(e.target.value)} className="appearance-none w-full bg-gray-50 border border-gray-200 text-gray-700 py-2 px-3 pr-8 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/50 text-sm transition-all">
                      {accessoriesAFROptions.map((opt) => (
                        <option key={opt}>{opt || "None"}</option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-2.5 top-2.5 w-4 h-4 text-gray-400 pointer-events-none" />
                  </div>
                  <div className="text-right text-indigo-600 font-semibold text-sm">₹ {afrPrice.toFixed(2)}</div>
                </div>

                {/* LS */}
                <div className="bg-white p-3 rounded-xl border border-gray-100 shadow-sm">
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 block">LS</label>
                  <div className="relative mb-2">
                    <select value={accessoriesLS} onChange={(e) => setAccessoriesLS(e.target.value)} className="appearance-none w-full bg-gray-50 border border-gray-200 text-gray-700 py-2 px-3 pr-8 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/50 text-sm transition-all">
                      {accessoriesLSOptions.map((opt) => (
                        <option key={opt}>{opt || "None"}</option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-2.5 top-2.5 w-4 h-4 text-gray-400 pointer-events-none" />
                  </div>
                  <div className="text-right text-indigo-600 font-semibold text-sm">₹ {lsPrice.toFixed(2)}</div>
                </div>

                {/* SOV */}
                <div className="bg-white p-3 rounded-xl border border-gray-100 shadow-sm">
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 block">SOV</label>
                  <div className="relative mb-2">
                    <select value={accessoriesSOV} onChange={(e) => setAccessoriesSOV(e.target.value)} className="appearance-none w-full bg-gray-50 border border-gray-200 text-gray-700 py-2 px-3 pr-8 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/50 text-sm transition-all">
                      {accessoriesSOVOptions.map((opt) => (
                        <option key={opt}>{opt || "None"}</option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-2.5 top-2.5 w-4 h-4 text-gray-400 pointer-events-none" />
                  </div>
                  <div className="text-right text-indigo-600 font-semibold text-sm">₹ {sovPrice.toFixed(2)}</div>
                </div>

                {/* QEV */}
                <div className="bg-white p-3 rounded-xl border border-gray-100 shadow-sm">
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 block">QEV</label>
                  <div className="relative mb-2">
                    <select value={accessoriesQEV} onChange={(e) => setAccessoriesQEV(e.target.value)} className="appearance-none w-full bg-gray-50 border border-gray-200 text-gray-700 py-2 px-3 pr-8 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/50 text-sm transition-all">
                      {accessoriesQEVOptions.map((opt) => (
                        <option key={opt}>{opt || "None"}</option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-2.5 top-2.5 w-4 h-4 text-gray-400 pointer-events-none" />
                  </div>
                  <div className="text-right text-indigo-600 font-semibold text-sm">₹ {qevPrice.toFixed(2)}</div>
                </div>

                {/* SC */}
                <div className="bg-white p-3 rounded-xl border border-gray-100 shadow-sm">
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 block">SC</label>
                  <div className="relative mb-2">
                    <select value={accessoriesSC} onChange={(e) => setAccessoriesSC(e.target.value)} className="appearance-none w-full bg-gray-50 border border-gray-200 text-gray-700 py-2 px-3 pr-8 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/50 text-sm transition-all">
                      {accessoriesSCOptions.map((opt) => (
                        <option key={opt}>{opt || "None"}</option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-2.5 top-2.5 w-4 h-4 text-gray-400 pointer-events-none" />
                  </div>
                  <div className="text-right text-indigo-600 font-semibold text-sm">₹ {scPrice.toFixed(2)}</div>
                </div>
              </div>

              {/* Total */}
              <div className="mt-5 flex justify-between items-center bg-white border border-gray-100 rounded-xl p-3 shadow-sm">
                <span className="font-semibold text-gray-700">Accessories Total</span>
                <span className="font-bold text-indigo-600">₹ {totalAccessoriesPrice.toFixed(2)}</span>
              </div>
            </div>

            <div className="flex flex-wrap gap-3 mt-8">
              <button onClick={recalculateOutputs} className="flex-1 flex items-center justify-center gap-2 bg-gray-100 text-gray-700 font-semibold py-3 px-3 rounded-xl hover:bg-gray-200 transition-all text-sm">
                <RefreshCw className="w-4 h-4" /> Recalculate Outputs
              </button>
              <button onClick={addToQuotation} className="flex-[2] flex items-center justify-center gap-2 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 shadow-md shadow-blue-600/20 transition-all text-sm">
                {editProduct ? <><CheckCircle2 className="w-5 h-5" /> Save Changes</> : <><Plus className="w-5 h-5" /> Add to Quotation</>}
              </button>
              {editProduct && (
                <button onClick={onCancel} className="flex-none flex items-center justify-center bg-white border border-gray-300 text-gray-700 font-semibold py-3 px-3 rounded-xl hover:bg-gray-50 transition-all text-sm">
                  Cancel
                </button>
              )}
            </div>
          </div>
        </div>

        {/* RIGHT: Selection Output (Editable Fields) */}
        <div className="xl:col-span-5 space-y-6">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 sticky top-6">
            <div className="flex items-center gap-2 mb-6">
              <Archive className="w-5 h-5 text-emerald-600" />
              <h2 className="text-xl font-bold text-gray-800">Selection Output</h2>
            </div>

            <p className="text-xs text-amber-600 bg-amber-50 p-3 rounded-lg mb-6 border border-amber-100 font-medium">
              * You can manually edit any output field. Click <b>"Recalculate Outputs"</b> to restore formula-based values.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-3 text-sm">
              {[
                { label: "Product", val: outputProduct, setter: setOutputProduct },
                { label: "Type", val: outputType, setter: setOutputType },
                { label: "Model", val: outputModel, setter: setOutputModel },
                { label: "Material", val: outputMaterial, setter: setOutputMaterial },
                { label: "Mounting Std", val: outputMountingStandard, setter: setOutputMountingStandard },
                { label: "Drive Type", val: outputDriveType, setter: setOutputDriveType },
                { label: "Protection", val: outputProtection, setter: setOutputProtection },
                { label: "Operation", val: outputOperationPrinciple, setter: setOutputOperationPrinciple },
                { label: "Air Port Conn", val: outputAirPortConnections, setter: setOutputAirPortConnections },
                { label: "Drawing No.", val: outputDrawingNumber, setter: setOutputDrawingNumber },
                { label: "Spring QTY", val: outputSpringQty, setter: setOutputSpringQty },
              ].map((item, idx) => (
                <div key={idx} className="flex flex-col">
                  <label className="font-medium text-gray-600 text-xs mb-1">{item.label}</label>
                  <input type="text" value={item.val} onChange={(e) => item.setter(e.target.value)} className="bg-gray-50 border border-gray-200 p-2 rounded-lg text-gray-800 focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 outline-none transition-all" />
                </div>
              ))}

              <div className="flex flex-col sm:col-span-2">
                <label className="font-medium text-gray-600 text-xs mb-1">Temperature Range</label>
                <input type="text" value={outputTempRange} onChange={(e) => setOutputTempRange(e.target.value)} className="bg-gray-50 border border-gray-200 p-2 rounded-lg text-gray-800 focus:ring-2 focus:ring-emerald-500/50 outline-none transition-all" />
              </div>
              <div className="flex flex-col sm:col-span-2">
                <label className="font-medium text-gray-600 text-xs mb-1">Travel Adjustment</label>
                <input type="text" value={outputTravelAdjust} onChange={(e) => setOutputTravelAdjust(e.target.value)} className="bg-gray-50 border border-gray-200 p-2 rounded-lg text-gray-800 focus:ring-2 focus:ring-emerald-500/50 outline-none transition-all" />
              </div>
              <div className="flex flex-col sm:col-span-2">
                <label className="font-medium text-gray-600 text-xs mb-1">Operating Media</label>
                <input type="text" value={outputOperatingMedia} onChange={(e) => setOutputOperatingMedia(e.target.value)} className="bg-gray-50 border border-gray-200 p-2 rounded-lg text-gray-800 focus:ring-2 focus:ring-emerald-500/50 outline-none transition-all" />
              </div>

              {[
                { label: "Output Torque", val: outputTorque, setter: setOutputTorque },
                { label: "Actual FOS", val: outputActualFOS, setter: setOutputActualFOS, displayVal: outputActualFOS.toFixed(1) },
                { label: "Actuator Price (₹)", val: outputActuatorUnitPrice, setter: setOutputActuatorUnitPrice },
                { label: "Adaptor Price (₹)", val: outputAdaptorPrice, setter: setOutputAdaptorPrice },
              ].map((item, idx) => (
                <div key={idx} className="flex flex-col">
                  <label className="font-medium text-gray-600 text-xs mb-1">{item.label}</label>
                  <input type="number" step="any" value={item.displayVal ?? item.val} onChange={(e) => item.setter(parseFloat(e.target.value) || 0)} className="bg-white border border-emerald-200 p-2 rounded-lg font-semibold text-emerald-800 focus:ring-2 focus:ring-emerald-500/50 outline-none transition-all" />
                </div>
              ))}
            </div>

            <div className="mt-6 pt-5 border-t border-gray-100 space-y-3">
              <div className="flex justify-between items-center px-2">
                <span className="font-medium text-gray-600">Accessories Total:</span>
                <span className="font-semibold text-gray-800">₹ {totalAccessoriesPrice.toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center px-2">
                <span className="font-medium text-gray-600">Unit Price Total:</span>
                <span className="font-semibold text-gray-800">₹ {unitPriceTotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center px-2">
                <span className="font-medium text-gray-600">Discount ({parseFloat(discount) || 0}%):</span>
                <span className="font-semibold text-red-500">- ₹ {discountAmount.toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center px-2">
                <span className="font-medium text-gray-600">Discounted Unit Price:</span>
                <span className="font-semibold text-gray-800">₹ {discountedUnitPrice.toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-emerald-50 rounded-xl border border-emerald-100">
                <span className="font-bold text-emerald-800">Total Amount (INR):</span>
                <span className="font-bold text-emerald-600">₹ {amountInINR.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}