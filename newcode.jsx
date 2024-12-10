import { WebContainer } from '@webcontainer/api';
import { files } from './files';
import { useEffect, useRef } from 'react';

function App() {
  const textareaRef = useRef(null);
  const iframeRef = useRef(null);
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
        }
      }));

      // Listen for server-ready event
      webcontainerInstance.on('server-ready', (port, url) => {
        console.log(`Server ready on port ${port}, URL: ${url}`);
        iframeRef.current.src = url; // Update the iframe with the server URL
      });
    }

    initWebContainer().catch((error) => console.error('Error initializing WebContainer:', error));
  }, []);

  return (
    <>
      <h1>WebContainer App</h1>
      <div>
        <textarea ref={textareaRef} id="textareaE1" style={{ width: '100%', height: '200px' }}></textarea>
      </div>
      <div>
        <iframe ref={iframeRef} id="iframeE1" style={{ width: '100%', height: '500px' }}></iframe>
      </div>
    </>
  );
}

export default App;
