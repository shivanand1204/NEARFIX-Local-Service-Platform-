import React from 'react';

const SimpleTestLogin = () => {
  const handleClick = () => {
    console.log('Test button clicked!');
    alert('Button clicked! Fetching...');
    fetch('http://localhost:5000/api/user/login', {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({email: 'tushar@gmail.com', password: '7654321'})
    }).then(res => res.json()).then(data => alert('Response: ' + JSON.stringify(data)))
    .catch(err => alert('Error: ' + err));
  };

  return (
    <div style={{padding: '50px', background: 'white'}}>
      <button onClick={handleClick} style={{padding: '10px 20px', fontSize: '20px'}}>Test Login Fetch</button>
      <p>Open F12 Console for errors / Network tab.</p>
    </div>
  );
};

export default SimpleTestLogin;
