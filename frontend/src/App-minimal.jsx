export default function AppMinimal() {
  return (
    <div style={{ 
      padding: '20px', 
      backgroundColor: 'lightgreen', 
      minHeight: '100vh',
      fontSize: '20px'
    }}>
      <h1>Minimal App Test - Working!</h1>
      <p>This is a test without ThemeProvider or Router.</p>
      <div style={{ marginTop: '20px', padding: '10px', backgroundColor: 'white' }}>
        If you can see this, the issue is with ThemeProvider or Router components.
      </div>
    </div>
  );
}
