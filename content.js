async function getJSON(url) {
	return (await fetch(url)).json();
}

async function getRating(user){
	return (await getJSON(`https://codeforces.com/api/user.info?handles=${user}`)).result[0].rating;
}

function assign_ranks(contestents, s, e) {
	let rk = (s+e-1)*0.5;
	while (s< len) contestents[s++]=rk;
}

function addElements(contestants,property,label){
	contestants=contestants.reduce((acc,cur) => {
		acc[cur.handle]=cur;
	}, {});
	var list= $('.standings').children().eq(0).children();
	list.eq(0).append(`<th class="top" style="width:4em;"><span>${label}</span></th>`);
	list.splice(1).forEach( (el) =>{
		let user=el.children().eq(1).children().eq(1).text();
		el.append(`<td><span style="color:black;font-weight:bold;">${contestants.user.property}</span></td>`);
	})
}

async function main() {
	//get contest code
	var code = window.location.pathname.split('/')[2];
	console.log(code);
	//get standings
	var obj = getJSON(`https://codeforces.com/api/contest.standings?contestId=${code}`);
	if(obj.status != "OK")return;

	var ranking = Object.entries(obj.result.rows)
		.filter((e) => e[1].points != 0 || e[1].problemResults.reduce((a,c) =>
			a |= (c.rejectedAttemptCount > 0 )), false)
		.map((e) => ({handle: e[1].party.members[0].handle, rank: e[1].rank}));
	ranking.forEach((e) => e[1].rating = await getRating(e[0]));

	let beg=0;
	for (let i=1; i<n; i++){
		if(ranking[i].rank != ranking[i-1].rank){
			assign_ranks(ranking,beg,i);
			beg=i;
		}
	}
	assign_ranks(ranking,beg,n);

	calculateExpectedRank(ranking);
	addElements(ranking, "expected_rank", "E(r)");

	calculateDeltas(ranking);
	addElements(ranking, "delta", "Δ");

}

main();