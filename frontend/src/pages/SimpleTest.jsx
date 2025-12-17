export default function SimpleTest() {
  return (
    <div className="p-8 bg-slate-50 min-h-screen">
      <h1 className="text-3xl font-bold text-slate-900 mb-4">Simple Test Page</h1>
      <p className="text-slate-600 mb-4">This is a basic test to verify React is working.</p>
      
      <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200">
        <h2 className="text-xl font-semibold mb-3">Add Organization Test</h2>
        <button className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700 transition-colors">
          Test Button
        </button>
      </div>
      
      <div className="mt-6 bg-green-50 p-4 rounded-lg border border-green-200">
        <h3 className="text-green-800 font-semibold mb-2">✅ Frontend Working</h3>
        <p className="text-green-600">If you can see this page, the React frontend is working correctly.</p>
      </div>
    </div>
  );
}
