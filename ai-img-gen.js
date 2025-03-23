const promptbtn = document.querySelector(".dice-icon");
const  promptspace = document.querySelector(".prompttext");
const promptform = document.querySelector(".promptform");
const model = document.getElementById("model-select");
const imgcount = document.getElementById("count-select");
const imgratio = document.getElementById("ratio-select");
const gridgallary = document.querySelector(".gallery-grid");
const genbtn = document.querySelector(".gen-btn");
const api_key = "";

const exampleprompts = [
    "A magic forest with glowing plants and fairy homes among giant mushrooms",
    "A futuristic city at sunset with flying cars, neon signs, and towering skyscrapers.",
    "A medieval knight fighting a fire-breathing dragon on a rocky mountain.",
    "A cozy cottage in the woods surrounded by colorful autumn leaves and a small stream.",
    "An astronaut floating in deep space, gazing at a distant galaxy.",
    "A cyberpunk-inspired street with glowing billboards, rain-soaked roads, and mysterious figures.",
    "A giant panda wearing sunglasses, sitting on a beach with a coconut drink",
    "A magical library with floating books and glowing runes on the walls.",
    "An ancient temple hidden in the jungle, covered in vines and guarded by stone statues.",
    "A futuristic warrior in a high-tech exosuit, standing on a battlefield.",
    "A peaceful underwater scene with a mermaid, coral reefs, and colorful fish swimming around.",
]

promptbtn.addEventListener("click", ()=>{
    let prompt = exampleprompts[Math.floor(Math.random()*exampleprompts.length)];
    promptspace.value = prompt;
    // promptspace.focus();
});

const getimgdimensions = (selectimgratio , basesize=512)=>{

    const [width,height] = selectimgratio.split("/").map(Number);
    const scalefactor = basesize / Math.sqrt(width*height); 

    let calculatewidth = Math.round(width * scalefactor);
    let calculateheight = Math.round(width * scalefactor); 

    calculatewidth = Math.floor(calculatewidth/16)*16;
    calculateheight = Math.floor(calculateheight/16)*16; 

    return {width :calculatewidth, height:calculateheight}

};

const updateimgcard = (imgidx,imgurl)=> {
    const imgcard = document.getElementById(`img-card-${imgidx}`);
    imgcard.classList.remove("spinner-border");
    imgcard.innerHTML=`<img src="${imgurl}" class="result-img">
                                <div class="img-overlay">
                                    <a href="${imgurl}" class="img-download-btn" download="${Date.now()}.png">
                                        <i class="fa-solid fa-download"></i>
                                    </a>
                                </div>`;
};

const generateImage = async(selectmodel, selectimgcount,selectimgratio, prompttext)=>{

    let pera = document.createElement("p");
    pera.textContent="";
    pera.style.color="red";
    const model_url = `https://router.huggingface.co/hf-inference/models/${selectmodel}`;

    const {width , height} = getimgdimensions(selectimgratio);

    genbtn.setAttribute("disabled","true");
    genbtn.style.backgroundColor = "grey";

    const imgpromise = Array.from({length:selectimgcount},async(_,i) => {
        try{
            const  response = await fetch(model_url,{

                headers: {
                    Authorization: `Bearer ${api_key}`,
                    "Content-Type": "application/json",
                    
                },
                method: "POST",
                body: JSON.stringify({
                    inputs:prompttext,
                    parameters :{width,height},
                    options : { wait_for_model : true, user_cache : false},
                }),

            });

            if(!response.ok) throw new Error((await response.json())?.error);

            const result = await response.blob();
            updateimgcard(i, URL.createObjectURL(result));

        }
        catch(error){
            console.log(error);
            const imgcard = document.getElementById(`img-card-${i}`);
            imgcard.classList.remove("spinner-border"); 
            pera.textContent ="Generation failed ! check console...";
            gridgallary.appendChild(pera);
        }
    });

    await Promise.allSettled(imgpromise);
    genbtn.removeAttribute("disabled");
    genbtn.style.backgroundColor = "rgb(34, 34, 120)";

}




const createimgcards=(selectmodel, selectimgcount,selectimgratio, prompttext)=>{

     gridgallary.innerHTML="";
    for(let i=0 ; i<selectimgcount ; i++){
           gridgallary.innerHTML += `
                                    <div class="img-card spinner-border" role="status" id="img-card-${i}" style="aspect-ratio:${selectimgratio}">                                  
                                            <span class="sr-only">Loading...</span>                                                                             
                                    </div>`
    }
    generateImage(selectmodel, selectimgcount,selectimgratio, prompttext);
};

promptform.addEventListener("submit",(e)=>{
    e.preventDefault();
    if(promptspace.value===""){
        alert("enter image description !");
        return;
    }
    const selectmodel = model.value;
    const selectimgcount =parseInt(imgcount.value)||1; 
    const selectimgratio = imgratio.value || "1/1";
    const prompttext = promptspace.value;
    createimgcards(selectmodel, selectimgcount,selectimgratio, prompttext);
});