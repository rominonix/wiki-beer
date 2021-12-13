//// HÄMTA INFO AV RANDOM BEER ////

async function getRandomBeer(url){
    const response = await fetch(url)
    const data = await response.json()
    return data[0]
}
//// NAVIGATION ////

function navLinks(){
    const links = document.querySelectorAll("nav > a")
    for (let link of links){
        link.addEventListener("click",()=>{
            const infoCard = document.querySelector(".info-card")
            infoCard.classList.remove("active")
            document.querySelectorAll("main > section").forEach(
                section => section.classList.remove("active")
            )
            const section = document.querySelector("." + link.id)
            section.classList.add("active")
            const homeCard = document.querySelector(".home-card")
            homeCard.classList.add("active")
        })
    }
}
navLinks()

//// BUTTONS HOME SIDA ////

const randomBeerButton = document.querySelector(".random-button")
randomBeerButton.addEventListener("click", loadBeer)

const randomBeerUrl = "https://api.punkapi.com/v2/beers/random"

async function loadBeer(){
    const beerData = await getRandomBeer(randomBeerUrl)
    renderRandomBeer(beerData)   
}

//// KÖR DENNA FÖR ATT FÅ UPP EN RANDOM ÖL NÄR MAN ÖPPNAR SIDAN ////
loadBeer()

//// MORE INFO KNAPPEN PÅ HOME PAGE ////

const moreInfoButtonHome = document.querySelector(".home .more-info-button")
const homeCard = document.querySelector(".home-card")
const infoCard = document.querySelector(".home .info-card")
moreInfoButtonHome.addEventListener("click", function(){
    homeCard.classList.remove("active")
    infoCard.classList.add("active")
})

//// ASYNC FUNCTIONS RANDOM BEER ////

async function renderListInfo(beerData){
    let listInfo = []
    listInfo.push(beerData.abv)
    listInfo.push(beerData.volume)
    listInfo.push(beerData.ingredients)
    return listInfo
}

async function renderRandomInfo(beerData, pageClass){
    const beerImages = document.querySelectorAll(pageClass + " .beer-img")
    for (const image of beerImages) {
        if(beerData.image_url == null){
            image.src = "/assets/missing.png"
        } else{
            image.src = beerData.image_url
        }
    }

    const beerNames = document.querySelectorAll(pageClass + " .beer-name")
    for (const beerName of beerNames) {
        beerName.innerHTML = beerData.name
    }

    const descriptionDiv = document.querySelector(pageClass + " .description-text")
    descriptionDiv.innerHTML = ""
    const descriptionItem = document.createElement("p")
    descriptionItem.innerHTML = beerData.description
    descriptionDiv.append(descriptionItem)

    const brewersTipsDiv = document.querySelector(pageClass + " .brewers-tips-text")
    brewersTipsDiv.innerHTML = ""
    const brewersItem = document.createElement("p")
    brewersItem.innerHTML = beerData.brewers_tips
    brewersTipsDiv.append(brewersItem)
    
    const foodPairingList = document.querySelector(pageClass + " .food-pairing-list")
    foodPairingList.innerHTML = ""
    const foodArray = beerData.food_pairing
    foodArray.forEach(foodItem => {
        const newListItem = document.createElement("li")
        newListItem.innerHTML = foodItem
        foodPairingList.append(newListItem)
    });
    
    document.querySelector(pageClass + " .info-list").innerHTML = ""
    const listInfo = await renderListInfo(beerData)

    for(let i = 0; i < listInfo.length; i++){
        const newListItem = document.createElement("li")
        if(i == 0){
            newListItem.innerHTML = `Alcohol by volume: ${listInfo[i]}` 
        }else if(i == 1){
            newListItem.innerHTML = `Volume: ${listInfo[i].value} ${listInfo[i].unit}` 
        }else if(i == 2){
            newListItem.innerHTML = "Ingredients: "
            const ingredients = listInfo[i]

            for (const property in ingredients) {
                if(typeof(ingredients[property]) == "object") {
                    const newUnorderedList = document.createElement("ul")
                    newUnorderedList.innerHTML = `${property}: `

                    const ingredientArray = ingredients[property]
                    
                    ingredientArray.forEach(element => {
                        const newListItem = document.createElement("li")
                        newListItem.innerHTML = element.name
                        newUnorderedList.append(newListItem)
                    });
                    newListItem.append(newUnorderedList)

                }else{
                    const anotherListItem = document.createElement("li")
                    anotherListItem.innerHTML = `${property}: ${ingredients[property]}`
                    newListItem.append(anotherListItem)
                }
            }
        }          
        document.querySelector(pageClass + " .info-list").append(newListItem)
    }

    const lessInfoButton = document.querySelector(pageClass + " .less-info-button")
    const infoCard = document.querySelector(pageClass + " .info-card")
    const currentPage = document.querySelectorAll(pageClass + "> div")
    lessInfoButton.addEventListener("click", function(){
        for(let div of currentPage){
            div.classList.add("active")
        }
        infoCard.classList.remove("active")
    })
}

async function renderRandomBeer(beerData){
    const homePageClass = ".home"
    renderRandomInfo(beerData, homePageClass)

    const tagline = document.querySelector(".tagline")
    tagline.innerHTML = beerData.tagline

}

//// HÄMTA INFO FOR SEARCH PAGE / SEARCH FIELD ////

let userInputBeer = ""
let pages = 1
let currentlySelectedBeer = {}

async function searchBeers(beer){
    const searchUrl = `https://api.punkapi.com/v2/beers?beer_name=${beer}&page=${pages}&per_page=10`
    const searchInfo = await fetch(searchUrl)
    const data = await searchInfo.json()
    return data
}

function userInput(){
    const inputBeerName = document.querySelector("#beer_name")
    const inputButton = document.querySelector(".search-button")
    const nextPrev = document.querySelector(".pagination")
    const errorMsn = document.querySelector(".form-message")
    const errorMsn1 = document.querySelector(".form-message-1")
    // nextPrev.classList.add("hidden")
    inputButton.addEventListener("click", async () =>{
        hideBeerList()
        userInputBeer = inputBeerName.value
        if(userInputBeer.length < 3 || userInputBeer.length == "" ){
            nextPrev.classList.add("hidden")
            errorMsn.classList.remove("hidden")
            errorMsn1.classList.add("hidden")
            renderBeersList(newBeers)
        }else{
            errorMsn.classList.add("hidden")
            errorMsn1.classList.add("hidden")
        }
        const resBeers = await searchBeers(userInputBeer)
        if(resBeers.length == 0){
            nextPrev.classList.add("hidden")
            errorMsn1.classList.remove("hidden")
            errorMsn.classList.add("hidden")
        }
        renderBeersList(resBeers)
        // inputBeerName.value = ""  
        nextPrev.classList.remove("hidden")
    })
}

function renderBeersList(newBeers){
    const renderBeers = document.querySelector(".search-beer-list")
    for (let beer of newBeers){
        const newList = document.createElement("li")
        const moreInfoButton = document.querySelector(".info-button")
        newList.classList.add("beer-list", "clear")
        newList.addEventListener("click", () => {
            moreInfoButton.classList.remove("hidden")
            const resultImg = document.querySelector(".img-info")
            const resultName = document.querySelector(".name-info")
            if(beer.image_url == null){
                resultImg.src = "/assets/missing.png"
            } else {
                resultImg.src = beer.image_url
            }
            resultName.innerText = beer.name
            const resultDes = document.querySelector(".description-info")
            resultDes.innerText = beer.description
            currentlySelectedBeer = beer
        })
        newList.innerHTML = beer.name
        renderBeers.append(newList)   
    }    
}

function moreInfoSearchSection(){
    const moreInfoBeer = document.querySelector(".info-button")
    const searchPage = document.querySelectorAll(".search > div")
    const infoCardSearch = document.querySelector(".search .info-card")
    moreInfoBeer.addEventListener("click", function(){
        const searchPageClass = ".search"
        renderRandomInfo(currentlySelectedBeer, searchPageClass)

        for(let div of searchPage) {
            div.classList.remove("active")
        }
        infoCardSearch.classList.add("active") 
    })
}
moreInfoSearchSection()

function nextPrevButtons(){
    const nextPreviousBeers = userInput()
    const prev = document.querySelector(".prev")
    prev.addEventListener("click", async () => {
        hideBeerList()
        if(pages > 1){
            pages--;  
        }
        const resBeers = await searchBeers(userInputBeer)
        renderBeersList(resBeers)
        const felMess = document.querySelector(".fel-mess")
        const noResults = document.querySelector(".search-beer-list")
        noResults.classList.remove("hidden")
        felMess.classList.add("hidden")
        
    })  
    
    const next = document.querySelector(".next")
    next.addEventListener("click",async () => {
        hideBeerList()
        pages++;
        const resBeers = await searchBeers(userInputBeer)
        renderBeersList(resBeers)
        if(resBeers.length === 0){
            const noResults = document.querySelector(".search-beer-list")
            const felMess = document.querySelector(".fel-mess")
            noResults.classList.add("hidden")
            felMess.classList.remove("hidden")
            hideBeerList()
            pages--;
        } 

    })           
}
nextPrevButtons()

function hideBeerList(){
    const details = document.querySelectorAll(".clear")
    for(let currentInfo of details){
        currentInfo.classList.add("hidden")
    }
}

