window.onload = function()
{
    let accounts = web3.eth.accounts;
    let maxBid = Math.ceil(Math.random () * 1000);
    let status = document.getElementById('status');

    Auction.new({from: accounts[0]}).then((contract) =>
    {
        contract.AuctionClosed().watch((err,response) =>
        {
            status.innerHTML = 'Auction has ended| bid is'+response.args.highestBid;
        }
        )
    });

    setTimeout( () =>
    {
        contract.closeAuction(maxBid,{from: accounts [0]});
    },3000);
}
