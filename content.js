async function getJSON(url) {
	return (await fetch(url)).json();
}

async function assignRatings(users){
	for(let i=0;i<users.length;i+=10000){
		let sec=users.slice(i,i+10000);
		let info = await getJSON(`https://codeforces.com/api/user.info?handles=${sec.map((cont) => cont.handle).join(';')}`).result;
		for(let j=0; j<sec.length; j++)sec[j].rating = info[j].rating;
	}
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
	list.slice(1).forEach( (el) =>{
		let user=el.children().eq(1).children().eq(1).text();
		el.append(`<td><span style="color:black;font-weight:bold;">${contestants.user.property}</span></td>`);
	})
}

async function main() {
	//get contest code
	var code = window.location.pathname.split('/')[2];
	console.log(code);
	//get standings
	var obj = await getJSON(`https://codeforces.com/api/contest.standings?contestId=${code}`);
	if(obj.status != "OK")return;

	var ranking = Object.entries(obj.result.rows)
		.filter((e) => e[1].points != 0 || e[1].problemResults.reduce((a,c) =>
			a |= (c.rejectedAttemptCount > 0 )), false)
		.map((e) => ({handle: e[1].party.members[0].handle, rank: e[1].rank}));
	assignRatings(ranking);

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