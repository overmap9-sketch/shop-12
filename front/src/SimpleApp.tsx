import React from 'react';

function SimpleApp() {
  console.log('🎨 Simple App rendering...');
  
  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h1 style={{ color: '#007bff' }}>🎉 EcoShop eCommerce App</h1>
      <p>The app is working! This is a simple test render.</p>
      <div style={{ background: '#f8f9fa', padding: '15px', marginTop: '20px', borderRadius: '8px' }}>
        <p><strong>✅ App Status:</strong> Successfully loaded and rendering</p>
        <p><strong>🚀 Framework:</strong> React + TypeScript + Vite</p>
        <p><strong>🎯 Architecture:</strong> Feature-Sliced Design</p>
      </div>
    </div>
  );
}

export default SimpleApp;
