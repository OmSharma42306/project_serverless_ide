export const files = {
    "index.js": {
      file: {
        contents: `
              import express from "express";
              const app = express();
              const port = 3111;
  
              app.get('/',(req,res) => {
              return res.send({msg:"Welcome to Om Sharma's Web Container."})
              
              app.listen(port,()=>{
              console.log(\` Server is Running on PORT : \${port}\`)})
              })
              `,
      },
    },
    "package.json": {
      file: {
        contents: `
                  {
    "name": "example-app",
    "type": "module",
    "dependencies": {
      "express": "latest",
      "nodemon": "latest"
    },
    "scripts": {
      "start": "nodemon --watch './' index.js"
    }
  }
              
              `,
      },
    },
  };
  