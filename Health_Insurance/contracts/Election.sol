pragma solidity ^0.4.11;

contract Election
{
    //constructor

    struct Candidate
    {
        uint id;
        string name;
        uint voteCount;
    }

    //Read,Fetch Candidate
    //store candidates count

    mapping(uint => Candidate) public candidates;
    //Store Candidates  count

    //store accounts that have voted
    mapping(address => bool) public voters;
    uint public candidatesCount;



    string public candidate;
    function Election() public
    {
        addCandidate("C 1");
        addCandidate("C 2");
       // candidate = "Candidate 1";
    }

    function addCandidate(string _name) private
    {
        candidatesCount++;
        candidates[candidatesCount] = Candidate(candidatesCount,_name,0);

    }
    event test(address value);
    function vote(uint _candidateId) public
    {
        //require that they havnot voted before
        require(!voters[msg.sender]);
        test(msg.sender);
        //require a valid candidate
        require(_candidateId > 0 && _candidateId <= candidatesCount);
        //record that voter has voted
        voters[msg.sender] = true;

        //update candidate vote candidatesCount
        candidates[_candidateId].voteCount ++;

    }

}

