const dropList = document.querySelectorAll("select");
const fromSelect = document.querySelector(".from select");
const toSelect = document.querySelector(".to select");
var conversionRate;
var conversionResult;

for(let i=0; i<dropList.length; i++){
    for(currency_code in country_list){
        let optionTag = `<option value="${currency_code}">${currency_code}</option>`;
        dropList[i].insertAdjacentHTML("beforeend", optionTag);
    }
    dropList[i].addEventListener("change", e => {
        loadFlag(e.target);
        getExchangeRate();
        document.querySelector(".exchange-rate p").innerHTML = "Getting conversion rate...";
        setTimeout(() => {
            document.querySelector(".exchange-rate p").innerHTML = `${amount} ${fromCurrency} = ${conversionRate} ${toCurrency}`;
        }, 500);
    });
};

function loadFlag(element){
    for(code in country_list){
        if(code == element.value){
            let imgTag = element.parentElement.querySelector("img");
            imgTag.src = `https://flagsapi.com/${country_list[code]}/flat/64.png`;
        };
    };
};

document.querySelector("button").addEventListener("click", () => {
    getExchangeRate();
});

function getExchangeRate(){
    fromCurrency = fromSelect.value;
    toCurrency = toSelect.value;
    amount = document.querySelector("input").value;
    let url = `https://v6.exchangerate-api.com/v6/cfe6d1909d1c10c4a03bc890/pair/${fromCurrency}/${toCurrency}/${amount}`
    fetch(url).then(response => response.json()).then(result => {
        conversionRate = result.conversion_rate;
        conversionResult = result.conversion_result
        document.querySelector(".exchange-rate p").innerHTML = `${amount} ${fromCurrency} = ${conversionResult} ${toCurrency}`;
    });
};

document.querySelector(".icon").addEventListener("click", () => {
    let temp = fromSelect.value;
    fromSelect.value = toSelect.value;
    toSelect.value = temp;
    loadFlag(fromSelect);
    loadFlag(toSelect);
    getExchangeRate();
});

window.addEventListener('load', () => {
    if ('Notification' in window && Notification.permission === 'default') {
      showNotifyPrompt();
    }
  });
  
  function showNotifyPrompt() {
    // 2) Create a temporary banner
    const prompt = document.createElement('div');
    prompt.id = 'notifyPrompt';
    prompt.innerHTML = `
      <div class="install-container" style="display:block;">
        <div class="install-banner">
          <div class="install-content">
            <i class="bi bi-bell-fill"></i>
            <p>Enable notifications to get rate updates</p>
          </div>
          <div class="install-buttons">
            <button id="notifyDismiss" class="btn btn-sm btn-outline-light">No thanks</button>
            <button id="notifyAllow" class="btn btn-sm btn-light">Allow</button>
          </div>
        </div>
      </div>
    `;
    document.body.appendChild(prompt);
  
    // 3) Wire up the buttons
    document.getElementById('notifyAllow').addEventListener('click', async () => {
      // ask permission, then remove the prompt
      const permission = await Notification.requestPermission();
      console.log('Notification permission:', permission);
      prompt.remove();
    });
    document.getElementById('notifyDismiss').addEventListener('click', () => {
      // just remove, no future prompts this session
      prompt.remove();
    });
  }