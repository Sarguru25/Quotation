"use client";
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import PneumaticActuators from './pneumatic_actuators';
import ElectricActuator from './electric_actuator';
import Accessories from './accessories';
import QuotationProducts from './QuotationProducts';

export default function CustomPage() {
  const [activeTab, setActiveTab] = useState('pneumatic');
  const [products, setProducts] = useState([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [editProduct, setEditProduct] = useState(null);
  const router = useRouter();

  useEffect(() => {
    try {
      const cachedProducts = localStorage.getItem("quotation_products_cache");
      if (cachedProducts) {
        setProducts(JSON.parse(cachedProducts));
      }
    } catch (error) {
      console.error("Failed to load products from cache", error);
    }
    setIsLoaded(true);
  }, []);

  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem("quotation_products_cache", JSON.stringify(products));
    }
  }, [products, isLoaded]);

  const handleSaveProduct = (product) => {
    if (editProduct) {
      setProducts(prev => prev.map(p => p.id === product.id ? product : p));
      setEditProduct(null);
    } else {
      setProducts(prev => [...prev, product]);
    }
  };

  const handleEdit = (prod) => {
    setEditProduct(prod);
    if (prod.productCategory === 'Pneumatic Actuator') setActiveTab('pneumatic');
    else if (prod.productCategory === 'Electric Actuator') setActiveTab('electric');
    else if (prod.productCategory === 'Accessories') setActiveTab('accessories');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleRemove = (id) => {
    setProducts(products.filter(p => p.id !== id));
    if (editProduct?.id === id) setEditProduct(null);
  };

  const convertToQuotation = () => {
    if (products.length === 0) return;
    const quotationItems = products.map((prod) => {
      let description = prod.description || "";
      return {
        item_id: "",
        name: prod.productCategory,
        description: description,
        quantity: prod.quantity,
        rate: prod.discountedUnitPrice,
        tax_id: "",
        tax_percentage: 0
      };
    });
    localStorage.setItem("pending_quotation_items", JSON.stringify(quotationItems));
    router.push("/dashboard/quotations?new=true");
  };

  if (!isLoaded) return null;

  return (
    <div className="container mx-auto p-4 sm:p-6 bg-gray-50/50 min-h-screen font-sans">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Custom Configuration</h1>
          <p className="text-gray-500 text-sm">Build your dynamic quotation items</p>
        </div>
      </div>

      {/* SEGMENTED CONTROL */}
      <div className="mb-8 w-full overflow-x-auto">
        <div className="inline-flex bg-gray-200/60 p-1.5 rounded-2xl gap-2 min-w-max">
          <button 
            onClick={() => { setActiveTab('pneumatic'); setEditProduct(null); }}
            className={`px-6 py-2.5 rounded-xl text-sm font-semibold transition-all ${activeTab === 'pneumatic' ? 'bg-white text-gray-800 shadow-sm' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-200/80'}`}
          >
            pneumatic_actuators
          </button>
          <button 
            onClick={() => { setActiveTab('electric'); setEditProduct(null); }}
            className={`px-6 py-2.5 rounded-xl text-sm font-semibold transition-all ${activeTab === 'electric' ? 'bg-white text-gray-800 shadow-sm' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-200/80'}`}
          >
            electric_actuator
          </button>
          <button 
            onClick={() => { setActiveTab('accessories'); setEditProduct(null); }}
            className={`px-6 py-2.5 rounded-xl text-sm font-semibold transition-all ${activeTab === 'accessories' ? 'bg-white text-gray-800 shadow-sm' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-200/80'}`}
          >
            accessories
          </button>
        </div>
      </div>

      {/* DYNAMIC COMPONENT RENDER */}
      <div className="mb-8">
        {activeTab === 'pneumatic' && (
          <PneumaticActuators 
            onSave={handleSaveProduct} 
            editProduct={editProduct} 
            onCancel={() => setEditProduct(null)} 
          />
        )}
        
        {activeTab === 'electric' && (
          <ElectricActuator 
            onSave={handleSaveProduct} 
            editProduct={editProduct} 
            onCancel={() => setEditProduct(null)} 
          />
        )}

        {activeTab === 'accessories' && (
          <Accessories 
            onSave={handleSaveProduct} 
            editProduct={editProduct} 
            onCancel={() => setEditProduct(null)} 
          />
        )}
      </div>

      {/* STATIC QUOTATION PRODUCTS TABLE */}
      <QuotationProducts 
        products={products}
        onEdit={handleEdit}
        onRemove={handleRemove}
        onConvert={convertToQuotation}
        editProductId={editProduct?.id}
      />
    </div>
  );
}