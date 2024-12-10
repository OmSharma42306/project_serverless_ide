export async function installDependencies (){
    const installProcess = await webcontainerInstance.spawn('npm',['install']);
    return installProcess.exit;
}