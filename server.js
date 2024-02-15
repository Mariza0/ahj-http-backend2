const fs = require('fs');
const http = require('http');
const Koa = require('koa');
const { koaBody } = require('koa-body');
const path = require('path');
const uuid = require('uuid');

const app = new Koa();

function setTime() {

    // Создаем объект для текущей даты
    let currentDate = new Date();

    // Получаем текущую дату в формате YYYY-MM-DD
    let year = currentDate.getFullYear();
    let month = String(currentDate.getMonth() + 1).padStart(2, '0'); // Добавляем ведущий ноль, если месяц < 10
    let day = String(currentDate.getDate()).padStart(2, '0'); // Добавляем ведущий ноль, если день < 10

    // Формируем строку даты в формате YYYY-MM-DD
    let formattedDate = year + '-' + month + '-' + day;

    // Устанавливаем значение поля ввода равным текущей дате
    return formattedDate;
}


app.use(koaBody({
    urlencoded: true,
    multipart: true,
}));

app.use((ctx, next) => {  

    if (ctx.request.url === '/') {

        ctx.response.set('Access-Control-Allow-Origin', '*');
        ctx.response.body = 'Hello, World!';
        return;
      }

    if (ctx.request.method !== 'OPTIONS') {
        next();
        return;
    }
    ctx.response.set('Access-Control-Allow-Origin', '*');
    ctx.response.set('Access-Control-Allow-Methods', 'DELETE, PUT, PATCH, GET, POST');
    ctx.response.status = 204;
}); 

app.use(async ctx => {
    const method  = ctx.request.query.method;
    console.log(method, 'method')

    switch (method) {

        case 'allTickets':

            try {

                console.log('получаем данные')
       
                const public = path.join(__dirname, '/public');
                const filePath = public + '/' + 'tickets.json';
                const existingData = fs.readFileSync(filePath, 'utf-8');
                const jsonData = await JSON.parse(existingData);

                ctx.response.set('Access-Control-Allow-Origin', '*');

                ctx.response.status = 200;

                ctx.response.body = jsonData;
                console.log('получение данных с сервера');
            
                return;

            } catch (error) {
                console.log(error);
            }
            return;
           
        case 'createTicket':
            console.log('создание тикета');
            try { 

                const public = path.join(__dirname, '/public');
                const data = ctx.request.body;
        
                const id = uuid.v4();
                const filePath = public + '/' + 'tickets.json';
        
                const creationDate = setTime();
                console.log('creationDate')
                const dataTicket = {
                    "name": data.name,
                    "description": data.description,
                    "creationDate": creationDate,
                    "id": id,
                    "statusTicket": false
                } 
        
                const existingData = fs.readFileSync(filePath, 'utf-8');
        
                const jsonArray = JSON.parse(existingData);
                
                jsonArray.push(dataTicket);
        
                // Преобразование массив обратно в JSON-строку с отступами
                const updatedJsonString = JSON.stringify(jsonArray, null, 2);
        
                fs.writeFileSync(filePath, updatedJsonString, 'utf-8');
                ctx.response.status = 200;
                ctx.response.set('Access-Control-Allow-Origin', '*');
                ctx.response.body = 'ok';      
                return;
            } catch (error) {
                ctx.response.status = 500;
                return;
            }

        case 'changeTicket' :

            try {
                const public = path.join(__dirname, '/public');

                const filePath = public + '/' + 'tickets.json';

                const data = ctx.request.body;

                const { id } = ctx.request.query;
            
                const existingData = fs.readFileSync(filePath, 'utf-8');

                let existingDataParse = JSON.parse(existingData);

                const indexFilteredData = existingDataParse.findIndex(item => item.id === id);
                existingDataParse[indexFilteredData].name = data.name;
                existingDataParse[indexFilteredData].description = data.description;
  
                const updatedJsonString = JSON.stringify(existingDataParse, null, 2);
  
                fs.writeFileSync(filePath, updatedJsonString, 'utf-8');

                ctx.response.status = 204;
                ctx.response.set('Access-Control-Allow-Origin', '*');
                ctx.response.body = 'ok';
                return;

            } catch (error) {
                console.log(error);
                ctx.response.status = 500;
                return;
            }

        case 'deleteTicket' :

            console.log('удаление');
            ctx.response.set('Access-Control-Allow-Origin', '*');
            ctx.response.set('Access-Control-Allow-Headers', 'Content-Type, Authorization, access-control-allow-headers; charset=UTF-8');

            ctx.response.set('Access-Control-Allow-Methods', 'DELETE');
            
            const { id } = ctx.request.query;

            const public = path.join(__dirname, '/public');

            const filePath = public + '/' + 'tickets.json';

            const existingData = fs.readFileSync(filePath, 'utf-8');

            let existingDataParse = JSON.parse(existingData);

            const filteredData = existingDataParse.filter(item => item.id !== id);

            const updatedJsonString = JSON.stringify(filteredData, null, 2);
        
            fs.writeFileSync(filePath, updatedJsonString, 'utf-8');

            ctx.response.status = 204;
            return;

        case 'changeStatus' :

            try {
                const public = path.join(__dirname, '/public');

                const filePath = public + '/' + 'tickets.json';

                const data = ctx.request.body;

                const { id, status } = ctx.request.query;

                console.log(status, 'status')
            
                const existingData = fs.readFileSync(filePath, 'utf-8');

                let existingDataParse = JSON.parse(existingData);

                const indexFilteredData = existingDataParse.findIndex(item => item.id === id);
            
                existingDataParse[indexFilteredData].statusTicket = JSON.parse(status);
  
                const updatedJsonString = JSON.stringify(existingDataParse, null, 2);
  
                fs.writeFileSync(filePath, updatedJsonString, 'utf-8');

                ctx.response.status = 204;
                ctx.response.set('Access-Control-Allow-Origin', '*');
                ctx.response.body = 'ok';
                return;
                
            } catch (error) {

                console.log(error);
                ctx.response.status = 500;
                return;
                
            }

        case 'getDescription' :
            try {
                
                const public = path.join(__dirname, '/public');

                const filePath = public + '/' + 'tickets.json';

                const data = ctx.request.body;

                const { id } = ctx.request.query;
            
                const existingData = fs.readFileSync(filePath, 'utf-8');

                let existingDataParse = JSON.parse(existingData);

                const indexFilteredData = existingDataParse.findIndex(item => item.id === id);
                
                const description = existingDataParse[indexFilteredData].description;

                ctx.response.set('Access-Control-Allow-Origin', '*');

                ctx.response.status = 200;

                ctx.response.body = description;
                return;

            } catch (error) {

                console.log(error);
                ctx.response.status = 500;
                return;
            }

        default:
            ctx.response.status = 404;
            ctx.response.body = '(((('; 
            return;
    }
});

app.use((ctx) => {
    console.log('second midleware');
})

const server = http.createServer(app.callback());

const port = process.env.PORT || 7070;

server.listen(port, (err) => {
    if (err) {
        console.log(err);
        return;
    }
    console.log('server is listening to port ' + port);
})
