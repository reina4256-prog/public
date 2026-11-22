'use strict';
document.querySelector('form').onsubmit=async event=>{event.preventDefault();const input=document.getElementById('key'),button=document.querySelector('button'),status=document.getElementById('status');
    button.disabled=true;let key=input.value.trim();input.value='';
    try{const result=await window.voiceSetup.save(key),ok=result?.ok===true;
        const errors={format:'Paste the complete API key using its Copy button in AI Studio (not the key name or a link).',encryption:'Windows encryption is unavailable. Close this window and reopen voice setup under your usual Windows account.',storage:'Could not write the encrypted key. Check available disk space and folder permissions, then try again.',window:'This setup window could not be verified. Close it and reopen voice setup.'};
        status.textContent=ok?'Saved. Close this window, then restart the game.':(errors[result?.error]||'Could not save. Please reopen voice setup and try again.');if(ok)input.disabled=true;else button.disabled=false;}
    catch(_){status.textContent='Could not save. Please try again.';button.disabled=false;}finally{key='';}
};
