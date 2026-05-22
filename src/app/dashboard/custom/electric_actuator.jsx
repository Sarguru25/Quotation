"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { Plus, RefreshCw, Trash2, Edit2, Settings, Archive, ChevronDown, CheckCircle2, Zap, PackagePlus, FileText } from "lucide-react";
import { useRouter } from "next/navigation";
// Database data will be fetched inside the component

export default function ElectricActuator({ onSave, editProduct, onCancel }) {

  // ========== INPUT FIELDS (User entries) ==========
  const [actuator, setActuator] = useState("ZREQT");
  const [turnType, setTurnType] = useState("Quarter Turn");
  const [operatingType, setOperatingType] = useState("Switch Type");
  const [torque, setTorque] = useState("");
  const [currentType, setCurrentType] = useState("AC");
  const [acType, setAcType] = useState("Single Phase");
  const [voltage, setVoltage] = useState("");
  const [frequency, setFrequency] = useState("50Hz");

  // NEW FIELDS
  const [enclosureRating, setEnclosureRating] = useState("IP67");
  const [temperature, setTemperature] = useState("");
  const [manualOperation, setManualOperation] = useState("");
  const [torqueSwitch, setTorqueSwitch] = useState("");
  const [limitSwitch, setLimitSwitch] = useState("ON/OFF");
  const [mountingBase, setMountingBase] = useState("");
  const [stemDia, setStemDia] = useState("");
  
  const [quantity, setQuantity] = useState(1);
  const [discount, setDiscount] = useState(0);

  // ========== OUTPUT FIELDS ==========
  const [outputProduct, setOutputProduct] = useState("Electric Actuator");
  const [outputModel, setOutputModel] = useState("");
  const [outputTorque, setOutputTorque] = useState(0);
  const [outputVoltage, setOutputVoltage] = useState("");
  const [outputActuatorUnitPrice, setOutputActuatorUnitPrice] = useState(0);
  const [outputUsdPrice, setOutputUsdPrice] = useState(0);

  // ========== DROPDOWN OPTIONS ==========
  const actuatorOptions = ["ZREQT", "ZREQM"];
  const turnTypeOptions = ["Quarter Turn", "Multi Turn"];
  const operatingTypeOptions = ["Switch Type", "Modulating", "Intelligent", "Super Intelligent"];
  const currentTypeOptions = ["AC", "DC"];
  const acTypeOptions = ["Single Phase", "Three Phase"];
  const enclosureOptions = ["IP67", "IP68"];
  const limitSwitchOptions = ["ON/OFF", "SPDT 250V AC 10A"];

  // ========== DATABASE DATA ==========
  const [dbZreqt, setDbZreqt] = useState([]);
  const [dbZreqm, setDbZreqm] = useState([]);
  const [isLoadingData, setIsLoadingData] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoadingData(true);
        const [zreqtRes, zreqmRes] = await Promise.all([
          fetch('/api/zreqt-prices'),
          fetch('/api/zreqm-prices')
        ]);
        const zreqtJson = await zreqtRes.json();
        const zreqmJson = await zreqmRes.json();

        if (zreqtJson.success) setDbZreqt(zreqtJson.data);
        if (zreqmJson.success) setDbZreqm(zreqmJson.data);
      } catch (err) {
        console.error('Failed to fetch data', err);
      } finally {
        setIsLoadingData(false);
      }
    };
    fetchData();
  }, []);

  // SELECT DATABASE DATA
  const selectedJson = useMemo(() => {
    return actuator === "ZREQT" ? dbZreqt : dbZreqm;
  }, [actuator, dbZreqt, dbZreqm]);

  // OPERATING TYPE DATA
  const operationData = useMemo(() => {
    return selectedJson.filter(item => item.category === operatingType) || [];
  }, [selectedJson, operatingType]);

  // UNIQUE TORQUE VALUES
  const torqueOptions = useMemo(() => {
    return [...new Set(operationData.map((item) => item.torque_nm))].sort((a, b) => Number(a) - Number(b));
  }, [operationData]);

  const voltageOptions = useMemo(() => {
    if (currentType === "DC") return ["D C24V"];
    if (currentType === "AC") {
      if (acType === "Single Phase") return ["AC 24V", "AC 110V", "AC 220V"];
      if (acType === "Three Phase") return ["AC 380V", "AC 440V"];
    }
    return [];
  }, [currentType, acType]);

  const frequencyOptions = useMemo(() => {
    return actuator === "ZREQM" ? ["50Hz", "60Hz"] : ["50Hz"];
  }, [actuator]);

  // Dynamic Options for new fields
  const temperatureOptions = useMemo(() => {
    if (actuator === "ZREQM") return ["-25°C to +70°C"];
    return ["-25 oC to + 70oC", "-30 oC to + 70oC", "-40 oC to + 70oC"];
  }, [actuator]);

  const manualOperationOptions = useMemo(() => {
    if (actuator === "ZREQM") {
      if (outputModel === "ZREQM 06" || outputModel === "ZREQM 10" || outputModel === "ZREQM 16" || outputModel === "ZREQM 20" || outputModel === "ZREQM 30" || outputModel === "ZREQM 50" || outputModel === "ZREQM 60") {
        return ["manual clutch", "automatic clutch"];
      } else {
        return ["no clutch"];
      }
    }
    return ["Allen key", "handwheel"];
  }, [actuator]);

  const torqueSwitchOptions = useMemo(() => {
    if (actuator === "ZREQM") {
      if (outputModel === "ZREQM 06" || outputModel === "ZREQM 10") {
        return ["ON/OFF"];
      } else {
        return ["ON/OFF", "SPDT 250V AC 10A"];
      }
    }
    return ["-"];
  }, [actuator]);

  const mountingBaseOptions = useMemo(() => {
    if (actuator === "ZREQM") {
      return [
        "ISO 5211 with F05/F07",
        "ISO 5211 with F07/F10",
        "ISO 5211 with F10/F12",
        "ISO 5211 with F10/F12 /F14",
        "ISO 5211 with F12/F14 /F16",
        "ISO 5211 with F14/F16",
        "ISO 5211 with F16/F25",
        "ISO 5211 with F25/F30"
      ];
    }
    return [
      "ISO 5211 with F03/F05",
      "ISO 5211 with F03/F05/F07",
      "ISO 5211 with F05/F07/F10",
      "ISO 5211 with F07/F10",
      "ISO 5211 with F07/F10/F12",
      "ISO 5211 with F10/F12/F14/F16",
      "ISO 5211 with F14/F16",
      "ISO 5211 with F16/F25"
    ];
  }, [actuator]);

  // Handle cascading clears
  useEffect(() => {
    if (!frequencyOptions.includes(frequency)) setFrequency(frequencyOptions[0] || "");
    if (!temperatureOptions.includes(temperature)) setTemperature(temperatureOptions[0] || "");
    if (!manualOperationOptions.includes(manualOperation)) setManualOperation(manualOperationOptions[0] || "");
    if (!torqueSwitchOptions.includes(torqueSwitch)) setTorqueSwitch(torqueSwitchOptions[0] || "");
    if (!mountingBaseOptions.includes(mountingBase)) setMountingBase(mountingBaseOptions[0] || "");
  }, [actuator, frequencyOptions, frequency, temperatureOptions, manualOperationOptions, torqueSwitchOptions, mountingBaseOptions, temperature, manualOperation, torqueSwitch, mountingBase]);

  // ACTUATOR MATCHING
  const matchedProduct = useMemo(() => {
    let products = [...operationData];

    if (torque) {
      products = products.filter((item) => Number(item.torque_nm) === Number(torque));
    }

    if (voltage) {
      products = products.filter((item) => {
        if (!item.voltage) return true;
        return item.voltage.some((v) => v.toLowerCase().includes(voltage.toLowerCase()));
      });
    }

    return products.length > 0 ? products[0] : null;
  }, [operationData, torque, voltage]);

  // ========== RECALCULATE FUNCTION ==========
  const recalculateOutputs = useCallback(() => {
    if (matchedProduct) {
      setOutputModel(matchedProduct.model || "");
      setOutputTorque(matchedProduct.torque_nm || 0);
      setOutputVoltage(voltage || (matchedProduct.voltage ? matchedProduct.voltage[0] : ""));
      setOutputActuatorUnitPrice(matchedProduct.list_price_inr || 0);
      setOutputUsdPrice(matchedProduct.list_price_usd || 0);
    } else {
      setOutputModel("");
      setOutputTorque(0);
      setOutputVoltage("");
      setOutputActuatorUnitPrice(0);
      setOutputUsdPrice(0);
    }
    setOutputProduct("Electric Actuator");
  }, [matchedProduct, voltage]);

  useEffect(() => {
    recalculateOutputs();
  }, [recalculateOutputs]);

  // ========== PRICING ==========
  const unitPriceTotal = outputActuatorUnitPrice;
  const discountAmount = (unitPriceTotal * (parseFloat(discount) || 0)) / 100;
  const discountedUnitPrice = unitPriceTotal - discountAmount;
  const amountInINR = quantity * discountedUnitPrice;

  // Populate from editProduct
  useEffect(() => {
    if (editProduct && editProduct.productCategory === 'Electric Actuator') {
      setActuator(editProduct.actuator || "ZREQT");
      setTurnType(editProduct.turnType || "Quarter Turn");
      setOperatingType(editProduct.operatingType || "Switch Type");
      setTorque(editProduct.torque || "");
      setCurrentType(editProduct.currentType || "AC");
      setAcType(editProduct.acType || "Single Phase");
      setVoltage(editProduct.voltage || "");
      setFrequency(editProduct.frequency || "50Hz");
      setEnclosureRating(editProduct.enclosureRating || "IP67");
      setTemperature(editProduct.temperature || "");
      setManualOperation(editProduct.manualOperation || "");
      setTorqueSwitch(editProduct.torqueSwitch || "");
      setLimitSwitch(editProduct.limitSwitch || "ON/OFF");
      setMountingBase(editProduct.mountingBase || "");
      setStemDia(editProduct.stemDia || "");
      setQuantity(editProduct.quantity || 1);
      setDiscount(editProduct.discount || 0);
    }
  }, [editProduct]);

  const addToQuotation = () => {
    const description = `Model = ${outputModel}\nTorque = ${outputTorque} Nm\nOperating Type = ${operatingType}\nVoltage = ${voltage}\nFrequency = ${frequency}\nActuator Type = ${actuator}\nEnclosure Rating = ${enclosureRating}\nTemperature = ${temperature}\nManual Operation = ${manualOperation}\nTorque Switch = ${torqueSwitch}\nLimit Switch = ${limitSwitch}\nMounting Base = ${mountingBase}\nStem Dia = ${stemDia}`;

    const newProduct = {
      id: editProduct ? editProduct.id : Date.now(),
      productCategory: 'Electric Actuator',
      description,
      detailsSummary: `Actuator: ${actuator}, Torque: ${torque} Nm\nVoltage: ${voltage}, Freq: ${frequency}`,
      actuator,
      turnType,
      operatingType,
      torque,
      currentType,
      acType,
      voltage,
      frequency,
      enclosureRating,
      temperature,
      manualOperation,
      torqueSwitch,
      limitSwitch,
      mountingBase,
      stemDia,
      quantity,
      discount: parseFloat(discount) || 0,
      discountAmount,
      discountedUnitPrice,

      productType: outputProduct,
      model: outputModel,
      outputTorque,
      unitPriceTotal,
      amountInINR,
    };

    onSave(newProduct);
    
    if (!editProduct) {
      setDiscount(0);
      setStemDia("");
    }
  };

  // Styling Variables
  const selectClass = "appearance-none w-full bg-gray-50 border border-gray-200 text-gray-700 py-2.5 px-4 pr-8 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all text-sm";
  const inputClass = "w-full bg-gray-50 border border-gray-200 text-gray-700 py-2.5 px-4 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all text-sm";
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
                <label className={labelClass}>Electric Actuator</label>
                <div className="relative">
                  <select value={actuator} onChange={(e) => setActuator(e.target.value)} className={selectClass}>
                    {actuatorOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                  </select>
                  <ChevronDown className="absolute right-3 top-3.5 w-4 h-4 text-gray-400 pointer-events-none" />
                </div>
              </div>
              
              <div>
                <label className={labelClass}>Type</label>
                <div className="relative">
                  <select value={turnType} onChange={(e) => setTurnType(e.target.value)} className={selectClass}>
                    {turnTypeOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                  </select>
                  <ChevronDown className="absolute right-3 top-3.5 w-4 h-4 text-gray-400 pointer-events-none" />
                </div>
              </div>
              
              <div>
                <label className={labelClass}>Operating Type</label>
                <div className="relative">
                  <select value={operatingType} onChange={(e) => setOperatingType(e.target.value)} className={selectClass}>
                    {operatingTypeOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                  </select>
                  <ChevronDown className="absolute right-3 top-3.5 w-4 h-4 text-gray-400 pointer-events-none" />
                </div>
              </div>
              
              <div>
                <label className={labelClass}>Torque (Nm)</label>
                <div className="relative">
                  <select value={torque} onChange={(e) => setTorque(e.target.value)} className={selectClass}>
                    <option value="">Select Torque</option>
                    {torqueOptions.map(opt => <option key={opt} value={opt}>{opt} Nm</option>)}
                  </select>
                  <ChevronDown className="absolute right-3 top-3.5 w-4 h-4 text-gray-400 pointer-events-none" />
                </div>
              </div>
              
              <div>
                <label className={labelClass}>Current Type</label>
                <div className="relative">
                  <select value={currentType} onChange={(e) => { setCurrentType(e.target.value); setVoltage(""); }} className={selectClass}>
                    {currentTypeOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                  </select>
                  <ChevronDown className="absolute right-3 top-3.5 w-4 h-4 text-gray-400 pointer-events-none" />
                </div>
              </div>
              
              {currentType === "AC" && (
                <div>
                  <label className={labelClass}>AC Configuration</label>
                  <div className="relative">
                    <select value={acType} onChange={(e) => { setAcType(e.target.value); setVoltage(""); }} className={selectClass}>
                      {acTypeOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                    </select>
                    <ChevronDown className="absolute right-3 top-3.5 w-4 h-4 text-gray-400 pointer-events-none" />
                  </div>
                </div>
              )}
              
              <div>
                <label className={labelClass}>Voltage</label>
                <div className="relative">
                  <select value={voltage} onChange={(e) => setVoltage(e.target.value)} className={selectClass}>
                    <option value="">Select Voltage</option>
                    {voltageOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                  </select>
                  <ChevronDown className="absolute right-3 top-3.5 w-4 h-4 text-gray-400 pointer-events-none" />
                </div>
              </div>
              
              <div>
                <label className={labelClass}>Frequency</label>
                <div className="relative">
                  <select value={frequency} onChange={(e) => setFrequency(e.target.value)} className={selectClass}>
                    {frequencyOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                  </select>
                  <ChevronDown className="absolute right-3 top-3.5 w-4 h-4 text-gray-400 pointer-events-none" />
                </div>
              </div>

              {/* NEW FIELDS */}
              <div>
                <label className={labelClass}>Enclosure Rating</label>
                <div className="relative">
                  <select value={enclosureRating} onChange={(e) => setEnclosureRating(e.target.value)} className={selectClass}>
                    {enclosureOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                  </select>
                  <ChevronDown className="absolute right-3 top-3.5 w-4 h-4 text-gray-400 pointer-events-none" />
                </div>
              </div>

              <div>
                <label className={labelClass}>Temperature</label>
                <div className="relative">
                  <select value={temperature} onChange={(e) => setTemperature(e.target.value)} className={selectClass}>
                    {temperatureOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                  </select>
                  <ChevronDown className="absolute right-3 top-3.5 w-4 h-4 text-gray-400 pointer-events-none" />
                </div>
              </div>

              <div>
                <label className={labelClass}>Manual Operation</label>
                <div className="relative">
                  <select value={manualOperation} onChange={(e) => setManualOperation(e.target.value)} className={selectClass}>
                    {manualOperationOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                  </select>
                  <ChevronDown className="absolute right-3 top-3.5 w-4 h-4 text-gray-400 pointer-events-none" />
                </div>
              </div>
              {actuator == "ZREQM" && (
              <div>
                <label className={labelClass}>Torque Switch</label>
                <div className="relative">
                  <select value={torqueSwitch} onChange={(e) => setTorqueSwitch(e.target.value)} className={selectClass}>
                    {torqueSwitchOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                  </select>
                  <ChevronDown className="absolute right-3 top-3.5 w-4 h-4 text-gray-400 pointer-events-none" />
                </div>
              </div>
               )}

              <div>
                <label className={labelClass}>Limit Switch</label>
                <div className="relative">
                  <select value={limitSwitch} onChange={(e) => setLimitSwitch(e.target.value)} className={selectClass}>
                    {limitSwitchOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                  </select>
                  <ChevronDown className="absolute right-3 top-3.5 w-4 h-4 text-gray-400 pointer-events-none" />
                </div>
              </div>

              <div>
                <label className={labelClass}>Mounting Base</label>
                <div className="relative">
                  <select value={mountingBase} onChange={(e) => setMountingBase(e.target.value)} className={selectClass}>
                    {mountingBaseOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                  </select>
                  <ChevronDown className="absolute right-3 top-3.5 w-4 h-4 text-gray-400 pointer-events-none" />
                </div>
              </div>

              <div>
                <label className={labelClass}>Stem Dia</label>
                <input type="text" value={stemDia} onChange={(e) => setStemDia(e.target.value)} className={inputClass} placeholder="Custom input" />
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
                { label: "Model", val: outputModel, setter: setOutputModel },
                { label: "Voltage", val: outputVoltage, setter: setOutputVoltage },
              ].map((item, idx) => (
                <div key={idx} className="flex flex-col">
                  <label className="font-medium text-gray-600 text-xs mb-1">{item.label}</label>
                  <input type="text" value={item.val} onChange={(e) => item.setter(e.target.value)} className="bg-gray-50 border border-gray-200 p-2 rounded-lg text-gray-800 focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 outline-none transition-all" />
                </div>
              ))}
              
              {[
                { label: "Output Torque (Nm)", val: outputTorque, setter: setOutputTorque },
                { label: "Actuator Price (₹)", val: outputActuatorUnitPrice, setter: setOutputActuatorUnitPrice },
                { label: "USD Price ($)", val: outputUsdPrice, setter: setOutputUsdPrice },
              ].map((item, idx) => (
                <div key={idx} className="flex flex-col">
                  <label className="font-medium text-gray-600 text-xs mb-1">{item.label}</label>
                  <input type="number" step="any" value={item.displayVal ?? item.val} onChange={(e) => item.setter(parseFloat(e.target.value) || 0)} className="bg-white border border-emerald-200 p-2 rounded-lg font-semibold text-emerald-800 focus:ring-2 focus:ring-emerald-500/50 outline-none transition-all" />
                </div>
              ))}
            </div>

            <div className="mt-6 pt-5 border-t border-gray-100 space-y-3">
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