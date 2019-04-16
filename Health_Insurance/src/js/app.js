var accounts;
var regulatorInstance;
var regulatorContractAddress;
var ctInstance;
var ctContractAddress;
var defaultGas = 4700000;
var userAccounts = [];

var regulatorAccount, croAccount, pharmaAccount, currentAccount;
var contractAddress = regulatorContractAddress;

var subjects = 10;
var dataPoints = 5;
var sideEffect = ['NONE', 'NAUSEA', 'VOMITTING', 'HEADACHE', 'HEARTBURN', 'COMA'];
var genderArray = ['Male', 'Female'];

var hostName = "localhost";
var ipfs = window.IpfsApi(hostName, 5001);

var trialDocHash;
var clinicalTrailCreationTxnHash;

var Regulator;


function hex2string(hex) {
    var str = '';
    for (var i = 0; i < hex.length; i += 2) {
        var v = parseInt(hex.substr(i, 2), 16);
        if (v) str += String.fromCharCode(v);
    }
    return str;
}
App = {
    web3Provider: null,
    contracts: {},
 }

// Initialize
function deployRegulator() {
    alert("I am in deplyRegulator");

    $.post('/saveSurvey', {
        recordID: "17557",
        filledform: "sairam",
        status: "true",
        count: 1
    }, function (data) {


        Regulator = TruffleContract(data);
        if (typeof web3 !== 'undefined') {
            // If a web3 instance is already provided by Meta Mask.
            App.web3Provider = web3.currentProvider;
            web3 = new Web3(web3.currentProvider);
           // alert("I m from if part of web3");
        } else {
            // Specify default instance if no web3 instance provided
            App.web3Provider = new Web3.providers.HttpProvider('http://localhost:7545');
            web3 = new Web3(App.web3Provider);
            //alert("I m from else part of web3");
        }
        Regulator.setProvider(App.web3Provider);

        Regulator.new({ from: currentAccount, gas: defaultGas }).then(function(reginstance) {

            regulatorInstance = reginstance;
            //alert( "From DeployRegulator"+JSON.stringify(regulatorInstance));
            regulatorContractAddress = regulatorInstance.address;
            $('#sectionAAddress').html('<i class="fa fa-address-card"></i> ' + regulatorInstance.address);
            $('#sectionATxnHash').html('<i class="fa fa-list-alt"></i> ' + regulatorInstance.transactionHash);
            $('#sectionBAddress').html('<i class="fa fa-address-card"></i> ' + regulatorInstance.address);
            $('#sectionBTxnHash').html('<i class="fa fa-list-alt"></i> ' + regulatorInstance.transactionHash);
            $("#deployRegContractSuccess").html('<i class="fa fa-check"</i>' + " Regulatory Contract mined!");
            $("#deployRegContractSuccess").show().delay(5000).fadeOut();
            initializeRegulatorEvents();


        })});



}

function initializeRegulatorEvents() {
    //var events = regulatorInstance.getPastEvents('allEvents',{fromBlock:0,toBlock: 'latest'})
    var events = regulatorInstance.allEvents({
        fromBlock: 0,
        toBlock: 'latest'
    });

    events.watch(function(error, result) {

        if (error) {
            console.log("Error: " + error);
        } else {
            //alert("sairam"+JSON.stringify(result));
            console.log(JSON.stringify(result));
            $('#audittrailbody').append('<tr><td>' + result.event +
                '</td><td>' + result.args.msgSender +
                '</td><td>' + hex2string(result.args.msg) +
                '</td><td>' + Date(result.args.timestamp) + '</td>');
        }
    });

}


function initializeClinicalTrialEvents() {
    var ct = ClinicalTrial.at(ctContractAddress);
    var events = ct.allEvents();
    events.watch(function(error, result) {
        if (error) {
            console.log("Error: " + error);
        } else {
            $('#audittrailbody').append('<tr><td>' + result.event +
                '</td><td>' + result.args.msgSender +
                '</td><td>' + hex2string(result.args.msg) +
                '</td><td>' + Date(result.args.timestamp) + '</td>');
        }
    });
}

function addCroForApproval(cro, croUrl) {
    document.getElementById("crodiv").style.display = "block";

    regulatorInstance.submitCro.sendTransaction(cro, croUrl, { from: currentAccount, gas: defaultGas })
        .then(function(txHash) {

            $("#submitCroSuccess").html('<i class="fa fa-check"</i>' + ' Transaction ' + txHash + " added to the blockchain");
            $("#submitCroSuccess").show().delay(5000).fadeOut();
        }).then(function() {
        readFromRegulator();
    });
}

function readFromRegulator() {
    regulatorInstance.getCroById(0).then(function(data) {
        data[0] = hex2string(data[0]);
        data[1] = hex2string(data[1]);
        alert(JSON.stringify(data));
        var table = document.getElementById("crotable").getElementsByTagName('tbody')[0];
        $("#crotable tbody").empty();
        var row = table.insertRow(0);
        var nameCell = row.insertCell(0);
        var urlCell = row.insertCell(1);
        var addressCell = row.insertCell(2);
        var statusCell = row.insertCell(3);
        nameCell.innerHTML = data[0];
        urlCell.innerHTML = data[1];
        addressCell.innerHTML = data[2];
        statusCell.innerHTML = getStatus(data[3].c[0]);
    });
}

function getStatus(data) {
    switch (data) {
        case 0:
            return "Submitted";
        case 1:
            return "Approved";
        default:
            return "Pending";
    }
}

function approveCroWithId0() {
    regulatorInstance.changeCroStatus.sendTransaction(pharmaAccount, 1, { from: regulatorAccount, gas: defaultGas }).then(
        function(txHash) {
            $("#approveCroSuccess").html('<i class="fa fa-check"</i>' + ' Transaction ' + txHash + " added to the blockchain");
            $("#approveCroSuccess").show().delay(5000).fadeOut();
            readFromRegulator();
        }
    );
}

async function submitProposal() {
   // alert("I m from submitProposal");
    var drugName = $("#inputDrugName").val();
    var trialFrom = $("#datepickertrialfrom").val();
    var trialTo = $("#datepickertrialto").val();
    var trialFromTs = (moment(trialFrom, "M/D/YYYY").valueOf()) / 1000;
    var trialToTs = (moment(trialTo, "M/D/YYYY").valueOf()) / 1000;
    var trailTextArea= $("#policyNumber").val();
    var Diseases_diagonised= $("#diseases").val();

    var cost_per_disease= $("#cost_each_disease").val();
    var spell_per_diseases= $("#spell_each_disease").val();
    var cost_per_day= $("#limit_per_day").val();
    var room_rent= $("#hospital_visit_room_rent_per_day").val();
    var days_stayed_in_hospital= $("#hospital_stay").val();
    var policy_number= $("#policyNumber").val();

    alert("ost_per_disease"+ cost_per_disease+ "cost per day"+cost_per_day+" Stayed: "+days_stayed_in_hospital);
   // alert("cost per diseases"+cost_per_disease+" spell"+spell_per_diseases+" cost"+cost_per_day+"Room rnt "+room_rent+" days stayed"+days_stayed_in_hospital);
    var messageTosign= "sairam";//$("#messageTosign").val();
    //alert(trailTextArea);
    var publicKey_policyHolder= regulatorAccount ;

    var privateKey= "50cb77d58f0114644ecee553dcae67a78d6deb7eab7f988d249116a763e50ca1";

   // web3.personal.sign(web3.fromUtf8("Consent from policy holder for claiming!"), web3.eth.coinbase, console.log);

    //var sig=web3.eth.sign(web3.sha3("Hello from Toptal!"), web3.eth.coinbase, console.log);
    var signature_created= "";
    var sig="";
    web3.eth.sign(web3.eth.coinbase,web3.sha3("sairam"), function(err,res)
    {
           // alert(res);
            signature_created= (res);
            sig= signature_created;
            console.log(res);
    }
    );

   /* var r = "0x"+sig.slice(0, 64)
    var second = '0x${sig.slice(64, 128)}'
    var v = web3.toDecimal(sig.slice(128, 130)) + 27
*/
    await sleep(2500);
    var r = "0x"+signature_created.slice(2,66);
    var second = "0x"+signature_created.slice(66,130);
    //var v = '0x' + signature_created.slice(130, 132)
    var v = web3.toDecimal(signature_created.slice(130, 132)) + 27;

    //var v= new Buffer(signature_created.slice(130,132),"hex");
    //v= web3.toHex(new ArrayBuffer(signature_created.slice(130,132)));
    //alert(v)
    //v= web3.toHex((signature_created.slice(130,132)));
   // v= v[0].valueOf();
   // console.log("r: ",r," s:",second," V: ",v);
    let hash_value1 =  web3.sha3("sairam");
    let hash_value = hash_value1;

    /*let r = '0x' + signature_created.slice(0, 64);
    let s = '0x' + signature_created.slice(64, 128);
    let v = web3.toDecimal(signature_created.slice(128, 130)) + 27;*/
/*
    var creation= "";
    web3.eth.sign((web3.eth.coinbase, hash_value1).slice(2),function(err,result)
    {
        creation= result;
        console.log("Recently Created Signature"+result);
    })
    var r = '0x${sig.slice(0, 64)}'
    var s = '0x${sig.slice(64, 128)}'
    var v = web3.toDecimal(sig.slice(128, 130)) + 27*/
/*

    var r = signature_created.slice(0, 66)
    var s = '0x' + signature_created.slice(66, 130)
    var v = '0x' + signature_created.slice(130, 132)
    v = web3.toDecimal(v)
    var s= second;
*/
    var s= second;

    console.log("r: ",r," s:",s," V: ",v);

    await sleep(500);

    regulatorInstance.verifySignature.call(r,s,v,hash_value).then(function(data) {
        alert("Stringfied Data"+JSON.stringify(data));
        alert("Raw Data"+data);

        console.log(data);

    })

    $.post('/ClaimSubmission',{policyNumber: policy_number,admitted_reason: drugName,admittedOn: trialFromTs,dischargedOn: trialTo,
    Diseases_diagonised: Diseases_diagonised,cost_of_disease:cost_per_disease,spell_of_disease:spell_per_diseases,cost_each_day:cost_per_day,
    Room_rent: room_rent,stay_at_hospital: days_stayed_in_hospital},function (data) {
        alert("data coming from policy Information"+ JSON.stringify(data));
    });

    //await sleep(100);
    /*
    regulatorInstance.submitProposal.sendTransaction(drugName, trialFromTs, trialToTs,trailTextArea,{ from: croAccount, gas: defaultGas }).then(
        function(txHash) {
            alert("I m from submitproposal,submitProposal_claim");
            $("#submitProposalSuccess").html('<i class="fa fa-check"</i>' + ' Transaction ' + txHash + " added to the blockchain");
            $("#submitProposalSuccess").show().delay(5000).fadeOut();
            readProposalById0();
        }
    );*/



        regulatorInstance.submitProposalclaim1.sendTransaction(drugName, trialFromTs, trialToTs, trailTextArea, Diseases_diagonised, cost_per_disease, spell_per_diseases, cost_per_day, room_rent, days_stayed_in_hospital, {
            from: croAccount,
            gas: defaultGas
        }).then(
            function (txHash) {

                $("#submitProposalSuccess").html('<i class="fa fa-check"</i>' + ' Transaction ' + txHash + " added to the blockchain");
                $("#submitProposalSuccess").show().delay(5000).fadeOut();
                readProposalById0();
            }
        );

}

async function verify_message() {
    var message = "sairam";//document.getElementById("message_to_verify").value
    var signature = "";//document.getElementById("signature").value
    if (document.getElementById("hash_check").checked) {
        message = web3.utils.sha3(message)
    }
    var signing_address = await web3.eth.personal.ecRecover(message, signature)
    document.getElementById("signing_address_output").innerText = signing_address
}

/*This function works when hospital submits claim to Insurance company.*/
function readProposalById0() {

    document.getElementById("trialproposaldiv").style.display = "block";
    document.getElementById("trialproposaldiv1").style.display = "block";
     alert("I m from ReadProposal line 318");
    regulatorInstance.claim_Patient_cost_getProposalById(0).then(function (data) {
        alert(hex2string(data[4])+" Data0= "+data[0]+" Cost of Diseases: "+data[1]);
        $("#diseases_diagonised").html(hex2string(data[0]));
        $("#cost_each_disease1").html(hex2string(data[1]));
        $("#spell_per_disease").html(hex2string(data[2]));
        $("#cost_per_day").html(hex2string(data[3].c[0]));
        $("#room_rent").html(hex2string(data[4]));
        $("#days_stayed_hospital").html(hex2string(data[5]));
/*
        $("#Tpa_diseases_diagonised").html(hex2string(data[0]));
        $("#Tpa_cost_each_disease1").html(hex2string(data[1]));
        $("#Tpa_spell_per_disease").html(hex2string(data[2]));
        $("#Tpa_cost_per_day").html(hex2string(data[3].c[0]));
        $("#Tpa_room_rent").html(hex2string(data[4]));
        $("#Tpa_days_stayed_hospital").html(hex2string(data[5]));*/
      }

    );
    regulatorInstance.claim_getProposalById(0).then(function(data) {

        $("#drugName").html(hex2string(data[1]));
        $("#tdfrom").html(moment.unix(data[2].c[0]).format("MM/DD/YYYY"));
        $("#tdto").html(moment.unix(data[3].c[0]).format("MM/DD/YYYY"));
        $("#tdstatus").html(getStatus(data[5].c[0]));
        $("#trailTextArea").html(hex2string(data[8]));
        if (getStatus(data[5].c[0]) == "Approved") {
            $("#clinicalTrialAddress").html('<i class="fa fa-address-card"></i> ' + data[6]);
            $("#clinicalTrialCreationTxnHash").html('<i class="fa fa-list-alt"></i> ' + clinicalTrailCreationTxnHash);
            $("#clinicalTrialHash").html('<i class="fa fa-check"</i>' + " Clinical Trial Contract mined!");
            $("#clinicalTrialHash").show().delay(5000).fadeOut();
            ctContractAddress = data[6];
            initializeClinicalTrialEvents();
        }

        /*The same fields are used for TPA as well for approvel*/

        $("#Tpa_drugName").html(hex2string(data[1]));
        $("#Tpa_tdfrom").html(moment.unix(data[2].c[0]).format("MM/DD/YYYY"));
        $("#Tpa_tdto").html(moment.unix(data[3].c[0]).format("MM/DD/YYYY"));
        $("#Tpa_tdstatus").html(getStatus(data[5].c[0]));
        $("#Tpa_trailTextArea").html(hex2string(data[8]));
        if (getStatus(data[5].c[0]) == "Approved") {
            $("#clinicalTrialAddress").html('<i class="fa fa-address-card"></i> ' + data[6]);
            $("#clinicalTrialCreationTxnHash").html('<i class="fa fa-list-alt"></i> ' + clinicalTrailCreationTxnHash);
            $("#clinicalTrialHash").html('<i class="fa fa-check"</i>' + " Clinical Trial Contract mined!");
            $("#clinicalTrialHash").show().delay(5000).fadeOut();
            ctContractAddress = data[6];
            initializeClinicalTrialEvents();
        }
    });

}

/*Reading the submitted policy which was submitted by agent*/
function readProposalOfSubmittedPolicy1() {
  //  alert("I m from ReadProposalOfSUbmittedPolicy1");
    document.getElementById("policyproposaldiv").style.display = "block";

    regulatorInstance.getProposalofSubmittedPolicy_agent(0).then(function (data) {

        var address= JSON.stringify((data[0]));
        var status= JSON.stringify((data[2].c[0]));
        var ipfs_hash= JSON.stringify(data[1]);

        var hash= JSON.stringify(hex2string(data[1]));
        var final_hash= hash.slice(1,-1);


        var JsonData= "";

        ipfs.files.get(final_hash, function (err, files) {
            files.forEach((file) => {
                console.log(file.path);
                JsonData= file.content.toString('utf8');
                var parseData= JSON.parse(JsonData);
                console.log(parseData.customerName+" Age: = "+JsonData[0].MedicalHistory);
                $("#customerName1").html(parseData.customerName);
                $("#c_dob").html(parseData.Dob);
                $("#c_age").html(parseData.Age);
                $("#c_Occupation").html(parseData.Occupation);
                $("#gender").html(parseData.Gender);
                $("#martialStatus").html(parseData.MartialStatus);
                $("#policyType").html(parseData.PolicyType);
                $("#term").html(parseData.Base_Term);
                $("#sumAssured").html(parseData.Base_SumAssured);
                $("#DiseasesCovered").html(parseData.Diseases_Covered_Customer);
                $("#c_status").html(getStatus(parseData.Status));
                $("#c_Pharmacies_Allowed").html(parseData.Pharmacies_Allowed);
                $("#c_Hospitals_Allowed").html(parseData.Hospitals_Allowed);
                $("#c_Reemberse").html(parseData.Remberse);
                $("#c_RoomRent").html(parseData.RoomRent);
                $("#c_Pharmacy_Limit").html(parseData.Pharmacy_Limit);
                $("#c_Deductable_Rider_Customer").html(parseData.Deductible_Rider_customer);
                $("#c_Deductable_Base_Customer").html(parseData.Deductible_Base_customer);
                $("#c_Coverage_Rider").html(parseData.Coverage_Rider);
                $("#c_Rider_Term").html(parseData.Rider_Term);
                $("#c_Medical_History").html(parseData.MedicalHistory);
                $("#POwner").html(parseData.PolicyOwner);
                $("#c_limitperDay").html(parseData.LimitPerDay);
                $("#c_policyNumber").html(parseData.PolicyNumber);
                $("#c_limit_per_year").html(parseData.Limit_per_Year);
                $("#c_limit_emergency").html(parseData.Emergency_Amount);

                console.log("File content >> ",file.content.toString('utf8'))
            })
        })
    })


        /*If base and sum assured entites to be added do the following
        *  add rest of the html fields in the policyproposaldiv
        *
        * */
       /* if (getStatus(data[5].c[0]) == "Approved") {
            $("#clinicalTrialAddress").html('<i class="fa fa-address-card"></i> ' + data[6]);
            $("#clinicalTrialCreationTxnHash").html('<i class="fa fa-list-alt"></i> ' + clinicalTrailCreationTxnHash);
            $("#clinicalTrialHash").html('<i class="fa fa-check"</i>' + " Clinical Trial Contract mined!");
            $("#clinicalTrialHash").show().delay(5000).fadeOut();
            ctContractAddress = data[6];
            initializeClinicalTrialEvents();
        }*/


}

function readProposalOfSubmittedPolicy() {

    alert("From Read Proposal DIV");
    document.getElementById("policyproposaldiv").style.display = "block";
    regulatorInstance.getProposalOfSubmittedPolicy(0).then(function(data) {

        $("#customerName1").html(hex2string(data[1]));
        $("#c_dob").html(moment.unix(data[2].c[0]).format("MM/DD/YYYY"));
        $("#c_age").html(moment.unix(data[3]));
        $("#c_Occupation").html(hex2string(data[4]));
        $("#c_status").html(getStatus(data[5].c[0]));
        /* if (getStatus(data[5].c[0]) == "Approved") {
             $("#clinicalTrialAddress").html('<i class="fa fa-address-card"></i> ' + data[6]);
             $("#clinicalTrialCreationTxnHash").html('<i class="fa fa-list-alt"></i> ' + clinicalTrailCreationTxnHash);
             $("#clinicalTrialHash").html('<i class="fa fa-check"</i>' + " Clinical Trial Contract mined!");
             $("#clinicalTrialHash").show().delay(5000).fadeOut();
             ctContractAddress = data[6];
             initializeClinicalTrialEvents();
         }*/
    });

}

/*Types of Coverage etc., will be edited by In
* surance company and the same will be written to blockchain*/
function acceptProposalOfSubmittedPolicy()
{
    var edited_Name= document.getElementById("customerName1").innerHTML;

    var edited_Dob= document.getElementById("c_dob").innerHTML;

    var edited_Age= document.getElementById("c_age").innerHTML;
    var edited_occupation= document.getElementById("c_Occupation").innerHTML;
    var edited_martialStatus= document.getElementById("martialStatus").innerHTML;
    var edited_policyType= document.getElementById("policyType").innerHTML;
    var edited_term= document.getElementById("term").innerHTML;
    var edited_sumAssured= document.getElementById("sumAssured").innerHTML;
    var edited_DiseasesCovered= document.getElementById("DiseasesCovered").innerHTML;
    var edited_gender= document.getElementById("gender").innerHTML;


    var edited_Pharmacies= document.getElementById("c_Pharmacies_Allowed").innerHTML;
    var edited_Hosptials= document.getElementById("c_Hospitals_Allowed").innerHTML;
    var edited_ReEmberse= document.getElementById("c_Reemberse").innerHTML;
    var edited_RoomRent= document.getElementById("c_RoomRent").innerHTML;
    var edited_PharmacyLimit= document.getElementById("c_Pharmacy_Limit").innerHTML;
    var edited_Riders_Deductable_Amount= document.getElementById("c_Deductable_Rider_Customer").innerHTML;
    var edited_Base_Deductable_Amount= document.getElementById("c_Deductable_Base_Customer").innerHTML;
    var edited_Coverage_Amount_for_Rider= document.getElementById("c_Coverage_Rider").innerHTML;
    var edited_Rider_TimePeriod= document.getElementById("c_Rider_Term").innerHTML;
    var edited_Medical_History= document.getElementById("c_Medical_History").innerHTML;
    var edited_PolicyOwner= document.getElementById("POwner").innerHTML;
    var edited_limitedPerDay= document.getElementById("c_limitperDay").innerHTML;

    var agentNumber= "A2017Sravan";
    var PolicyNumber= document.getElementById("c_policyNumber").innerHTML;
    var edited_emergency_amount= document.getElementById("c_limit_emergency").innerHTML;
        var edited_limit_per_Year= document.getElementById("c_limit_per_year").innerHTML;


    /*Entering the details into Database*/

    $.post('/Customer_Details_Approved_By_Insurance_Company',{AgentNumber: agentNumber,CustomerName: edited_Name,PolicyNumber: PolicyNumber,DateOfBirth: edited_Dob,
        Age: edited_Age,Gender:edited_gender,Occupation:edited_occupation,Martial_Status:edited_martialStatus,Policy_Type: edited_policyType,Term: edited_policyType,
        Sum_Assured: edited_sumAssured,Diseases_Covered: edited_DiseasesCovered,Medical_History: edited_Medical_History,Rider_Term: edited_Rider_TimePeriod,
        Rider_Coverage_Amount: edited_Coverage_Amount_for_Rider,Policy_Owner: edited_PolicyOwner,Deductable_Base: edited_Base_Deductable_Amount,
        Deductible_Rider: edited_Riders_Deductable_Amount,Limit_Per_Day: edited_limitedPerDay,Limit_For_Pharmacy: edited_PharmacyLimit,Limit_For_RoomRent: edited_RoomRent,
        ReEmburse: edited_ReEmberse,Pharmacies_Allowed: edited_Pharmacies,Hospitals_Allowed: edited_Hosptials,Year_Limit: edited_limit_per_Year,Emergency_Limit: edited_emergency_amount},function (data)
    {
        alert("data coming from policy Information"+ JSON.stringify(data));
    });

    regulatorInstance.acceptProposalOfSubmittedPolicy.sendTransaction(0,{from: regulatorAccount, gas: defaultGas}).then(
        function (txHash) {
            $("#acceptProposalSuccess2").html('<i class="fa fa-check"</i>'+ ' Transaction'+ txHash + " added to the blockchain");
            $("#acceptProposalSuccess2").show().delay(5000).fadeOut();
        }
    )

   // getCustomerInformation();

}

/*Get customer Information from the Database,to show result to the database*/
function getCustomerInformation_for_Pharmacy()
{

    var policyNumber= $("#PolicyNumbercheck12").val();//"17P01";
    alert(policyNumber);
    /*$.post('/PolicyNumberChecking',{policyNumber: policyNumber},function (data) {
        alert("data coming from policy Information"+ JSON.stringify(data));
    })*/
    $.post('/getCustomerInformation',{policyNumber: policyNumber},function (data) {
        alert("I m from inside of pharmacy"+JSON.stringify(data));
          document.getElementById("policyResultdiv1_for_Pharmacy").style.display = "block";

        $('#trialdatabody1_pharmacy').append('<tr><td>' + "CustomerData - " + data.data[0].CustomerName + '</tr></td>'
            +'<tr><td>'+" DOB:   " + data.data[0].DateOfBirth + '</td></tr>'
            +'<tr><td>'+" Age:   " + data.data[0].Age + '</td></tr>'
            +'<tr><td>'+" Occupation: " + data.data[0].Occupation + '</td></tr>'
            +'<tr><td>'+" Gender:   " + data.data[0].Gender + '</td></tr>'
            +'<tr><td>'+" Martial_Status:   " + data.data[0].Martial_Status + '</td></tr>'
            +'<tr><td>'+" Policy_Type:   " + data.data[0].Policy_Type + '</td></tr>'
            +'<tr><td>'+" Term:   " + data.data[0].Term + '</td></tr>'
            +'<tr><td>'+" Sum_Assured:   " + data.data[0].Sum_Assured + '</td></tr>'
            +'<tr><td>'+" Diseases_Covered:   " + data.data[0].Diseases_Covered + '</td></tr>'
            +'<tr><td>'+" Agent_Number:   " + data.data[0].AgentNumber + '</td></tr>'


        );

    })
}

function readProposalOfEmergency(policyNumber)
{
    document.getElementById("policyproposaldiv_Emergency").style.display = "block";

    $.post('/getCustomerInformation',{policyNumber: policyNumber},function (data) {
        var Medicinal_Limit = data.data[0].Emergencies_Received;
        alert("I am in read proposal of Emergency"+Medicinal_Limit.length);
        //alert("First Data Item in Medicines"+Medicinal_Limit[Medicinal_Limit.length-1]);
        $("#e_customerName1").html(Medicinal_Limit[Medicinal_Limit.length-1]);
        $("#e_dob").html(data.data[0].DateOfBirth);
        $("#e_limit_per_year").html(data.data[0].Limit_Per_Year);
        $("#e_e_limit_emergency").html(data.data[0].Emergency_Amount);


    })
}

function acceptProposalOfSubmittedPolicy_Emergency() {

    alert("I m inside the function");
    var pharma= "0x769De39f9e238054E71F5c46b16D8ceB41c8955a";

    regulatorInstance.acceptProposal_for_Emergency.sendTransaction(regulatorAccount, 1,{from: regulatorAccount,gas: defaultGas,value: web3.toWei(1,'ether'),}).then(function(txHash)
    {
        $("#acceptProposalSuccess2").html('<i class="fa fa-check"</i>'+ ' Transaction'+ txHash + " added to the blockchain");
        $("#acceptProposalSuccess2").show().delay(5000).fadeOut();
    }).then(function () {
        regulatorInstance.getBalance(regulatorAccount).then(function(data)
        {
            alert(data.c[0]);
        })

    })

}

function submitProposal_Emergency()
{
    alert("I m from submit proposal Emergency");
    var Hospital_Name= $("#hospitalName").val();
    var policyNumber= $("#PolicyNumbercheck_customer1").val();
    var drugName = $("#e_inputDrugName").val();
    var trialFrom = $("#e_datepickertrialfrom").val();

    alert(policyNumber);
    var admitted_on = (moment(trialFrom, "M/D/YYYY").valueOf()) / 1000;


    var Diseases_diagonised= $("#e_diseases").val();

    /*var cost_per_disease= $("#e_cost_each_disease").val();
    var spell_per_diseases= $("#e_spell_each_disease").val();
    var cost_per_day= $("#e_limit_per_day").val();
    var room_rent= $("#e_hospital_visit_room_rent_per_day").val();
    var days_stayed_in_hospital= $("#e_hospital_stay").val();*/

    /*
        var concatination= "Hospital Name: "+Hospital_Name+"**"+"Reason For Admitting: "+drugName+"**"+"AdmittedOn: "+trialFromTs+"Discharged On: "+trialToTs
        +"**"+"Injuries: "+Diseases_diagonised+"**"+"cost_Per_Disease"+cost_per_disease+"**"+"Spell per Diseases: "+spell_per_diseases+"Cost per Day: "+cost_per_day
        +"**"+"Room Rent: "+room_rent+"**"+"Number of days stayed in hospital"+days_stayed_in_hospital;*/


    var total_cost= $("#e_emergency_cost").val();
    var hospital_Address= $("#e_hospital_Address").val();
    var blockchain_Address= "0xF7db034FD67FAA7B06eE456C1b1F69529e793585";
/*
    var concatination= "Hospital Name: "+Hospital_Name+"**"+"Reason For Admitting: "+drugName+" Admitted On: "+admitted_on+"**"+" Injuries Happend: "+ Diseases_diagonised
    +"**"+"Cost Incurred: "+total_cost+"**"+" Hospital Address"+hospital_Address+"**"+" BlockchainAddress: "+blockchain_Address;*/






    $.post('/getCustomerInformation',{policyNumber: policyNumber},function (data) {


        var Year_limit = data.data[0].Limit_Per_Year;
        var emergency_amount= data.data[0].Emergency_Amount;


        var concatination= "PolicyNumber: "+policyNumber+" "+"Hospital Name: "+Hospital_Name+" "+"Reason For Admitting: "+drugName+" Admitted On: "+admitted_on+" "+" Injuries Happend: "+ Diseases_diagonised
            +" "+"Cost Incurred: "+total_cost+" "+" Hospital Address"+hospital_Address+" "+" BlockchainAddress: "+blockchain_Address+ "YearLimit: "+Year_limit+" "+"Emergency_Amount"+emergency_amount;
        alert("year Limit"+Year_limit+"total_cost"+total_cost+" Emergency Amount"+emergency_amount);

        var toStore = buffer.Buffer(concatination);


        if( total_cost < Year_limit )
        {
            emergency_amount= Year_limit- emergency_amount;

            $.post('/EmergencyDetails_Updation',{PolicyNumber: policyNumber,EmergencyInformation: concatination,limit: emergency_amount},function (data) {
                alert(JSON.stringify(data));
            })



            ipfs.add(toStore, function(err, res) {
                // alert(toStore);

                if (err || !res) {
                    alert("I m from error part")
                    return console.error('ipfs add error', err, res)
                }

                res.forEach(function(file) {
                    console.log('successfully stored', file);
                    //submitTrialProtocolDocument(file.path);
                    //display(file.path);

                    hash_tobeStored_in_contract= file.path;
                    ipfs.cat(file.path, function(err, res) {
                        if(err || !res) return console.error("ipfs cat error", err, res);
                        if(res.readable) {
                            console.error('unhandled: cat result is a pipe', res);
                        } else {
                            //   alert(file.path);
                            console.log("Ipfs Hash: "+file.path);

                            regulatorInstance.EmergencyDetails.sendTransaction(blockchain_Address,file.path,{from: croAccount,gas: defaultGas}).then(
                                function (txHash) {
                                    //         alert("I after submitting customer policy"+txHash);
                                    $("#submitProposalSuccess2").html('<i class="fa fa-check"</i>' + ' Transaction ' + txHash + " added to the blockchain");
                                    $("#submitProposalSuccess2").show().delay(5000).fadeOut();
                                    readProposalOfEmergency(policyNumber);


                                }
                            )
                        }
                    });
                })
            })

            /*regulatorInstance.EmergencyDetails.sendTransaction(blockchain_Address,concatination,{from: regulatorAccount, gas: defaultGas}).then(
                function (txHash) {
                    $("#submitProposalSuccess2").html('<i class="fa fa-check"</i>'+ ' Transaction'+ txHash + " added to the blockchain");
                    $("#submitProposalSuccess2").show().delay(5000).fadeOut();
                    alert("I am before calling ReadProposalOfEmergency");

                    readProposalOfEmergency();
                }
            )*/


            /*Pay via contract to the Pharmacy the same amount*/

            /*var pharma= "0xF7db034FD67FAA7B06eE456C1b1F69529e793585";
            regulatorInstance.acceptProposal_for_Emergency.sendTransaction(pharma, 1,{from: regulatorAccount,gas: defaultGas,value: web3.toWei(1,'ether'),}).then(function(txHash)
            {
                $("#acceptProposalSuccess2").html('<i class="fa fa-check"</i>'+ ' Transaction'+ txHash + " added to the blockchain");
                $("#acceptProposalSuccess2").show().delay(5000).fadeOut();
            }).then(function () {
                regulatorInstance.getBalance(regulatorAccount).then(function(data)
                {
                    alert(data.c[0]);
                })

            })*/

        }
       /*
            This part can be used in submitproposal concept
       var Day_limit = data.data[0].Limit_Per_Day;
        var RoomRent_limit= data.data[0].Limit_For_RoomRent;
        var hospitaldays_covered= data.data[0].Days_Covered;
        var emergency_limit= data.data[0].Emergency_Amount;

        if(RoomRent_limit <= room_rent   && Day_limit <= cost_per_day)
        {
            Day_limit= Day_limit - cost_per_day;
            RoomRent_limit= RoomRent_limit - room_rent;


        }*/


    })

}

function Submit_Proposal_For_Medicine_By_Pharmacy()
{
    alert("Testing in Pharmacy");
    var policyNumber= $("#PolicyNumbercheck12").val();
    alert(policyNumber);
    var medicines_purchased= $("#Medicines_Taken").val();
    var total_cost= $("#Total_Cost").val();
    var concatination= medicines_purchased+"**"+total_cost;
    $.post('/getCustomerInformation',{policyNumber: policyNumber},function (data)
    {
        alert(data.data[0].Limit_For_Pharmacy);
        var Medicinal_Limit= data.data[0].Limit_For_Pharmacy;
        alert(Medicinal_Limit);

        if(Medicinal_Limit >= total_cost) {
            //Update the value in the Database and call the contract to record the same
            Medicinal_Limit = Medicinal_Limit - total_cost;
            $.post('/PharmacyDetails_Updation',{PolicyNumber: policyNumber,PharmacyInformation: concatination,limit: Medicinal_Limit},function (data) {
                $.post('/getCustomerInformation',{policyNumber: policyNumber},function (data) {
                    var year_limit = data.data[0].Limit_per_Year;
                    alert("Smart contract pays the amount");
                })
                    // alert(JSON.stringify(data));
            })

            /*Pay via contract to the Pharmacy the same amount*/

            var pharma= "0xB5Bd97447A1D95f75226b834A9E0CA6E6e3EF07B";
            regulatorInstance.acceptProposal_for_Pharmacy.sendTransaction(pharma, 1,{from: regulatorAccount,gas: defaultGas,value: web3.toWei(1,'ether'),}).then(function(txHash)
            {
                $("#acceptProposalSuccess2").html('<i class="fa fa-check"</i>'+ ' Transaction'+ txHash + " added to the blockchain");
                $("#acceptProposalSuccess2").show().delay(5000).fadeOut();
                   }).then(function () {
                regulatorInstance.getBalance(regulatorAccount).then(function(data)
                {
                    alert(data.c[0]);
                })

            })

        }


    })

}



function getCustomerInformation()
{
    alert("I am from getcustomer information");
    var policyNumber= $("#PolicyNumbercheck_customer").val();
    alert("Policy Number :"+ policyNumber);

    $.post('/PolicyNumberChecking',{policyNumber: policyNumber},function (data) {
        alert("data coming from policy Information"+ JSON.stringify(data));
    })
        $.post('/getCustomerInformation',{policyNumber: policyNumber},function (data) {


        document.getElementById("policyResultdiv1").style.display = "block";

        $('#trialdatabody1').append('<tr><td>' + "CustomerData - " + data.data[0].CustomerName + '</tr></td>'
            +'<tr><td>'+" DOB:   " + data.data[0].DateOfBirth + '</td></tr>'
            +'<tr><td>'+" Age:   " + data.data[0].Age + '</td></tr>'
            +'<tr><td>'+" Occupation: " + data.data[0].Occupation + '</td></tr>'
            +'<tr><td>'+" Gender:   " + data.data[0].Gender + '</td></tr>'
            +'<tr><td>'+" Martial_Status:   " + data.data[0].Martial_Status + '</td></tr>'
            +'<tr><td>'+" Policy_Type:   " + data.data[0].Policy_Type + '</td></tr>'
            +'<tr><td>'+" Term:   " + data.data[0].Term + '</td></tr>'
            +'<tr><td>'+" Sum_Assured:   " + data.data[0].Sum_Assured + '</td></tr>'
            +'<tr><td>'+" Diseases_Covered:   " + data.data[0].Diseases_Covered + '</td></tr>'
            +'<tr><td>'+" Agent_Number:   " + data.data[0].AgentNumber + '</td></tr>'
            +'<tr><td>'+" Pharmacies Allowed:   " + data.data[0].Pharmacies_Allowed + '</td></tr>'
            +'<tr><td>'+" Hospitals  Allowed:   " + data.data[0].Hospitals_Allowed + '</td></tr>'
            +'<tr><td>'+" ReEmberse:   " + data.data[0].ReEmburse + '</td></tr>'
            +'<tr><td>'+" Room Rent:   " + data.data[0].Limit_For_RoomRent + '</td></tr>'
            +'<tr><td>'+" Pharmacy Limit:   " + data.data[0].Limit_For_Pharmacy + '</td></tr>'
            +'<tr><td>'+" Rider Deductible Amount:   " + data.data[0].Deductible_Rider + '</td></tr>'
            +'<tr><td>'+" Base Deductable Amount:   " + data.data[0].Deductible_Base + '</td></tr>'
            +'<tr><td>'+" Rider Coverage Amount:   " + data.data[0].Rider_Coverage_Amount + '</td></tr>'
            +'<tr><td>'+" Medical History:   " + data.data[0].Medical_History + '</td></tr>'
            +'<tr><td>'+" Policy Owner:   " + data.data[0].Policy_Owner + '</td></tr>'
            +'<tr><td>'+" Limit Per Day:   " + data.data[0].Limit_Per_Day + '</td></tr>'

        );

        console.log(data.data[0].AgentNumber);


        var r_c_dob= data.data[0].DateOfBirth;
        var r_c_age= data.data[0].Age;
        var r_c_Occupation=  data.data[0].Occupation;
        var r_gender= data.data[0].Gender;
        var r_martialStatus= data.data[0].Martial_Status;
        var policyType= data.data[0].Policy_Type;
        var r_term= data.data[0].Term;
        var r_sumAssured= data.data[0].Sum_Assured;
        var r_DiseasesCovered= data.data[0].Diseases_Covered;



    })
}

function getCustomerInformation_customer()
{
    alert("I am from getcustomer information");
    var policyNumber= $("#PolicyNumbercheck_customer").val();
    alert("Policy Number :"+ policyNumber);

    $.post('/PolicyNumberChecking',{policyNumber: policyNumber},function (data) {
        alert("data coming from policy Information"+ JSON.stringify(data));
    })
    $.post('/getCustomerInformation',{policyNumber: policyNumber},function (data) {


        document.getElementById("policyResultdiv_customer").style.display = "block";

        $('#trialdatabody_customer').append('<tr><td>' + "CustomerData - " + data.data[0].CustomerName + '</tr></td>'
            +'<tr><td>'+" DOB:   " + data.data[0].DateOfBirth + '</td></tr>'
            +'<tr><td>'+" Age:   " + data.data[0].Age + '</td></tr>'
            +'<tr><td>'+" Occupation: " + data.data[0].Occupation + '</td></tr>'
            +'<tr><td>'+" Gender:   " + data.data[0].Gender + '</td></tr>'
            +'<tr><td>'+" Martial_Status:   " + data.data[0].Martial_Status + '</td></tr>'
            +'<tr><td>'+" Policy_Type:   " + data.data[0].Policy_Type + '</td></tr>'
            +'<tr><td>'+" Term:   " + data.data[0].Term + '</td></tr>'
            +'<tr><td>'+" Sum_Assured:   " + data.data[0].Sum_Assured + '</td></tr>'
            +'<tr><td>'+" Diseases_Covered:   " + data.data[0].Diseases_Covered + '</td></tr>'
            +'<tr><td>'+" Agent_Number:   " + data.data[0].AgentNumber + '</td></tr>'
            +'<tr><td>'+" Pharmacies Allowed:   " + data.data[0].Pharmacies_Allowed + '</td></tr>'
            +'<tr><td>'+" Hospitals  Allowed:   " + data.data[0].Hospitals_Allowed + '</td></tr>'
            +'<tr><td>'+" ReEmberse:   " + data.data[0].ReEmburse + '</td></tr>'
            +'<tr><td>'+" Room Rent:   " + data.data[0].Limit_For_RoomRent + '</td></tr>'
            +'<tr><td>'+" Pharmacy Limit:   " + data.data[0].Limit_For_Pharmacy + '</td></tr>'
            +'<tr><td>'+" Rider Deductible Amount:   " + data.data[0].Deductible_Rider + '</td></tr>'
            +'<tr><td>'+" Base Deductable Amount:   " + data.data[0].Deductible_Base + '</td></tr>'
            +'<tr><td>'+" Rider Coverage Amount:   " + data.data[0].Rider_Coverage_Amount + '</td></tr>'
            +'<tr><td>'+" Medical History:   " + data.data[0].Medical_History + '</td></tr>'
            +'<tr><td>'+" Policy Owner:   " + data.data[0].Policy_Owner + '</td></tr>'
            +'<tr><td>'+" Limit Per Day:   " + data.data[0].Limit_Per_Day + '</td></tr>'

        );

        console.log(data.data[0].AgentNumber);


        var r_c_dob= data.data[0].DateOfBirth;
        var r_c_age= data.data[0].Age;
        var r_c_Occupation=  data.data[0].Occupation;
        var r_gender= data.data[0].Gender;
        var r_martialStatus= data.data[0].Martial_Status;
        var policyType= data.data[0].Policy_Type;
        var r_term= data.data[0].Term;
        var r_sumAssured= data.data[0].Sum_Assured;
        var r_DiseasesCovered= data.data[0].Diseases_Covered;



    })
}


function acceptProposalId0() {
    /*var trailTextArea = $("#PatientDetails").val();
    alert(trailTextArea);
    var policyNumber= $("");
    $.post('/places', {data: trailTextArea},function (data) {
        alert("I m from get method"+JSON.stringify(data));
        //alert(JSON.stringify(data));

    });*/

    regulatorInstance.acceptProposal1.sendTransaction(regulatorAccount, 1,{from: regulatorAccount,gas: defaultGas,value: web3.toWei(1,'ether'),}).then(function(txHash)
    {

        $("#acceptProposalSuccess2").html('<i class="fa fa-check"</i>'+ ' Transaction'+ txHash + " added to the blockchain");
        $("#acceptProposalSuccess2").show().delay(5000).fadeOut();


    }).then(function () {
        regulatorInstance.getBalance(regulatorAccount).then(function(data)
            {
              alert(data.c[0]);
            })

    })

  /*  regulatorInstance.acceptProposal.sendTransaction(0, { from: regulatorAccount, gas: defaultGas }).then(
        function(txHash) {
            clinicalTrailCreationTxnHash = txHash;
            $("#acceptProposalSuccess").html('<i class="fa fa-check"</i>' + ' Transaction ' + txHash + " added to the blockchain");
            $("#acceptProposalSuccess").show().delay(5000).fadeOut();
            readProposalById0();
        }
    );*/
}

function addSubjects() {
    var ct = ClinicalTrial.at(ctContractAddress);
    document.getElementById("trialdiv").style.display = "block";

    function addSubjectTransaction(sub, currentValue) {
        var deferred = Q.defer();
        ct.addSubject.sendTransaction(sub, { from: currentAccount, gas: defaultGas }).then(function(txHash) {
            $("#addSubjectHash").html('<i class="fa fa-check"</i>' + ' Transaction ' + txHash + " added to the blockchain");
            $("#addSubjectHash").show().delay(5000).fadeOut();
            getSubjectById(currentValue);
            deferred.resolve();
        }).catch(function(e) {
            console.log("catching---->" + e)
            if ((e + "").indexOf("invalid JUMP") || (e + "").indexOf("out of gas") > -1) {
                // We are in TestRPC
                $("#addSubjectError").show().delay(5000).fadeOut();
            } else if ((e + "").indexOf("please check your gas amount") > -1) {
                // We are in Geth for a deployment
            } else {
                throw e;
            }
        });
        return deferred.promise;
    }

    var subjectsRange = [];
    for (i = 0; i < subjects; i++) {
        subjectsRange.push(i);
    }

    subjectsRange.reduce(function(previousValue, currentValue) {
        return previousValue.then(function() {
            var data = {};
            data['name'] = 's' + currentValue.toString();
            data['dob'] = getRandomInt(1, 12) + '-' + getRandomInt(1, 30) + '-' + getRandomInt(2014, 2015);
            data['gender'] = genderArray[getRandomInt(0, 1)];
            var sub = data['name'] + '/' + data['dob'] + '/' + data['gender'];
            return addSubjectTransaction(sub, currentValue);
        })
    }, Q.resolve('start'));
}


function getSubjectById(currentValue) {
    var ct = ClinicalTrial.at(ctContractAddress);
    ct.getSubjectById(currentValue).then(function(_subjId) {
        var table = document.getElementById("subjecttable").getElementsByTagName('tbody')[0];
        var row = table.insertRow(0);
        var nameCell = row.insertCell(0);
        var dobCell = row.insertCell(1);
        var genderCell = row.insertCell(2);
        var fields = hex2string(_subjId).split('/');
        nameCell.innerHTML = fields[0];
        dobCell.innerHTML = fields[1];
        genderCell.innerHTML = fields[2];
    });
}

function getRandomInt(min, max) {
    return (Math.floor(Math.random() * (max - min + 1)) + min).toString();
}

function addDataPoints() {
    var ct = ClinicalTrial.at(ctContractAddress);

    function addDataTransaction(_subjId, _json) {
        var deferred = Q.defer();
        //croAccount
        ct.addDataPoint.sendTransaction(_subjId, _json, { from: currentAccount, gas: defaultGas }).then(function(txHash) {
            $("#addDataPointstHash").html('<i class="fa fa-check"</i>' + ' Transaction ' + txHash + " added to the blockchain");
            $("#addDataPointstHash").show().delay(5000).fadeOut();
            deferred.resolve();
        }).catch(function(e) {
            console.log("catching---->" + e)
            if ((e + "").indexOf("invalid JUMP") || (e + "").indexOf("out of gas") > -1) {
                // We are in TestRPC
                $("#addDataError").show().delay(5000).fadeOut();
            } else if ((e + "").indexOf("please check your gas amount") > -1) {
                // We are in Geth for a deployment
            } else {
                throw e;
            }
        });
        return deferred.promise;
    }

    var subjectsRange = [];
    for (i = 0; i < subjects; i++) {
        subjectsRange.push(i);
    }

    subjectsRange.reduce(function(previousValue, currentValue) {
        return previousValue.then(function() {
            var promises = []
            for (j = 0; j < dataPoints; j++) {
                var data = {};
                data['dose'] = Math.floor((Math.random() * 100) + 1);
                data['units'] = 'mg';
                data['response'] = Math.floor((Math.random() * 100) + 1);
                data['side-effects'] = sideEffect[getRandomInt(0, 5)];
                var _json = data['dose'] + '/' + data['units'] + '/' + data['response'] + '/' + data['side-effects'];
                promises.push(addDataTransaction(currentValue, _json));
            }
            return Q.all(promises);
        })
    }, Q.resolve('start'));
}


function readFromTrial(actor) {
    var ct = ClinicalTrial.at(ctContractAddress);

    function readDataPoint(_patientIdx, _dataIdx, _patient) {
        var deferred1 = Q.defer();
        ct.getDataPointForSubject(_patientIdx, _dataIdx).then(function(data) {
            data[1] = hex2string(data[1]);
            if (actor == 'cro') {
                $('#trialdatabody').append('<tr><td>' + "Dose/Units/Response/Side Effects - " + data[1] + " added at " + Date(data[0]) + '</td></tr>');
            } else {
                $('#trialdatabodypharma').append('<tr><td>' + "Dose/Units/Response/Side Effects - " + data[1] + " added at " + Date(data[0]) + '</td></tr>');

            }
            deferred1.resolve();
        })
        return deferred1.promise;
    }

    function readDataForPatient(_patientIdx) {
        var deferred = Q.defer();
        ct.getSubjectById(_patientIdx).then(function(_patient) {
            if (actor == 'cro') {
                $('#trialdatabody').append('<tr><td style="font-weight:bold">' + hex2string(_patient) + '</td></tr>');
            } else {
                $('#trialdatabodypharma').append('<tr><td style="font-weight:bold">' + hex2string(_patient) + '</td></tr>');
            }
            var promises = [];
            ct.getDataCounterForSubject(_patientIdx).then(function(_counterForPatient) {
                for (var i = 0; i < parseInt(_counterForPatient); i++) {
                    promises.push(readDataPoint(_patientIdx, i, _patient));
                }
                Q.all(promises).then(function() {
                    deferred.resolve();
                })
            })
        })

        return deferred.promise;
    }

    ct.getSubjectsCount().then(function(_count) {
        var range = [];
        for (var i = 0; i < _count; i++) {
            range.push(i);
        }

        range.reduce(function(previousValue, currentValue) {
            return previousValue.then(function() {
                return readDataForPatient(currentValue);
            })
        }, Q.resolve('start'));
    })

}

function showAccounts() {
    var accountSelect = document.getElementById("accountSelect");
    userAccounts.forEach(function(account) {
        var option = document.createElement("option");
        if (account == regulatorAccount) {
            option.text = account + " - Regulator";
        } else if (account == croAccount) {
            option.text = account + " - CRO";
        } else if (account = pharmaAccount) {
            option.text = account + " - Pharma";
        }
        option.value = account;
        accountSelect.add(option);
    });
}


function store() {
    const file = document.getElementById('source').files[0]
    const reader = new FileReader()
    reader.onload = function() {
        var toStore = buffer.Buffer(reader.result);
        //alert(toStore);
        ipfs.add(toStore, function(err, res) {
           // alert(toStore);

            if (err || !res) {
                alert("I m from error part")
                return console.error('ipfs add error', err, res)
            }

            res.forEach(function(file) {
                console.log('successfully stored', file);
                submitTrialProtocolDocument(file.path);
                display(file.path);
            })
        })
    }
    reader.readAsArrayBuffer(file)
}

function submitTrialProtocolDocument(docHash) {
    console.log(docHash);
    regulatorInstance.submitTrialProtocolDocument.sendTransaction(0, docHash, { from: croAccount, gas: defaultGas }).then(
        function(txHash) {
            console.log("Submitting trial protocal docHash into trial proposal ", txHash);
            $("#uploadIpfsSuccess").html('<i class="fa fa-check"</i>' + ' IPFS Document Hash ' + docHash + " added to IPFS");
            $("#uploadIpfsSuccess").show().delay(7000).fadeOut();
            $("#uploadProtocalSuccess").html('<i class="fa fa-check"</i>' + ' Transaction ' + txHash + " added to the blockchain");
            $("#uploadProtocalSuccess").show().delay(7000).fadeOut();
            readProposalById0();
        }
    );
}

function display(hash) {
    document.getElementById('hash').innerHTML =
        "<a target='_blank' href='http://" + hostName + ":8080/ipfs/" + hash + "'>" + hash + "</a>"
}

async function test() {
    var dayscovered= $("#days_covered").val();
    var customerName = $("#customerName").val();
    var trialTo = $("#customer_DOB").val();
    var customer_DOB = (moment(trialTo, "M/D/YYYY").valueOf()) / 1000;

    var customer_Age= $("#customer_age").val();
    var occupation= $("#customer_occupation").val();
    var gender= $("#customer_gender").val();
    var martialStatus= $("#customer_martialStatus").val();
    var policyType= $("#customer_Policy_Coverage_Type").val();
    var term= $("#customer_Term").val();
    var sumAssured= $("#customer_SumAssured").val();
    var DiseasesCovered= $("#customer_DiseasesCovered").val();
    var medicalHistory= $("#customer_MedicalHistory").val();

    var customer_term_rider= $("#customer_Term_Rider").val();
    var customer_policy_rider= $("#customer_Policy_Coverage_Rider").val();
    var customer_policy_Owner= $("#customer_PolicyOwner").val();
    var customer_rider_assured= $("#customer_Rider_Assured").val();
    var customer_dedcutable_base= $("#customer_Deductable_Base").val();
    var customer_deducatable_rider= $("#customer_Deductable_Rider").val();
    var customer_limit_per_day= $("#customer_limit_per_day").val();
    var customer_limit_for_pharmacy= $("#customer_limit_for_Pharmacy").val();
    var customer_roomRent= $("#customer_roomRent").val();
    var customer_remberse= $("#customer_Re_embersement").val();
    var pharmacies_Approved= $("#customer_PharmaciesApproved").val();
    var hospitals_approved= $("#customer_PharmaciesApproved").val();
    var policyNumber= $("#customer_PolicyNumber").val();
    var limit_per_year= $("#customer_limit_per_year").val();
    var emergency_limit= $("#emergency_Amount").val();

    /*This part is used to save all the user information in IPFS*/
    const data = JSON.stringify({
        customerName: customerName,
        Dob: customer_DOB,
        Age: customer_Age,
        Occupation: occupation,
        Gender: gender,
        MartialStatus: martialStatus,
        PolicyType: policyType,
        Base_Term: term,
        Base_SumAssured: sumAssured,
        Diseases_Covered_Customer: DiseasesCovered,
        Rider_Term: customer_term_rider,
        Coverage_Rider: customer_rider_assured,
        Deductible_Base_customer: customer_dedcutable_base,
        Deductible_Rider_customer: customer_deducatable_rider,
        Day_Limit: customer_limit_per_day,
        Pharmacy_Limit: customer_limit_for_pharmacy,
        RoomRent: customer_roomRent,
        Remberse: customer_remberse,
        Pharmacies_Allowed: pharmacies_Approved,
        Hospitals_Allowed: hospitals_approved,
        MedicalHistory: medicalHistory,
        Status: "Submitted",
        PolicyOwner: customer_policy_Owner,
        LimitPerDay: customer_limit_per_day,
        PolicyNumber: policyNumber,
        Days_Covered: dayscovered,
        Limit_per_Year: limit_per_year,
        Emergency_Amount: emergency_limit,

    });

    /*Adding all the contents to the IPFS*/
    var toStore = buffer.Buffer(data);
    var hash_tobeStored_in_contract= "";

    ipfs.add(toStore, function(err, res) {
        // alert(toStore);

        if (err || !res) {
            alert("I m from error part")
            return console.error('ipfs add error', err, res)
        }

        res.forEach(function(file) {
            console.log('successfully stored', file);
            //submitTrialProtocolDocument(file.path);
            //display(file.path);

            hash_tobeStored_in_contract= file.path;
            ipfs.cat(file.path, function(err, res) {
                if(err || !res) return console.error("ipfs cat error", err, res);
                if(res.readable) {
                    console.error('unhandled: cat result is a pipe', res);
                } else {
                    alert(file.path);
                    console.log("Ipfs Hash: "+file.path);

                    regulatorInstance.agent_submitting_customer_policy.sendTransaction(file.path,{from: croAccount,gas: defaultGas}).then(
                        function (txHash) {
                            alert("I after submitting customer policy"+txHash);
                            $("#submitProposalSuccess1").html('<i class="fa fa-check"</i>' + ' Transaction ' + txHash + " added to the blockchain");
                            $("#submitProposalSuccess1").show().delay(5000).fadeOut();
                            readProposalOfSubmittedPolicy1();


                        }
                    )
                }
            });
        })
    })


    var customerTemporaryAddress= "0xB5Bd97447A1D95f75226b834A9E0CA6E6e3EF07B";

}

function submitcustomerInformation()
{
    test();

}

async function getBlockDetails(blockNo) {
    var block= "";
    web3.eth.getBlock(blockNo,function (error,result) {
        if(!error)
        {
            block= result;
            console.log(block);
        }

    });

    await sleep(100);

    console.log("Block number     : " + block.number + "\n"
        + " hash            : " + block.hash + "\n"
        + " parentHash      : " + block.parentHash + "\n"
        + " nonce           : " + block.nonce + "\n"
        + " sha3Uncles      : " + block.sha3Uncles + "\n"
        + " logsBloom       : " + block.logsBloom + "\n"
        + " transactionsRoot: " + block.transactionsRoot + "\n"
        + " stateRoot       : " + block.stateRoot + "\n"
        + " miner           : " + block.miner + "\n"
        + " difficulty      : " + block.difficulty + "\n"
        + " totalDifficulty : " + block.totalDifficulty + "\n"
        + " extraData       : " + block.extraData + "\n"
        + " size            : " + block.size + "\n"
        + " gasLimit        : " + block.gasLimit + "\n"
        + " gasUsed         : " + block.gasUsed + "\n"
        + " timestamp       : " + block.timestamp + "\n"
        + " transactions    : " + block.transactions + "\n"
        + " uncles          : " + block.uncles+ "\n"
        + "  hash rate      : " + web3.eth.getHashrate());

    if (block.transactions != null) {
        console.log("--- transactions ---");
        block.transactions.forEach( function(e) {
            //printTransaction(e);
        })
    }
   // alert(block+"I m from GetBlockDetails")
    $('#blkNum').html(block.number);
    $('#transactionCount').html(block.transactions.length);
    $('#transactions').html(block.transactions[0]);
    $('#timestamp').html(Date(block.timestamp));
    $('#difficulty').html(("" + block.difficulty).replace(/['"]+/g, ''));
    $('#nonce').html(block.nonce);
    $('#size').html(block.size);
    $('#miner').html(block.miner);
    $('#gasLimit').html(block.gasLimit);
    $('#gasUsed').html(block.gasUsed);
    $('#receiptRoot').html(block.receiptRoot);
    $('#stateRoot').html(block.stateRoot);
    $('#sha3Uncles').html(block.sha3Uncles);

    $('#modalBlockDetails').modal({
        show: true,
        keyboard: true,
        backdrop: "static"
    });
}


function getBlock(number) {
    web3.eth.getBlock(number, function(error, block) {
        console.log("Next block:"+number);
        if(error)
            console.log(error);
        else {
            console.log(block);
            if(number < 1000) {
                getBlock(number+1);
            }
        }
    });
};
var blockNum= ""

 function currentBlockInformation()
{
    alert("I m from currentBlockInformation");
    web3.eth.getBlockNumber(function(error, result){
        if (!error) {
            alert("I m frm BlockNumber"+result);
            console.log("block number => " + JSON.stringify(result))
            blockNum= result;
            return  (blockNum);
            // alert("sairam"+result);
        }
    })
}
function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}
async function getBlockInfo() {

   // getBlock(0);

    var maxBlocks = 100;
   currentBlockInformation();
    await sleep(100);
    blocks = [];

    for (var i = 0; i < maxBlocks; ++i) {
        //alert("I m frm for loop");
        web3.eth.getBlock((blockNum - i),function (err,result) {
            if(!err) {
                blocks.push(result)
                console.log(result)
                //console.log(blocks)
            }
            if(err)
                alert("I m from error of loop");

        });
    }
    $("#”transactions tbody").empty();
    await sleep(500);
    console.log("From Blocks"+blocks[0]);

    console.log("From Blocks"+blocks.length);
    blocks.forEach(function(block) {
        for (var index = 0; index < block.transactions.length; index++) {
            var t = block.transactions[index];
            $('#transactionsbody').append('<tr><td><a  target="#" onclick="getBlockDetails(' + block.number + ');return false;" href="' + t.blockNumber +
                ' ">' + block.number + '</a></td><td>' + block.hash +
                '</td><td>' + block.parentHash +
                '</td>');
        }
    });

}

window.onload = function() {

    web3.eth.getAccounts(function(err, accs) {
        if (err != null) {
            alert("There was an error fetching your accounts.");
            return;
        }
        if (accs.length == 0) {
            alert("Couldn't get any accounts! Make sure your Ethereum client is configured correctly.");
            return;
        }
        accounts = accs;

        pharmaAccount = accounts[0];
        currentAccount = accounts[0];
        regulatorAccount = "0xcAe8262759Fa5bd5E6Bc3aA266598f55A81024D4";//accounts[1];
        croAccount = accounts[2];

        userAccounts.push(pharmaAccount);
        userAccounts.push(regulatorAccount);
        userAccounts.push(croAccount);
        alert(pharmaAccount);
        $('#pharmaAccount').html('User Account : ' + pharmaAccount);
        $('#regulatorAccount').html('User Account : ' + regulatorAccount);
        $('#croAccount').html('User Account : ' + croAccount);
        //web3.eth.defaultAccount = accounts[0];
    });

    $("#accountSelect").change(function(e) {
        e.preventDefault();
        //alert("sairam i mfrom change");
        currentAccount = $("#accountSelect option:selected").val();
        currentAccountText = $("#accountSelect option:selected").text();
        var fields = currentAccountText.split('-');
        $('#actor').text(fields[1]);
        if (currentAccount == pharmaAccount) {
            $('#mytabs a[href="#sectionA"]').tab('show');
        } else if (currentAccount == regulatorAccount) {
            $('#mytabs a[href="#sectionB"]').tab('show');
        } else {
            $('#mytabs a[href="#sectionC"]').tab('show');
        }

    });

    $("#deployRegContract").click(function() {
        //alert("sairam");
        var accountSelected = $("#accountSelect option:selected").val();
        deployRegulator();
        //alert("After calling deployRegulator");
    });

    $("#addCroForApproval").click(function() {
        var cro = $("#addCro").val();
        var croUrl = $("#addCroUrl").val();
        addCroForApproval(cro, croUrl);
    });

    $("#approveCRO").click(function() {
        approveCroWithId0();
    });

    $("#acceptProposal").click(function() {
        acceptProposalId0();
    });


    $("#acceptProposal_InsuranceCompany").click(function() {
        acceptProposalId0();
    });

    $("#acceptProposalOfSubmittedPolicy_Emergency").click(function () {
       // alert("Testing the function");
        acceptProposalOfSubmittedPolicy_Emergency();
    })

    //accept proposal by tpa
    $("#acceptProposal_tpa").click(function() {
        acceptProposalId0();
    });

    $("#acceptProposalOfSubmittedPolicy").click(function () {
        acceptProposalOfSubmittedPolicy();
    });

    $("#Submit_Proposal_For_Medicines").click(function () {
        alert("Inside medicines");

        Submit_Proposal_For_Medicine_By_Pharmacy();

    })

    $("#deployCtContract").click(function() {
        submitProposal();
    });

    $("#submit_proposal_Emergency").click(function () {
        submitProposal_Emergency();

    })

    //used for polic checking
    $("#Policychecking").click(function() {
        alert("I m frm get customer Information");
        getCustomerInformation();
    });

    $("#Policychecking_customer").click(function() {
        alert("I m frm get customer Information");
        getCustomerInformation_customer();
    });

    $("#Pharmachecking").click(function() {
        getCustomerInformation_for_Pharmacy();
    });

    $("#btnAddSubject").click(function() {
        addSubjects();
    });

    $("#btnAddDataPoints").click(function() {
        addDataPoints();
    });

    $("#btnTrialData").click(function() {
        readFromTrial('cro');
    });

    $("#btnTrialDataPharma").click(function() {
        readFromTrial('pharma');
    });

    $("#modalClose").click(function() {
        $('#modalBlockDetails').modal('hide');
    });

    $("#deployCustomerInformation").click(function () {
        alert("I m from customer Information");
        submitcustomerInformation();
        //submitCustomerDetails()
        //test();
    });

    $(function() {
        $("#datepickertrialfrom").datepicker();
        $("#datepickertrialto").datepicker();
        $("#customer_DOB").datepicker();
        $("#e_datepickertrialfrom").datepicker();
        $("e_datepickertrialto").datepicker();
    });

    $('a[data-toggle="tab"]').on('shown.bs.tab', function(e) {
        var target = $(e.target).attr("href") // activated tab
        if (target == "#sectionA") {
            $('#actor').text("Pharma");
            currentAccount = pharmaAccount;
            $('#pharmaAccount').html('User Account : ' + pharmaAccount);


        } else if (target == "#sectionB") {
            $('#actor').text("Regulator");
            currentAccount = regulatorAccount;
            $('#regulatorAccount').html('User Account : ' + regulatorAccount);
        } else if (target == "#sectionC") {
            $('#actor').text("CRO");
            currentAccount = croAccount;
            currentAccount = regulatorAccount;
            $('#croAccount').html('User Account : ' + croAccount);
        }

       else if (target == "#dropdown2") {

            //alert("Get Block Info sairam 123");
            getBlockInfo();
        }
    });
};
