export default function MinimalTest() {
  return (
    <div style={{ padding: '20px', backgroundColor: 'white', minHeight: '100vh' }}>
      <h1 style={{ color: 'blue', fontSize: '24px' }}>Minimal Test Page</h1>
      <p style={{ color: 'black', marginTop: '10px' }}>If you can see this, React is working.</p>
      <div style={{ marginTop: '20px', padding: '10px', backgroundColor: 'lightgray' }}>
        Current time: {new Date().toLocaleTimeString()}
      </div>
    </div>
  );
}
