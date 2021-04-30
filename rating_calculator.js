const initial_rating = 1400;

//Implementation of the Codeforces rating system found here: https://codeforces.com/blog/entry/20762
function win_probability(rating_a,rating_b){
	return 1 / ( 1 + Math.pow(10, (rating_b - rating_a) / 400));
}

//Fixed
function get_expected_rank(contestants, rating){
	return contestants.reduce((a,cur) => 
		a + win_probability(cur.rating,rating)
	, 0.5);
}

var done=false;
function calculate_expected_rank(contestants){
	if(done)return;
	done=true;
	contestants.forEach((cont) => cont.expected_rank = get_expected_rank(contestants, cont.rating));
}

function rank_to_rating(contestants, rank){
	let l=-1000,r=5000;
	for(let i=0;i<20;i++){
		let mid = (l+r)*.5;
		if(get_expected_rank(contestants, mid) > rank) l=mid;
		else r=mid;
	}
	return (l+r)*.5;
}

async function calculate_deltas(contestants){
	calculate_expected_rank(contestants);
	for(let i = 0; i < contestants.length; i++){
		let cont = contestants[i];
		let R=rank_to_rating(contestants, Math.sqrt(cont.rank*cont.expected_rank));
		cont.delta=(R-cont.rating)*.5;
		await sleep(0);
	}
	let n = contestants.length;
	let s = Math.min(n,Math.floor(4*Math.sqrt(n)));
	let inc = -contestants.reduce((a,c) => a + c.delta, 0)/(n-1);
	console.log(`Change from Conservation: ${inc}`);
	contestants.forEach((cont) => cont.delta += inc);
	let inc2 = Math.min(0, Math.max(-10,-contestants.slice(0,s).reduce((a,c) => a + c.delta, 0)/s));
	console.log(`Change to Counter Inflation: ${inc2}`);
	console.log(`Affected Users: ${s}`);
	contestants.forEach((cont,i) => cont.delta += (i < s ? inc2 : 0));
}
