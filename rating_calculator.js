//Implementation of the Codeforces rating system found here: https://codeforces.com/blog/entry/20762
function winProb(a,b){
	return 1/(1+pow(10,(b-a)/400));
}

//Fixed
function getERank(contestants, rating, cont){
	return 0.5 + contestants.reduce((a,cur) => {
		if(cur!==cont) a += winProb(cur.rating,rating);
	});
}

var done=false;
function calculateExpectedRank(contestants){
	if(done)return;
	done=true;
	contestants.forEach((cont) => cont.expected_rank = getErank(contestants, cont.rating, cont));
}

function rankToRating(rank,cont){
	let l=-1000,r=5000;
	for(let i=0;i<20;i++){
		let mid = (l+r)*.5;
		if(getERank(contestants, mid, cont)<rank)l=mid;
		else r=mid;
	}
	return (l+r)*.5;
}

function calculateDeltas(contestants){
	calculateExpectedRank(contestants);
	contestants.forEach((cont) => {
		let R=rankToRating(Math.sqrt(cont.rank*cont.expected_rank));
		cont.delta=(R-cont.rating)*.5;
	})
	let s=min(n,(int)(4*Math.sqrt(n)));
	let inc = -contestants.reduce((a,c) => a+=c.delta)/(n-1);
	contestants.forEach((cont) => cont.delta += inc);
	let inc2 = min(0, max(-10,-contestants.slice(0,s).reduce((a,c) => a+=c.delta)/s));
	contestants.forEach((cont,i) => cont.delta += (i < s ? inc2 : 0));
}
