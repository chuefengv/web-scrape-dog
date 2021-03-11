const puppeteer = require('puppeteer');
const path = require('path');
const pool = require(path.resolve(__dirname, './db.js')); 

// const url = 'https://www.akc.org/dog-breeds/?characteristic%5B%5D=best-family-dogs&characteristic%5B%5D=best-guard-dogs&characteristic%5B%5D=best-dogs-for-kids&characteristic%5B%5D=best-dogs-for-apartments-dwellers&size%5B%5D=small&trainability%5B%5D=agreeable&trainability%5B%5D=eager-to-please&trainability%5B%5D=easy-training';

async function getList(){
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
        try{
            await page.setDefaultNavigationTimeout(0);
            await page.goto(url, {waitUntil: 'networkidle2'});
            let dogList = await page.evaluate(()=>{
                let array = [];
                let names  = document.querySelectorAll('a[class="d-block relative"]');
                for(let i=0; i<names.length; i++){
                    array[i] = names[i].href;
                }
                return array;
            })
            await browser.close();
            return dogList;
        }catch(err){
            console.log('GETLIST: ' + err.message);
        }
        
}

async function scrapeHere(link){
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    
    try{
        await page.setDefaultNavigationTimeout(0);
        await page.goto(link, {waitUntil: 'networkidle2'});

        let info = await page.evaluate(()=>{
            let dogData = new Object;
            dogData.breed = document.querySelector('h1[class="page-header__title  page-header--centered"]').innerText;
            dogData.height = document.querySelectorAll('li[class="attribute-list__row "] > span')[3].innerText;
            dogData.weight  = document.querySelectorAll('li[class="attribute-list__row "] > span')[5].innerText;
            dogData.life  = document.querySelectorAll('li[class="attribute-list__row "] > span')[7].innerText;
            dogData.description  = document.querySelector('div[class="breed-hero__footer"]').innerText;
            dogData.bio = document.querySelectorAll('div[class="breed-info__content-wrap"] > p')[0].innerText;
            dogData.pic = document.querySelector('img[class="media-wrap__image lozad"]').dataset.src;
            dogData.size = 'large';
            return dogData;
        })
        await browser.close();
        return info;

    }catch(err){
        console.log('SCRAPEHERE: ' + err.message);
    }
}

async function getInfo(){

    let query = 'INSERT INTO dogs(breed, height, weight, life, description, bio, pic, size) VALUES($1, $2, $3, $4, $5, $6, $7, $8)';
    let dogArray = [];
    let dogLinks = await getList();
    for(let i=0; i<dogLinks.length; i++){
        dogArray.push(await scrapeHere(dogLinks[i]));
    }

    for(let i=0; i<dogLinks.length; i++){
        let {breed, height, weight, life, description, bio, pic, size} = dogArray[i];
        try{
            await pool.query(query,[breed, height, weight, life, description, bio, pic, size]);
        }catch(err){
            console.log(err.message);
        };
    };

    


}

// getInfo();