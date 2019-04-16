pragma solidity ^0.4.23;

import "./ClinicalTrial.sol";

contract Regulator {


    function () public payable {}
   address owner;
   int constant STATUS_SUBMITTED = 0;
   int constant STATUS_ACCEPTED  = 1;
   int constant STATUS_REJECTED  = 2;

   mapping (address => uint256) public balances;

   event ProposalSubmitted(address msgSender,bytes32 msg,uint timestamp);
   event ProposalAccepted_Emergency (address msgSender,bytes32 msg,uint timestamp);
   event ProposalAccepted (address msgSender,bytes32 msg,uint timestamp);
   event ProposalRejected (address msgSender,bytes32 msg,uint timestamp);

   event AddCRO (address msgSender,bytes32 msg,uint timestamp);
   event UpdateCROStatus (address msgSender,bytes32 msg,uint timestamp);
   event RegulatoryContractDeployed (address msgSender,bytes32 msg,uint timestamp);
   event ClinicalTrialContractDeployed (address msgSender,bytes32 msg,uint timestamp);
   event UploadTrialProtocol (address msgSender,bytes msg,uint timestamp);
   event SigVerification(address msgSender,address msg,uint timestamp);

   event CustomerPolicySubmitted(address msgSender,bytes32 msg,uint timestamp);
      event CustomerPolicySubmitted_agent(address msgSender,bytes msg,uint timestamp);
      //event CustomerPolicySubmitted_agent(address msgSender,bytes msg,uint timestamp);

   event  AcceptedProposalOfSubmittedPolicy(address msgSender,bytes32 msg,uint timestamp);

   struct CroIdentity {
      bytes32  name;
      bytes32  url;
      address addr;
      int   status;  //values: SUBMITTED, ACCEPTED, REJECTED
   }

   struct TrialProposal {
      address croAddr;
      bytes32  drugName;
      uint32  startDate;
      uint32  endDate;
      bytes  ipfsHash;
      int   status; // values: SUBMITTED, ACCEPTED, REJECTED
      //address trial;  // clinical trial contract; 0x0 if none
      bytes32 patientDetails;
      bytes32 diseases_diagonised;
          /*          bytes16 cost_per_disease;
                    bytes16 spell_per_disease;
                    bytes16 cost_per_day;
                    bytes16 room_rent;
                    bytes16 days_stayed_in_hospital;
                    */

   }


   struct Patient_Info_cost
   {
        bytes16 diseases;
              bytes16 cost_per_disease;
              bytes16 spell_per_disease;
              bytes16 cost_per_day;
              bytes16 room_rent;
              bytes16 days_stayed_in_hospital;

   }
   Patient_Info_cost [] cost_of_claim_patient;


   /*Customer Information section*/
   struct Customer
   {
     address customerAddr;
     bytes32 name;
     //ipfs hash;
     uint32 DOB;
     bytes32 age;
     bytes32 occupation;
     int status;
      uint256 payPerMonth;
   }
   Customer [] customers;

   struct CustomerInfo
   {
        address customerAddr;
        bytes32 name;
        uint32 DOB;
        bytes32 age;
        bytes32 occupation;
        int status;
        uint256 payPerMonth;
        bytes32 gender;
        bytes32 MartialStatus;
        bytes32 policyType;
        bytes32 term;
        bytes32 sumassured;
        bytes32 diseasecovered;
   }


    CustomerInfo [] customersData;

    struct CustomerInfo_Submitted_By_Agent
    {
        address customerAddr;
          int   status; // values: SUBMITTED, ACCEPTED, REJECTED
        bytes hash_of_data;
    }
    CustomerInfo_Submitted_By_Agent [] customersData_By_Agent;

    struct Emergency_Information
    {
        address customerAddr;
        int status; //values: Submitted,Accepted,Rejected
        bytes32 hash_of_data;
    }
    Emergency_Information [] EmergencyData;


  /**/
   CroIdentity   [] cros;
   TrialProposal [] proposals;

   modifier crosOnly {
      bool found = false;
      for(uint32 i=0; i<cros.length; i++) {
         if(cros[i].addr == msg.sender && cros[i].status == STATUS_ACCEPTED) {
            found = true;
            break;
         }
      }
      if(!found) throw;
      _;
   }

   modifier ownerOnly {
      if(msg.sender != owner) throw;
      _;
   }

   function Regulator() {
      owner = msg.sender;
      RegulatoryContractDeployed(msg.sender,"Mined",block.timestamp);
      //log3(bytes32(msg.sender));
   }


   function submitCustomerPolicy1(bytes32 _customerName, uint32 _dob,bytes32 _age,bytes32 _occupation,bytes32 gender,bytes32 martialstatus,bytes32 policyType,bytes32 term
    ,bytes32 sumassured,bytes32 diseasescovered)
   {
        CustomerInfo memory proposal;
        proposal.customerAddr= msg.sender;
        proposal.name= _customerName;
        proposal.DOB= _dob;
        proposal.age= _age;
        proposal.occupation= _occupation;
        proposal.status= STATUS_SUBMITTED;
        proposal.payPerMonth= 120;
        proposal.gender= gender;
        proposal.MartialStatus= martialstatus;
        proposal.policyType= policyType;
        proposal.term= term;
        proposal.sumassured= sumassured;
        proposal.diseasecovered= diseasescovered;
        customersData.push(proposal);

        CustomerPolicySubmitted(msg.sender,proposal.name,block.timestamp);
   }

   function submitCustomerPolicy(bytes32 _customerName, uint32 _dob,bytes32 _age,bytes32 _occupation)
   {
        Customer memory proposal;
        proposal.customerAddr= msg.sender;
        proposal.name= _customerName;
        proposal.DOB= _dob;
        proposal.age= _age;
        proposal.occupation= _occupation;
        proposal.status= STATUS_SUBMITTED;
        proposal.payPerMonth= 120;
        customers.push(proposal);

        CustomerPolicySubmitted(msg.sender,proposal.name,block.timestamp);
   }
   function submitProposal(bytes32 _drugName, uint32 _startDate, uint32 _endDate,bytes32 _patientDetails) {

      TrialProposal memory proposal;
      proposal.croAddr   = msg.sender;
      proposal.drugName  = _drugName;
      proposal.startDate = _startDate;
      proposal.endDate   = _endDate;
      proposal.status    = STATUS_SUBMITTED;
      proposal.patientDetails = _patientDetails;
      proposals.push(proposal);

      ProposalSubmitted(msg.sender,proposal.drugName,block.timestamp);
   }

   //claim submitted by the hospital
   function submitProposalclaim1(bytes32 _drugName, uint32 _startDate, uint32 _endDate,bytes32 _patientDetails,bytes16 Diseases,bytes16 cost_of_disease,bytes16 spell_of_disease
   ,bytes16 cost_per_day,bytes16 room_rent,bytes16 days_spent_hospital) {

         TrialProposal memory proposal;
         Patient_Info_cost memory proposal_cost;
         proposal.croAddr   = msg.sender;
         proposal.drugName  = _drugName;
         proposal.startDate = _startDate;
         proposal.endDate   = _endDate;
         proposal.status    = STATUS_SUBMITTED;
         proposal.patientDetails = _patientDetails;
         proposal_cost.diseases= Diseases;
               proposal_cost.cost_per_disease= cost_of_disease;
               proposal_cost.spell_per_disease= spell_of_disease;
               proposal_cost.cost_per_day= cost_per_day;
               proposal_cost.room_rent= room_rent;
               proposal_cost.days_stayed_in_hospital= days_spent_hospital;



         proposals.push(proposal);
         cost_of_claim_patient.push(proposal_cost);

         ProposalSubmitted(msg.sender,proposal.drugName,block.timestamp);
      }




   function submitTrialProtocolDocument(uint32 _id, bytes _docHash) constant returns (bytes _docIpfsHash)
   {
      if(_id >= proposals.length) {
         return;
      }
      TrialProposal memory tp = proposals[_id];
      tp.ipfsHash = _docHash;
      _docIpfsHash = tp.ipfsHash;
      UploadTrialProtocol(msg.sender,tp.ipfsHash,block.timestamp);
   }

   function getProposalsCount() constant returns (uint _counter)
   {
      _counter = proposals.length;
   }

   function getProposalById(uint32 _id) constant returns(address _croAddr, bytes32 _drugName, uint32 _startDate, uint32 _endDate, bytes _ipfsHash, int _status, address _trial,uint256 _proposals_Length,bytes32 _patientDetails) {
      if(_id >= proposals.length) {
         return;
      }
      TrialProposal memory tp = proposals[_id];
      _croAddr = tp.croAddr;
      _drugName = tp.drugName;
      _startDate = tp.startDate;
      _endDate = tp.endDate;
      _ipfsHash = tp.ipfsHash;
      _status = tp.status;
      //_trial = tp.trial;
      _proposals_Length= proposals.length;
      _patientDetails = tp.patientDetails;
   }



   /*Get the proposed claim for user*/
   function claim_getProposalById(uint32 _id) constant returns(address _croAddr, bytes32 _drugName, uint32 _startDate, uint32 _endDate, bytes _ipfsHash, int _status, address _trial,uint256 _proposals_Length,bytes32 _patientDetails) {
         if(_id >= proposals.length) {
            return;
         }
         TrialProposal memory tp = proposals[_id];
         Patient_Info_cost memory tp1= cost_of_claim_patient[_id];
         _croAddr = tp.croAddr;
         _drugName = tp.drugName;
         _startDate = tp.startDate;
         _endDate = tp.endDate;
         _ipfsHash = tp.ipfsHash;
         _status = tp.status;
          _patientDetails = tp.patientDetails;
         //_trial = tp.trial;
        /* _proposals_Length= proposals.length;

         _diseaseDiagonised= tp1.diseases;
         _diseaseCovered= tp1.cost_per_disease;
         _spell_disease_covered= tp1.spell_per_disease;
         _cost_per_day= tp1.cost_per_day;
         _room_rent= tp1.room_rent;
         _stay_in_hospital= tp1.days_stayed_in_hospital;
         */

      }

      function claim_Patient_cost_getProposalById(uint32 _id) constant returns(bytes16 _diseaseDiagonised,bytes16 _diseaseCovered,bytes16 _spell_disease_covered,bytes16 _cost_per_day,bytes16 _room_rent,bytes16 _stay_in_hospital) {
               if(_id >= proposals.length) {
                  return;
               }

               Patient_Info_cost memory tp1= cost_of_claim_patient[_id];

               _diseaseDiagonised = tp1.diseases;
               _diseaseCovered = tp1.cost_per_disease;
               _spell_disease_covered = tp1.spell_per_disease;
               _cost_per_day = tp1.cost_per_day;
               _room_rent = tp1.room_rent;
               _stay_in_hospital = tp1.days_stayed_in_hospital;
            }



   function getProposalOfSubmittedPolicy(uint32 _id) constant returns(address _customer,bytes32 _customerName,uint32 _dob,bytes32 _age,bytes32 _Occupation,int _status,
   bytes32 _gender,bytes32 _martialStatus,bytes32 policyType,bytes32 term,bytes32 sumassured,bytes32 DiseaseCovered)
   {
     /*   if(_id >= customers.length)
        {
            return;
        }
        */
        CustomerInfo memory policyholder= customersData[_id];
        _customer= policyholder.customerAddr;
        _customerName= policyholder.name;
        _dob= policyholder.DOB;
        _age= policyholder.age;
        _Occupation= policyholder.occupation;
        _status= policyholder.status;
        _gender= policyholder.gender;
        _martialStatus= policyholder.MartialStatus;
        policyType= policyholder.policyType;
        term= policyholder.term;
        sumassured= policyholder.sumassured;
        DiseaseCovered= policyholder.diseasecovered;
   }

   /*Acceptance of submitted policy*/

   function acceptProposalOfSubmittedPolicy(uint _id)
   {
        if(_id >= customersData_By_Agent.length)
        {
            throw;
        }
        CustomerInfo_Submitted_By_Agent memory tp= customersData_By_Agent[_id];
      /*  if(tp.status == STATUS_ACCEPTED)
        {
            throw;
        }
       */
        customersData_By_Agent[_id].status= STATUS_ACCEPTED;
        AcceptedProposalOfSubmittedPolicy(msg.sender,"Accepted",block.timestamp);
   }

   /*Details submitted by the agent and putting all them in ipfs Hash*/
   function agent_submitting_customer_policy(bytes JsonHash )
   {

        CustomerInfo_Submitted_By_Agent memory proposal;// customersData_By_Agent
        proposal.customerAddr= msg.sender;
          proposal.status=  STATUS_SUBMITTED; // values: SUBMITTED, ACCEPTED, REJECTED
        proposal.hash_of_data= JsonHash;

        customersData_By_Agent.push(proposal);
        //CustomerPolicySubmitted(msg.sender,"Proposal Submitted By Agent",block.timestamp);
        CustomerPolicySubmitted_agent(msg.sender,proposal.hash_of_data,block.timestamp);

   }
   /*Retreiving the detials of the customer submitted by the agent to the requestee*/
   function getProposalofSubmittedPolicy_agent(uint32 _id) constant returns(address _customer,bytes hash,int _status)
   {
        CustomerInfo_Submitted_By_Agent memory tp= customersData_By_Agent[_id];
        _customer= tp.customerAddr;
        _status= tp.status;
        hash= tp.hash_of_data;


   }

   /*Retreive the Details of the Emergency*/
   /*function getProposalofSubmittedEmergency_Details(uint32 _id) constant returns(address _customer,bytes32 hash,int _status)
   {
         ProposalAccepted (msg.sender,"sairam",block.timestamp);

        Emergency_Information memory tp= EmergencyData[_id];
        _customer= tp.customerAddr;
        hash= tp.hash_of_data;
        _status= tp.status;
   }*/


 /*  function acceptProposal(uint _id) constant returns (address _clinicalTrial) {

      if(_id >= proposals.length) {
         throw;
      }

      TrialProposal memory tp = proposals[_id];
      if(tp.status == STATUS_ACCEPTED) {
         throw;
      }

      // deploy the actual clinical trial contract and return it
      ClinicalTrial trial = new ClinicalTrial(owner, tp.croAddr, _id, tp.startDate, tp.endDate, tp.drugName, tp.ipfsHash);

      proposals[_id].trial = trial;
      proposals[_id].status = STATUS_ACCEPTED;

      _clinicalTrial = proposals[_id].trial;

      ProposalAccepted (msg.sender,tp.drugName,block.timestamp);
      //ProposalAccepted (msg.sender,balances[msg.sender],block.timestamp);
      ClinicalTrialContractDeployed(msg.sender,"Mined",block.timestamp);

   }*/



      function acceptProposal_for_Pharmacy(address _sender,uint _amount) public payable
      {
        uint _id= 0;
       /* if(_id >= customersData_By_Agent.length)
        {
            throw;
        }
        */
          //CustomerInfo_Submitted_By_Agent memory tp= customersData_By_Agent[_id];
         //CustomerInfo_Submitted_By_Agent memory tp= customersData_By_Agent[0];
         //if(tp.status == STATUS_ACCEPTED)
           // throw;
         //tp.customerAddr.transfer(msg.value);
         //customersData_By_Agent[_id].status= STATUS_ACCEPTED;
           address customerAddress= 0xcAe8262759Fa5bd5E6Bc3aA266598f55A81024D4;
                  //tp.customerAddr.transfer(msg.value);
                  customerAddress.transfer(msg.value);
                  ProposalAccepted_Emergency(msg.sender,"Pharmacy Amount Transferred",block.timestamp);
         //ProposalAccepted (msg.sender,"Transferred",block.timestamp);
      }

      function acceptProposal_for_Emergency(address _sender,uint _amount) public payable
      {
       // uint _id= 0;
       // if(_id >= customersData_By_Agent.length)
         //   throw;
         //CustomerInfo_Submitted_By_Agent memory tp= customersData_By_Agent[0];
         address customerAddress= 0xcAe8262759Fa5bd5E6Bc3aA266598f55A81024D4;
         //tp.customerAddr.transfer(msg.value);
         customerAddress.transfer(msg.value);
         ProposalAccepted_Emergency(msg.sender,"Emergency Amount Transferred",block.timestamp);
      }
      /*Emergency Details*/

      function EmergencyDetails(address _sender,bytes32 completeDetails )
         {

              Emergency_Information memory proposal;// customersData_By_Agent
              proposal.customerAddr= msg.sender;
                proposal.status=  STATUS_SUBMITTED; // values: SUBMITTED, ACCEPTED, REJECTED
              proposal.hash_of_data= completeDetails;

              EmergencyData.push(proposal);
              ProposalAccepted(msg.sender,"Emergency",block.timestamp);

              //CustomerPolicySubmitted_agent(msg.sender,proposal.hash_of_data,block.timestamp);

         }


      function acceptProposal1(address _sender,uint _amount) public payable
      {
          uint _id=0;
          if(_id >= proposals.length)
          {
                   throw;
          }
           TrialProposal memory tp = proposals[0];
           if(tp.status == STATUS_ACCEPTED) {
                        throw;
                     }
           balances[msg.sender] -= _amount;
           //balances[tp.croAddr] += _amount;
           tp.croAddr.transfer(msg.value);
           uint value= msg.value;
           proposals[_id].status = STATUS_ACCEPTED;
           ProposalAccepted (msg.sender,"Transferred via TPA",block.timestamp);


      }

      //function transfer()

   /* 'constant' prevents function from editing state variables; */
      function getBalance(address _receiver) constant returns(uint256){
          return balances[_receiver];
      }
  /*    function acceptProposal(uint _id) constant returns (address _clinicalTrail) {

          if(_id >= proposals.length) {
             throw;
          }

          TrialProposal memory tp = proposals[_id];
          if(tp.status == STATUS_ACCEPTED) {
             throw;
          }

          // deploy the actual clinical trial contract and return it
          //let this class go and fetch the amoun of the hospital
          ClinicalTrial trial = new ClinicalTrial(owner, tp.croAddr, _id, tp.startDate, tp.endDate, tp.drugName, tp.ipfsHash);

          proposals[_id].trial = trial;
          proposals[_id].status = STATUS_ACCEPTED;

          _clinicalTrial = proposals[_id].trial;

          //balances[tp.croAddr]
          ProposalAccepted (msg.sender,tp.drugName,block.timestamp);
          ClinicalTrialContractDeployed(msg.sender,"Mined",block.timestamp);
       }*/

   function rejectProposal(uint _id) {

      if(_id >= proposals.length) {
         throw;
      }

      proposals[_id].status = STATUS_REJECTED;

      TrialProposal memory tp = proposals[_id];
      ProposalRejected (tp.croAddr, tp.drugName, _id);
   }

   function submitCro(bytes32 _name, bytes32 _url) {
      CroIdentity memory cro;
      cro.name   = _name;
      cro.url    = _url;
      cro.addr   = msg.sender;
      cro.status = STATUS_SUBMITTED;

      cros.push(cro);

      AddCRO(msg.sender,cro.name,block.timestamp);
   }

   function changeCroStatus(address _addr, uint8 _status) {
      for(uint32 i=0; i<cros.length; i++) {
         if(cros[i].addr == _addr) {
            cros[i].status = _status;
            if(cros[i].status == STATUS_ACCEPTED)
            {
               UpdateCROStatus(msg.sender,"Approved",block.timestamp);
            }
            else
            {
               UpdateCROStatus(msg.sender,"Rejected",block.timestamp);
            }
            break;
         }
      }

   }

   function getCrosCounter() constant returns (uint _counter) {
      _counter = cros.length;
   }

   function getCroById(uint _id) constant returns(bytes32 _name, bytes32 _url, address _addr, int _status) {

      if(_id >= cros.length) {
         throw;
      }

      CroIdentity memory ci = cros[_id];
      _name = ci.name;
      _url  = ci.url;
      _addr = ci.addr;
      _status = ci.status;
   }

   function verifySignature(bytes32 r,bytes32 s,uint8 v,bytes32 hash) constant returns(address)
   {
        bytes memory prefix = "\x19Ethereum Signed Message:\n32";
         //bytes32 prefixedHash = keccak256(prefix, hash);
         bytes32 prefixedHash = sha3(prefix, hash);
        return ecrecover(hash,v,r,s);
        //address signer = prefixedHash.toEthSignedMessage().recover(prefixedHash,v,r,s);
        //return ecrecover(prefixedHash,v,r,s);
          //   return (ecrecover(prefixedHash, v, r, s));

        //SigVerification(msg.sender,signer,block.timestamp);
       // return signer;
   }
   /*
         function validate(address makerAddress, uint makerAmount, address makerToken,
                              address takerAddress, uint takerAmount, address takerToken,
                              uint256 expiration, uint256 nonce, uint8 v, bytes32 r, bytes32 s) private returns (bytes32) {

                // Hash arguments to identify the order.
                bytes32 hashV = keccak256(makerAddress, makerAmount, makerToken,
                    takerAddress, takerAmount, takerToken,
                    expiration, nonce);

                bytes memory prefix = "\x19Ethereum Signed Message:\n32";
                bytes32 prefixedHash = sha3(prefix, hashV);

                require(ecrecover(prefixedHash, v, r, s) == makerAddress);

        return hashV;
   */
}
