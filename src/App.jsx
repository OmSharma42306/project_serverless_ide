import { WebContainer } from '@webcontainer/api';
import { files } from './files';
import { useEffect, useRef, useState } from 'react';

function App() {
  const textareaRef = useRef(null); // Reference to the textarea
  const iframeRef = useRef(null); // Reference to the iframe
  const [terminalOutput, setTerminalOutput] = useState(''); // To store terminal logs
  let webcontainerInstance;

  useEffect(() => {
    async function initWebContainer() {
      // Populate the textarea with the initial content of 'index.js'
      textareaRef.current.value = files['index.js'].file.contents;

      // Boot the WebContainer instance
      webcontainerInstance = await WebContainer.boot();

      // Mount the file system
      await webcontainerInstance.mount(files);

      // Install dependencies (make sure you listen for output before waiting for the process to finish)
      const installProcess = await webcontainerInstance.spawn('npm', ['install']);
      
      // Capture install logs
      installProcess.output.pipeTo(new WritableStream({
        write(data) {
          console.log('[npm install log]:', data);
          setTerminalOutput(prevOutput => prevOutput + '\n' + data);
        }
      }));

      const responseCode = await installProcess.exit;
      console.log('Install process exited with code:', responseCode);

      if (responseCode !== 0) {
        throw new Error('Installation failed');
      }

      // Start the development server
      const startProcess = await webcontainerInstance.spawn('npm', ['run', 'start']);

      // Capture server logs
      startProcess.output.pipeTo(new WritableStream({
        write(data) {
          console.log('[npm start log]:', data);
          setTerminalOutput(prevOutput => prevOutput + '\n' + data);
        }
      }));

      // Listen for server-ready event and update iframe source
      webcontainerInstance.on('server-ready', (port, url) => {
        console.log(`Server ready on port ${port}, URL: ${url}`);
        iframeRef.current.src = url; // Update iframe source
      });
    }

    initWebContainer().catch((error) => console.error('Error initializing WebContainer:', error));
  }, []);

  return (
    <div className="container">
      <h1>WebContainer React App</h1>

      {/* Main Editor / Preview layout */}
      <div className="editor-preview">
        <div className="editor">
          <h3>Editor</h3>
          <textarea ref={textareaRef} id="textareaE1" style={{ width: '100%', height: '200px' }}></textarea>
        </div>

        <div className="preview">
          <h3>Preview</h3>
          <iframe ref={iframeRef} id="iframeE1" src="loading.html" style={{ width: '100%', height: '400px' }}></iframe>
        </div>
      </div>

      {/* Terminal Section */}
      <div className="terminal">
        <h3>Terminal</h3>
        <pre style={{ backgroundColor: '#000', color: '#0f0', padding: '10px', height: '200px', overflowY: 'scroll' }}>
          {terminalOutput}
        </pre>
      </div>
    </div>
  );
}

export default App;
