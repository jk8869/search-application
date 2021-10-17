var timerId;
var searchHistoryList = localStorage.getItem('searchHistory') ?? [];
var searchHistoryElement = document.getElementById("list-history");
const input = document.querySelector('input');
const suggesstionList = document.getElementById("list-sugession");

const clearHistory = () => {
    localStorage.clear();
    searchHistoryElement.innerHTML = "";
    searchHistoryElement.style.display = "none";
    loadSearchHistory();
}

const clearHistoryItem = (id, el) => {            
    el.parentNode.remove();

    var removeIndex = searchHistoryList.map(item => item.id).indexOf(id);
    ~removeIndex && searchHistoryList.splice(removeIndex, 1);
    localStorage.setItem('searchHistory', JSON.stringify(searchHistoryList));
}

//sort history list by date desc to last item comes first
const sortSearchHistoryList = () => {
    searchHistoryList.sort((a, b) => b.date < a.date? -1: 1);
}

//load search history from local storage
const loadSearchHistory = () => {
    searchHistoryList = localStorage.getItem('searchHistory') ?? [];
    if(searchHistoryList.length > 0){
        searchHistoryList = JSON.parse(searchHistoryList);
        sortSearchHistoryList();
        let listItem = `<li>Search history<button id="clear-history" onclick="clearHistory()">Clear search history</button></li>`;
        searchHistoryList.map((item) => {
            listItem += `<li>${item.value}
                            <button class="clear-history-item" onclick="clearHistoryItem(${item.id}, this)"></button>
                            <time class="history-date">${item.date.slice(0, -3)}</time>
                        </li>`;
        });
        searchHistoryElement.innerHTML = listItem;
        searchHistoryElement.style.display = "block";
    }
}

//bold the current input in suggesion list
const boldString = (str, substr) => {
    let strRegExp = new RegExp(substr, 'g');
    return str.replace(strRegExp, '<b>'+substr+'</b>');
}

const addToSearchHistory = (value, id) => {
    let date = new Date();
    let dateString = date.getFullYear() 
                    + "-"+ (date.getMonth()+1) 
                    +"-"+ date.getDate() 
                    + " " +  date.toLocaleString('en-US', { hour: 'numeric', minute: 'numeric', hour12: true })
                    + " " + date.getSeconds();

    let historyObject = {
        id: id,
        value: value,
        date: dateString
    }
    searchHistoryList.push(historyObject);
    localStorage.setItem('searchHistory', JSON.stringify(searchHistoryList));
    loadSearchHistory();
}

//this is debouce function to reduce extra call to api
//we assume if user stop typing for 200ms then it is time fetch data
const debounceFunction = (func, delay) => {
    // Cancels the setTimeout method execution
    clearTimeout(timerId)

    // Executes the func after delay time.
    timerId  =  setTimeout(func, delay)
}

const fetchData = (e) => {            
    let xhr = new XMLHttpRequest();
    let userInput = e.target.value;
    xhr.open("GET", `https://gorest.co.in/public/v1/users?name=${e.target.value}`, true);
    xhr.onload = function(){
        let data = JSON.parse(xhr.responseText).data;                
        let listItem = "";
        data.map((item, index) => 
            listItem += `<li onclick="addToSearchHistory('${item.name}', ${item.id})">${boldString(item.name, userInput)}</li>`);
        suggesstionList.innerHTML = listItem;

        if(data == null || data.length == 0){
            suggesstionList.style.display = "none";
        }else{
            suggesstionList.style.display = "block";
        }
    };
    xhr.send();
}

input.addEventListener('input', (e) => debounceFunction(fetchData(e), 200));
input.addEventListener('focusin', loadSearchHistory);