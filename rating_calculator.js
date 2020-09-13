//Implementation of the Codeforces rating system found here: https://codeforces.com/blog/entry/20762
function winProb(a,b){
	return 1/(1+pow(10,(b-a)/400));
}

//Not exactly like the Codeforces version. That one excludes the contestant instead of using 0.5.
//This slightly affects the rankToRating function.
function getERank(contestants, rating){
	return 0.5 + contestants.reduce((a,cur) =>
		a+winProb(cur[1].rating,rating)
	);
}

var done=false;
function calculateExpectedRank(contestants){
	if(done)return;
	done=true;
	contestants.forEach((cont) => cont.expected_rank=getErank(contestants, cont.rating));
}
function rankToRating(rank){
	let l=-1000,r=5000;
	for(let i=0;i<20;i++){
		let mid = (l+r)*.5;
		if(getERank(mid)<rank)l=mid;
		else r=mid;
	}
	return (l+r)*.5;
}
function calculateDeltas(contestants){
	contestants.forEach((cont) => {
		let R=rankToRating(Math.sqrt(cont.rank*cont.expected_rank));
		cont.delta=(R-cont.rating)*.5;
	})
	let s=min(n,(int)(4*Math.sqrt(n)));
	let inc = -contestants.reduce((a,c) => a+c.delta)/(n-1);
	let inc2 = -contestants.slice(0,s).reduce((a,c) => a+c.delta)/s;
	contestants.forEach((cont,i) => cont.delta += inc + (i < s ? inc2 : 0));
}
