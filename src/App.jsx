import { WebContainer } from '@webcontainer/api'
import { files } from './files';
function App() {
  let webcontainerInstance;

  window.addEventListener('load',async () => {
    textareaE1.value = files['index.js'].file.contents;

    webcontainerInstance = await WebContainer.boot();
    await webcontainerInstance.mount(files);
    // const packageJson = await webcontainerInstance.fs.readFile('package.json','utf-8');
    // console.log(packageJson);
    
    const installProcess = await webcontainerInstance.spawn('npm',['install']);
    const responceCode = await installProcess.exit;
    console.log(responceCode)
    if(responceCode !== 0){
      throw new Error('Installation Failed');
    }
    installProcess.output.pipeTo(new WritableStream({
      write(data){
        console.log(data);
      }
    }))  // install npm processed completed.

    // start of developement server.

    // run npm start to run 

    await webcontainerInstance.spawn('npm',['run','start']);

    // wait for server ready event!

    webcontainerInstance.on('server-ready',(port,url) => {
      textareaE1.src = url;
    })
    

  })

  return (
    <>
      hi
      <div>
        <textarea name="textareaE1" id="textareaE1"></textarea>
      </div>
    </>
  )
}

export default App
