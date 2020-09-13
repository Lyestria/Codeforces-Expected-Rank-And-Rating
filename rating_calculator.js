//Implementation of the Codeforces rating system found here: https://codeforces.com/blog/entry/20762
function winProb(a,b){
	return 1/(1+pow(10,(b-a)/400));
}
var done=false;
function calculateExpectedRank(contestants){
	if(done)return;
	done=true;
	contestants.forEach((cont) => {
		cont.expected_rank = 0.5 + contestants.reduce((a,cur) =>
			a+winProb(cur[1].rating,cont[1].rating)
		)
	});
}
