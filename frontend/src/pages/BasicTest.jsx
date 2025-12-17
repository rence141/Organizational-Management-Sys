export default function BasicTest() {
  return (
    <div style={{ 
      padding: '40px', 
      backgroundColor: 'yellow', 
      minHeight: '100vh',
      fontSize: '32px',
      color: 'black'
    }}>
      <h1>BASIC TEST PAGE</h1>
      <p>If you can see this, React routing is working!</p>
      <div style={{ marginTop: '20px', fontSize: '20px' }}>
        Current time: {new Date().toLocaleTimeString()}
      </div>
    </div>
  );
}
