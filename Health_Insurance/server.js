
var express = require("express");
var bodyParser = require('body-parser');
var methodOverride = require('method-override');
var path = require('path');
var port = process.env.PORT || 3000;
var database = require('./dataBase/index');

var app = express();
var router = express.Router();

//middleware functions
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(methodOverride());



var Web3 = require('web3');

if (typeof web3 !== 'undefined') {
    web3 = new Web3(web3.currentProvider);
} else {
    // set the provider you want from Web3.providers
    web3 = new Web3(new Web3.providers.HttpProvider("http://localhost:8545"));
}

console.log("Eth Node Version: ", web3.version.node);
//console.log("Network: " ,web3.version.network, web3.version.ethereum);
console.log("Connected: ", web3.isConnected(), web3.currentProvider);
console.log("syncing: ", web3.eth.syncing, ", Latest Block: ",web3.eth.blockNumber);
console.log("Accounts[0]: " , web3.eth.accounts[0], ":",web3.eth.getBalance(web3.eth.accounts[0]).toNumber())
//var web3 = new Web3(new Web3.providers.HttpProvider("http://localhost:8545"));

//Below 2 statements are used for the pushing the first page on browser
var Ipublic = path.resolve(__dirname, 'src');
app.use(express.static(Ipublic));

app.all('/*', function(req, res, next) {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
    res.header('Access-Control-Allow-Headers', 'Content-Type');
    next();
});
app.post('/registerUser', database.registerUser);
app.post('/updateregisterUser', database.updateregisterUser);


app.post('/loginUser', database.loginUser);
app.post('/addQuestion', database.addQuestion);
app.post('/getUsers',database.getUsers);
app.post('/getUserstotheAdmin',database.getUserstotheAdmin);

app.post('/saveProcess', database.saveProcess);

app.post('/deleteSurvey',database.deleteSurvey);

app.post('/getquizes', database.getquizes);
app.post("/saveResult", database.saveResult);
app.post('/getsurveys', database.getsurveys);
app.post('/saveSurvey', database.saveSurvey);


app.post('/saveimages',database.saveimages);

app.post('/places',database.places);

app.post('/getCustomerInformation',database.getCustomerInformation);

app.post('/PolicyNumberChecking',database.PolicyNumberChecking);

/*Cliam submitted by the Hospital to the insurance company*/
app.post('/ClaimSubmission',database.ClaimSubmission);

/*Agent Submitting new customer Details*/
app.post('/Customer_Details_Approved_By_Insurance_Company',database.Customer_Details_Approved_By_Insurance_Company);
app.post('/PharmacyDetails_Updation',database.PharmacyDetails_Updation);
app.post('/EmergencyDetails_Updation',database.EmergencyDetails_Updation);

/*Setting up server to listen for the clients*/
server = require('http').createServer(app),
    io = require('socket.io').listen(server),


    app.use(function (req, res) {
        res.sendFile(Ipublic + "/index.html");
    });
server.listen(port, function () {


    console.log('Server is starting to port ' + port);
});

io.on('error',function(err)
{
    console.log("Socket.IO Error");
    console.log(err.stack);
});

io.on('connection',function(socket)
{
    console.log("Inside Connection")
    
});

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}


var port= 1234;
var host= "localhost";
var dgram= require('dgram');
var client = dgram.createSocket('udp4');

var server1 = dgram.createSocket('udp4');

var maxBlocks= 100;
var blockNum= "";
blocks = [];

var count_sender= 0;
function currentBlockInformation()
{
  //  alert("I m from currentBlockInformation");
    web3.eth.getBlockNumber(function(error, result){
        if (!error) {
          //  alert("I m frm BlockNumber"+result.size);
            console.log("block number => " + JSON.stringify(result))
            console.log("Block size"+result.size);
            blockNum= result;
            return  (blockNum);
            // alert("sairam"+result);
        }
    })
}

setInterval(function () {
    //currentBlockInformation();
    blockNum= web3.eth.blockNumber;
   // console.log("BlockNumber Latest: "+blockNum);
    /*
    web3.eth.getBlockNumber(function(error, result){
        if (!error) {
            //  alert("I m frm BlockNumber"+result);
            console.log("block number => " + JSON.stringify(result))
            blockNum= result;
            return  (blockNum);
            // alert("sairam"+result);
        }
    })
*/

    //while(DateObj.getMilliseconds() < millisec )
    //{


    blocks= [];
    for (var i = 0; i < maxBlocks; ++i) {
        console.log("Value of i= \n"+i);

    //alert("I m frm for loop");
    web3.eth.getBlock((blockNum - i),function                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            (err,result) {
        if(!err) {
            blocks.push(result);
            //console.log("Size of each Transaction= "+result.toString().length);
            var compare= "null";
            var check= compare.localeCompare(result);
            console.log(compare.localeCompare(result));
            if(check != 0){

               // console.log("Result is as follows: "+JSON.stringify(result));
                //console.log("syncing: ", web3.eth.syncing, ", Latest Block: ",web3.eth.blockNumber);


                var message12= new Buffer(JSON.stringify(result));
            console.log("Result is as follows: "+result.toString()+"Length of Messages: "+message12.length+ "Current Counter Value= "+i+" Blocks Length= "+blocks.length);
            //console.log
            client.send(message12,0,message12.length,port,host,function(err,bytes)
                {

                    if(err)
                        throw err;
                    console.log("Message send to "+host);
                    //       client.close();
                }



            )}
            //sleep(1000);
            console.log(result)

            //console.log(blocks)
        }
        if(err)
          //  alert("I m from error of loop");
        count_sender= count_sender + 1;
    });
}

},1000);


console.log("--------------------------"+JSON.stringify(blocks))
console.log(blocks.toString());
var message= new Buffer(blocks);
//var buffer= new BufferStream(message);
console.log("Messages are "+message);

//var message= new Buffer("Sairam");
console.log("Messages are "+message);

/*
blocks.forEach(function(block)
{
    console.log("I m in blocks for each");
    for (var index = 0; index < block.transactions.length; index++) {
        var t = block.transactions[index];
        console.log(t);
        console.log("BlockNumber"+t.blockNumber+"   Parent Hash:"+block.hash)

     /!*   $('#transactionsbody').append('<tr><td><a  target="#" onclick="getBlockDetails(' + block.number + ');return false;" href="' + t.blockNumber +
            ' ">' + block.number + '</a></td><td>' + block.hash +
            '</td><td>' + block.parentHash +
            '</td>');*!/
    }
});
*/
/*
client.send(message,0,message.length,port,host,function(err,bytes)
    {

        if(err)
            throw err;
        console.log("Message send to "+host);
        //       client.close();
    }


);*/
var count= 0;
client.on('message', function (message, remote) {
    console.log("********************************count= **************************************************\n"+count);
    console.log("--------------------------------coun_Server= "+count_sender);
    console.log("\n");
    console.log(remote.address + ':' + remote.port +' - ' + message);
    var message1= message;
    /*From 1st string separate the number using collan*/
    //var numbers= result[1].split("\\:");
    //var starting_string= message1.split(": ");

    if(message.toString().startsWith("Find"))
    {

        var result= message1.toString().split("\\: ");
    web3.eth.getTransaction(starting_string[1],function (error,result) {
        console.log("Transaction Details: "+JSON.stringify(result));
        var resultant_data= "RESULT:" +JSON.stringify(result);

        client.send(resultant_data,0,resultant_data.length,port,host,function(err,bytes)
            {

                if(err)
                    throw err;
                console.log("Message send to "+host);
                //       client.close();
            });







})
    };
    //web3.eth.ge
    count= count + 1;

});

console.log("Befor starting server");
var message = new Buffer("i received u r message");

server1.on('message',function(message,remote)
    {

        console.log("**********************************************************************************\n");
        console.log(remote.address+":"+"- "+remote.port+"-"+message);
      //  getBlockInfo();
    }
);



